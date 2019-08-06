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

		mainData: [],
		isFirstLoadAllStandard: ['getMainData'],
		submitData: {
			shop_name: ''
		},
		searchItem: {
			user_type: 1,
		},
		La1: '',
		lo1: '',
		order:{}
	},

	onLoad(options) {

		const self = this;
		console.log('options', options)
		api.commonInit(self);
		self.getLocation();


	},

	getLocation() {
		const self = this;
		const callback = (res) => {
			if (res.errMsg == "getLocation:ok") {
					self.data.la1 = res.latitude;
					self.data.lo1 = res.longitude
			}
			console.log(res)
			self.getMainData()
		};
		api.getLocation('getGeocoder', callback)
	},


	getMainData() {
		const self = this;
		var lat = self.data.la1;
		var lon = self.data.lo1;
		var orderKey = 'ACOS(SIN(('+ lat +'* 3.1415) / 180 ) *SIN((latitude * 3.1415) / 180 ) +COS(('+ lat +' * 3.1415) / 180 ) * COS((latitude * 3.1415) / 180 ) *COS(('+ lon +' * 3.1415) / 180 - (longitude * 3.1415) / 180 ) ) * 6379';
		self.data.order[orderKey]= 'asc';
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.tokenFuncName = 'getProjectToken';
		postData.searchItem = api.cloneForm(self.data.searchItem);
		postData.order = api.cloneForm(self.data.order);
		
		postData.order = api.cloneForm(self.data.order)
		postData.getBefore = {
			shop: {
				tableName: 'User',
				middleKey: 'status',
				key: 'status',
				searchItem: {
					primary_scope: ['in', [30]],
				},
				condition: 'in'
			}
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data);
				for (var i = 0; i < self.data.mainData.length; i++) {
					self.data.mainData[i].distance =
						api.distance(self.data.la1, self.data.lo1, self.data.mainData[i].latitude, self.data.mainData[i].longitude)
					console.log('self.data.mainData[i].distance', self.data.mainData[i].distance)
					
				};

				
				
			}else {
				self.data.isLoadAll = true;
				api.showToast('没有更多了', 'none')
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
				//web_testObject:testObject
			});
			console.log(self.data.mainData)
		};
		api.userInfoGet(postData, callback);
	},

	changeBind(e) {
		const self = this;
		api.fillChange(e, self, 'submitData');
		console.log(self.data.submitData);
		self.setData({
			web_submitData: self.data.submitData
		});
		if (self.data.submitData.shop_name) {
			self.data.searchItem.shop_name = ['LIKE', ['%' + self.data.submitData.shop_name + '%']],
				self.getMainData(true)

		} else if (self.data.submitData.shop_name == '') {
			api.showToast('输入门店名查询', 'none');
			return
		}
	},

	/* search() {
		const self = this;
		
	}, */


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
