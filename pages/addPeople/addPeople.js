import {
  ajax,
  showMsg,
  getStorageFn,
  checkUserInput
} from '../../utils/util.js'

Page({
  data: {
    user: {},
    showSelection: false,
    selections: [{
      pos: '检查员',
      checked: false,
      code: 1
    }, {
      pos: '管理员',
      checked: false,
      code: 0
    }],
    avatar: '../images/default_avatar.png',
    uploadAvatar: '',
    name: '',
    cardNum: '',
    pos: '请选择职位',
    position: 0,
    tel: '',
    shengShiQuArr: [
      [],
      [],
      []
    ],
    cityCode: 0,
    countyCode: 0,
    citysCode: [],
    districtsCode: [],
    selectedCode: '',
    formBooArr: [false, false, false, false, false] // 记录表单哪一项没填
  },

  // 自定义方法
  jilu_xuanxiang(index) {
    this.data.formBooArr[index] = true;
  },
  stopprogation() {},

  // 交互事件
  // 第一项
  select_touxiang() {
    // 选择头像
    ajax.chooseImg({
      count: 1
    }).then((res) => {
      // 图片临时地址
      let tempFilePaths = res.tempFilePaths;
      this.setData({
        // 显示图片
        avatar: tempFilePaths,
      })

      ajax.uploadImg({
        url: '/v1/login/uploadPic',
        filePath: tempFilePaths[0],
        name: 'file',
      }).then((data) => {
        wx.hideLoading();
        let dataObj = JSON.parse(data.data)
        if (dataObj.errcode != 0) {
          // 请求错误
          showMsg.none_1500(dataObj.errmsg);
          return;
        }
        // 请求成功
        this.setData({
          uploadAvatar: dataObj.data.picUrl
        })

        this.jilu_xuanxiang(0);
      })
    })
  },
  // 第二项
  name_input_blur(e) {
    if (e.detail.value != false) {
      this.jilu_xuanxiang(1)
    }
  },
  // 第三项
  card_input_blur(e) {
    if (e.detail.value != false && e.detail.value.length >= 10) {
      this.jilu_xuanxiang(2)
    }
  },
  // 第四项
  radioChange(e) {
    let code = e.detail.value;
    let selectedZhiwei = '';

    this.data.selections.forEach((c, i) => {
      if (c.code == code) {
        c.checked = true;
        selectedZhiwei = c.pos;
      } else {
        c.checked = false
      }
    })
    this.setData({
      selections: this.data.selections,
      pos: selectedZhiwei,
      showSelection: false,
    })
    this.jilu_xuanxiang(3)
  },
  // 第五项
  phone_input_blur(e) {
    if (checkUserInput.isPhoneNumber(e.detail.value)) {
      this.jilu_xuanxiang(4)
    }
  },
  select_zhiwei() {
    this.setData({
      showSelection: !this.data.showSelection
    })
  },

  formSubmit(e) {
    let messageArr = [
      '请选择头像',
      '请填写姓名',
      '请填写10-20位的卡号',
      '请选择职位',
      '请填写正确的手机号'
    ]
    let checkInputBoo = this.data.formBooArr.every((c, i) => {
      if (!c) {
        showMsg.none_1500(messageArr[i])
        return false;
      };
      return true;
    })
    if (!checkInputBoo) {
      return;
    }

    let postData = Object.assign({}, e.detail.value, {
      area_code: wx.getStorageSync('user').area_code,
      user_id: wx.getStorageSync('user').id,
    });

    ajax.post('/v1/login/add_manage', postData).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      showMsg.success('添加成功');
      // 返回
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/manage/manage',
        })
      }, 1400);
    })
  },

  bindMultiPickerChange: function (e) {},

  bindMultiPickerColumnChange: function (e) {},

  /**
   * 生命周期函数-
   */
  onLoad: function (options) {
    getStorageFn('user').then((res) => {
      this.setData({
        user: res.data
      })
    })
    getStorageFn('userarea').then((v) => {
      let shengShiQuArr = v.data.reverse().map((c, i) => {
        return [c.name]
      })

      this.setData({
        shengShiQuArr
      })
    })
  },
})