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
		artData: [],
		isLoadAll: false,
		sForm: {
			thirdapp_id: 2,
			name: '',
			phone: '',
			password: '',
			address: '',
			code: ''
		},
		isFirstLoadAllStandard: ['getMainData'],
		region: '',
		customItem: '全部',
		text: '获取验证码', //按钮文字
		currentTime: 61, //倒计时 
	},
	//事件处理函数
	preventTouchMove: function(e) {

	},

	onLoad(options) {
		const self = this;

		self.data.type = options.type;
		console.log(options);
		api.commonInit(self);
		self.getMainData();

	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id
		};
		postData.getBefore = {
			article: {
				tableName: 'Label',
				searchItem: {
					title: ['=', ['注册']],
					thirdapp_id: ['=', [getApp().globalData.thirdapp_id]],
				},
				middleKey: 'menu_id',
				key: 'id',
				condition: 'in',
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.articleGet(postData, callback);
	},

	bindRegionChange(e) {
		const self = this;
		console.log('picker发送选择改变，携带值为', e.detail.value)
		self.data.region = e.detail.value.join('');
		this.setData({
			web_region: self.data.region
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
		api.fillChange(e, self, 'sForm');
		console.log(self.data.sForm);
		self.setData({
			web_sForm: self.data.sForm,
		});
	},





	register() {
		const self = this;
		const postData = {
			data: api.cloneForm(self.data.sForm)
		};
		if (self.data.type == 'store') {
			postData.data.primary_scope = 30
		} else if (self.data.type == 'partner') {
			postData.data.primary_scope = 60
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true);
				api.showToast('申请成功', 'none', 800);
				setTimeout(function() {
					api.pathTo('/pages/user/user', 'rela');
				}, 800)
			} else {
				api.buttonCanClick(self, true);
				api.showToast(res.msg, 'none', 1000);
			};

		};
		api.register(postData, callback);
	},



	submit() {
		const self = this;
		api.buttonCanClick(self);
		var phone = self.data.sForm.phone;
		self.data.sForm.address = self.data.region + self.data.sForm.address;

		const pass = api.checkComplete(self.data.sForm);
		console.log('pass', self.data.sForm)
		if (pass) {
			if (self.data.region.length == 0) {
				api.buttonCanClick(self, true);
				api.showToast('请选择省市区', 'none');
				return
			};
			if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
				api.buttonCanClick(self, true);
				api.showToast('手机格式错误', 'none')
			} else {
				self.register();
			}
		} else {
			api.buttonCanClick(self, true);
			api.showToast('请补全信息', 'none');
		};
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
	},



})
