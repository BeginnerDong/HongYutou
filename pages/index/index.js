import {
	Api
} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';
const token = new Token();

Page({
	data: {
		background: ['/images/banner.png', '/images/banner.png', '/images/banner.png'],
		indicatorDots: false,
		vertical: false,
		autoplay: true,
		circular: true,
		interval: 2000,
		duration: 500,
		previousMargin: 0,
		nextMargin: 0,
		isFirstLoadAllStandard: ['storeDataGet', 'groupDataGet', 'onlineDataGet','getSliderData'],
		groupData: [],
		onlineData: [],
		endTimeList: []
	},


	//事件处理函数

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getSliderData();
		self.getLocation();
		self.groupDataGet();
		self.onlineDataGet();
	},

	onShow() {
		const self = this;
		self.storeDataGet();

	},

	getLocation() {
		const self = this;
		const callback = (res) => {
			if (res.errMsg == "getLocation:ok") {
				self.data.location = res
			}
		};
		api.getLocation('getGeocoder', callback)
	},

	getSliderData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			title: '首页轮播'
		};
		const callback = (res) => {
			console.log(1000, res);
			if (res.info.data.length > 0) {
				self.data.sliderData = res.info.data[0];
			}
			self.setData({
				web_sliderData: self.data.sliderData,
			});
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getSliderData', self);
		};
		api.labelGet(postData, callback);
	},

	storeDataGet() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_type: 1,
			primary_scope: 30
		};
		postData.refreshToken = true;

		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.storeData = res.info.data[0];
				self.data.storeData.distance = api.distance(self.data.location.latitude, self.data.location.longitude, self.data
					.storeData.info.latitude, self.data.storeData.info.longitude);
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'storeDataGet', self);
			self.setData({
				web_storeData: self.data.storeData,
			});
			console.log('self.data.storeData', self.data.storeData)
		};
		api.userGet(postData, callback);
	},

	groupDataGet() {
		const self = this;
		var now = new Date().getTime();
		const postData = {};
		postData.searchItem = {
			category_id: 5,
			end_time: ['>', now]
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.groupData.push.apply(self.data.groupData, res.info.data)
				for (var i = 0; i < self.data.groupData.length; i++) {
					self.data.endTimeList.push({
						actEndTime: api.timeto(self.data.groupData[i].end_time, "ymd-hms")
					});
					self.data.groupData[i].endTimeList = [];
				}
			};

			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'groupDataGet', self);
			self.setData({
				web_groupData: self.data.groupData,
			});
			console.log(self.data.endTimeList)
			// 将活动的结束时间参数提成一个单独的数组，方便操作

			self.setData({
				actEndTimeList: self.data.endTimeList
			});
			// 执行倒计时函数
			self.countDown();
		};
		api.productGet(postData, callback);
	},

	timeFormat(param) { //小于10的格式化函数
		const self = this;
		return param < 10 ? '0' + param : param;
	},

	countDown() { //倒计时函数
		// 获取当前时间，同时得到活动结束时间数组
		const self = this;
		let newTime = new Date().getTime();
		let endTimeList = self.data.endTimeList;
		let countDownArr = [];
		
		
		// 对结束时间进行处理渲染到页面
		for (var i = 0; i < self.data.endTimeList.length; i++) {


			let endTime = new Date(self.data.endTimeList[i].actEndTime).getTime();
			let obj = null;
			// 如果活动未结束，对时间进行处理
		
			if (endTime - newTime > 0) {
				let time = (endTime - newTime) / 1000;
				// 获取天、时、分、秒
				let day = parseInt(time / (60 * 60 * 24));
				let hou = parseInt(time % (60 * 60 * 24) / 3600);
				let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
				let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
				if (day > 0) {
					hou = hou + day * 24
				}
				obj = {

					hou: self.timeFormat(hou),
					min: self.timeFormat(min),
					sec: self.timeFormat(sec)
				}
			} else { //活动已结束，全部设置为'00'
				obj = {

					hou: '00',
					min: '00',
					sec: '00'
				}
			}
			countDownArr.push(obj);
		}
		// 渲染，然后每隔一秒执行一次倒计时函数
		this.setData({
			countDownList: countDownArr
		})

		setTimeout(this.countDown, 1000);
	},
	
	onUnload() {
      const self = this;
      //清除计时器  即清除setInter
      clearTimeout(self.countDown())
  },


	onlineDataGet(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			category_id: 7
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.onlineData.push.apply(self.data.onlineData, res.info.data)
			} else {
				api.showToast('没有更多了', 'none')
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'onlineDataGet', self);
			self.setData({
				web_onlineData: self.data.onlineData,
			});

		};
		api.productGet(postData, callback);
	},

	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll && self.data.buttonCanClick) {
			self.data.paginate.currentPage++;
			self.onlineDataGet();
		};
	},

	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},

	intoPathRedi(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},
})
