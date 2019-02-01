import {
  ajax,
  showMsg
} from '../../utils/util.js'

Page({
  data: {
    jigou_info: {},
    monitorInfo: {},
    monitors: [],
    coverImgArr: [],
    play: false,
    showListBoo: ''
  },

  // 自定义方法
  getMonitorList(fn = function () {}) {
    let postData = {
      school_id: this.data.jigou_info.school_id
    }
    ajax.post('/v1/Device/getNvrDeviceList', postData).then((data) => {
      fn();
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      if (data.data.length <= 0) {
        // 如果没有要显示的内容
        this.setData({
          showListBoo: false
        })
        return;
      }
      this.setData({
        allMonitorInfo: data.data,
        monitors: data.data[0].list,
        showListBoo: true
      })
      // 拿图片
      this.getCoverImg(data.data[0].list);
    }).catch(() => {
      this.setData({
        showListBoo: false
      })
    })
  },
  getCoverImg(list) {
    list.forEach((c, i) => {
      if (c.state === 1) {
        let postData = {
          account: this.data.allMonitorInfo.account,
          device_serial: this.data.allMonitorInfo[0].device_serial,
          chan_no: c.chan_no
        }
        ajax.post('/v1/Device/getNvrCapture', postData, {}, true).then((data) => {
          if (data.errcode != 0) {
            // 请求错误
            showMsg.none_1500(data.errmsg);
            return;
          }
          // 请求成功
          this.data.coverImgArr[c.chan_no] = `data:image/jpg;base64,${data.data.base64_img}`;
          this.setData({
            coverImgArr: this.data.coverImgArr
          })
        })
      }
    });
  },

  // 交互事件
  play(e) {
    let status = e.currentTarget.dataset.status;
    if (status == 0) {
      showMsg.none_1500('通道不在线');
      return;
    }
    let postData = {
      device_serial: this.data.allMonitorInfo[0].device_serial,
      chan_no: e.currentTarget.dataset.chan_no
    }
    ajax.post('/v1/Device/getHtmlUrl', postData).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      wx.setStorage({
        key: 'monitor_url',
        data: data.data.html5_url,
        success() {
          wx.navigateTo({
            url: '/pages/video/video'
          })
        }
      })
    })
  },

  /**
   * 生命周期函数
   */
  onLoad: function (options) {
    this.setData({
      jigou_info: {
        ...options
      }
    })

    // 取监控列表
    this.getMonitorList();
  },
  onPullDownRefresh: function () {
    this.getMonitorList(() => {
      wx.stopPullDownRefresh();
    });
  },
})