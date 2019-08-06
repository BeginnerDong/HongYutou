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
		num: 0,
		sForm: {
			name: '',
			phone: '',
			address: '',
			balance: '',
			shop_name: '',
			parent_no: '',
			/*    level:'',
			    passage1:'',
			    idCard:'' */
			passage1:[]
		},
		mainData: [],
		
		isEdit: [],
		isFirstLoadAllStandard: ['userInfoGet', 'getMainData'],
	},


	onLoad: function() {
		const self = this;
		wx.setNavigationBarTitle({
			title: '门店管理',
		});
		api.commonInit(self);
		self.userInfoGet();
		self.getMainData()
	},



	userInfoGet() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.sForm.name = res.info.data[0].info.name;
				self.data.sForm.phone = res.info.data[0].info.phone;
				self.data.sForm.address = res.info.data[0].info.address;
				self.data.sForm.balance = res.info.data[0].info.balance;
				self.data.sForm.shop_name = res.info.data[0].info.shop_name;
				self.data.sForm.parent_no = res.info.data[0].parent_no;
			};


			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'userInfoGet', self);
			self.setData({
				web_sForm: self.data.sForm,
			});

		};
		api.userGet(postData, callback);
	},

	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			category_id: 6,
			user_no: wx.getStorageSync('threeInfo').user_no
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				for (var i = 0; i < self.data.mainData.length; i++) {
					 self.data.isEdit.push(false)
				}
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			console.log(self.data.isEdit)
		};
		api.productGet(postData, callback);
	},

	changeBind(e) {
		const self = this;
		console.log(e)
		if(api.getDataSet(e, 'key')=='price'){
			self.data.sForm.price[api.getDataSet(e, 'index')] = api.getDataSet(e, 'value');
		};
		if (api.getDataSet(e, 'value')) {
			self.data.sForm[api.getDataSet(e, 'key')] = api.getDataSet(e, 'value');
		} else {
			api.fillChange(e, self, 'sForm');
		};
		console.log(self.data.sForm);
		self.setData({
			web_sForm: self.data.sForm,
		});
	},

	userInfoUpdate() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			user_no: wx.getStorageSync('threeInfo').user_no
		};
		postData.data = {
			name: self.data.sForm.name,
			phone: self.data.sForm.phone,
			address: self.data.sForm.address,
			shop_name:self.data.sForm.shop_name
		};
/* 		postData.saveAfter = [{
			tableName: 'User',
			FuncName: 'update',
			searchItem: {
				user_no: wx.getStorageSync('threeInfo').user_no
			},
			data: {
				login_name: self.data.sForm.login_name,
			}
		}]; */
		const callback = (data) => {
			api.buttonCanClick(self, true);
			if (data.solely_code == 100000) {
				api.showToast('完善成功', 'none');

				setTimeout(function() {
					api.pathTo('/pages/store/store', 'rela')
				}, 1000);
			} else {
				api.showToast(data.msg, 'none')
			};

		};
		api.userInfoUpdate(postData, callback);
	},
	
	productUpdate(index){
	  const self = this;
	  const postData = {};
	  postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			id:self.data.mainData[index].id
		},
	  postData.data = {
			passage1:self.data.sForm.passage1
		};
	  const callback = (data)=>{
			 api.buttonCanClick(self,true);
	    if(data.solely_code==100000){
	      api.showToast('修改成功','none');
				self.data.isEdit[index] = false;
				self.data.mainData[index].passage1 = self.data.sForm.passage1;
	    }else{
	      api.showToast(data.msg,'none')
	    };
			self.setData({
				web_isEdit:self.data.isEdit,
				web_mainData:self.data.mainData
			})
	  };
	  api.productUpdate(postData,callback);
	},

	submit() {
		const self = this;
		api.buttonCanClick(self);
		var phone = self.data.sForm.phone;
		var newObject = api.cloneForm(self.data.sForm);
		delete newObject.price;
		const pass = api.checkComplete(self.data.sForm);
		if (pass) {
			if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
				api.buttonCanClick(self, true);
				api.showToast('手机格式不正确', 'none')

			} else {
				wx.showLoading();
				self.userInfoUpdate();
			}
		} else {
			api.buttonCanClick(self, true);
			api.showToast('请补全信息', 'none');

		};
	},
	
	submitTwo(e) {
		const self = this;
		api.buttonCanClick(self);
		var index = api.getDataSet(e,'index');
		if (self.data.sForm.price!='') {

				self.productUpdate(index);
		
		} else {
			api.buttonCanClick(self, true);
			api.showToast('请输入价格', 'none');	
		};
	},

	edit(e) {
		const self = this;
		console.log(e);
		var index = api.getDataSet(e,'index');
		self.data.isEdit[index] = true;
		self.setData({
			web_isEdit: self.data.isEdit
		})
	},



	menuClick(e) {
		const self = this;
		//api.buttonCanClick(self)
		const num = e.currentTarget.dataset.num;
		//self.changeSearch(num);
		self.setData({
			num: num
		});
	},



	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll && self.data.buttonCanClick) {
			self.data.paginate.currentPage++;
			self.getMainData();
		};
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
