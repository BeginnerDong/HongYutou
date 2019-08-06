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
		searchItem: {
			type: 3
		},
		isFirstLoadAllStandard: ['getMainData'],
		count: 0,

	},


	onLoad() {
		const self = this;
		api.commonInit(self);
		self.getMainData();
		self.getUserInfoData();
		self.setData({
			web_count: self.data.count
		})
	},

	getUserInfoData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {};
		postData.searchItem.user_no = wx.getStorageSync('threeInfo').user_no;
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.userInfoData = res.info.data[0];
			};
			self.setData({
				web_userInfoData: self.data.userInfoData
			})
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getUserInfoData', self);
		};
		api.userInfoGet(postData, callback);
	},


	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = api.cloneForm(self.data.searchItem);
		postData.searchItem.user_no = wx.getStorageSync('threeInfo').user_no;
		postData.order = {
			create_time: 'desc',
		};
		postData.getAfter = {
			store: {
				tableName: 'UserInfo',
				middleKey: 'relation_user',
				key: 'user_no',
				searchItem: {
					status: 1
				},
				condition: '=',
				info: ['shop_name']
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				for (var i = 0; i < self.data.mainData.length; i++) {
					self.data.count += parseFloat(self.data.mainData[i].count)
				}
			} else {
				self.data.isLoadAll = true;
				api.showToast('没有更多了', 'none');
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_count: self.data.count,
				web_mainData: self.data.mainData,
			});
		};
		api.flowLogGet(postData, callback);
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


})
