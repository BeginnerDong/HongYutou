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
		isFirstLoadAllStandard: ['getMainData']

	},

	onLoad(options) {
		
		const self = this;
		console.log('options',options)
		api.commonInit(self);
		self.data.id = options.id;
		self.data.standard = options.standard;
		self.getMainData()
		
	},




	getMainData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = {
			user_type: 1,
			primary_scope: 30
		};
		postData.getAfter = {
			order: {
				tableName: 'Order',
				middleKey: 'user_no',
				key: 'shop_no',
				searchItem: {
					status: 1,
					passage1: self.data.id,
					pay_status:1
				},
				condition: '='
			}
		}
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				for (var i = 0; i < self.data.mainData.length; i++) {
					console.log(self.data.mainData[i].order.length)
					self.data.mainData[i].minNum = self.data.standard - self.data.mainData[i].order.length
				}
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			console.log(self.data.mainData)
		};
		api.userGet(postData, callback);
	},

	choose(e) {

		const self = this;
		const user_no = api.getDataSet(e, 'user_no');
		console.log('user_no',user_no)
		getApp().globalData.user_no = user_no;
		
		setTimeout(function() {
			wx.navigateBack({
				delta: 1
			});
		}, 300);

	},


	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll && self.data.buttonCanClick) {
			self.data.paginate.currentPage++;
			self.getMainData();
		};
	},


})
