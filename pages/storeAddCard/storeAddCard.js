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
		disabled: true,
		isFirstLoadAllStandard: ['getMainData'],
		submitData: {
			enc_bank_no: '',
			enc_true_name: '',
			bank_code: '',
			phone: '',
			code: ''
		},
		text: '获取验证码', //按钮文字
		currentTime: 61, //倒计时 
		bankData: [{
				name: '工商银行',
				value: 1002
			}, {
				name: '农业银行',
				value: 1005
			}, {
				name: '中国银行',
				value: 1026
			}, {
				name: '建设银行',
				value: 1003
			}, {
				name: '招商银行',
				value: 1001
			},
			{
				name: '邮储银行',
				value: 1066
			}, {
				name: '交通银行',
				value: 1020
			}, {
				name: '浦发银行',
				value: 1004
			}, {
				name: '民生银行',
				value: 1006
			}, {
				name: '兴业银行',
				value: 1009
			},
			{
				name: '平安银行',
				value: 1010
			}, {
				name: '中信银行',
				value: 1021
			}, {
				name: '华夏银行',
				value: 1025
			}, {
				name: '广发银行',
				value: 1027
			}, {
				name: '光大银行',
				value: 1022
			},
			{
				name: '北京银行',
				value: 1032
			}, {
				name: '宁波银行',
				value: 1056
			},
		]
	},
	//事件处理函数


	onLoad(options) {
		const self = this;
		api.commonInit(self);

		self.getMainData()
	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		const callback = (res) => {
			self.data.mainData = {};
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.submitData.enc_bank_no = res.info.data[0].info.enc_bank_no;
				self.data.submitData.enc_true_name = res.info.data[0].info.enc_true_name;
				self.data.submitData.bank_code = res.info.data[0].info.bank_code;
				self.data.submitData.phone = res.info.data[0].info.phone;
				for (var i = 0; i < bankData.length; i++) {
					if (bankData[i].value == self.data.mainData.info.bank_code) {
						self.setData({
							web_index: i
						})
					}
				}
			};
			self.setData({
				web_submitData: self.data.submitData,
				web_mainData: self.data.mainData
			});
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
		};
		api.userGet(postData, callback);
	},

	bankChange(e) {
		const self = this;
		console.log('picker发送选择改变，携带值为', e.detail.value)
		self.data.submitData.bank_code = self.data.bankData[e.detail.value].value;

		self.setData({
			web_index: e.detail.value,
			web_submitData: self.data.submitData
		})
	},

	getCode() {
		var self = this;
		api.buttonCanClick(self);
		var phone = self.data.sForm.phone;
		var currentTime = self.data.currentTime //把手机号跟倒计时值变例成js值
		if (self.data.sForm.phone == '') {
			api.buttonCanClick(self, true);
			api.showToast('手机号码不能为空', 'none');
			return
		} else if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
			api.buttonCanClick(self, true);
			api.showToast('手机号格式不正确', 'none');
			return
		} else {
			//当手机号正确的时候提示用户短信验证码已经发送
			const postData = {
				data: {
					thirdapp_id: 2,
					phone: self.data.sForm.phone
				}
			};
			const callback = (res) => {
				if (res.solely_code == 100000) {
					api.buttonCanClick(self, true);
					api.showToast('验证码已发送', 'none');
					//设置一分钟的倒计时
					var interval = setInterval(function() {
						currentTime--; //每执行一次让倒计时秒数减一
						self.setData({
							text: currentTime + 's', //按钮文字变成倒计时对应秒数
						})
						//如果当秒数小于等于0时 停止计时器 且按钮文字变成重新发送 且按钮变成可用状态 倒计时的秒数也要恢复成默认秒数 即让获取验证码的按钮恢复到初始化状态只改变按钮文字
						if (currentTime <= 0) {
							clearInterval(interval)
							self.setData({
								text: '重新发送',
								currentTime: 61,
							})
						}

					}, 1000);
				} else {
					api.buttonCanClick(self, true);
					api.showToast(res.msg, 'none')
				}
			};
			api.codeGet(postData, callback)
		};
	},

	changeBind(e) {
		const self = this;
		api.fillChange(e, self, 'submitData');
		self.setData({
			web_submitData: self.data.submitData,
		});
		console.log(self.data.submitData)
	},




	submit() {
		const self = this;
		api.buttonCanClick(self)
		var name = self.data.submitData.enc_true_name;
		var phone = self.data.submitData.phone;
		const pass = api.checkComplete(self.data.submitData);
		console.log(self.data.submitData)
		if (pass) {
			if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
				api.showToast('手机格式错误', 'none')
			} else {
				if (!/^[\u4E00-\u9FA5]+$/.test(name)) {
					api.showToast('姓名格式错误', 'none')
				} else {
					self.userInfoUpdate();
				}
			}
		} else {
			api.showToast('请补全信息', 'none');
			api.buttonCanClick(self, true);
		};
	},





	userInfoUpdate() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.user_type = 1;
		postData.data = {};
		postData.data = api.cloneForm(self.data.submitData);
		const callback = (data) => {
			api.buttonCanClick(self, true);
			if (data.solely_code == 100000) {
				api.showToast('绑定成功', 'none')
				setTimeout(function() {
					wx.navigateBack({
						delta: 1
					});
				}, 300);
			} else {
				api.showToast('网络故障', 'none')
			};

		};
		api.bindCard(postData, callback);
	},




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
