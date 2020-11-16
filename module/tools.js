/**
 * Created by Administrator on 2018/3/21 0021.
 */
const md5=require('md5');

const multer = require('koa-multer');

const  fs=require('fs');

var sd = require('silly-datetime');

var request = require('request');
var CryptoJS = require("crypto-js");

var tools={
    getTime(){

        return new Date();
    },
    getOrderId(){
        var order_id = sd.format(new Date(), 'YYYYMMDDHHmmss');
        var numArr=[0,1,2,3,4,5,6,7,8,9];
        var randomStr='';
        for(var i=0;i<6;i++){
            randomStr+=numArr[Math.floor(Math.random()*10)];
        }
        return order_id+randomStr;  /*字符串的拼接*/
    },
    getFormatTime(){
       return sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    },
    md5(str){
        return md5(str);
    },
    cateToList(data){

        var firstArr=[];  /*获取一级分类*/
        for(var i=0;i<data.length;i++){
            if(data[i].pid=='0'){
                firstArr.push(data[i])
            }
        }
        //console.log(firstArr);
        for(var i=0;i<firstArr.length;i++){
            firstArr[i].list=[];
            for(var j=0;j<data.length;j++){
                //console.log(data[j]);
                if(firstArr[i]._id==data[j].pid){
                    firstArr[i].list.push(data[j])
                }
            }
        }
        //console.log(firstArr)
        return firstArr;

    },
    upload(){
        //https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md
//配置
        var storage = multer.diskStorage({
            //文件保存路径
            destination: function (req, file, cb) {

                var d=sd.format(new Date(), 'YYYYMMDD');
                var dir='public/upload/'+d;

                fs.exists(dir, async (exists)=> {
                    if(!exists){
                        await fs.mkdir(dir);
                    }
                    cb(null,dir);
                });

            },
            //修改文件名称
            filename: function (req, file, cb) {
                var fileFormat = (file.originalname).split(".");
                cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
            }
        })
        //加载配置
        var upload = multer({ storage: storage });

        return  multer({ storage: storage });
    }
    //请求数据的模块
    ,requestData(urlStr){
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

    },sign(json){
        var arr=[];
        for(var i in json){
            arr.push(i);
        }
        //如果这个参数被省略，那么元素将按照 ASCII 字符顺序进行升序排列（也就是所谓的自然顺序）
        arr=arr.sort();
        var str='';
        for(let i=0;i<arr.length;i++){
            str+=arr[i]+json[arr[i]]
        }
        return md5(str);
    },
    getShopOrderPrintInfo(total_price,result){
        var orderInfo;
        orderInfo = "<CB>无人商超</CB><BR>";//标题字体如需居中放大,就需要用标签套上
        orderInfo += "名称　　　　　   <RIGHT>单价  数量 金额</RIGHT><BR>";
        orderInfo += "--------------------------------<BR>";
        for (var i = 0; i < result.length; i++) {
            orderInfo += result[i].product_title + "　 <RIGHT>" + result[i].product_price + "    " + result[i].product_num + "   " + result[i].product_price + "</RIGHT><BR>";
        }
        orderInfo += "合计：" + total_price + "元<BR>";
        orderInfo += "购买时间：" + this.getFormatTime() + "<BR><BR>";
        orderInfo += "----------扫码有惊喜哦----------";
        orderInfo += "<QR>http://www.itying.com</QR>";//把二维码字符串用标签套上即可自动生成二维码

        return orderInfo;

    }
}

module.exports=tools;

