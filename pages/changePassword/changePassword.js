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
		sForm: {
			phone:'',
			code:'',
			password: '',
			passwordNew: ''
		},
		text: '获取验证码', //按钮文字
		currentTime: 61, //倒计时 
		buttonCanClick:false
	},

	onLoad(options) {
		const self = this;
		console.log(options)
		self.data.type = options.type;
		self.setData({
			web_buttonCanClick:true
		})
	},



	submit() {
		const self = this;
		var postData = {};

		wx.showLoading();
		if (api.checkComplete(self.data.sForm)) {
			if (self.data.sForm.password != self.data.sForm.passwordNew) {
				api.showToast('两次密码不一致', 'none');
			} else {
				self.userUpdate()
			}
		} else {
			api.showToast('请补全信息', 'none');

		}

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
			if(phone!=wx.getStorageSync('threeInfo').login_name){
				api.buttonCanClick(self, true);
				api.showToast('非门店绑定手机号', 'none');
				return
			};
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


	bindInputChange(e) {
		const self = this;
		api.fillChange(e, self, 'sForm');
		self.setData({
			web_sForm: self.data.sForm,
		});
	},


	userUpdate() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('threeInfo').user_no
		};
		postData.data = {
			password: self.data.sForm.password
		};
		postData.smsAuth = {
			code:self.data.sForm.code,
			phone:self.data.sForm.phone
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.showToast('修改成功', 'none');

				setTimeout(function() {
					api.logOff();
				}, 800)
			} else {
				api.showToast(res.msg, 'none');
			}
		};
		api.userUpdate(postData, callback);
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
