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
	data: {
		flowlogData:[],
		isFirstLoadAllStandard: ['getMainData'],
		bankData:[{name:'工商银行',value:1002},{name:'农业银行',value:1005},{name:'中国银行',value:1026},{name:'建设银行',value:1003},{name:'招商银行',value:1001},
		{name:'邮储银行',value:1066},{name:'交通银行',value:1020},{name:'浦发银行',value:1004},{name:'民生银行',value:1006},{name:'兴业银行',value:1009},
		{name:'平安银行',value:1010},{name:'中信银行',value:1021},{name:'华夏银行',value:1025},{name:'广发银行',value:1027},{name:'光大银行',value:1022},
		{name:'北京银行',value:1032},{name:'宁波银行',value:1056},],
		submitData: {
			enc_bank_no: '',
			enc_true_name: '',
			bank_code: '',
		},
	},
	//事件处理函数


	onLoad(options) {
		const self = this;
		api.commonInit(self);

		
	},
	
	onShow(){
		const self = this;
		self.getMainData();

	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			user_no:wx.getStorageSync('threeInfo').user_no,
			// withdraw:1
		};
		postData.getAfter = {
			Payment: {
				tableName: 'FlowLog',
				middleKey: 'user_no',
				key: 'user_no',
				condition: '=',
				searchItem: {
					status:['in',[0,1,-1]],
					user_no:wx.getStorageSync('threeInfo').user_no
				},
				compute: {
					payment: [
						'sum',
						'count',
						{
							status: 1,
							count:['>',0]
						}
					],
					withdraw: [
						'sum',
						'count',
						{
							status: 1,
							count:['<',0],
							withdraw:1
						}
					],
				}
			}
		}
		const callback = (res) => {
			self.data.mainData = {};
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				for (var i = 0; i < self.data.bankData.length; i++) {
					if(self.data.bankData[i].value==self.data.mainData.info.bank_code){
						self.data.mainData.info.bank_code = self.data.bankData[i].name;
						self.data.mainData.info.enc_bank_no = self.data.mainData.info.enc_bank_no.substring(self.data.mainData.info.enc_bank_no.length-3)
					}
				}
			};
			self.setData({
				web_mainData: self.data.mainData
			});
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
		};
		api.userGet(postData, callback);
	},
	
	
	
	
	deleteCard() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.user_type = 1;
		postData.data = {};
		postData.data = api.cloneForm(self.data.submitData);
		const callback = (data) => {
			api.buttonCanClick(self, true);
			if (data.solely_code == 100000) {
				api.showToast('解绑成功', 'none')
				
			} else {
				api.showToast('网络故障', 'none')
			};
	
		};
		api.bindCard(postData, callback);
	},
/* 	getFlowLogData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			status:['in',[0,1,-1]]
		};
		const callback = (res) => {

			if (res.info.data.length > 0) {
				self.data.flowlogData.push.apply(self.data.flowlogData,res.info.data)
				
			};
			self.setData({
				web_flowlogData: self.data.flowlogData
			});
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getFlowLogData', self);
		};
		api.flowLogGet(postData, callback);
	}, */



	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},

	intoPathRedi(e) {
		const self = this;
		wx.navigateBack({
			delta: 1
		})
	},

	intoPathRedirect(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	}

})
