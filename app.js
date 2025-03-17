App({
  // 小程序初始化完成时触发，全局只触发一次
  onLaunch: function () {
    // 可以在这里进行一些初始化操作，比如检查用户登录状态等
    console.log('小程序初始化完成');
  },

  // 小程序启动，或从后台进入前台显示时触发
  onShow: function (options) {
    console.log('小程序启动或从后台进入前台', options);
  },

  // 小程序从前台进入后台时触发
  onHide: function () {
    console.log('小程序进入后台');
  },

  // 小程序发生脚本错误，或者 api 调用失败时触发
  onError: function (msg) {
    console.error('小程序发生错误:', msg);
  },

  // 全局数据
  globalData: {
    userInfo: null
  }
});