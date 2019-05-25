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
		num: 0,
		mainData: [],
		groupData:[],
		searchItem: {},
		isFirstLoadAllStandard: ['getMainData','groupDataGet'],
	},


	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getMainData();
		self.groupDataGet()
	},

	onShow() {
		const self = this;


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
		postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
		postData.searchItem.type = 4;
		postData.searchItem.pay_status = 1;
		postData.searchItem.user_type = 0;
		postData.searchItem.shop_no = wx.getStorageSync('threeInfo').user_no;
		postData.searchItem.group_leader = 'true';
		postData.order = {
			create_time: 'desc'
		}
		const callback = (res) => {
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.data.mainData.push.apply(self.data.mainData, res.info.data);
				} else {
					self.data.isLoadAll = true;
					api.showToast('没有更多了', 'none', 1000);
				};
				api.buttonCanClick(self, true);
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
	
	groupDataGet() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			category_id: 5
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.groupData.push.apply(self.data.groupData, res.info.data)
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'groupDataGet', self);
			self.setData({
				web_groupData: self.data.groupData,
			});

		};
		api.productGet(postData, callback);
	},




	menuClick: function(e) {
		const self = this;
	
		const num = e.currentTarget.dataset.num;
		self.setData({
			num: num
		});
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
