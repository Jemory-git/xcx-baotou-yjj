import {
  ajax,
  checkUserInput,
  showMsg,
  getStorageFn
} from '../../utils/util.js'

Page({
  data: {
    phone: '',
    openId: '',
    verifyCodeTime: '发送验证码',
    disable: false,
    intervalId: null,
    yzm_value: ''
  },

  // 自定义方法

  // 交互事件
  inputTel(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  getCode() {
    // 清空验证码输入
    this.setData({
      yzm_value: ''
    })
    // 拿验证码
    if (this.data.disable) {
      return;
    }

    if (!checkUserInput.isPhoneNumber(this.data.phone)) {
      showMsg.none_1500('请填写正确的手机号');
      return;
    }
    // 禁用
    this.setData({
      disable: true
    })
    // 倒计时
    let c = 60;
    let intervalId = setInterval(() => {
      this.setData({
        verifyCodeTime: c-- + 's后重发',
      })
      if (c == 0) {
        clearInterval(intervalId);
        this.setData({
          verifyCodeTime: '发送验证码',
          disable: false
        })
      }
    }, 1000)
    // 请求发送验证码
    ajax.post('/v1/login/get_message', {
      phone: this.data.phone
    }).then((data) => {
      if (data.errcode != 0) {
        // 发送验证码失败，重启按钮
        showMsg.none_1500(data.errmsg ? data.errmsg : data);
        clearInterval(intervalId);
        this.setData({
          verifyCodeTime: '发送验证码',
          disable: false
        })
        return;
      }
      // 发送验证码成功
      showMsg.success('验证码已发送')
    }).catch((e) => {
      // 接口调用失败
      showMsg.none_1500(e.data.msg);
    })
  },

  formSubmit(e) {
    let inputValue = e.detail.value;
    if (!checkUserInput.isPhoneNumber(inputValue.phone)) {
      showMsg.none_1500('请填写正确的手机号');
      return;
    }
    if (!checkUserInput.lengthIs_6(inputValue.code)) {
      showMsg.none_1500('验证码填写有误');
      return;
    }

    let postData = {
      ...inputValue,
      openid: this.data.openId
    }

    ajax.post('/v1/login/message_login', postData).then((data) => {

      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      wx.setStorageSync('user', data.data.detail_info);
      wx.setStorageSync('userarea', data.data.area_info);
      wx.switchTab({
        url: '/pages/index/index'
      })
    }).catch((v) => {
      showMsg.none_1500(v);
    })
  },

  // 页面生命周期
  onLoad() {
    getStorageFn('openId').then((res) => {
      this.data.openId = res.data
    })

    // 开启小程序分享功能
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})