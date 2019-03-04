//app.js
App({
  onLaunch: function () {
    this.updateManager();

    if (!wx.cloud) {
      console.error('请升级微信到最新版本')
    } else {
      // 云初始化
      wx.cloud.init({
        traceUser: true,
      })
    };

    // 调用云函数
    wx.cloud.callFunction({
      name: 'log',
      data: {
        behavior: 'login',
        content: 'login'
      },
      success: res => {
        console.log('[云函数] [log] user openid: ', res.result.openid)
        this.openID = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [log] 调用失败', err)
      }
    });  
  },

  updateManager() {
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            updateManager.applyUpdate()   // 新版本已下载好，调用applyUpdate应用新版本并重启
          })
          updateManager.onUpdateFailed(function () {    // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索“基础计算过关”打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  globalData: {
    adPictureUrl: 'cloud://peiwaxue1.7065-peiwaxue1/基础计算小程序轮播_怎么做基础计算训练.jpg',
    adVideoUrl: 'cloud://peiwaxue1.7065-peiwaxue1/ad20190301怎么练习基础计算.mp4',
    helpUrl: 'cloud://peiwaxue1.7065-peiwaxue1/help20190301.mp4',
    openID: null,
  }
})