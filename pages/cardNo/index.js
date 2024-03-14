// pages/nfct/nfct.js
//let nfc = require("../../utils/nfctoolsMifareClassic.js")
let nfc = require("../../utils/card.js")
Page({
  nfc: null,
  /**
   * 页面的初始数据
   */
  data: {
		sectorIndex: 1,
		blockIndex: 0,
    authKey: "FFFFFFFFFFFF",
    useAuthKey: "A",
    defaultKey: ["FFFFFFFFFFFF", "D3F7D3F7D3F7", "A0A1A2A3A4A5", "B0B1B2B3B4B5", "AABBCCDDEEFF", "A0B1C2D3E4F5", "B0B1B2B3B4B5", "000000000000"],
    defaultSector: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    chekcKeyItems: [
      { value: 'A', name: '密钥A', checked: 'true' },
      { value: 'B', name: '密钥B' },
    ],
		result: [],
		cardNo:'',
		icNo:'',
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
    nfc.close()
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
  readCardNo: function (e) {
    this.setData({ result: [],cardNo:'',icNo:'' })
    wx.showToast({
      title: '请将标签贴近手机',
      icon: "none",
      mask: true,
		})

		//this.data.sectorIndex=1  // 1扇区ic卡号
		//this.data.sectorIndex=15 //15扇区 会员卡号码

		nfc.read(1,0,this)
		//nfc.read(15,0,this)
  },
 
})