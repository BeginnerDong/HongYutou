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
		isFirstLoadAllStandard: ['getUserInfoData'],
		bankData:[{name:'工商银行',value:1002},{name:'农业银行',value:1005},{name:'中国银行',value:1026},{name:'建设银行',value:1003},{name:'招商银行',value:1001},
		{name:'邮储银行',value:1066},{name:'交通银行',value:1020},{name:'浦发银行',value:1004},{name:'民生银行',value:1006},{name:'兴业银行',value:1009},
		{name:'平安银行',value:1010},{name:'中信银行',value:1021},{name:'华夏银行',value:1025},{name:'广发银行',value:1027},{name:'光大银行',value:1022},
		{name:'北京银行',value:1032},{name:'宁波银行',value:1056},]
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.getUserInfoData()

	},

	getUserInfoData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			user_no:wx.getStorageSync('threeInfo').user_no
		}
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.userInfoData = res.info.data[0];
				self.data.userInfoData.enc_bank_no = self.data.userInfoData.enc_bank_no.substring(self.data.userInfoData.enc_bank_no.length-4)
				for (var i = 0; i < self.data.bankData.length; i++) {
					if(self.data.bankData[i].value==self.data.userInfoData.bank_code){
						self.data.userInfoData.bank_code = self.data.bankData[i].name
					}
				}
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
				type: 2,
				thirdapp_id: 2,
				withdraw:1,
				withdraw_type:2
			}
		};
		postData.tokenFuncName = 'getThreeToken';
		if (self.data.userInfoData.bank_code.length == 0) {
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

			api.showToast('请输入提现金额', 'none')
		};
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
		self.data.submitData.count = self.data.userInfoData.balance;
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
