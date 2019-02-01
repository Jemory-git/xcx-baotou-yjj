import {
  ajax,
  showMsg,
  formatTime
} from '../../utils/util.js'

Page({
  data: {
    school_id: '',
    user_id: '',
    showBtnsBoo: false,
    showListBoo: false,
    showLevel: false,
    showFace: false,
    showDeleteBtnBoo: true,
    showEditViewBoo: false,
    checkList: [],
    added_imgs: [],
    imgId: '',
    level: 2,
    levels: [{
        url: '../images/ic_a.png',
        code: 1,
      },
      {
        url: '../images/ic_b.png',
        code: 2,
      },
      {
        url: '../images/ic_c.png',
        code: 3,
      }
    ],
    levelImg: '../images/ic_b.png',
    face: 2,
    faces: [{
        url: '../images/ic_happy.png',
        code: 1,
      },
      {
        url: '../images/ic_normal.png',
        code: 2,
      },
      {
        url: '../images/ic_sad.png',
        code: 3,
      }
    ],
    faceImg: '../images/ic_normal.png',
    now: '',
    scrollto_which_id: '',
    selectingItem: {
      title: '',
      content: '',
      check_id: '',
      content_id: ''
    },
    school_info: '',
    address: '',
    fjcyValue: '',
    editingText: '', // 当前正在编辑的整改内容
    modifyingBoo: false, // 当前是新增内容还是修改内容
    modifyingIndex: '', // 当前正在修改的内容位置
    textarea_value_arr: [], // 保存每一条整改项内容
    zhengGaiObj: {
      textarea_value: '',
      datePicker_value: '',
      uploadedImgUrls: [],
    },
    needZhengGai: false,
    focus_input_boo: false, // 文本输入框聚焦控制，textarea在关闭内容编辑时，必须重置为false
    checkResultObj: {} // 数据对象
  },

  // 自定义方法
  getCheckList() {
    ajax.post('/v1/check/check_list', {
      school_id: this.data.school_id
    }).then((data) => {
      if (data.errcode != 0) {
        // 数据请求失败
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      let address = data.data.position.reverse().map((c, i) => {
        // 提取 拼接地址
        return c.name;
      })
      this.setData({
        checkList: data.data.check_info,
        school_info: data.data.school_info[0],
        address: address.join('-'),
        showListBoo: true
      })
    }).catch((e) => {
      showMsg.none_1500(e);
    })
  },
  pushTextAreaValueToArr(showMsgBoo) {
    if (this.data.editingText.search(/(\w|[\u2E80-\u9FFF])+/) === -1) {
      // 如果没有输入有效内容
      if (showMsgBoo) {
        showMsg.none_1500('请输入有效内容');
      }
      return;
    }
    // 保存当前的内容至数组
    if (this.data.modifyingBoo) {
      // 如果是正在修改，就替换原来的
      this.data.textarea_value_arr.splice(this.data.modifyingIndex, 1, this.data.editingText);
      this.setData({
        modifyingBoo: false
      })
    } else {
      // 否则就添加到最后
      this.data.textarea_value_arr.push(this.data.editingText);
    }

    // 更新视图
    this.setData({
      textarea_value_arr: this.data.textarea_value_arr
    })

    // 清空当前输入内容
    this.setData({
      editingText: ''
    })
    return true;
  },

  // 交互事件
  // 整改内容编辑-s
  openEditView() {
    this.setData({
      showEditViewBoo: true
    })
    setTimeout(() => {
      // 编辑框完全出现后聚焦textarea
      this.setData({
        focus_input_boo: true
      })
    }, 550);
  },
  closeEditView() {
    this.setData({
      showEditViewBoo: false,
      focus_input_boo: false
    })
  },
  // 完成输入
  completeEdit() {
    // 区分是新增内容还是修改内容
    if (this.data.modifyingBoo) {
      // 如果当前是修改状态，提示是否要保存当前修改
      showMsg.modal_confirmCb_cancleCb('是否保存当前修改', '提示', '放弃修改', '保存').then(() => {

        // 修改
        if (this.pushTextAreaValueToArr(true)) {
          this.closeEditView();
        }
      }).catch(() => {
        // 丢弃修改
        this.setData({
          modifyingBoo: false,
          editingText: ''
        })

        this.closeEditView();
      })
      return;
    }

    // 如果是新增
    this.pushTextAreaValueToArr(false)
    this.closeEditView();
  },
  on_textarea_input(e) {
    // 保存当前输入内容
    this.data.editingText = e.detail.value;
  },
  onfjcyinput(e) {
    this.data.fjcyValue = e.detail.value;
  },
  modify_this_item(e) {
    // 点击修改按钮时
    let index = e.target.dataset.index;

    if (!this.data.showEditViewBoo) {
      this.openEditView();
    }
    // 将要修改的内容放入textarea
    this.setData({
      modifyingIndex: index,
      editingText: this.data.textarea_value_arr[index],
      modifyingBoo: true
    })
  },
  delete_this_item(e) {
    // 点击删除按钮时
    this.data.textarea_value_arr.splice(e.target.dataset.index, 1);
    // 更新视图
    this.setData({
      textarea_value_arr: this.data.textarea_value_arr
    })
  },

  // 整改内容编辑-e


  quanxuan(e) {
    // 全选功能，测试专用
    // this.data.checkList.forEach((c, i) => {
    //   c.content.forEach((c, i) => {
    //     c.check_status_code = '1'
    //   })
    // })
    // // 更新视图
    // this.setData({
    //   checkList: this.data.checkList
    // })
  },
  showBtns(e) {
    let currentTarget = e.currentTarget;
    let dataSet = currentTarget.dataset;
    this.setData({
      selectingItem: {
        ...dataSet
      },
      showBtnsBoo: true
    })
  },
  hideBtns() {
    this.setData({
      showBtnsBoo: false
    })
  },
  stop_propagation(e) {},

  select(e) {
    let target = e.target;
    // 找到正在选择的检查项，添加检查结果
    this.data.checkList.forEach((c, i) => {
      if (c.check_id === this.data.selectingItem.check_id) {
        c.content.forEach((c, i) => {
          if (c.content_id === this.data.selectingItem.content_id) {
            c.check_status_code = target.dataset.status_code
            return;
          }
        })
        return;
      }
    })

    // 更新视图
    this.setData({
      checkList: this.data.checkList
    })

    // 隐藏按钮
    this.hideBtns();
  },

  showLevel() {
    this.setData({
      showLevel: true
    })
  },

  selectLevel(e) {
    var code = e.currentTarget.dataset.code;
    var img = e.currentTarget.dataset.img;
    this.setData({
      level: code, // 提交表单用
      levelImg: img, // 显示选择结果用
      showLevel: false
    })
  },

  showFace() {
    this.setData({
      showFace: true
    })
  },

  selectFace(e) {
    var code = e.currentTarget.dataset.code;
    var img = e.currentTarget.dataset.img;
    this.setData({
      face: code, // 提交表单用
      showFace: false,
      faceImg: img // 显示选择结果用
    })
  },

  add_img() {
    // 选择图片
    // if (this.data.added_imgs.length >= 8) {
    //   return;
    // }
    ajax.chooseImg({
      count: 8 - this.data.added_imgs.length
    }).then((res) => {
      // 图片临时地址
      this.setData({
        // 显示图片
        added_imgs: this.data.added_imgs.concat(res.tempFilePaths),
      })
    }).catch((e) => {
      console.log(e);
    })
  },
  upload_img(i) {
    // 递归上传，判断本次上传图片成功还是失败
    let current_i = i;
    let next_i = i + 1;
    let added_imgs_urls = this.data.added_imgs;

    // 判断是否全部图片上传完毕
    if (this.data.zhengGaiObj.uploadedImgUrls.length === added_imgs_urls.length) {
      wx.hideLoading();
      // 将图片地址处理成要发送的数据形式
      this.data.zhengGaiObj.uploadedImgUrls = this.data.zhengGaiObj.uploadedImgUrls.join(',');
      // 继续提交流程，添加其他数据
      this.continue_submit();
      return;
    }

    // 提示正在上传
    wx.showLoading({
      mask: true,
      title: `正传第${current_i + 1}张图`
    })

    // ajax上传
    ajax.uploadImg({
      url: '/v1/login/uploadPic',
      filePath: added_imgs_urls[current_i],
      name: 'file',
    }).then((data) => {
      let dataObj = JSON.parse(data.data);
      if (dataObj.errcode != 0) {
        // 请求错误
        showMsg.none_1500(dataObj.errmsg);
        return;
      }
      // 请求成功，保存返回的图片地址
      this.data.zhengGaiObj.uploadedImgUrls.push(dataObj.data.picUrl);
      // 继续发送下一张图片
      this.upload_img(next_i);
    }).catch((e) => {
      // 网络请求失败时
      wx.hideLoading();
      console.log('上传失败');
      showMsg.modal_confirmCb_cancleCb(`第${i + 1}张图片上传失败`).then(() => {
        // 重新上传
        this.upload_img(current_i);

      }).catch(() => {
        // 跳过这张,删除已选图片中的这一张
        this.data.added_imgs.splice(current_i, 1);
        this.upload_img(next_i);

      })
    })
  },
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
            urls: that.data.added_imgs,
          })
        }
      }
    })
  },
  // manageImgList(e) {
  //   this.setData({
  //     showDeleteBtnBoo: !this.data.showDeleteBtnBoo
  //   })
  // },
  deleteImg(e) {
    this.data.added_imgs.splice(e.target.id, 1);
    this.setData({
      added_imgs: this.data.added_imgs
    })

  },

  bindDateChange: function (e) {
    let that = this;
    // 修改时间选择的值
    this.data.zhengGaiObj.datePicker_value = e.detail.value;
    // 更改视图
    this.setData({
      zhengGaiObj: that.data.zhengGaiObj
    })
  },

  onsubmit() {
    // 重置needZhengGai的值
    this.data.needZhengGai = false;

    let checkListResult = [];

    this.data.checkList.forEach((c, i) => {
      // 从checkList中找有用信息
      let check_id = c.check_id;
      let check_title = c.check_title;
      c.content.forEach((c, i) => {
        let content_id = c.content_id;
        let check_status_code = c.check_status_code;
        let content_index = i;
        checkListResult.push({
          check_id, // 提交表单用
          content_id, // 提交表单用
          check_status_code, // 提交表单用
          check_title, // 提示框用
          content_index, // 提示框用
        })
      })
    })

    // 判断检查列表是否有未填项， forEach 不能在中途退出循环，所以用下面方式
    for (let i = 0; i < checkListResult.length; i++) {
      let c = checkListResult[i];
      if (c.check_status_code == 3) {
        // 如果有不合格项，就需要填写整改信息
        this.data.needZhengGai = true;
      }
      if (!c.check_status_code) {
        showMsg.modal_confirm_jcd(`你好，请填写“${c.check_title}”中的第${c.content_index + 1}项`, () => {
          this.setData({
            scrollto_which_id: `id_${c.check_id}_${c.content_id}`
          })
        });
        return;
      }
    }

    // 检查列表完全通过后，保存结果
    this.data.checkResultObj.checkListResult = checkListResult.map((c, i) => {
      delete c.check_title;
      delete c.content_index;
      return c;
    });

    // 添加数据---是否有需要整改项
    this.data.checkResultObj.check_status = this.data.needZhengGai ? 1 : 0;

    switch (this.data.needZhengGai) {
      case true:
        // 判断当含有不合格项时，整改内容是否有未填项
        if (this.data.textarea_value_arr.length === 0) {
          showMsg.none_1500('请填写整改内容');
          return;
        }
        if (this.data.zhengGaiObj.datePicker_value === '') {
          showMsg.none_1500('请选择下次核查时间');
          return;
        }
        if (this.data.added_imgs.length === 0) {
          showMsg.none_1500('请选择问题图片');
          return;
        }

        // 检查整改内容通过后，保存结果

        this.data.zhengGaiObj.textarea_value = this.data.textarea_value_arr.join('&&&');
        this.data.checkResultObj.zhengGaiObj = this.data.zhengGaiObj;
        break;

      default:
        // 判断当全部合格时，整改内容是否有未填项         
        if (this.data.added_imgs.length > 0 || this.data.zhengGaiObj.datePicker_value !== '' || this.data.textarea_value_arr.length > 0) {
          if (this.data.textarea_value_arr.length === 0) {
            showMsg.none_1500('请填写整改内容');
            return;
          }
          if (this.data.zhengGaiObj.datePicker_value === '') {
            showMsg.none_1500('请选择下次核查时间');
            return;
          }
          if (this.data.added_imgs.length === 0) {
            showMsg.none_1500('请选择问题图片');
            return;
          }
          // 检查整改内容通过后，保存结果
          this.data.zhengGaiObj.textarea_value = this.data.textarea_value_arr.join('&&&');
          this.data.checkResultObj.zhengGaiObj = this.data.zhengGaiObj;
        }
        break;
    }

    // 如果有图片，上传图片，添加数据---图片地址
    if (this.data.added_imgs.length > 0) {
      // 清空保存上传完成图片的url的数组
      this.data.zhengGaiObj.uploadedImgUrls = [];
      // 开始上传图片，
      this.upload_img(0);
      return;
    }
    // 没有图片，继续提交流程，添加其他数据
    this.continue_submit();

  },

  continue_submit() {
    // 添加数据---评级
    let that = this;
    this.data.checkResultObj.pingjiObj = {
      niandu: that.data.level,
      dongtai: that.data.face
    }

    // 添加数据---副检查员(可选)
    this.data.checkResultObj.inspector_name = this.data.fjcyValue;

    // 添加数据---school_id
    this.data.checkResultObj.school_id = this.data.school_info.school_id;

    // 添加数据---org_id
    this.data.checkResultObj.org_id = this.data.school_info.org_id;

    // 添加数据---user_id
    this.data.checkResultObj.user_id = this.data.user_id;

    // 提交表单
    ajax.post('/v1/check/do_check', this.data.checkResultObj, {
      'content-type': 'application/json'
    }).then((data) => {
      let realData = JSON.parse(`{${data.split('{')[1].split('}')[0]}}`);
      if (realData.errcode != 0) {
        // 数据请求失败
        showMsg.none_1500(realData.errmsg);
        return;
      }
      // 请求成功
      showMsg.modal_confirm_cb('提交成功', () => {
        wx.reLaunch({
          url: '/pages/enter/enter',
        })
      })

    })
  },


  /**
   * 生命周期函数
   */
  onLoad: function (options) {
    // var obj = options;
    var obj = {};
    var scene = decodeURIComponent(options.scene);
    if (scene) {
      var arr = scene.split('&');
      if (arr) {
        arr.forEach((item) => {
          var temArr = item.split('=');
          var key = temArr[0];
          var val = temArr[1];
          obj[key] = val;
        });
      }
    }
    this.setData({
      school_id: obj.si,
      user_id: obj.fui,
      now: formatTime(new Date()).dateStr
    })
    this.getCheckList();
  }
})