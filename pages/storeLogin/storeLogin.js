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
			login_name: '',
			password: ''
		},
		web_show: true,
	},

	onLoad(options) {
		const self = this;
		console.log(options)
		self.data.type = options.type;
		self.setData({
			web_type: self.data.type
		})
	},

	onShow() {
		const self = this;
		if (wx.getStorageSync('threeInfo') && wx.getStorageSync('threeToken')) {
			
			if(self.data.type=='store'){
				
				if (wx.getStorageSync('scope') == 30) {
					self.setData({
						web_show: false
					});
					wx.redirectTo({
						url: '/pages/store/store'
					})
				}
			}else if(self.data.type=='partner'){
				
				if (wx.getStorageSync('scope') == 60) {
					self.setData({
						web_show: false
					});
					wx.redirectTo({
						url: '/pages/agent/agent'
					})
				}
			}
			
		}
		
	},

	submit() {
		const self = this;
		var postData = {};
		
		wx.showLoading();
		if (api.checkComplete(self.data.sForm)) {

			wx.setStorageSync('login', self.data.sForm);
		} else {
			api.showToast('请输入账号密码', 'none');
			return
		}
		postData.data = api.cloneForm(self.data.sForm);
		const callback = (res) => {
			console.log(res)
			if (res) {
				wx.setStorageSync('scope', res.data.info.primary_scope);
				wx.setStorageSync('threeInfo', res.data.info);
				if(res.data.info.primary_scope==30){
					wx.redirectTo({
						url: '/pages/store/store'
					})
				}else if(res.data.info.primary_scope==60){
					wx.redirectTo({
						url: '/pages/agent/agent'
					})
				}
				
				api.showToast('登陆成功', 'none')
			} else {
				wx.hideLoading();
				api.showToast('用户不存在', 'none')
			}
		}
		token.getToken(callback);
	},


	bindInputChange(e) {
		const self = this;
		api.fillChange(e, self, 'sForm');
		self.setData({
			web_sForm: self.data.sForm,
		});
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
