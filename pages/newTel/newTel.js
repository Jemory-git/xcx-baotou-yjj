import {
  ajax,
  checkUserInput,
  showMsg,
  getStorageFn
} from '../../utils/util.js'

Page({
  data: {
    user: {},
    phone: '',
    verifyCodeTime: '发送验证码',
    disable: false,
    flag_code:'',
    old_phone: ""
  },

  // 自定义方法
  changeText() {
    let c = 60;
    let intervalId = setInterval(()=> {
      c--;
      this.setData({
        verifyCodeTime: c + 's后重发',
        disable: true
      })
      if (c == 0) {
        clearInterval(intervalId);
        this.setData({
          verifyCodeTime: '获取验证码',
          disable: false
        })
      }
    }, 1000)
  },
  // 交互事件
  on_phone_number_input(e) {
    // 只能输入数字
    let value = e.detail.value;
    this.setData({
      phone: value.match(/\d*/g)[0]
    })
  },

  getCode() {
    if (this.data.disable) {
      return;
    }
    if (!checkUserInput.isPhoneNumber(this.data.phone)) {
      showMsg.none_1500('手机号码有误')
      return;
    }
    this.changeText();

    let postData = {
      phone: this.data.phone
    };
    
    ajax.post('/v1/login/newphone_send_message', postData).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      showMsg.success('验证码已发送');
    })
  },

  formSubmit(e) {
    if (!checkUserInput.lengthIs_6(e.detail.value.code)) {
      showMsg.none_1500('验证码填写有误！')
      return;
    }
    if (!checkUserInput.isPhoneNumber(e.detail.value.phone)) {
      showMsg.none_1500('手机号输入有误！')
      return;
    }
    let postData = {
      ...e.detail.value,
      change_flag: this.data.flag_code,
      old_phone: this.data.old_phone
    }
    
    ajax.post('/v1/login/banding_newphone', postData).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功,回到我的页面
      showMsg.success('修改成功！');
      setTimeout(() => {
        wx.navigateBack({
          delta: 2
        })
      }, 1300)
    })
  },

  /**
   * 生命周期函数
   */
  onLoad: function (options) {    
    this.setData({
      flag_code: options.flag_code,
      old_phone: options.old_phone,
    })
    getStorageFn('user').then((v) => {
      this.setData({
        user: v.data
      })
    })
  }
})