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
			login_name: ''
		},
		searchItem: {
			user_type: 1,
			primary_scope: 30
		}
	},

	onLoad(options) {

		const self = this;
		console.log('options', options)
		api.commonInit(self);
		self.getLocation();
		self.getMainData()

	},

	getLocation() {
		const self = this;
		const callback = (res) => {
			if (res.errMsg == "getLocation:ok") {
				self.data.location = res
			}
		};
		api.getLocation('getGeocoder', callback)
	},


	getMainData() {
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = api.cloneForm(self.data.searchItem);

		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				for (var i = 0; i < self.data.mainData.length; i++) {
					self.data.mainData[i].distance = api.distance(self.data.location.latitude,self.data.location.longitude,
					self.data.mainData[i].info.latitude,self.data.mainData[i].info.longitude);
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

	changeBind(e) {
		const self = this;
		api.fillChange(e, self, 'submitData');
		console.log(self.data.submitData);
		self.setData({
			web_submitData: self.data.submitData
		});
		if (self.data.submitData.login_name) {
			self.data.searchItem.login_name = ['LIKE', ['%' + self.data.submitData.login_name + '%']],
				self.getMainData(true)

		} else if (self.data.submitData.login_name == '') {
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
