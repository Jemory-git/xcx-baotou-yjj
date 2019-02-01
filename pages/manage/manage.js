import {
  ajax,
  showMsg,
  getStorageFn
} from '../../utils/util.js'

Page({
  data: {
    user: {},
    isManage: false,
    showSelectAll: true,
    currentIndex: -1,
    selectedArr: [],
    managers: [],
    showingArr: [],
    getMoreBoo: true,
    showListBoo: ''
  },

  // 自定义方法
  showList(arr) {
    // 如果列表没有内容
    if (arr.length === 0) {
      this.setData({
        showListBoo: false
      })
      return;
    }
    this.setData({
      showListBoo: true,
      showingArr: arr
    })
  },
  getData(page, fn = function () {}) {
    let area_code = this.data.user.area_code;
    let user_id = this.data.user.id;
    let user_type = this.data.user.user_type;
    let postData = {
      area_code,
      user_id,
      user_type,
      page
    };

    ajax.post('/v1/login/manage_list', postData).then((data) => {
      fn(); // 该函数只有下拉刷新时传入
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      let list = data.data.detail_info;
      if (list.length < 6) {
        // 如果没有数据了，则禁用上拉加载功能
        this.setData({
          getMoreBoo: false
        })
      }

      this.setData({
        managers: this.data.managers.concat(list),
        showSelectAll: true // 如果点了全选后在上拉加载数据，则恢复按钮为全选
      })

      // 显示拼接好的数据
      this.showList(this.data.managers)
    }).catch(() => {
      this.setData({
        showListBoo: false
      })
    })
  },

  // 交互事件
  manage() {
    this.setData({
      isManage: true
    })
  },

  cancel() {
    this.data.managers.forEach((c, i) => {
      c.checked = false
    });

    this.setData({
      isManage: false,
      showSelectAll: true,
      selectedArr: [],
      managers: this.data.managers
    })
    // 显示处理好的数据
    this.showList(this.data.managers)
  },

  confirmDelete() {
    wx.showModal({
      title: '人员管理',
      content: '是否删除选中人员',
      cancelText: '取消',
      confirmText: '确认',
      success: (res) => {
        if (res.confirm) {
          this.delete();
        }
      }
    })
  },

  toggleAll() {
    let showSelectAll = this.data.showSelectAll;
    let selectedArr = this.data.selectedArr;
    let managers = this.data.managers;

    if (selectedArr.length < managers.length && showSelectAll) {
      managers.forEach((c, i) => {
        c.checked = true;
      })
      selectedArr = managers;
    } else {
      managers.forEach((c, i) => {
        c.checked = false;
      })
      selectedArr = [];
    }

    this.setData({
      showSelectAll: !showSelectAll,
      selectedArr,
      managers
    })
    // 显示处理好的数据
    this.showList(this.data.managers)
  },

  select(e) {
    if (!this.data.isManage) {
      return;
    }
    let selectedArr = [];
    let managers = this.data.managers;

    managers[e.currentTarget.dataset.index].checked = !managers[e.currentTarget.dataset.index].checked;

    managers.forEach((c, i) => {
      if (c.checked) {
        selectedArr.push(c.id);
      }
    })

    if (selectedArr.length === managers.length) {
      // 切换显示全选按钮
      this.setData({
        showSelectAll: false,
      })
    } else {
      this.setData({
        showSelectAll: true,
      })
    }
    // 保存更改
    this.setData({
      selectedArr,
      managers
    })
    // 显示处理好的数据
    this.showList(this.data.managers)
  },

  delete() {
    let ids = this.data.selectedArr.join(',');
    let deleteData = {
      user_id: this.data.user.id,
      ids
    }
    ajax.post('/v1/login/delete_manage', deleteData).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      // 恢复管理按钮、全选按钮、清空managers,清空已选数组
      this.setData({
        isManage: false,
        showSelectAll: true,
        selectedArr: [],
        managers: []
      })
      // 重新加载数据
      this.getData(1);
    })
  },

  onPullDownRefresh: function () {
    if (this.data.isManage) {
      //如果正在对人员进行操作，就不用刷新
      wx.stopPullDownRefresh();
      return;
    }
    // 清空列表恢复初始化，加载新数据
    this.data.managers = [];
    this.data.getMoreBoo = true;
    this.getData(1, () => {
      wx.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    if (!this.data.getMoreBoo) {
      return;
    }

    let currentPage = Math.ceil(this.data.managers.length / 6);
    this.getData(currentPage + 1);
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
        user: v.data
      })
      // 清空列表，加载新数据
      this.data.managers = [];
      this.getData(1);
    })

    // 开启小程序分享功能
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})