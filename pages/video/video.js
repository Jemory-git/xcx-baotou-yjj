// pages/video/video.js
Page({
  data: {
    source: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'monitor_url',
      success(res) {
        that.setData({
          source: res.data
        })
      }
    })
  }
})