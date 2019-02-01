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
    shop_id: 0,
    showingList: [], // 页面上显示的数组
    allListArr: [], // 数据拼接和保存
    searchResultArr: [], // 数据拼接和保存
    shengShiQuArr: [
      [],
      [],
      []
    ],
    searchValue: '', // 搜索框输入的值
    searchTimeout: '', // 结束输入后执行搜索的计时器
    school_id: null,
    xiaoqu_info: {},
    getMoreBoo: true,
    showListBoo: '',
    placeholderBoo: false
  },

  // 自定义方法
  showList(arr) {
    if (arr.length === 0) {
      this.setData({
        showListBoo: false
      })
      return;
    }
    // 将整改项拆成数组
    arr.forEach((c, i) => {
      if (Array.isArray(c.correct_content) || c.correct_content === null) {
        return;
      }
      c.correct_content = c.correct_content.split('&&&')
    });
    // 更新视图
    this.setData({
      showListBoo: true,
      showingList: arr
    })
  },
  getAll_quyuJianChaDan(page, fn = function () {}) {
    // 拿区域所有检查单,一批6个
    let postData = {
      area_code: this.data.area_code,
      page
    }

    ajax.post('/v1/login/all_check_list', postData).then((data) => {
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
    }).catch(() => {
      this.setData({
        showListBoo: false
      })
    })
  },
  getAll_jigouJianChaDan(page, fn = function () {}) {
    // 拿一个校区的所有检查单
    let postData = {
      school_id: this.data.xiaoqu_info.school_id,
      page
    }

    ajax.post('/v1/login/chicken_check_history', postData).then((data) => {
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
      // 将xiaoqu_info合并到数据里
      let mergedArr = data.data.map((c, i) => {
        return Object.assign({}, c, this.data.xiaoqu_info)
      })
      this.setData({
        allListArr: this.data.allListArr.concat(mergedArr)
      })
      // 将allListArr显示出来
      this.showList(this.data.allListArr)
    }).catch(() => {
      this.setData({
        showListBoo: false
      })
    })
  },
  getSearch_quyu(searchValue, page) {
    // 拿区域搜索检查单,一批6个
    let postData = {
      area_code: this.data.area_code,
      page,
      key_word: searchValue
    }

    ajax.post('/v1/login/all_check_list', postData).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功，拼接数据至搜索结果数组
      if (data.data.length === 0) {
        // 如果没有数据了，则禁用上拉加载更多功能
        this.setData({
          getMoreBoo: false
        })
      } else {
        // 如果有搜索数据则，开启上啦加载功能
        this.setData({
          getMoreBoo: true
        })
      }
      this.setData({
        searchResultArr: this.data.searchResultArr.concat(data.data)
      })
      // 显示搜索结果
      this.showList(this.data.searchResultArr)
    }).catch(() => {
      this.setData({
        showListBoo: false
      })
    })
  },
  getSearch_jigou(searchValue, page) {
    // 拿校区搜索检查单,一批6个
    let postData = {
      school_id: this.data.xiaoqu_info.school_id,
      page,
      key_word: searchValue
    }

    ajax.post('/v1/login/chicken_check_history', postData).then((data) => {
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功，拼接数据至搜索结果数组
      if (data.data.length === 0) {
        // 如果没有数据了，则禁用上拉加载更多功能
        this.setData({
          getMoreBoo: false
        })
      } else {
        // 如果有搜索数据则，开启上啦加载功能
        this.setData({
          getMoreBoo: true
        })
      }
      // 将xiaoqu_info合并到数据里
      let mergedArr = data.data.map((c, i) => {
        return Object.assign({}, c, this.data.xiaoqu_info)
      })
      this.setData({
        searchResultArr: this.data.searchResultArr.concat(mergedArr)
      })
      // 显示搜索结果
      this.showList(this.data.searchResultArr)
    }).catch(() => {
      this.setData({
        showListBoo: false
      })
    })
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
      switch (typeof this.data.xiaoqu_info.school_id) {
        case 'undefined':
          // 没有校区ID，在区域所有检查单中搜索
          this.getSearch_quyu(searchValue, 1)
          break;

        default:
          // 有校区ID，在某个校区所有检查单中搜索
          this.getSearch_jigou(searchValue, 1)
          break;
      }
    }, 500);
  },
  pickerChange(e) {},
  pickerColumnChange(e) {},

  /**
   * 生命周期函数
   */
  onLoad: function (options) {
    if (Object.keys(options).length === 0) {
      // 首页所有检查单按钮进来
      // 读取用户区域码
      getStorageFn('user').then((res) => {
        this.setData({
          area_code: res.data.area_code,
        })
        this.getAll_quyuJianChaDan(1);
      })

    } else {
      // 校区页检查单按钮进来
      this.setData({
        xiaoqu_info: {
          ...options
        },
        placeholderBoo: true
      })
      this.getAll_jigouJianChaDan(1);
    }

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
    switch (typeof this.data.xiaoqu_info.school_id) {
      case 'undefined':
        // 没有校区ID，加载区域检查单
        this.getAll_quyuJianChaDan(1, () => {
          wx.stopPullDownRefresh();
        })
        break;

      default:
        // 有校区ID， 加载机构检查单
        this.getAll_jigouJianChaDan(1, () => {
          wx.stopPullDownRefresh();
        })
        break;
    }
  },
  onReachBottom() {
    if (!this.data.getMoreBoo) {
      return;
    }
    switch (typeof this.data.xiaoqu_info.school_id) {
      case 'undefined':
        // 没有校区ID，区域所有检查单
        if (noSearchValue(this.data.searchValue)) {
          // 加载更多区域检查单
          let currentPage = Math.ceil(this.data.allListArr.length / 6);
          this.getAll_quyuJianChaDan(currentPage + 1);
        } else {
          // 如果显示区域显示的是搜索结果，加载更多区域搜索检查单
          let currentPage = Math.ceil(this.data.searchResultArr.length / 6);
          this.getSearch_quyu(this.data.searchValue, currentPage + 1)
        }
        break;

      default:
        // 有校区ID，某个校区所有检查单
        if (noSearchValue(this.data.searchValue)) {
          // 加载更多校区检查单
          let currentPage = Math.ceil(this.data.allListArr.length / 6);
          this.getAll_jigouJianChaDan(currentPage + 1);
        } else {
          // 如果显示区域显示的是搜索结果，加载更多区域搜索检查单
          let currentPage = Math.ceil(this.data.searchResultArr.length / 6);
          this.getSearch_jigou(this.data.searchValue, currentPage + 1)
        }
        break;
    }
  }
})