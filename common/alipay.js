
const Alipay = require('alipay-mobile');  //按并且引入

const config = require('./config');
class AlipayService {
  async  doPay(orderData) {

    return new Promise((resolve, reject) => {

      //1.实例化 alipay
      console.log(config.alipayOptions);
      const service = new Alipay(config.alipayOptions);

      //获取返回的参数
      //1. config.alipayBasicParams  客户端支付成功返回地址,服务器端支付成功异步通知地址
      //2. 商品的订单和价格信息
      service.createPageOrderURL(orderData, config.alipayBasicParams)
        .then(result => {
          console.log(result);
          resolve(result.data);

        })
      reject('timeout');
    }).then(undefined, (error) => {
      throw new Error(error);
    });


  }


  //验证异步通知的数据是否正确
  alipayNotify(params) {

    //实例化 alipay
    const service = new Alipay(config.alipayOptions);

    return service.makeNotifyResponse(params);


  }

}

module.exports = new AlipayService();
