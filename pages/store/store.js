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

		isFirstLoadAllStandard: ['getMainData']
	},

	onLoad(options) {
		const self = this;
		api.commonInit(self);

		self.getMainData()

	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.getAfter = {
			Payment: {
				tableName: 'FlowLog',
				middleKey: 'user_no',
				key: 'user_no',
				condition: '=',
				searchItem: {
					status: 1,
					count: ['>', 0]
				},
				compute: {
					payment: [
						'sum',
						'count',
						{
							status: 1,
							count: ['>', 0]
						}
					],
					withdraw: [
						'sum',
						'count',
						{
							status: 1,
							count: ['<', 0],
							withdraw: 1
						}
					],
				}
			}
		}
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
			};
			self.setData({
				web_mainData: self.data.mainData
			})
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
		};
		api.userGet(postData, callback);
	},

	removeStorageSync() {
		api.logOff();
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
