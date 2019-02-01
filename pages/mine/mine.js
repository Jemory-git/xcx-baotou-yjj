import {
  ajax,
  showMsg,
  getStorageFn
} from '../../utils/util.js'

Page({
  data: {
    userInfo: '',
    isBind: false,
    card: '',
  },
  // 自定义方法

  // 交互事件
  prevImg(e) {
    let src = e.currentTarget.dataset.src;
    let url = [];
    url.push(src);
    wx.previewImage({
      urls: url,
    })
  },

  bindCard() {
    this.setData({
      isBind: true
    })
  },

  modify_headImg() {
    ajax.chooseImg({
      count: 1
    }).then((res) => {
      wx.showLoading({
        mask: true
      })
      this.uploadImg(res.tempFilePaths[0]);
    })
  },

  uploadImg(filePath) {
    ajax.uploadImg({
      url: '/v1/login/uploadPic',
      filePath,
      name: 'file'
    }).then((data) => {
      let dataObj = JSON.parse(data.data);
      if (dataObj.errcode != 0) {
        // 数据请求失败
        showMsg.none_1500(dataObj.errmsg);
        return;
      }
      // 请求成功
      this.submit_headImg(dataObj.data.picUrl);
    })
  },
  submit_headImg(url) {
    let postData = {
      user_id: this.data.userInfo.id,
      url
    }
    ajax.post('/v1/login/change_img', postData).then((data) => {
      if (data.errcode != 0) {
        // 数据请求失败
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      showMsg.none_1500('头像修改成功');
      // 修改头像地址
      this.data.userInfo.head_img_url = url;
      // 修改视图
      this.setData({
        userInfo: this.data.userInfo
      })
      // 修改存储
      wx.setStorageSync('user', this.data.userInfo);
    })
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '是否退出登录',
      success: (res) => {
        if (res.cancel) {
          return;
        }
        let user = wx.getStorageSync('user');
        let logoutData = {
          user_id: user.id,
        }
        ajax.post('/V1/login/unbinding_openid', logoutData).then((data) => {
          if (data.errcode != 0) {
            // 请求错误
            showMsg.none_1500(data.errmsg);
            return;
          }
          // 请求成功，清除所有缓存
          wx.clearStorage({
            success() {
              wx.reLaunch({
                url: '/pages/enter/enter'
              })
            }
          });

        }).catch((e) => {
          console.log(e);
          showMsg.none_1500('操作失败');
        })
      }
    })
  },

  hidden() {
    this.setData({
      isBind: false,
      card: '',
    })
  },
  on_card_number_input(e) {
    // 只能输入数字
    let value = e.detail.value;
    this.setData({
      card: value.match(/\d*/g)[0]
    })
  },
  formSubmit(e) {
    // 提交修改卡号
    if (e.detail.value.card_no.replace(/\s+/g, '').length == 0) {
      showMsg.none_1500('卡号不能为空')
      return;
    };
    if (e.detail.value.card_no.replace(/\s+/g, '').length < 10) {
      showMsg.none_1500('卡号需10位以上')
      return;
    };
    this.setData({
      isBind: false
    })

    let postData = {
      user_id: this.data.userInfo.id,
      card_num: e.detail.value.card_no
    };
    ajax.post('/v1/login/binding_card', postData).then((data) => {

      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      showMsg.success(data.errmsg);
    })
  },

  imageError(e) {
    let errImg = e.currentTarget.dataset.img;
    let errObj = {};
    errObj[errImg] = '../images/default_avatar.png';
    this.setData(errObj);
  },
  /**
   * 生命周期函数
   */
  onLoad: function () {
    getStorageFn('user').then((v) => {
      this.setData({
        userInfo: v.data
      })
    })

    // 开启小程序分享功能
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})