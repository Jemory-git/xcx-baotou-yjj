import {
  ajax,
  showMsg
} from '../../utils/util.js'

Page({
  data: {
    liuyangJiluList: []
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
    ajax.post('/v1/login/detail_food_sample', {
      school_id: options.school_id
    }).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      this.setData({
        liuyangJiluList: data.data
      })

    })

  }
})