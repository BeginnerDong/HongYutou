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
		isFirstLoadAllStandard: ['getArtData'],
	},
	//事件处理函数
	preventTouchMove: function(e) {

	},

	onLoad() {
		const self = this;
		api.commonInit(self);
		self.getArtData()
	},

	getArtData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id
		};
		postData.getBefore = {
			article: {
				tableName: 'Label',
				searchItem: {
					title: ['=', ['消息']],
					thirdapp_id: ['=', [getApp().globalData.thirdapp_id]],
				},
				middleKey: 'menu_id',
				key: 'id',
				condition: 'in',
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.artData.push.apply(self.data.artData, res.info.data)
			}
			for (var i = 0; i < self.data.artData.length; i++) {
				self.data.artData[i].content = api.wxParseReturn(res.info.data[i].content).nodes;
			}

			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getArtData', self);

			self.setData({
				web_artData: self.data.artData,
			});
		};
		api.articleGet(postData, callback);
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
