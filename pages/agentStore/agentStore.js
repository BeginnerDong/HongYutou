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
		submitData:{
			login_name:''
		},
		mainData: [],
		isFirstLoadAllStandard: ['getMainData'],
		searchItem:{
			parent_no: wx.getStorageSync('threeInfo').user_no,
			user_type:1
		},
		searchItemTwo:{
			status:1
		},
	},

	onLoad(options) {

		const self = this;
		api.commonInit(self);
		

	},

	onShow(){
		const self = this;

		self.getMainData()
	},


	getMainData(isNew) {
		const self = this;
		if(isNew){
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = api.cloneForm(self.data.searchItem);

		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
			} else {
				api.showToast('没有更多了', 'none')
			};
			setTimeout(function()
			{
			  wx.hideNavigationBarLoading();
			  wx.stopPullDownRefresh();
			},300);
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			console.log(self.data.mainData)
		};
		api.userGet(postData, callback);
	},
	
	changeBind(e){
	  const self = this;
	  api.fillChange(e,self,'submitData');
	  console.log(self.data.submitData);
	  self.setData({
	    web_submitData:self.data.submitData
	  })
	},
	
	search(){
		const self = this;
		if(self.data.submitData.login_name){  
	    self.data.searchItem.login_name = ['LIKE',['%'+self.data.submitData.login_name+'%']],
	    self.getMainData(true)
	    
	  }else if(self.data.submitData.login_name==''){
	      api.showToast('输入门店名查询','none');
	      return
	  }
	},
	
	
	
	onPullDownRefresh(){
	  const self = this;
	  wx.showNavigationBarLoading(); 
	  delete self.data.searchItem.create_time;
	  delete self.data.searchItem.login_name;
	  self.data.submitData.login_name = '';
	  self.setData({
	    web_startTime:'',
	    web_endTime:'',	
		web_submitData:self.data.submitData
	  });
	  self.getMainData(true);
	},
	
	bindTimeChange: function(e) {
	  const self = this;
	  var label = api.getDataSet(e,'type');
	  this.setData({
	    ['web_'+label]: e.detail.value
	  });
	  self.data[label+'stap'] = new Date(self.data.date+' '+e.detail.value).getTime()/1000;
	  if(self.data.endTimestap&&self.data.startTimestap){
	    self.data.searchItem.create_time = ['between',[self.data.startTimestap,self.data.endTimestap]];
	  }else if(self.data.startTimestap){
	    self.data.searchItem.create_time = ['>',self.data.startTimestap];
	  }else{
	    self.data.searchItem.create_time = ['<',self.data.endTimestap];
	  };
	  self.getMainData(true);   
	},

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
