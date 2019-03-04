// pages/playVideo/playVideo.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */

  data: {
    adVideoUrl: app.globalData.adVideoUrl,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (res) {
    this.videoContext = wx.createVideoContext('myVideo')
    // 调用云函数记录日志
    wx.cloud.callFunction({
      name: 'log',
      data: {
        behavior: 'view',
        content: app.globalData.adVideoUrl,
      },
      success: res => {
        console.log('观看视频', res.result.openid)
      },
      fail: err => {
        console.error('[云函数] [log] 调用失败', err)
      }
    })
  },
  
 /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

 },

  videoErrorCallback: function (e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  
  onShareAppMessage: function () {
    return{
      title: '基础计算过关',
      imageUrl: '/assets/img-share.png',
      path: '/pages/playVideo/Video'
    }
  }
})