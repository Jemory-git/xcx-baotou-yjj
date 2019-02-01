import {
  ajax,
  checkUserInput,
  showMsg
} from '../../utils/util.js'

Page({
  data: {
    phone: '',
    verifyCodeTime: '发送验证码',
    disable: false
  },

  // 自定义方法
  changeText() {
    let c = 60;
    let intervalId = setInterval(() => {
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
    // 发送验证码
    if (this.data.disable) {
      return;
    }
    if (!checkUserInput.isPhoneNumber(this.data.phone)) {
      showMsg.none_1500('请填写正确的手机号');
      return;
    }
    this.changeText();

    let data = {
      phone: this.data.phone
    };

    ajax.post('/v1/login/get_message', data).then((data) => {
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

    ajax.post('/v1/login/old_phone_check', e.detail.value).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      wx.navigateTo({
        url: `/pages/newTel/newTel?flag_code=${data.data.flag_code}&old_phone=${this.data.phone}`,
      })
    })
  },

  /**
   * 生命周期函数
   */
})