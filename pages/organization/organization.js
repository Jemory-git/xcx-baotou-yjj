import {
  ajax,
  showMsg,
  noSearchValue,
  getStorageFn
} from '../../utils/util.js'

Page({
  data: {
    user: '',
    showingArr: [],
    jigouArr: [],
    searchResultArr: [],
    searchTimeout: '',
    searchValue: '',
    getMoreBoo: true,
    hege_jigou_shuliang: {},
    zhengjianArr: [],
    currentIndex: -1,
    shengShiQuArr: [
      [],
      [],
      []
    ],
    citysCode: [],
    districtsCode: [],
    provCode: '',
    cityCode: 0,
    countyCode: 0,
    hasInfo: '',
    fuzhiBoo: true
  },

  // 自定义方法
  showList(arr) {
    this.setData({
      hasInfo: true,
      showingArr: arr
    })
  },
  getData(page, fn = function () {}) {
    let postData = {
      area_code: this.data.user.area_code,
      page
    };

    ajax.post('/v1/login/chicken_list', postData).then((data) => {
      fn();
      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }
      // 请求成功
      if (data.data.content.length === 0) {
        // 如果没有机构数据了，则禁用上拉加载更多功能
        this.setData({
          getMoreBoo: false
        })
        return;
      }
      if (this.data.fuzhiBoo) {
        // 顶部统计数量只赋值一次
        this.setData({
          hege_jigou_shuliang: data.data.top_data,
          fuzhiBoo: false
        })
      }
      this.setData({
        jigouArr: this.data.jigouArr.concat(data.data.content)
      })
      if (this.data.jigouArr.length === 0) {
        // 没有要显示的内容
        this.setData({
          hasInfo: false
        })
        return;
      }
      // 显示机构列表
      this.showList(this.data.jigouArr)

    }).catch((e) => {
      this.setData({
        hasInfo: false
      })
    })
  },
  getSearchData(key_word, page) {
    let postData = {
      area_code: this.data.user.area_code,
      page,
      key_word
    };

    ajax.post('/v1/login/chicken_list', postData).then((data) => {

      if (data.errcode != 0) {
        // 请求错误
        showMsg.none_1500(data.errmsg);
        return;
      }

      // 请求成功，
      if (data.data.content.length === 0) {
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
      // 拼接数据至搜索结果数组
      this.setData({
        searchResultArr: this.data.searchResultArr.concat(data.data.content)
      })
      // 显示搜索结果
      if (this.data.searchResultArr.length === 0) {
        // 没有要显示的内容
        this.setData({
          hasInfo: false
        })
        return;
      }
      this.showList(this.data.searchResultArr);
      
    }).catch((e) => {
      this.setData({
        hasInfo: false
      })
    })

  },
  getZhengjianStatus(school_id, index) {
    // 拿机构的证件信息
    let postData = {
      school_id
    }
    ajax.post('/v1/login/school_license_info', postData).then((data) => {      
      this.data.zhengjianArr[index] = {
        spxkz: data.data.food_license,
        yyzz: data.data.business_license
      }
      this.setData({
        zhengjianArr: this.data.zhengjianArr
      })
    })
  },

  // 交互事件
  on_arrow_click(e) {
    let index = e.currentTarget.dataset.index;
    let school_id = e.currentTarget.dataset.school_id;
    if (index === this.data.currentIndex) {
      this.setData({
        currentIndex: -1
      })
      return;
    }
    this.setData({
      currentIndex: index
    })
    if (typeof this.data.zhengjianArr[index] === 'object') {
      // 如果点击的机构证件信息已经拿了，就return
      return;
    }
    this.getZhengjianStatus(school_id, index);

  },
  call(e) {
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  on_search_input(e) {
    // 连续输入时清掉计时器，500ms后没有再次输入时，执行搜索
    clearTimeout(this.data.searchTimeout);
    let searchValue = e.detail.value;
    if (noSearchValue(searchValue)) {
      // 没有输入搜索内容时，显示jigouArr
      this.showList(this.data.jigouArr)
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
  pickerChange(e) {
  },
  pickerColumnChange(e) {
  },
  imageError(e) {
    var errImg = e.currentTarget.dataset.img;
    var errObj = {};
    errObj[errImg] = '../images/default_avatar.png';
    this.setData(errObj);
  },
  onPullDownRefresh: function () {
    // 恢复初始化状态
    this.setData({
      hege_jigou_shuliang: {},
      fuzhiBoo: true,
      getMoreBoo: true,
      jigouArr: [],
      searchValue: ''
    })

    // 重新加载数据
    this.getData(1, () => {
      wx.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    if (!this.data.getMoreBoo) {
      return;
    }

    if (noSearchValue(this.data.searchValue)) {
      // 加载更多所有机构
      let currentPage = Math.ceil(this.data.jigouArr.length / 6);
      this.getData(currentPage + 1);
    } else {
      // 如果显示区域显示的是搜索结果，加载更多搜索机构
      let currentPage = Math.ceil(this.data.searchResultArr.length / 6);
      this.getSearchData(this.data.searchValue, currentPage + 1)
    }
  },

  // 页面声明周期钩子函数
  onLoad: function () {
    // 读取用户信息
    getStorageFn('user').then((res) => {
      this.setData({
        user: res.data,
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

    // 开启小程序分享功能
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})