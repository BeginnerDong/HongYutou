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
		api.buttonCanClick(self);	
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
		postData.searchItem.type = ['in',[3,4]];
		postData.searchItem.user_no = wx.getStorageSync('info').user_no;
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
    api.orderGet(postData,callback);
  },
  
  

  deleteOrder(e){
    const self = this;
    api.buttonCanClick(self)
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {};
    postData.searchItem.id = api.getDataSet(e,'id');
    const callback  = res=>{
      if(res){
        api.dealRes(res);
      };
      self.getMainData(true);
    };
    api.orderDelete(postData,callback);
  },

  orderUpdate(e){
    const self = this;
    api.buttonCanClick(self)
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.data ={
      transport_status:2,
      order_step:3
    }
    postData.searchItem = {};
    postData.searchItem.id = api.getDataSet(e,'id');
    const callback  = res=>{
      if(res.solely_code==100000){
        api.showToast('已确认收货','none'); 
      }else{
        api.showToast(res.msg,'none')
      };  
      self.getMainData(true);
    };
    api.orderUpdate(postData,callback);
  },

  refuedOrder(e){
    const self = this;
    api.buttonCanClick(self)
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.data ={
      order_step:1
    }
    postData.searchItem = {};
    postData.searchItem.id = api.getDataSet(e,'id');
    const callback  = res=>{
      if(res.solely_code==100000){
        api.showToast('申请成功','none'); 
      }else{
        api.showToast(res.msg,'none')
      };  
      self.getMainData(true);
    };
    api.orderUpdate(postData,callback);
  },



  pay(e){
    const self = this;
	console.log(e)
    var id = api.getDataSet(e,'id');
    
    api.pathTo('/pages/confirmOrder/confirmOrder?id='+id,'nav'); 
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

    }else if(num=='1'){
      self.data.searchItem.pay_status = '0';
      self.data.searchItem.order_step = '0';
    }else if(num=='2'){
      self.data.searchItem.pay_status = '1';
      /* self.data.searchItem.transport_status = ['in',[0,1]]; */
      self.data.searchItem.order_step = '4';
    }else if(num=='3'){
      self.data.searchItem.pay_status = '1';
      self.data.searchItem.transport_status = '0';
      self.data.searchItem.order_step = ['in',[0,5]];
    }else if(num=='4'){
      self.data.searchItem.pay_status = '1';
      self.data.searchItem.transport_status = '1';
      self.data.searchItem.order_step = ['in',[0,5]];
    }else if(num=='5'){
      self.data.searchItem.pay_status = '1';
      self.data.searchItem.transport_status = '2';
      self.data.searchItem.order_step = '3';
    }
    self.setData({
      web_mainData:[],
    });
    self.getMainData(true);
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

  