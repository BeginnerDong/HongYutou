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
		isFirstLoadAllStandard: ['getMainData', 'getMessageData'],
		tabCurrent: 0,
		orderData: [],
		messageData: [],

	},


	//事件处理函数

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.id = options.id;
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
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			self.orderGet();
			self.getMessageData()
		};
		api.productGet(postData, callback);
	},


	getMessageData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken',
			postData.searchItem = {
				relation_id: self.data.id,
				type: 1,
				user_type: 0
			};
		postData.order = {
			create_time: 'desc'
		};
		postData.getAfter = {
			user: {
				tableName: 'User',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1
				},
				condition: '='
			}
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.messageData.push.apply(self.data.messageData, res.info.data);
			} else {
				self.data.isLoadAll = true;
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMessageData', self);
			self.setData({
				web_messageData: self.data.messageData,
			});
		};
		api.messageGet(postData, callback);
	},

	orderGet() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken',
			postData.searchItem = {
				user_type: 0,
				type: 3,
				group_leader: 'true',
				order_step: 4,
				pay_status: 1
			};
		postData.getBefore = {
			OrderItem: {
				tableName: 'OrderItem',
				searchItem: {
					product_id: ['in', [self.data.id]],
				},
				key: 'order_no',
				middleKey: 'order_no',
				condition: 'in',
			},
		};
		postData.getAfter = {
			user: {
				tableName: 'User',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1
				},
				condition: '='
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.orderData.push.apply(self.data.orderData, res.info.data)
				/*        for (var i = 0; i < self.data.orderData.length; i++) {
				          if(self.data.orderData[i].user_no==wx.getStorageSync('info').user_no){
				            self.data.hasGroup = true;
				          }
				        }*/
			};
			self.setData({
				/*web_hasGroup:self.data.hasGroup,*/
				web_orderData: self.data.orderData
			});
			console.log('orderGet', self.data.orderData)
		}
		api.orderGet(postData, callback)
	},

	groupData(e) {
		const self = this;
		self.data.id1 = api.getDataSet(e, 'id');
		self.data.group_no1 = api.getDataSet(e, 'group_no')
		const postData = {};
		postData.tokenFuncName = 'getProjectToken',
			postData.searchItem = {
				user_type: 0,
				id: self.data.id1
			};
		postData.getAfter = {
			groupMember: {
				tableName: 'Order',
				middleKey: 'group_no',
				key: 'group_no',
				searchItem: {
					status: 1,

				},
				condition: '='
			},
			user: {
				tableName: 'User',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1
				},
				condition: '='
			}
		};

		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.groupData = res.info.data[0];
				for (var i = 0; i < self.data.groupData.groupMember.length; i++) {
					if (self.data.groupData.groupMember[i].user_no == wx.getStorageSync('info').user_no) {
						self.data.isMember = true;
					}
				}
				self.showGroupMember();
			};
			console.log('666', self.data.isMember)
			self.setData({
				web_isMember: self.data.isMember,
				web_groupData: self.data.groupData,
				web_lessNum: self.data.groupData.standard - self.data.groupData.groupMember.length
			})
		}
		api.orderGet(postData, callback)
	},

	groupData(e) {
		const self = this;
		self.data.id1 = api.getDataSet(e, 'id');
		self.data.group_no1 = api.getDataSet(e, 'group_no')
		const postData = {};
		postData.tokenFuncName = 'getProjectToken',
			postData.searchItem = {
				user_type: 0,
				id: self.data.id1
			};
		postData.getAfter = {
			groupMember: {
				tableName: 'Order',
				middleKey: 'group_no',
				key: 'group_no',
				searchItem: {
					status: 1,

				},
				condition: '='
			},
			user: {
				tableName: 'User',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1
				},
				condition: '='
			}
		};

		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.groupData = res.info.data[0];
				for (var i = 0; i < self.data.groupData.groupMember.length; i++) {
					if (self.data.groupData.groupMember[i].user_no == wx.getStorageSync('info').user_no) {
						self.data.isMember = true;
					}
				}
				self.showGroupMember();
			};
			console.log('666', self.data.isMember)
			self.setData({
				web_isMember: self.data.isMember,
				web_groupData: self.data.groupData,
				web_lessNum: self.data.groupData.standard - self.data.groupData.groupMember.length
			})
		}
		api.orderGet(postData, callback)
	},

	showGroupMember() {
		const self = this;
		self.data.isShow1 = !self.data.isShow1
		self.setData({
			web_isShow1: self.data.isShow1
		})
	},



	select_this(e) {
		const self = this;
		self.data.tabCurrent = api.getDataSet(e, 'current');
		self.setData({
			tabCurrent: self.data.tabCurrent
		})
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
