import {
  ajax,
  showMsg,
  getStorageFn
} from '../../utils/util.js'

Page({

  data: {
    jigouName: '',
    address: '',
    imgsInfo: {},
    checkList: [],
    contentList: [],
    imgs: [],
    imgId: '',
    // imgss: ['http://es6.ruanyifeng.com/images/cover-3rd.jpg'],
    showListBoo: ''
  },

  // 自定义方法
  getCheckList(data) {
    ajax.post('/v1/login/index_check_detail', data).then((data) => {
      if (data.errcode != 0) {
        // 数据请求失败
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      this.setData({
        checkList: data.data.content,
        contentList: data.data.summary.correct_content === null ? null : data.data.summary.correct_content.split('&&&'),
        imgs: data.data.summary.check_imgs,
        showListBoo: true
      })
      if (data.data.content.length === 0) {
        this.setData({
          showListBoo: false
        })
      }
    }).catch(() => {
      this.setData({
        showListBoo: false
      })
    })
  },

  // 交互事件

  prevImg(e) {
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
            current: e.currentTarget.dataset.src,
            urls: that.data.imgs,
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getStorageFn('userarea').then((v) => {
      let arr = v.data.reverse().map((c, i) => {
        return c.name
      })
      // 设置机构地址和名称
      this.setData({
        jigouName: options.jigouName,
        address: arr.join('-')
      })
    })
    // 请求检查列表
    let data = {
      check_id: options.check_id
    };

    this.getCheckList(data);
  }
})