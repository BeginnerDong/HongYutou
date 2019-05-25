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
		isFirstLoadAllStandard: ['getMainData']

	},


	//事件处理函数

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.id = options.id;
		if (options.type) {
			self.data.type = options.type;
		};
		if (options.user_no) {
			self.data.user_no = options.user_no;
			self.setData({

				web_user_no: self.data.user_no
			})
		};
		self.setData({
			web_type: self.data.type
		})
		self.getMainData()

	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			id: self.data.id
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
				self.data.mainData.countDownList = {}
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			self.countDown()
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
		let endTime = self.data.mainData.end_time;
		let obj = null;
		/* console.log('endTime',endTime) */
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
		self.data.mainData.countDownList = obj
		
		self.setData({
			web_mainData:self.data.mainData
		});
		setTimeout(this.countDown, 1000);
	},

	onShareAppMessage(res) {
		const self = this;

		console.log(res)
		if (res.from == 'button') {
			self.data.shareBtn = true;
		} else {
			self.data.shareBtn = false;
		}
		return {
			title: '红芋头',
			path: 'pages/groupDetail/group[Detail]?id=' + self.data.id + '&&user_no=' + wx.getStorageSync('threeInfo').user_no,
			success: function(res) {
				console.log(res);
				console.log(parentNo)
				if (res.errMsg == 'shareAppMessage:ok') {
					console.log('分享成功')
					if (self.data.shareBtn) {
						if (res.hasOwnProperty('shareTickets')) {
							console.log(res.shareTickets[0]);
							self.data.isshare = 1;
						} else {
							self.data.isshare = 0;
						}
					}
				} else {
					wx.showToast({
						title: '分享失败',
					})
					self.data.isshare = 0;
				}
			},
			fail: function(res) {
				console.log(res)
			}
		}
	},


	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},

	intoPathRedi(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},


	intoPathRela(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'rela');
	},
})
