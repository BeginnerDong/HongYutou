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
		isFirstLoadAllStandard: ['getMainData'],
		searchItem: {
			income_type: 1
		},
		num: 0,
		count:0
	},


	onLoad() {
		const self = this;
		wx.setNavigationBarTitle({
			title: '我的收益',
		});
		api.commonInit(self);
		self.getMainData();
		self.setData({
			web_num: self.data.num,
			web_count:self.data.count
		})
	},




	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self);
		};
		self.data.count = 0;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = api.cloneForm(self.data.searchItem);
		postData.searchItem.type = 2;
		postData.getAfter = {
				user: {
					tableName: 'User',
					middleKey: 'relation_user',
					key: 'user_no',
					searchItem: {
						status: 1
					},
					condition: '=',
					info: ['headImgUrl', 'nickname']
				},
				product: {
					tableName: 'Product',
					middleKey: 'relation_id',
					key: 'id',
					searchItem: {
						status: 1
					},
					condition: '=',
				},
			},
			postData.order = {
				create_time: 'desc',
			};
			postData.compute = {
			  totalCount:[
				'sum',
				'count',
				{user_no:wx.getStorageSync('threeInfo').user_no,type:2,income_type:self.data.searchItem.income_type}
			  ],
			  
			};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				console.log(parseFloat(self.data.mainData[0].count))
				for (var i = 0; i < self.data.mainData.length; i++) {
					self.data.count += parseFloat(self.data.mainData[i].count)
				}			
			} else {
				self.data.isLoadAll = true;
				api.showToast('没有更多了', 'none');
			};
			console.log('self.data.count',self.data.count)
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
				web_count:self.data.count.toFixed(2),
				web_totalCount: res.info.compute.totalCount,
			});
		};
		api.flowLogGet(postData, callback);
	},

	tab(e) {
		const self = this;
		if (self.data.num != api.getDataSet(e, 'num')) {

			self.data.num = api.getDataSet(e, 'num');
			if (self.data.num == 1) {
				self.data.searchItem.income_type = 2
			} else if (self.data.num == 2) {

				self.data.searchItem.income_type = 3
			} else if (self.data.num == 0) {
				self.data.searchItem.income_type =1
			};
			self.getMainData(true);
			self.setData({
				web_num: self.data.num
			})
		};
	},
	/* getComputeData() {
		const self = this;
		const postData = {};
		postData.data = {
			FlowLog: {
				compute: {
					count: 'sum',
				},

				searchItem: {
					user_no: wx.getStorageSync('info').user_no,
					type: 3,
					behavior: 2,
					count: ['>', 0]
				}
			}
		};
		const callback = (res) => {
			self.data.computeData = res;
			self.setData({
				web_computeData: self.data.computeData,
			});
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getComputeData', self)
		};
		api.flowLogCompute(postData, callback);
	}, */

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
