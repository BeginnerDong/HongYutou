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
		submitData: {
			shop_name: ''
		},
		searchItem: {
			user_type: 1,
		},
		La1: '',
		lo1: '',
		order: {}
	},

	onLoad(options) {

		const self = this;
		console.log('options', options)
		api.commonInit(self);
		self.getMainData()


	},

	choose(e) {

		const self = this;
		const user_no = api.getDataSet(e, 'user_no');
		const name = api.getDataSet(e, 'name');
		self.data.user_no = user_no;
		getApp().globalData.name = name;
		getApp().globalData.user_no = user_no;
		setTimeout(function() {
			wx.navigateBack({
				delta: 1
			});
		}, 300);

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
		postData.getBefore = {
			user: {
				tableName: 'Distribution',
				middleKey: 'user_no',
				key: 'child_no',
				searchItem: {
					parent_no: ['=', [wx.getStorageSync('threeInfo').user_no]]
				},
				condition: 'in',
			}
		}
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
		api.userInfoGet(postData, callback);
	},



	changeBind(e) {
		const self = this;
		api.fillChange(e, self, 'submitData');
		console.log(self.data.submitData);
		self.setData({
			web_submitData: self.data.submitData
		});
		if (self.data.submitData.shop_name) {
			self.data.searchItem.shop_name = ['LIKE', ['%' + self.data.submitData.shop_name + '%']],
				self.getMainData(true)

		} else if (self.data.submitData.shop_name == '') {
			api.showToast('输入门店名查询', 'none');
			return
		}
	},

	/* search() {
		const self = this;
		
	}, */


	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},

	intoPathRedi(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},

	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll && self.data.buttonCanClick) {
			self.data.paginate.currentPage++;
			self.getMainData();
		};
	},


})
