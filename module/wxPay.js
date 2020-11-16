/**
 * Created by Administrator on 2018/3/21 0021.
 */
var cryptoMO = require('crypto'); // MD5算法
var parseString = require('xml2js').parseString; // xml转js对象
var request = require('request');
var wxConfig = require('./config.js').wxConfig;

class WxPay{
    constructor(){
    }
    getTooken(code){
       
        //https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
        let urlStr = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + wxConfig.appid + '&secret=' + wxConfig.secret + '&js_code=' + code + '&grant_type=authorization_code';
        return new Promise((resolve,reject)=>{

            request(urlStr, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var jsBody = JSON.parse(body);
                    jsBody.status = 100;
                    jsBody.msg = '操作成功';
                    resolve(JSON.stringify(jsBody));
                }else{

                    reject(error)
                }
            })
        })

    }

    //作用：产生随机字符串，不长于32位
    createNoncestr(length = 32) {
        var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        var str = "";
        for (var i = 0; i <length; i++) {
            str += chars.substr(Math.floor(Math.random()*chars.length), 1);
        }
        return str;
    }
    //异步通知签名
    notifySignjsApi(json) {
        var ret={};
        for(var attr in json){
            if(attr !='sign'){
                ret[attr]=json[attr][0]
            }
        }
        var str = this.raw(ret);
        str = str + '&key='+wxConfig.mch_key;
        var md5Str = cryptoMO.createHash('md5').update(str).digest('hex');
        md5Str = md5Str.toUpperCase();
        return md5Str;
    }

    // 生成签名
    paySignjsApi(appid,body,mch_id,nonce_str,notify_url,openid,out_trade_no,spbill_create_ip,total_fee) {
        var ret = {
            appid: appid,
            body: body,
            mch_id: mch_id,
            nonce_str: nonce_str,
            notify_url:notify_url,
            openid:openid,
            out_trade_no:out_trade_no,
            spbill_create_ip:spbill_create_ip,
            total_fee:total_fee,
            trade_type: 'JSAPI'
        };
        var str = this.raw(ret);
        str = str + '&key='+wxConfig.mch_key;
        var md5Str = cryptoMO.createHash('md5').update(str).digest('hex');
        md5Str = md5Str.toUpperCase();
        return md5Str;
    }
    //作用：格式化参数，签名过程需要使用
    raw(args) {
        var keys = Object.keys(args);
        keys = keys.sort()
        var newArgs = {};
        keys.forEach(function(key) {
            newArgs[key] = args[key];
        });

        var str = '';
        for(var k in newArgs) {
            str += '&' + k + '=' + newArgs[k];
        }
        str = str.substr(1);
        return str;
    }

    paySignJs(appid, nonceStr, packageName, signType, timeStamp) {
        var ret = {
            appId: appid,
            nonceStr: nonceStr,
            package: packageName,
            signType: signType,
            timeStamp: timeStamp
        };
        var str = this.raw(ret);
        str = str + '&key='+wxConfig.mch_key;
        return cryptoMO.createHash('md5').update(str).digest('hex');
    }




    //统一下单        付款成功商品总价要减少
    pay(openid,ip,body,notify_url,out_trade_no,total_fee){

        var that=this;


        var spbill_create_ip =ip; // 获取客户端ip
        var body =body; // 商品描述
        var notify_url = notify_url // 支付成功的回调地址  可访问 不带参数
        var nonce_str = this.createNoncestr(); // 随机字符串
        var out_trade_no = out_trade_no; // 商户订单号
        console.log(openid,ip,body,notify_url,out_trade_no,total_fee);
        var total_fee = parseInt(total_fee*100); // 订单价格 单位是 分

        var timeStamp = Math.round(new Date().getTime()/1000); // 当前时间

        var bodyData = '<xml>';
        bodyData += '<appid>' + wxConfig.appid + '</appid>';  // 小程序ID
        bodyData += '<body>' + body + '</body>'; // 商品描述
        bodyData += '<mch_id>' + wxConfig.mch_id + '</mch_id>'; // 商户号
        bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
        bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址
        bodyData += '<openid>' + openid + '</openid>'; // 用户标识
        bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
        bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
        bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
        bodyData += '<trade_type>JSAPI</trade_type>'; // 交易类型 小程序取值如下：JSAPI
        // 签名
        var sign = this.paySignjsApi(
            wxConfig.appid,
            body,
            wxConfig.mch_id,
            nonce_str,
            notify_url,
            openid,
            out_trade_no,
            spbill_create_ip,
            total_fee
        );
        bodyData += '<sign>' + sign + '</sign>';
        bodyData += '</xml>';


        return new Promise((resolve,reject)=>{
            // 微信小程序统一下单接口
            var urlStr = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
            request({
                url: urlStr,
                method: 'POST',
                body: bodyData
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var returnValue = {};
                    parseString(body, function (err, result) {

                        if (result.xml.return_code[0] == 'SUCCESS') {
                            returnValue.out_trade_no = out_trade_no;  // 商户订单号
                            // 小程序 客户端支付需要 nonceStr,timeStamp,package,paySign  这四个参数
                            returnValue.nonceStr = result.xml.nonce_str[0]; // 随机字符串
                            returnValue.timeStamp = timeStamp.toString(); // 时间戳
                            returnValue.package = 'prepay_id=' + result.xml.prepay_id[0]; // 统一下单接口返回的 prepay_id 参数值
                            returnValue.paySign = that.paySignJs(wxConfig.appid, returnValue.nonceStr, returnValue.package, 'MD5',timeStamp); // 签名
                            resolve(JSON.stringify(returnValue));
                        } else{
                            returnValue.msg = result.xml;
                            returnValue.status = '102';
                            resolve(JSON.stringify(returnValue));
                        }
                    });
                }
            })
        })
    }
}


module.exports=new WxPay();

