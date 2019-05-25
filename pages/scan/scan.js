//logs.js
import {
	Api
} from '../../utils/api.js';
var api = new Api();

import {
	Token
} from '../../utils/token.js';
const token = new Token();

Page({
	data: {
		is_show: false,
		searchItem: {},
		submitData: {
			price: ''
		},
		isFirstLoadAllStandard: ['getUserData'],
		couponData: [],
		pay: {

			coupon: []


		},
		freeCouponData: [],
		isDiscount: false,
		freeCouponId: []
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.user_no = options.user_no;
		self.getUserData();
		self.getFreeCouponData();
		self.setData({
			web_isDiscount: self.data.isDiscount,
			web_pay: self.data.pay
		})
	},

	getUserData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_no: self.data.user_no
		}
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.userData = res.info.data[0];
			};
			self.getUserCouponData();
			self.setData({
				web_userData: self.data.userData
			})
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getUserData', self);
		};
		api.userGet(postData, callback);
	},

	getFreeCouponData() {
		const self = this;
		const postData = {};

		postData.searchItem = {
			behavior: 2
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.freeCouponData.push.apply(self.data.freeCouponData, res.info.data);
				for (var i = 0; i < self.data.freeCouponData.length; i++) {
					self.data.freeCouponId.push(self.data.freeCouponData[i].id)
				}
			}
			self.data.randomId = Math.floor(Math.random() * self.data.freeCouponId.length);
			self.data.selectFreeCouponData = self.data.freeCouponData[self.data.randomId];
			console.log('self.data.freeCouponData', self.data.freeCouponData)
			console.log('self.data.randomId', self.data.randomId)
			console.log('self.data.selectFreeCouponData', self.data.selectFreeCouponData)
			self.setData({
				web_selectFreeCouponData: self.data.selectFreeCouponData,
				web_freeCouponData: self.data.freeCouponData,
			});
		};
		api.couponGet(postData, callback);
	},

	getUserCouponData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			behavior: 1
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.couponData.push.apply(self.data.couponData, res.info.data)
			}

			self.setData({
				web_couponData: self.data.couponData,
			});
		};
		api.userCouponGet(postData, callback);
	},

	useCoupon(e) {
		const self = this;
		if (self.data.submitData.price == '') {
			api.showToast('请输入金额');
			return
		};
		var id = api.getDataSet(e, 'id');
		console.log('self.data.pay.coupon',self.data.pay.coupon)
		var findCoupon = api.findItemInArray(self.data.couponData, 'id', id);
		var findItem = api.findItemInArray(self.data.pay.coupon, 'id', id);
		console.log('findCoupon', findCoupon)
		console.log('findItem', findItem)
		if (findCoupon) {
			findCoupon = findCoupon[1];

		} else {
			api.showToast('优惠券错误', 'error');
			return;
		};
		if (findItem) {
			self.data.pay.coupon.splice(findItem[0], 1);
		} else {

			if (findCoupon.type == 1) {
				var couponPrice = findCoupon.value;

			} else if (findCoupon.type == 2) {

				var couponPrice = parseFloat(self.data.price).toFixed(2) - parseFloat(findCoupon.discount / 10 * self.data.submitData
						.price)
					.toFixed(2);
			};

			self.data.pay.coupon.push({
				id: id,
				price: couponPrice,
			});
			console.log('self.data.pay', self.data.pay);
		};
		self.countPrice()
	},

	countPrice() {

		const self = this;
		var totalPrice = 0;
		var couponPrice = 0;
		self.data.couponTotalPrice = api.addItemInArray(self.data.pay.coupon, 'price');
		var wxPay = self.data.submitData.price - self.data.couponTotalPrice;
		console.log('wxPay', wxPay);
		console.log('self.data.couponTotalPrice', self.data.couponTotalPrice)
		if (wxPay > 0) {
			self.data.pay.wxPay = {
					price: wxPay.toFixed(2),		
			};
			self.data.pay.wxPayStatus = 0
		}
		/* else{
				  delete self.data.pay.pay;
				}; */
		self.setData({
			web_pay: self.data.pay
		})

	},



	pay() {
		const self = this;
		api.buttonCanClick(self);

		const postData = {};
		postData.pay = self.data.pay;
		postData.tokenFuncName = 'getProjectToken';
		if(!wx.getStorageSync('info')||!wx.getStorageSync('info').headImgUrl){
		  postData.refreshToken = true;
		};
		postData.data = {
			shop_no: self.data.user_no,
			price: self.data.submitData.price
		}

	
		if (JSON.stringify(postData.pay) == '{}') {
			api.buttonCanClick(self, true);
			api.showToast('空白充值', 'error');
			return;
		};
		postData.data.payAfter = [{
				tableName: 'FlowLog',
				FuncName: 'add',
				data: {
					count: 1000,
					type: 3,
					user_no: wx.getStorageSync('info').user_no,
					thirdapp_id: 2,
					relation_user: self.data.user_no
				}
			},
			{
				tableName: 'FlowLog',
				FuncName: 'add',
				data: {
					count: 1000,
					type: 2,
					user_no: self.data.user_no,
					thirdapp_id: 2,
					relation_user: wx.getStorageSync('info').user_no,
					income_type: 1
				}
			},
		];
		const callback = (res) => {
			console.log(res)
			api.buttonCanClick(self, true)
			if (res.solely_code == 100000) {
				if (res.info) {
					const payCallback = (payData) => {
						if (payData == 1) {
							api.showToast('支付成功', 'none', 1000, function() {
								self.couponAdd()
							});
						} else {
							api.showToast('调起微信支付失败', 'none');
						};

						self.data.submitData.price = 0;

					};
					api.realPay(res.info, payCallback);
				} else {
					console.log(777)
				};
			} else {
				api.showToast(res.msg, 'none');

				self.data.submitData.price = 0;

			};
			self.setData({
				web_submitData: self.data.submitData
			})
		}
		api.addVirtualOrder(postData, callback);
	},

	couponAdd() {
		const self = this;
		const postData = {
			tokenFuncName: 'getProjectToken',
			coupon_id: self.data.freeCouponData[self.data.randomId].id,
			pay: {
				score: 0
			},
		};
		console.log('postData', postData)
		const callback = (res) => {
			if (res && res.solely_code == 100000) {
				self.data.isDiscount = true;
				self.setData({
					web_isDiscount: self.data.isDiscount
				})
			} else {
				api.showToast(res.msg, 'none')
			}
		};
		api.couponAdd(postData, callback);
	},



	submit() {
		const self = this;
		api.buttonCanClick(self);
		const pass = api.checkComplete(self.data.submitData);
		console.log('pass', pass)
		if (pass) {
			const callback = (user, res) => {
				self.pay();
			};
			api.getAuthSetting(callback);
		} else {
			api.buttonCanClick(self, true);

			api.showToast('请输入金额', 'none')
		};
	},

	close() {
		const self = this;
		self.data.isDiscount = false;
		self.setData({
			web_isDiscount: self.data.isDiscount
		})
	},

	changeBind(e) {
		const self = this;
		api.fillChange(e, self, 'submitData');
		console.log('self.data.submitData', self.data.submitData)
		self.setData({
			web_submitData: self.data.submitData,
		});
		self.countPrice()
	},


	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},
})
