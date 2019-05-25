//logs.js
import {
	Api
} from '../../utils/api.js';
var api = new Api();

import {
	Token
} from '../../utils/token.js';
const token = new Token();

Page({
	data: {
		is_show: false,
		searchItem: {},
		submitData: {
			count: ''
		},
		isFirstLoadAllStandard: ['getUserInfoData', 'getAboutData']
	},

	onLoad(options) {
		const self = this;
	/* 	api.commonInit(self);
		self.getUserInfoData()
		self.getAboutData() */
	},

	getUserInfoData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getStoreToken';
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

	flowLogAdd() {
		const self = this

		const postData = {
			data: {
				count: -self.data.submitData.count,
				trade_info: '提现',
				status: 0,
				type: 3,
				thirdapp_id: 2
			}
		};
		postData.tokenFuncName = 'getStoreToken';
		if (self.data.userInfoData.bank_no.length == 0) {
			api.buttonCanClick(self, true);
			api.showToast('请绑定银行卡', 'none');
			return;
		};
		const callback = (res) => {
			api.buttonCanClick(self, true)
			if (res.solely_code == 100000) {
				api.showToast('申请成功', 'none');
				setTimeout(function() {
					wx.navigateBack({
						delta: 1
					})
				}, 1000);
			}
		};
		api.flowLogAdd(postData, callback)
	},

	submit() {
		const self = this;
		api.buttonCanClick(self);
		const pass = api.checkComplete(self.data.submitData);
		console.log('pass', pass)
		if (pass) {
			self.flowLogAdd()
		} else {
			api.buttonCanClick(self, true);

			api.showToast('请输入提现数量', 'none')
		};
	},

	getAboutData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: 2,
		};
		postData.getBefore = {
			label: {
				tableName: 'Label',
				searchItem: {
					title: ['=', ['联盟金提现规则']],
				},
				middleKey: 'menu_id',
				key: 'id',
				condition: 'in'
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.aboutData = res.info.data[0];
				self.data.aboutData.content = api.wxParseReturn(res.info.data[0].content).nodes;
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getAboutData', self);
			self.setData({
				web_aboutData: self.data.aboutData,
			});
		};
		api.articleGet(postData, callback);
	},

	is_show() {
		const self = this;
		self.data.is_show = !self.data.is_show;
		self.setData({
			is_show: self.data.is_show
		})
	},

	allOut() {
		const self = this;
		self.data.submitData.count = self.data.userInfoData.score;
		self.setData({
			web_submitData: self.data.submitData
		})
	},

	changeBind(e) {
		const self = this;
		api.fillChange(e, self, 'submitData');
		console.log('self.data.submitData', self.data.submitData)
		self.setData({
			web_submitData: self.data.submitData,
		});
	},


	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},
})
