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



		isFirstLoadAllStandard: ['getMainData', 'getUserInfoData', 'userCouponGet'],
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
		if (options.user_no) {
			self.data.user_no = options.user_no;
			getApp().globalData.user_no = self.data.user_no;
			self.setData({
				web_user_no: self.data.user_no
			})
		};
		self.getMainData();

		self.userCouponGet()
		self.setData({
			web_showCoupon: self.data.showCoupon
		})
	},

	onShow() {
		const self = this;
		self.getUserInfoData();
		console.log(getApp().globalData.user_no)

	},



	showCoupon() {
		const self = this;
		self.data.showCoupon = !self.data.showCoupon;
		self.setData({
			web_showCoupon: self.data.showCoupon
		})
	},

	noSelect() {
		const self = this;
		api.showToast('不能选择门店', 'none')
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

			self.setData({
				web_mainData: self.data.mainData,
			});
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
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
			use_step: 1,
			invalid_time: ['>', now]
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
					longitude: parseFloat(self.data.parentStoreData.info.longitude),
					latitude: parseFloat(self.data.parentStoreData.info.latitude),
					name: self.data.parentStoreData.info.shop_name,
					address: self.data.parentStoreData.info.address,
					scale: 28
				})
			}
		})
	},

	getParentStoreData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_type: 1,
			user_no: api.cloneForm(getApp().globalData.user_no)
		};
		postData.getAfter = {
			order: {
				tableName: 'Order',
				middleKey: 'user_no',
				key: 'shop_no',
				searchItem: {
					status: 1,
					passage1: self.data.id,
					pay_status: 1
				},
				condition: '='
			},

			partner: {
				tableName: 'Distribution',
				middleKey: 'user_no',
				key: 'child_no',
				searchItem: {
					status: 1
				},
				condition: '=',
				info: ['parent_no']
			}
		}
		const callback = (res) => {
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.data.parentStoreData = res.info.data[0];
					self.data.parentStoreData.minNum = self.data.mainData.standard - self.data.parentStoreData.order.length;
					self.data.parentStoreData.percent = (100 / self.data.mainData.standard) * self.data.parentStoreData.order.length
				}
				self.setData({
					web_parentStoreData: self.data.parentStoreData,
				});
			} else {
				api.showToast('网络故障', 'none')
			};

		};
		api.userGet(postData, callback);
	},

	getUserInfoData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		postData.getAfter = {
			user: {
				tableName: 'Distribution',
				middleKey: 'user_no',
				key: 'child_no',
				searchItem: {
					status: 1,
					level: 1
				},
				condition: '=',
			}
		}
		const callback = (res) => {
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.data.userData = res.info.data[0];
					if (getApp().globalData.user_no) {
						self.getParentStoreData();
					} else if (self.data.userData.user.length > 0) {
						getApp().globalData.user_no = self.data.userData.user[0].parent_no;
						self.getParentStoreData();
					};
					getApp().globalData.user_no = ''
				}
				self.setData({
					web_userData: self.data.userData,
				});
			} else {
				api.showToast('网络故障', 'none')
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getUserInfoData', self);
		};
		api.userInfoGet(postData, callback);
	},

	addOrder(e) {
		const self = this;
		if (self.data.orderId) {
			self.pay(self.data.orderId)
		};
		var orderList = [{
			product: [{
				id: self.data.mainData.id,
				count: self.data.mainData.count,
			}],

		}];
		const postData = {
			tokenFuncName: 'getProjectToken',
			orderList: orderList,
			data: {
				shop_no: self.data.parentStoreData.user_no,
				passage1: self.data.mainData.id,
				standard: self.data.mainData.standard,
				end_time:self.data.mainData.end_time
			},
			type: 4,
			isGroup: true
		};
		if (self.data.parentStoreData.order.length > 0) {
			postData.group_no = self.data.parentStoreData.order[0].group_no;
		};
		const callback = (res) => {
			if (res && res.solely_code == 100000) {
				self.data.orderId = res.info.id;

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
		if (self.data.parentStoreData && self.data.parentStoreData.user_no) {
			if (self.data.pay.wxPay && self.data.pay.wxPay.price && self.data.pay.wxPay.price > 0 && self.data.mainData.shop_ratio >
				0) {
				postData.payAfter.push({
					tableName: 'FlowLog',
					FuncName: 'add',
					data: {
						relation_user: wx.getStorageSync('info').user_no,
						count: self.data.pay.wxPay.price*(self.data.mainData.shop_ratio/100),
						trade_info: '下级分润',
						user_no: self.data.parentStoreData.user_no,
						type: 2,
						thirdapp_id: getApp().globalData.thirdapp_id,
						relation_id: self.data.mainData.id,
						income_type: 2
					}
				});
			};
		}
		if (self.data.parentStoreData && self.data.parentStoreData.partner.parent_no) {
				if (self.data.pay.wxPay && self.data.pay.wxPay.price && self.data.pay.wxPay.price > 0 && self.data.mainData.shop_ratio >0) {
				postData.payAfter.push({
					tableName: 'FlowLog',
					FuncName: 'add',
					data: {
						relation_user: wx.getStorageSync('info').user_no,
						count: self.data.pay.wxPay.price*(self.data.mainData.shop_ratio/100),
						trade_info: '下级分润',
						user_no: self.data.parentStoreData.partner.parent_no,
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


	useCoupon(e) {
		const self = this;
		
		console.log(api.getDataSet(e, 'index'))
		self.data.couponIndex = api.getDataSet(e, 'index');
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
			console.log('(self.data.price - self.data.couponTotalPrice)',self.data.price - self.data.couponTotalPrice)
			console.log('findCoupon.condition',findCoupon.condition)
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
			self.data.showCoupon = false;
			self.setData({
				web_couponIndex: self.data.couponIndex
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
			self.data.sForm.score = 0;
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
		self.data.price = self.data.mainData.price;
		console.log('self.data.price', self.data.price)
		console.log('self.data.sForm.score', self.data.sForm.score);
		if (self.data.sForm.score > 0) {
			self.data.pay.score = self.data.sForm.score
		};
		if (self.data.sForm.balance > 0) {
			self.data.pay.balance = self.data.sForm.balance
		};
		var wxPay = parseFloat(self.data.price) - parseFloat(self.data.couponTotalPrice) - parseFloat(self.data.sForm.score);
		if (wxPay > 0) {
		   self.data.pay.wxPay = {
			  price:wxPay.toFixed(2),
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
		/*if(self.data.buyType=='delivery'&&self.data.addressData.length==0){
		  api.showToast('请选择收货地址','none');
		  api.buttonCanClick(self,true);
		  return;
		};*/
		self.addOrder();
	},


})
