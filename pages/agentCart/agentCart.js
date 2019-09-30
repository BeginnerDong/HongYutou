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

		array: [],
		mainData: [],
		isFirstLoadAllStandard: ['getMainData', 'getUserData']
	},


	//事件处理函数

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getUserData();
		self.getMainData();
		self.getLabelData();

	},



	getLabelData() {
		const self = this;

		const postData = {};

		postData.searchItem = {
			title: '合伙人下单图'
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.labelData = res.info.data[0]
			}
			self.setData({
				web_labelData: self.data.labelData,
			})
		};
		api.labelGet(postData, callback);
	},


	getUserData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('threeInfo').user_no
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				self.data.userData = res.info.data[0],
					self.data.array = self.data.userData.order_limit.split(',');
			} else {
				api.showToast('网络故障', 'none')
			}
			var week = new Date().getDay().toString();
			console.log(self.data.array.indexOf(week))
			var canOrder = self.data.array.indexOf(week);
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getUserData', self);
			self.setData({
				web_canOrder: canOrder,
				web_userData: self.data.userData,
			});
			console.log((self.data.userData.order_limit).split(','))
		};
		api.userGet(postData, callback)
	},

	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			category_id: 8,
			partner_no: wx.getStorageSync('threeInfo').user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				for (var i = 0; i < self.data.mainData.length; i++) {
					self.data.mainData[i].count = 1;
					self.data.mainData[i].isSelect = false
				};

			} else {
				api.showToast('没有更多了', 'none')
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});

		};
		api.productGet(postData, callback);
	},

	showMsg() {
		const self = this;
		api.showToast('今日限制下单', 'none');
	},

	choose(e) {
		const self = this;
		const index = api.getDataSet(e, 'index');
		if (self.data.mainData[index].isSelect) {
			self.data.mainData[index].isSelect = false;
		} else {
			self.data.mainData[index].isSelect = true;
		};
		self.setData({
			web_mainData: self.data.mainData
		})
		console.log(self.data.mainData[index].isSelect)
		self.countTotalPrice();
	},

	counter(e) {
		const self = this;
		var index = api.getDataSet(e, 'index');
		console.log(index)
		if (api.getDataSet(e, 'type') == '+') {
			self.data.mainData[index].count++;
		} else {
			if (self.data.mainData[index].count > 1) {
				self.data.mainData[index].count--;
			}
		};
		self.countTotalPrice();
		self.setData({
			web_mainData: self.data.mainData
		})
	},
	
	bindManual(e) {
	  const self = this;
	  const index = api.getDataSet(e,'index');
	  var num = e.detail.value;
	  if(!num||num<1){
	    num = 1;
	  };
	  self.data.mainData[index].count = num;
	  self.countTotalPrice();
	  self.setData({
	    num: num,
	    web_mainData:self.data.mainData
	  });
	}, 

	countTotalPrice() {
		const self = this;
		self.data.totalPrice = 0;
		self.data.shopTotalPrice=0;
		self.data.minScore = 0;
		self.data.scorePay=0;
		console.log(self.data.mainData)
		for (var i = 0; i < self.data.mainData.length; i++) {
			if (self.data.mainData[i].isSelect) {
				console.log(111)
				self.data.shopTotalPrice +=self.data.mainData[i].shop_price * self.data.mainData[i].count;
				self.data.totalPrice += self.data.mainData[i].partner_price * self.data.mainData[i].count;
				self.data.minScore += (parseFloat(self.data.mainData[i].shop_price) - parseFloat(self.data.mainData[i].partner_price))*self.data.mainData[i].count;
				self.data.scorePay += parseFloat(self.data.mainData[i].partner_price)*self.data.mainData[i].count;

			};

		};
		console.log(self.data.totalPrice)
		console.log('minScore', self.data.scorePay)
		console.log('self.data.scorePay', self.data.scorePay)
	},

	addOrder(e) {
		const self = this;
		var key = api.getDataSet(e, 'key');
		console.log('key', key)
		self.data.pay = {};
		const productData = [];
		for (var i = 0; i < self.data.mainData.length; i++) {
			if (self.data.mainData[i].isSelect) {
					
				productData.push({
					id: self.data.mainData[i].id,
					count: self.data.mainData[i].count,
				})
			}
					
		};
		console.log('productData', productData)
					
		if (productData.length == 0) {
			api.buttonCanClick(self, true);
			api.showToast('没有选择商品', 'none');
			return
		};
		if (key == "wx") {
			self.data.pay.wxPay = {
				price: self.data.totalPrice.toFixed(2)
			}
		} else if (key == "balance") {
			var ratio = wx.getStorageSync('threeInfo').thirdApp.custom_rule.balanceDiscount;
			if (ratio && ratio > 0) {
				self.data.pay = {
					balance: (self.data.totalPrice * (ratio / 100)).toFixed(2),
					other: {
						price: (self.data.totalPrice - self.data.totalPrice * (ratio / 100)).toFixed(2)
					}
				}
			} else {
				api.buttonCanClick(self, true);
				api.showToast('折扣设置错误', 'none');
				return
			}
			wx.showModal({
				title: '确认订单',
				content: '使用余额支付优惠' + self.data.pay.other.price + '元' ,
				cancelText: '取消',
				confirmText: '确认',
				success(res) {
					if (res.cancel) {
						api.buttonCanClick(self,true);
					} else if (res.confirm) {
						api.buttonCanClick(self);
			
						
						var orderList = [{
							product: productData,
							type: 1
						}];
						console.log('self.data.minScore', self.data.minScore)
						const postData = {
							tokenFuncName: 'getThreeToken',
							orderList: orderList,
							/* data:{
								shop_no:wx.getStorageSync('threeInfo').parent_no
							} */
							data:{
								express_info:self.data.pay.balance
							}
						};
						const callback = (res) => {
							if (res && res.solely_code == 100000) {
								self.data.orderId = res.info.id;
								self.getOrderData(key);
							} else {
								api.showToast(res.msg, 'none')
							};
						};
						api.addOrder(postData, callback);
			
					}
				}
			})
		} else if (key == "score") {
			self.data.pay = {
				score: self.data.totalPrice,
			}
		}
		if (key == 'score') {
			wx.showModal({
				title: '确认订单',
				content: '门店采购价'+self.data.shopTotalPrice+'元，合伙人采购价' + self.data.scorePay + '元。合伙人本次分润' + self.data.minScore + '元',
				cancelText: '取消',
				confirmText: '确认',
				success(res) {
					if (res.cancel) {
						api.buttonCanClick(self,true);
					} else if (res.confirm) {
						api.buttonCanClick(self);

						
						var orderList = [{
							product: productData,
							type: 1
						}];
						console.log('self.data.minScore', self.data.minScore)
						const postData = {
							tokenFuncName: 'getThreeToken',
							orderList: orderList,
							/* data:{
								shop_no:wx.getStorageSync('threeInfo').parent_no
							} */
							data:{
								express_info:self.data.shopTotalPrice
							}
						};
						const callback = (res) => {
							if (res && res.solely_code == 100000) {
								self.data.orderId = res.info.id;
								self.getOrderData(key);
							} else {
								api.showToast(res.msg, 'none')
							};
						};
						api.addOrder(postData, callback);

					}
				}
			})
		} else if(key=='wx') {
			api.buttonCanClick(self);

			
			var orderList = [{
				product: productData,
				type: 1
			}];
			console.log('self.data.minScore', self.data.minScore)
			const postData = {
				tokenFuncName: 'getThreeToken',
				orderList: orderList,
				/* data:{
					shop_no:wx.getStorageSync('threeInfo').parent_no
				} */
				data:{
					express_info:self.data.pay.wxPay.price
				}
			};
			const callback = (res) => {
				if (res && res.solely_code == 100000) {
					self.data.orderId = res.info.id;
					self.getOrderData(key);
				} else {
					api.showToast(res.msg, 'none')
				};
			};
			api.addOrder(postData, callback);
		}
	},



	getOrderData(key) {
		const self = this;
		console.log(key)
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			id: self.data.orderId
		}
		const callback = (res) => {
			console.log(key)
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.data.orderData = res.info.data[0]
					self.pay(key)
				} else {

					api.showToast(res.msg, 'none', 1000);
				};

				api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
				self.setData({
					web_mainData: self.data.mainData,
				});
			} else {
				api.showToast('网络故障', 'none')
			}
		};
		api.orderGet(postData, callback);
	},


	pay(key) {
		const self = this;
		
		console.log('self.data.pay', self.data.pay)
		const postData = self.data.pay;
		postData.openid = wx.getStorageSync('info').openid;
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			id: self.data.orderId
		};

		postData.payAfter = [];
		if (key == "score") {
			if (self.data.minScore && self.data.minScore > 0) {
				postData.payAfter.push({
					tableName: 'FlowLog',
					FuncName: 'add',
					data: {
						count: self.data.minScore,
						trade_info: '差价奖励余额',
						user_no: wx.getStorageSync('threeInfo').user_no,
						type: 2,
						thirdapp_id: getApp().globalData.thirdapp_id,
						relation_id: self.data.mainData.id,
						income_type: 4,
						order_no: self.data.orderData.order_no
					}
				});
			};
			postData.payAfter.push({
				tableName: 'FlowLog',
				FuncName: 'add',
				data: {
					relation_user: wx.getStorageSync('info').user_no,
					count: -self.data.minScore,
					trade_info: '多余货款',
					user_no: wx.getStorageSync('threeInfo').user_no,
					type: 3,
					thirdapp_id: getApp().globalData.thirdapp_id,
				}
			});
		}
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true);
				if (res.info) {
					const payCallback = (payData) => {
						if (payData == 1) {
							const cc_callback = () => {
								api.pathTo('/pages/agentOrder/agentOrder', 'redi');
							};
							api.showToast('支付成功', 'none', 1000, cc_callback);
						};
					};
					api.realPay(res.info, payCallback);
				} else {
					api.showToast('支付成功', 'none', 1000, function() {
						api.pathTo('/pages/agentOrder/agentOrder', 'redi');
					});
				};
			} else {
				api.showToast(res.msg, 'none');
			};
		};
		api.pay(postData, callback);

	},

	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll && self.data.buttonCanClick) {
			self.data.paginate.currentPage++;
			self.getMainData();
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
