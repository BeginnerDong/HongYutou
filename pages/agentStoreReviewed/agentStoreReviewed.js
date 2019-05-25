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

	/**
	 * 页面的初始数据
	 */
	data: {
		num: 0,
		mainData: [],
		searchItem: {
			status: 0,

		},
		isFirstLoadAllStandard: ['getMainData'],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.setData({
			web_num: self.data.num
		});
		self.getMainData()
	},

	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self)
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = api.cloneForm(self.data.searchItem);
		postData.searchItem.parent_no = wx.getStorageSync('threeInfo').user_no;
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
			} else {
				api.showToast('没有更多了', 'none')
			};

			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			console.log(self.data.mainData)
		};
		api.userGet(postData, callback);
	},

	userUpdate(e) {
		const self = this;
		var num = api.getDataSet(e,'num');
		api.buttonCanClick(self)
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.data = {
			status:num
		}
		postData.searchItem = {};
		postData.searchItem.user_no = api.getDataSet(e, 'user_no');
		postData.searchItem.status = 0;
		const callback = res => {
			if (res.solely_code == 100000) {
				api.showToast('更新成功', 'none');
			} else {
				api.showToast(res.msg, 'none')
			};
			self.getMainData(true);
		};
		api.userUpdate(postData, callback);
	},

	menuClick: function(e) {
		const self = this;
		api.buttonCanClick(self);
		const num = e.currentTarget.dataset.num;
		self.changeSearch(num);
	},

	changeSearch(num) {
		const self = this;
		self.setData({
			web_num: num
		});
		self.data.searchItem = {};
		if (num == '0') {
			self.data.searchItem.status = 0
		} else if (num == '1') {
			self.data.searchItem.status = 1
		} else if (num == '2') {
			self.data.searchItem.status = -1
		}
		self.setData({
			web_mainData: [],
		});
		self.getMainData(true);
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
