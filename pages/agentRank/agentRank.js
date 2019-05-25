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
		mainData: [],
		searchItem: {
			type:1,
			period:''
		},
		isFirstLoadAllStandard: ['getMainData','getRuleData'],
		showRule:false
	},


	onLoad(options) {
		const self = this;
		api.commonInit(self);
		var now = new Date();
		self.data.searchItem.period = api.getFirstDayOfWeek(now);
		self.getUserData();
		self.getMainData();
		self.getRuleData()		
	},

	onShow() {
		const self = this;
		

	},
	
	isShow(){
		const self = this;
		self.data.showRule = !self.data.showRule;
		self.setData({
			showRule:self.data.showRule
		})
	},
	
	getUserData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		const callback = (res) => {
			
		};
		api.userGet(postData, callback);
	},

	getMainData(isNew) {
		const self = this;
		if(isNew){
			api.clearPageIndex(self)
		}
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = api.cloneForm(self.data.searchItem);
		postData.getAfter = {
			user:{
				token:wx.getStorageSync('threeToken'),
				tableName:'User',
				middleKey:'user_no',
				key:'user_no',
				searchItem:{
					status:1
				},
				condition:'='
			}
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.data.mainData.push.apply(self.data.mainData, res.info.data);
					for (var i = 0; i < self.data.mainData.length; i++) {
						if(self.data.mainData[i].user_no==wx.getStorageSync('threeInfo').user_no){
							self.data.mainDataMe = self.data.mainData[i]
						}
					}
				} else {
					self.data.isLoadAll = true;
					api.showToast('本月暂无数据', 'none', 1000);
				};
				
				api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
				self.setData({
					web_mainData: self.data.mainData,
					web_mainDataMe:self.data.mainDataMe 
				});
			} else {
				api.showToast('网络故障', 'none')
			}
		};
		api.rankGet(postData, callback);
	},

	getRuleData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id
		};
		postData.getBefore = {
			article: {
				tableName: 'Label',
				searchItem: {
					title: ['=', ['奖励规则']],
					thirdapp_id: ['=', [getApp().globalData.thirdapp_id]],
				},
				middleKey: 'menu_id',
				key: 'id',
				condition: 'in',
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.ruleData = res.info.data[0];
				self.data.ruleData.content = api.wxParseReturn(res.info.data[0].content).nodes;
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getRuleData', self);
			self.setData({
				web_ruleData: self.data.ruleData,
			});
		};
		api.articleGet(postData, callback);
	},
	
	
	bindTimeChange(e){
		const self = this;
		console.log(e);
		self.data.searchItem.period = api.getFirstDayOfWeek(e.detail.value);
		self.setData({
			web_time:e.detail.value
		})
		self.getMainData(true)
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
