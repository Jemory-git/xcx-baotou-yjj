import {
  ajax,
  showMsg,
  getStorageFn
} from '../../utils/util.js'

Page({
  data: {
    user: {},
    userAreaStr: '',
    checkMsg: {},
    checkList: [],
    hasInfo: ''
  },

  // 自定义方法
  getData(fn = function () {}) {
    let data = {
      area_code: this.data.user.area_code,
      num: 6,
      page: 1
    };

    ajax.post('/v1/login/index_check_list', data).then((data) => {
      fn();
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }

      // 将整改项拆成数组
      data.data.content.forEach((c,i) => {
        c.correct_content = c.correct_content.split('&&&')
      });

      // 更新视图
      this.setData({
        hasInfo: true,
        checkMsg: data.data.top_data,
        checkList: data.data.content
      })
      if (data.data.content.length == 0) {
        this.setData({
          hasInfo: false,
        })
      }
    }).catch(() => {
      this.setData({
        hasInfo: false,
      })
    })
  },

  // 交互事件
  gotoInspect(e) {
    let check_id = e.currentTarget.dataset.check_id;
    let jigouName = e.currentTarget.dataset.jigou_name;
    wx.navigateTo({
      url: `/pages/inspect/inspect?check_id=${check_id}&jigouName=${jigouName}`,
    })
  },

  imageError(e) {
    var errImg = e.currentTarget.dataset.img;
    var errObj = {};
    errObj[errImg] = '../images/default_avatar.png';
    this.setData(errObj);
  },

  onPullDownRefresh: function () {
    // 恢复初始化
    this.setData({
      checkMsg: {},
      checkList: [],
      user: wx.getStorageSync('user'),
      hasInfo: ''
    })

    // 重新加载
    this.getData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 生命周期函数
   */
  onLoad: function (options) {

    getStorageFn('user').then((v) => {
      this.setData({
        user: v.data
      })
      this.getData();
    })
    getStorageFn('userarea').then((v) => {
      let arr = v.data.reverse().map((c, i) => {
        return c.name
      })
      this.setData({
        userAreaStr: arr.join('-')
      })
    })

    // 开启小程序分享功能
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})