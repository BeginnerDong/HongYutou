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
		isFirstLoadAllStandard: ['getMainData']

	},

	onLoad(options) {

		const self = this;
		api.commonInit(self);
		self.data.user_no = options.user_no;
		self.getMainData()

	},




	getMainData() {
		const self = this;
		const postData = {};
		postData.tokenFuncName = 'getThreeToken';
		postData.searchItem = {
			user_no:self.data.user_no
		};
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
				}
			}
		}
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData=res.info.data[0]
			} else {
				api.showToast('数据错误', 'none')
			}
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getMainData', self);
			self.setData({
				web_mainData: self.data.mainData,
			});
			console.log(self.data.mainData)
		};
		api.userGet(postData, callback);
	},





})
