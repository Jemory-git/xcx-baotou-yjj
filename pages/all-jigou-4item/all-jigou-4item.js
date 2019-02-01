import {
  ajax,
  showMsg,
  noSearchValue,
  getStorageFn
} from '../../utils/util.js'

Page({

  data: {
    user: '',
    area_code: '',
    showingList: [], // 页面上显示的数组
    allListArr: [], // 数据拼接和保存
    searchResultArr: [], // 数据拼接和保存
    orgs: [],
    shengShiQuArr: [
      [],
      [],
      []
    ],
    hasInfo: true,
    getMoreBoo: true,
    searchTimeout: '',
    searchValue: ''
  },

  // 自定义方法
  showList(arr) {
    this.setData({
      showingList: arr
    })
  },
  getData(page, fn = function () {}) {
    let postData = {
      area_code: this.data.area_code,
      page
    }
    ajax.post('/v1/login/kitchen_detail_list', postData).then((data) => {

      fn();
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功,拼接数据至allListArr
      if (data.data.length === 0) {
        // 如果没有数据了，则禁用上拉加载更多功能
        this.setData({
          getMoreBoo: false
        })
      }
      this.setData({
        allListArr: this.data.allListArr.concat(data.data)
      })
      // 将allListArr显示出来
      this.showList(this.data.allListArr)
    })
  },
  getSearchData(key_word, page) {
    let postData = {
      area_code: this.data.area_code,
      page,
      key_word
    }
    ajax.post('/v1/login/kitchen_detail_list', postData).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功,拼接数据至allListArr
      if (data.data.length === 0) {
        // 如果没有数据了，则禁用上拉加载更多功能
        this.setData({
          getMoreBoo: false
        })
      }
      this.setData({
        searchResultArr: this.data.searchResultArr.concat(data.data)
      })
      // 将searchResultArr显示出来
      this.showList(this.data.searchResultArr)
    })
  },

  imageError(e) {
    var errImg = e.currentTarget.dataset.img;
    var errObj = {};
    errObj[errImg] = '../images/default_avatar.png';
    this.setData(errObj);
  },

  // 交互事件
  on_search_input(e) {
    // 连续输入时清掉计时器，500ms后没有再次输入时，执行搜索
    clearTimeout(this.data.searchTimeout);

    let searchValue = e.detail.value;
    if (noSearchValue(searchValue)) {
      // 没有输入搜索内容时，显示allListArr
      this.showList(this.data.allListArr)
      // 清空searchValue
      this.data.searchValue = '';
      return;
    }
    // 清空搜索结果数组
    this.data.searchResultArr = [];
    this.data.searchTimeout = setTimeout(() => {
      this.setData({
        // 保存搜索框的输入值
        searchValue
      })
      this.getSearchData(searchValue, 1)
    }, 500);
  },
  pickerChange(e) {},
  pickerColumnChange(e) {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 读取用户信息
    getStorageFn('user').then((res) => {
      this.setData({
        user: res.data,
        area_code: res.data.area_code
      })
      this.getData(1);
    })
    // 拿地址
    getStorageFn('userarea').then((v) => {
      let shengShiQuArr = v.data.reverse().map((c, i) => {
        return [c.name]
      })

      this.setData({
        shengShiQuArr
      })
    })
  },
  onPullDownRefresh: function () {
    // 恢复初始化
    this.setData({
      getMoreBoo: true,
      allListArr: [],
      searchResultArr: [],
      searchValue: ''
    })
    // 重新加载
    this.getData(1, () => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom: function () {
    if (!this.data.getMoreBoo) {
      return;
    }
    if (noSearchValue(this.data.searchValue)) {
      // 加载更多区域检查单
      let currentPage = Math.ceil(this.data.allListArr.length / 6);
      this.getData(currentPage + 1);
    } else {
      // 如果显示区域显示的是搜索结果，加载更多区域搜索检查单
      let currentPage = Math.ceil(this.data.searchResultArr.length / 6);
      this.getSearchData(this.data.searchValue, currentPage + 1)
    }

  }
})