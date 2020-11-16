/**
 * Created by Administrator on 2018/3/17 0017.
 */
/*配置文件*/


var app={

    dbUrl: 'mongodb://localhost:27017/',



    dbName: 'myshop',
    wxConfig:{
    	notifyUrl:'http://pay.apiying.com/',

        appid: "wx5f0a381387979a68",  // 小程序ID
        secret: "ecee680ae5d1bdb6e4598faeb5f7c13a",  // 小程序Secret

        mch_id: "1501274771", // 商户号  邮件里面获取

        mch_key: "zhongyuantengitying6666666666666" //   登录微信商户平台获取  商户key
    }

}

module.exports=app;
