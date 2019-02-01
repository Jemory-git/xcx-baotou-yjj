import {
  ajax,
  showMsg,
  getStorageFn
} from '../../utils/util.js'

Page({

  data: {
    shop_id: '',
    user_id: '',
    org_id: '',
    user: {},
    jigou_info: {},
    licenseList: [],
    newLicenseList: [],
    caigouPingzhengList: [],
    liuyangJiluList: [],
    xiaoduJiluList: [],
    recipesList: [],
    recipesImgs: [],
    imgId: ''
  },

  getData(fn = function () {}) {
    let postData = {
      school_id: this.data.jigou_info.xiaoqu_id
    }
    ajax.post('/v1/login/kitchen_check_detail', postData).then((data) => {
      fn(); // 只在下拉刷新时提供回调
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功,保存校区信息

      // 补充证件前三项，营业执照（1）、食品许可证（2）、卫生许可证（3）、其他（4）
      let newLicenseList = [];
      let licenseList = data.data.license_info;
      let len = licenseList.length > 2 ? licenseList.length : 3;
      // 最少循环三次，以添加占位图
      for (let i = 0; i < len; i++) {
        const c = licenseList[i];
        if (i === 0) {
          let result = licenseList.find((c, i) => {
            // 找营业执照
            return c.license_type == 1
          })
          newLicenseList[i] = result ? result : {};
          continue;
        }
        if (i === 1) {
          let result = licenseList.find((c, i) => {
            // 找食品许可证
            return c.license_type == 2
          })
          newLicenseList[i] = result ? result : {};
          continue;
        }
        if (i === 2) {
          let result = licenseList.find((c, i) => {
            // 找卫生许可证
            return c.license_type == 3
          })
          newLicenseList[i] = result ? result : {};
          continue;
        }
        if (i > 2) {
          newLicenseList[i] = licenseList[i];
        }
      }
      // 如果有其他证件，newLicenseList的长度大于3，用空白对象将newLicenseList 的长度补充成3的倍数,以适应flex布局的space-between
      let currentLength = newLicenseList.length;
      let afterLength = Math.ceil(currentLength / 3) * 3;
      for (let i = 0; i < afterLength - currentLength; i++) {
        newLicenseList.push({
          license_type: 4,
          kongbai: true
        })
      }

      this.setData({
        jigou_info: Object.assign({}, this.data.jigou_info, data.data.schoolmaster),
        newLicenseList,
        licenseList,
        caigouPingzhengList: data.data.check_detail.purchase_receipt,
        liuyangJiluList: data.data.check_detail.food_sample,
        xiaoduJiluList: data.data.check_detail.tableware_disinfect,
        recipesList: data.data.check_detail.cookbook_record,
      })

      // 将采购凭证数组 留样数组 消毒记录数组 菜谱数组保存
      wx.setStorage({
        key: 'abc',
        data: Object.assign({}, { ...data.data.check_detail
        })
      })
    })
  },
  // 审核
  on_tap_shenhe(e) {
    var postData = {
      user_id: this.data.user.id,
      license_id: e.target.dataset.id
    }

    showMsg.modal_confirmCb_cancleCb('是否通过审核？', '提示', '不通过', '通过').then(() => {
      postData.is_check = 1;
      this.shenhe(postData, 1, e.target.dataset.index);
    }).catch(() => {
      postData.is_check = -1;
      this.shenhe(postData, -1, e.target.dataset.index);
    })
  },

  shenhe(postData, checkResult, index) {
    ajax.post('/v1/login/check_license', postData).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功,修改视图
      this.data.licenseList[index].is_check = checkResult;
      this.setData({
        licenseList: this.data.licenseList
      })
    })
  },
  yulan_img(e) {
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
            current: e.currentTarget.dataset.currentUrl,
            urls: that.data.licenseList.map((c, i) => {
              return c.license_pic_url;
            }),
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 取用户信息
    getStorageFn('user').then((res) => {
      this.setData({
        jigou_info: {
          ...options
        },
        user: res.data
      })
      // 取qs
      this.getData();
    })
  },

  imageError(e) {
    var errImg = e.currentTarget.dataset.img;
    var errObj = {};
    errObj[errImg] = '../images/default_avatar.png';
    this.setData(errObj);
  },
  onPullDownRefresh: function () {
    this.getData(() => {
      wx.stopPullDownRefresh();
    });
  }
})