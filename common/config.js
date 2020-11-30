var obj = {}
obj.alipayOptions = {
    app_id: "*******************",
    appPrivKeyFile: "*********************************************************",
    alipayPubKeyFile: "*******************************************************************"
}

obj.alipayBasicParams = {
    return_url: '******************', //支付成功返回地址
    notify_url: '**************************' //支付成功异步通知地址，更新订单路由
}

module.exports = obj;
