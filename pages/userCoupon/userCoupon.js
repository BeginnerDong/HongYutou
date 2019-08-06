import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  data: {
    num:0,
    mainData:[],
    searchItem:{
			use_step:1
    },
    isFirstLoadAllStandard:['getMainData'],
  },


  onLoad(options){
    const self = this;
		api.commonInit(self);
		self.getMainData()
		
    
  },

  onShow(){
    const self = this;
  
   
  },


  getMainData(isNew){
    const self = this;
	var now = Date.parse(new Date());
		api.buttonCanClick(self);	
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = api.cloneForm(self.data.searchItem);
		postData.searchItem.type=['in',[1,2]]
	
    postData.order = {
      create_time:'desc'
    }
    const callback = (res)=>{
			 api.buttonCanClick(self,true);
      if(res.solely_code==100000){
        if(res.info.data.length>0){
          self.data.mainData.push.apply(self.data.mainData,res.info.data);
        }else{
          self.data.isLoadAll = true;
          api.showToast('没有更多了','none',1000);
        };
       
        api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
        self.setData({
          web_mainData:self.data.mainData,
        });  
      }else{
        api.showToast('网络故障','none')
      }
    };
    api.userCouponGet(postData,callback);
  },

  


  menuClick: function (e) {
    const self = this;
    api.buttonCanClick(self);
    const num = e.currentTarget.dataset.num;
    self.changeSearch(num);
  },

  changeSearch(num){
    const self = this;
    this.setData({
      num: num
    });
    self.data.searchItem = {};
    if(num=='0'){
		self.data.searchItem.use_step =1
    }else if(num=='1'){
     self.data.searchItem.use_step =2
    }else if(num=='2'){
      self.data.searchItem.use_step =-1
    }
    self.setData({
      web_mainData:[],
    });
    self.getMainData(true);
  },
  
  showToast(e){
	  const self = this;
	  if(api.getDataSet(e,'num')==0){
		  api.pathTo(api.getDataSet(e,'path'),'nav');
	  }else if(api.getDataSet(e,'num')==1){
		  api.showToast('优惠券已使用','none')
	  }else if(api.getDataSet(e,'num')==2){
		  api.showToast('优惠券已过期','none') 
	  }
  },

  
  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll&&self.data.buttonCanClick){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },


})

  