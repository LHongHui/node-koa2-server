/*配置文件*/


var app={

    dbUrl: 'mongodb://localhost:27017/',



    dbName: 'myshop',
    wxConfig:{
    	notifyUrl:'http://pay.apiying.com/',

        appid: "***********",  // 小程序ID
        secret: "**********************",  // 小程序Secret

        mch_id: "**********", // 商户号  邮件里面获取

        mch_key: "****************************" //   登录微信商户平台获取  商户key
    }

}

module.exports=app;
