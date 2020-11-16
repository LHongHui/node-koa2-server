// 购物车表

var mongoose = require('./db.js');
const Schema = mongoose.Schema;
var d=new Date(); 
const ShopListSchema = new Schema({
        uid: String,    // 用户的id
        shop_price: Number,   // 单个商品价格
        cid: String,    // 商品的id
        title:String, 
        goods_cover: String, // 商品的图片
        mallPrice: Number,  // 一个商品的总价
        store:Number,
        add_time: {         // 加入购物车时间
            type: Number,
            default: +new Date(),
        },
        check: {        // 是否选中
            type: Boolean,
            default: false
        },
        count: {        // 商品数量
            type: Number,
            default: 1
        }
    });

module.exports =mongoose.model('ShopList', ShopListSchema,'shopList');