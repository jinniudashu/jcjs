// pages/help/help.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    helpResource: app.globalData.helpUrl
  },

  onLoad: function (res) {
    this.videoContext = wx.createVideoContext('helpVideo')
    // 调用云函数记录日志
    wx.cloud.callFunction({
      name: 'log',
      data: {
        behavior: 'view',
        content: app.globalData.helpUrl
      },
      success: res => {
        console.log('观看帮助', res.result.openid)
      },
      fail: err => {
        console.error('[云函数] [log] 调用失败', err)
      }
    })
  },

  onReady: function () {
  },

  videoErrorCallback: function (e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
  },

  onShareAppMessage: function () {
    return{
      title: '基础计算过关',
      imageUrl: '/assets/img-share.png',
      path: '/pages/help/help'
    }
  }
})