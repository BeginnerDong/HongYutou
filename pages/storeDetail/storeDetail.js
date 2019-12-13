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
		isFirstLoadAllStandard: ['getMainData', 'getProductData', 'getCouponData'],
		productData: [],
		isDiscount: false,
		la1:'',
		lo1:'',
		order:{}
	},
	
	scan() {
		const self = this;
		api.buttonCanClick(self);
		
		wx.scanCode({
			success: (res) => {
				console.log(res)
				api.buttonCanClick(self, true);
				/* if (res.errMsg == "scanCode:ok") {
					self.getMainData(res.result)
				} */
			},
			fail: (res) => {
				api.buttonCanClick(self, true);
			}
		})
	},


	//事件处理函数

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.user_no = options.user_no;
		self.getLocation();
		
		self.getUserCouponData()
		self.setData({
			web_isDiscount: self.data.isDiscount
		})

	},
	
	getLocation() {
		const self = this;
		const callback = (res) => {
			if (res.errMsg == "getLocation:ok") {
					self.data.la1 = res.latitude;
					self.data.lo1 = res.longitude
			}
			console.log(res)
			self.getMainData()
		};
		api.getLocation('getGeocoder', callback)
	},
	


	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: self.data.user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.distance =
					api.distance(self.data.la1, self.data.lo1, self.data.mainData.info.latitude, self.data.mainData.info.longitude)
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			self.getProductData()
		};
		api.userGet(postData, callback);
	},

	phoneCall() {
		const self = this;
		wx.makePhoneCall({
			phoneNumber: self.data.mainData.info.phone,
		})
	},
	
	intoMap() {
		const self = this;
		wx.getLocation({
			type: 'gcj02', //返回可以用于wx.openLocation的经纬度
			success: function(res) { //因为这里得到的是你当前位置的经纬度
				var latitude = res.latitude
				var longitude = res.longitude
				wx.openLocation({ //所以这里会显示你当前的位置
					// longitude: 109.045249,
					// latitude: 34.325841,
					longitude: parseFloat(self.data.mainData.longitude),
					latitude: parseFloat(self.data.mainData.latitude),
					name: self.data.mainData.info.shop_name,
					address: self.data.mainData.info.address,
					scale: 28
				})
			}
		})
	},

	getProductData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			category_id: 6,
			user_no: self.data.user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.productData.push.apply(self.data.productData, res.info.data)
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getProductData', self);
			self.setData({
				web_productData: self.data.productData,
			});
		};
		api.productGet(postData, callback);
	},

	getUserCouponData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			behavior: 1,
			user_no: wx.getStorageSync('info').user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getCouponData', self);
			} else {
				self.getCouponData();	
			}

			self.setData({
				web_couponData: self.data.couponData,
			});
		};
		api.userCouponGet(postData, callback);
	},

	getCouponData() {
		const self = this;
		const postData = {};
		/* postData.tokenFuncName='getProjectToken'; */
		postData.searchItem = {
			behavior: 1
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.couponData = res.info.data[0]
				self.data.isDiscount = true;
				self.setData({
					web_isDiscount: self.data.isDiscount
				})
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getCouponData', self);
			self.setData({
				web_couponData: self.data.couponData,
			});
		};
		api.couponGet(postData, callback);
	},

	couponAdd(e) {
		const self = this;
		api.buttonCanClick(self);
		console.log(e);
		var id = api.getDataSet(e, 'id');
		const postData = {
			tokenFuncName: 'getProjectToken',
			coupon_id: id,
			pay: {
				score: 0
			},
		};
		console.log('postData', postData)
		const callback = (res) => {
			if (res && res.solely_code == 100000) {
				api.showToast('领取成功！', 'none', 2000)
				self.data.isDiscount = false;
				self.setData({
					web_isDiscount: self.data.isDiscount
				})
			} else {
				api.showToast(res.msg, 'none')
			}
			api.buttonCanClick(self, true);
		};
		api.couponAdd(postData, callback);

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
