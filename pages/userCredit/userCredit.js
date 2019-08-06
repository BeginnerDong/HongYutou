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
			type: 3,
			count: ['not in', 0]
		},
		isFirstLoadAllStandard: ['getMainData','getUserInfoData'],
		count: 0,

	},


	onLoad() {
		const self = this;
		api.commonInit(self);
		self.getMainData();
		self.getUserInfoData()
	},


	getUserInfoData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken';
		const callback = (res) => {
			if (res.solely_code == 100000) {
				self.data.userInfoData = res.info.data[0]
			} else {
				api.showToast(res.msg, 'none')
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getUserInfoData', self);
			self.setData({
				web_userInfoData: self.data.userInfoData,
			});
		};
		api.userInfoGet(postData, callback)
	},




	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = api.cloneForm(self.data.searchItem)
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
			} else {
				self.data.isLoadAll = true;
				api.showToast('没有更多了', 'none');
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
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
