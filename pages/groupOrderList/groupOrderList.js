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
		mainData:[],
		isFirstLoadAllStandard: ['getMainData'],
		


	},


	//事件处理函数

	onLoad(options) {
		const self = this;
		api.commonInit(self);
		self.data.id = options.id;
		self.getMainData()

	},


	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getProjectToken',
			postData.searchItem = {
				user_type: 0,
				type: 3,
				group_leader: 'true',
				order_step: 4,
				pay_status: 1
			};
		postData.getBefore = {
			OrderItem: {
				tableName: 'OrderItem',
				searchItem: {
					product_id: ['in', [self.data.id]],
				},
				key: 'order_no',
				middleKey: 'order_no',
				condition: 'in',
			},
		};
		postData.getAfter = {
			user: {
				tableName: 'User',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1
				},
				condition: '='
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData.push.apply(self.data.mainData, res.info.data)
			};
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData
			});
		}
		api.orderGet(postData, callback)
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
