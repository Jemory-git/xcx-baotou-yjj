import {
  getStorageFn
} from '../../utils/util.js'

Page({
  data: {
    recipesList: []
  },

  // 交互事件
  yulan_img(e) {
    if (e.target.dataset.imgId === this.data.imgId) {
      // 第一次肯定不等，如果相等就初始化imgId
      this.setData({
        imgId: ''
      })
      return;
    }
    let that = this;
    wx.getSystemInfo({
      success(res) {
        if (res.platform === 'ios') {
          that.setData({
            imgId: e.target.dataset.imgId
          })
        } else {
          wx.previewImage({
            current: e.currentTarget.dataset.currentUrl,
            urls: that.data.licenseList.map((c, i) => {
              return c.license_pic_url;
            }),
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getStorageFn('abc').then((res) => {
      this.setData({
        recipesList: res.data.cookbook_record
      })
    })
  }
})