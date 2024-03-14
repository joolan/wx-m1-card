// pages/home/r.js
let nfc = require("../../utils/readDirect.js")
Page({

  /**
   * 页面的初始数据
   */
	nfc: null,
  data: {
		winShow:'',
		result: [],
		cardNo:'',
		icNo:'',
		readArea:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

	},
	closeNfc: function(e){
		this.setData({
			winShow: ''
	})
	}
	,
	readDirect: function (e) {
    this.setData({ result: [],cardNo:'',icNo:'',readArea:[] })
		/*
		wx.showToast({
      title: '请将标签贴近手机',
      icon: "none",
      mask: true,
		})
	*/
	
		this.setData({
				winShow: ' show'
		})

		//this.data.readArea = [[0,0,'FFFFFFFFFFFF'],[15,0,'FFFFFFFFFFFF']]// 扇区 块 密钥
		this.data.readArea = [[0,0,'FFFFFFFFFFFF']] 
		nfc.read(this)
  },
})