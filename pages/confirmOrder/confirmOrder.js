import {
	Api
} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';
const token = new Token();



Page({
	data: {

		mainData: [],
		addressData: [],
		userInfoData: [],
		idData: [],
		orderData: [],
		couponData: [],
		couponId: [],
		searchItem: {
			isdefault: 1
		},
		submitData: {
			passage1: ''
		},
		sForm: {
			score: 0,
		},
		scoreForm: {

		},


		isFirstLoadAllStandard: ['getMainData', 'getAddressData', 'getUserData', 'userCouponGet'],
		pay: {
			coupon: []
		},
		couponTotalPrice: 0,
		showCoupon: true

	},

	onLoad(options) {

		const self = this;
		api.commonInit(self);
		console.log(options);
		self.data.id = options.id;
		if (options.type) {
			self.data.type = options.type;
			self.setData({
				web_type:self.data.type
			})
		};
		if (options.group_no) {
			self.data.group_no = options.group_no;
		};
		getApp().globalData.address_id = '';
		self.getMainData();
		self.userCouponGet();
		
			self.distributionGet();
		
		

	},


	counter(e) {

		const self = this;


		if (api.getDataSet(e, 'type') == '+') {
			self.data.mainData.count++;
		} else {
			if (self.data.mainData.count > 1) {
				self.data.mainData.count--;
			}
		};
		self.setData({
			web_mainData: self.data.mainData
		})

		self.countPrice();

	},

	onShow() {

		const self = this;
		self.data.searchItem = {};
		if (getApp().globalData.address_id) {
			self.data.searchItem.id = getApp().globalData.address_id;
		} else {
			self.data.searchItem.isdefault = 1;
		};
		self.getUserData();
		self.getAddressData();

	},

	getAddressData() {
		const self = this;
		const postData = {}
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			isdefault: 1
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.addressData = res.info.data[0];
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getAddressData', self);
			self.setData({
				web_addressData: self.data.addressData,
			});
		};
		api.addressGet(postData, callback);
	},


	showCoupon() {
		const self = this;
		self.data.showCoupon = !self.data.showCoupon;
		self.setData({
			web_showCoupon: self.data.showCoupon
		})
	},

	getMainData(isNew) {

		const self = this;

		const postData = {};

		postData.searchItem = {
			id: self.data.id
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.count = 1;
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			self.countPrice()

		};
		api.productGet(postData, callback);

	},

	userCouponGet() {

		const self = this;
		var now = Date.parse(new Date());
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			behavior: 2,
			use_step:1,
			invalid_time:['>',now]
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.couponData.push.apply(self.data.couponData, res.info.data);
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'userCouponGet', self);
			self.setData({
				web_couponData: self.data.couponData,
			});
		};
		api.userCouponGet(postData, callback);

	},

	getUserData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		const callback = (res) => {
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.data.userData = res.info.data[0];
				}
				self.setData({
					web_userData: self.data.userData,
				});
			} else {
				api.showToast('网络故障', 'none')
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getUserData', self);
		};
		api.userInfoGet(postData, callback);
	},

	addOrder(e) {
		const self = this;
		if (self.data.orderId) {
			self.pay(self.data.orderId);
			return
		};
		if (self.data.type && self.data.type == 'group') {
			if (self.data.mainData.standard == 0 || self.data.mainData.standard == null) {
				api.buttonCanClick(self, true);
				api.showToast('成团标准错误', 'none', 1000);

				return;
			}
		};
		const postData = {
			tokenFuncName: 'getProjectToken',
			
			orderList: [{
					product: [{
						id: self.data.mainData.id,
						count: self.data.mainData.count,
					}, ],

				},
				
			],
			type: 3,
			data: {
				standard: self.data.mainData.standard,
			}
		};
		if(!wx.getStorageSync('info')||!wx.getStorageSync('info').headImgUrl){
		  postData.refreshToken = true;
		};
		if (self.data.type && self.data.type == 'group') {
			postData.isGroup = true;
		};
		if (self.data.group_no && self.data.group_no != '') {
			postData.group_no = self.data.group_no;
		};
		const callback = (res) => {
			if (res && res.solely_code == 100000) {
				self.data.orderId = res.info.id;
				console.log('self.orderId', self.orderId)
				self.pay(self.data.orderId)
			} else {
				api.showToast(res.msg, 'none')
			};
		};
		api.addOrder(postData, callback);
	},

	pay(order_id) {

		const self = this;

		const postData = self.data.pay;
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			id: self.data.orderId
		};
		postData.payAfter = [];

		if (self.data.distributionData&&self.data.distributionData.info.data.length > 0) {
			if (self.data.pay.wxPay && self.data.pay.wxPay.price && self.data.pay.wxPay.price > 0 && self.data.mainData.shop_ratio >0) {


				postData.payAfter.push({
					tableName: 'FlowLog',
					FuncName: 'add',
					data: {
						relation_user: wx.getStorageSync('info').user_no,
						count: self.data.pay.wxPay.price*(self.data.mainData.shop_ratio/100),
						trade_info: '下级分润',
						user_no: self.data.distributionData.info.data[0].parent_no,
						type: 2,
						thirdapp_id: getApp().globalData.thirdapp_id,
						relation_id: self.data.mainData.id,
						income_type: 2
					}
				});
			};
		}
		if (self.data.distributionData&&self.data.distributionData.info.data[0].partner.parent_no) {
			if (self.data.pay.wxPay && self.data.pay.wxPay.price && self.data.pay.wxPay.price > 0 && self.data.mainData.shop_ratio >
				0) {
				postData.payAfter.push({
					tableName: 'FlowLog',
					FuncName: 'add',
					data: {
						relation_user: wx.getStorageSync('info').user_no,
						count: self.data.pay.wxPay.price*(self.data.mainData.shop_ratio/100),
						trade_info: '下级分润',
						user_no: self.data.distributionData.info.data[0].partner.parent_no,
						type: 2,
						thirdapp_id: getApp().globalData.thirdapp_id,
						relation_id: self.data.mainData.id,
						income_type: 2
					}
				});
			};
		}


		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true);
				if (res.info) {
					const payCallback = (payData) => {
						if (payData == 1) {
							const cc_callback = () => {
								api.pathTo('/pages/userOrder/userOrder', 'redi');
							};
							api.showToast('支付成功', 'none', 1000, cc_callback);
						};
					};
					api.realPay(res.info, payCallback);
				} else {
					api.showToast('支付成功', 'none', 1000, function() {
						api.pathTo('/pages/userOrder/userOrder', 'redi');
					});
				};
			} else {
				api.showToast(res.msg, 'none');
			};
		};
		api.pay(postData, callback);

	},



	distributionGet() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			child_no: wx.getStorageSync('info').user_no,
			level:1
		};
		postData.getAfter = {
			partner: {
				tableName: 'Distribution',
				middleKey: 'parent_no',
				key: 'child_no',
				searchItem: {
					status: 1
				},
				condition: '=',
				info: ['parent_no']
			}
		};
		const callback = (res) => {
			if (res) {
				self.data.distributionData = res;
				self.setData({
					web_distributionData: self.data.distributionData,
				});
			};
		};
		api.distributionGet(postData, callback);
	},


	useCoupon(e) {
		const self = this;
		self.data.couponIndex = api.getDataSet(e, 'index');
		console.log(api.getDataSet(e, 'index'))
		
		var id = self.data.couponData[self.data.couponIndex].id;
		var findCoupon = api.findItemInArray(self.data.couponData, 'id', id);
		var findItem = api.findItemInArray(self.data.pay.coupon, 'id', id);
		console.log('findCoupon', findCoupon)
		if(self.data.pay.coupon.length>=1){
			self.data.pay.coupon = []
		};
		if (findCoupon) {
			findCoupon = findCoupon[1];
			var findSameCoupon = api.findItemsInArray(self.data.pay.coupon, 'product_id', id);
		} else {
			api.showToast('优惠券错误', 'none');
			return;
		};
		if (findItem) {
			self.data.pay.coupon.splice(findItem[0], 1);
		} else {
			if ((self.data.price - self.data.couponTotalPrice) < findCoupon.condition) {
				api.showToast('金额不达标', 'none');
			
				return;
			};
			console.log('findCoupon.limit', findCoupon.limit)
			console.log('findSameCoupon.length', findSameCoupon.length)
			if (self.data.pay.coupon.length >= 1) {
				api.showToast('叠加使用超限', 'none');
			
				return;
			};
			if (findCoupon.type == 1) {
				var couponPrice = findCoupon.discount;
				console.log('findCoupon.discount', findCoupon.discount)
			} else if (findCoupon.type == 2) {

				var couponPrice = parseFloat(self.data.price).toFixed(2) - parseFloat(findCoupon.discount / 100 * self.data.price)
					.toFixed(2);
			};
			if (parseFloat(couponPrice) + parseFloat(self.data.couponTotalPrice) > parseFloat(self.data.price)) {
				couponPrice = parseFloat(self.data.price).toFixed(2) - parseFloat(self.data.couponTotalPrice).toFixed(2);
			};
			self.data.pay.coupon.push({
				id: id,
				price: couponPrice,
			});
			self.data.showCoupon = false
			self.setData({
				web_couponIndex:self.data.couponIndex
			});
		};
		self.countPrice();
	},







	inputBind(e) {
		const self = this;
		api.fillChange(e, self, 'sForm');
		if(self.data.sForm.score==''){
			self.data.sForm.score = 0
		};
		console.log('inputBind', self.data.sForm.score);
		console.log('inputBind', self.data.userData.score)
		if (parseInt(self.data.sForm.score) > parseInt(self.data.userData.score) || parseInt(self.data.sForm.score) >
			parseInt(self.data.price)) {
			api.showToast('积分不符合规则', 'none');
			self.data.sForm.score = '';
			self.setData({
				web_sForm: self.data.sForm,
			});
			return;
		};

		self.countPrice();

	},



	countPrice() {

		const self = this;
		var totalPrice = 0;
		var couponPrice = 0;
		var productsArray = self.data.mainData.products;
		self.data.couponTotalPrice = api.addItemInArray(self.data.pay.coupon, 'price');
		console.log('self.data.couponTotalPrice', self.data.couponTotalPrice)
		if (self.data.type == 'group') {
			self.data.price = self.data.mainData.group_price * self.data.mainData.count;
		} else {
			self.data.price = self.data.mainData.price * self.data.mainData.count;
		}

		console.log('self.data.price', self.data.price)
		if (self.data.sForm.score > 0) {
			self.data.pay.score = self.data.sForm.score
		};
		if (self.data.sForm.balance > 0) {
			self.data.pay.balance = self.data.sForm.balance
		};
		var wxPay = parseFloat(self.data.price) - parseFloat(self.data.couponTotalPrice) - parseFloat(self.data.sForm.score);
		if (wxPay > 0) {
			self.data.pay.wxPay = {
				price: wxPay.toFixed(2),
			};
		} else {
			  delete self.data.pay.wxPay;
			 
		};

		console.log('countPrice-wxPay', wxPay);
		console.log('self.data.pay', self.data.pay)
		self.setData({
			web_couponPrice: parseFloat(self.data.couponTotalPrice).toFixed(2),
			web_price: parseFloat(self.data.price).toFixed(2),
			web_pay: self.data.pay,
		
			web_showCoupon: self.data.showCoupon
		});

	},


	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},


	changeBind(e) {
		const self = this;
		api.fillChange(e, self, 'submitData');
		console.log(self.data.submitData);
		self.setData({
			web_submitData: self.data.submitData,
		});
	},


	submit(e) {
		const self = this;
		api.buttonCanClick(self);
		const callback = (user, res) => {
			self.addOrder();
		};
		api.getAuthSetting(callback);
		
	},


})
