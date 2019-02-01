import {
  ajax
} from '../../utils/util.js'

Page({

  data: {},

  // 自定义方法
  getLoginStatus() {
    wx.login({
      success: r => {
        // 发送 r.code 到后台换取 openId, sessionKey
        ajax.post('/V1/login/auth_login', {
          code: r.code
        }).then((res) => {
          if (res.errcode == 1) {
            wx.showToast({
              title: res.errmsg,
              icon: 'none',
              duration: 1500
            })
            return;
          }
          if (res.errcode == 2) {
            // 返回用户openId
            let openId = res.data.openid;

            wx.setStorageSync('openId', openId);

            wx.redirectTo({
              url: '/pages/login/login',
            })
            return;
          }

          if (res.errcode == 0) {
            // 返回用户信息
            let user = Object.assign({}, res.data);
            wx.setStorageSync('user', user);
            wx.setStorageSync('userarea', res.data.area_info);
            wx.switchTab({
              url: '/pages/index/index'
            })
          }
        }).catch((v) => {
          console.log(v);
        })
      }
    })
  },
  // 页面生命周期
  onLoad() {
    this.getLoginStatus();
  }
})