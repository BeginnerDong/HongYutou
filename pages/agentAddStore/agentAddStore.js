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
			thirdapp_id:2,
			name:'',
			phone:'',
			password:'',
			address:'',
			mainImg:[],
			shop_name:'',
			longitude:'',
			latitude:'',
		},
		isFirstLoadAllStandard: ['getMainData'],
		region: '',
		customItem: '全部'
	},
	//事件处理函数
	preventTouchMove: function(e) {

	},

	onLoad(options) {
		const self = this;
		
		self.data.type=options.type;
		console.log(options);
		api.commonInit(self);
		self.getMainData();
		self.setData({
			web_sForm:self.data.sForm
		})
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


	changeBind(e) {
		const self = this;
		api.fillChange(e, self, 'sForm');
		console.log(self.data.sForm);
		self.setData({
			web_sForm: self.data.sForm,
		});
	},

	addShop() {
		const self = this;
		const postData = {
			tokenFuncName:'getThreeToken',
			data:api.cloneForm(self.data.sForm)
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.buttonCanClick(self, true);
				api.showToast('添加成功', 'none', 800);
				setTimeout(function() {
					wx.navigateBack({
						delta: 1
					})
				}, 800)
			} else {
				api.buttonCanClick(self, true);
				api.showToast(res.msg, 'none', 1000);
			};

		};
		api.addShop(postData, callback);
	},

	chooseLocation(e){
	  var self = this;
	  wx.chooseLocation({
	    success: function(res){
	      self.data.sForm.address = res.address,
	      self.data.sForm.longitude = res.longitude,
	      self.data.sForm.latitude = res.latitude,
	 
		self.setData({
			web_sForm:self.data.sForm
		})
	    
	    },
	    fail: function() {
	    // fail
	    },
	    complete: function() {
	    // complete
	    }
	  })
	},

	submit() {
		const self = this;
		api.buttonCanClick(self);
		var phone = self.data.sForm.phone;
		self.data.sForm.address = self.data.region+self.data.sForm.address;
		
		const pass = api.checkComplete(self.data.sForm);
		console.log('pass', self.data.sForm)
		if (pass) {
			
			if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
				api.buttonCanClick(self, true);
				api.showToast('手机格式错误', 'none')
			} else {
				self.addShop();
			}
		} else {
			api.buttonCanClick(self, true);
			api.showToast('请补全信息', 'none');
		};
	},

	upLoadImg(){
	  const self = this;
	 
	  wx.showLoading({
	    mask: true,
	    title: '',
	  });
	  const callback = (res)=>{
	    console.log('res',res)
	    if(res.solely_code==100000){
	      self.data.sForm.mainImg.push({url:res.info.url,type:'image'})
	      self.setData({
	        web_sForm:self.data.sForm
	      });
	      wx.hideLoading()  
	    }else{
	      api.showToast('网络故障','none')
	    }
	  };
	  wx.chooseImage({
	    count:1,
	    success: function(res) {
	      console.log(res);
	      var tempFilePaths = res.tempFilePaths;
	      console.log(callback)
		
			api.uploadFile(tempFilePaths[0],'file',{tokenFuncName:'getThreeToken'},callback)
			
	      
	    },
	    fail: function(err){
	      wx.hideLoading();
	    }
	  })
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
