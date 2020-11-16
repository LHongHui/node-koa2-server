var mongoose = require('./db.js')
const Schema = mongoose.Schema;
const d = new Date();
const orderSchema = new Schema({
  uid: { type: Schema.Types.ObjectId }, // 用户编号
  all_price: { type: Number },  // 总价格
  order_id: { type: Number },   // 订单号
  name: { type: String },    // 收件人
  phone: { type: Number },   //电话
  address: { type: String }, //地址
  zipcode: { type: String },  // 邮编
  remark:{ type: String },  // 
  peisongType:{ type: String }, //配送类型
  yunPrice:{ type: Number },  // 运费
  goodsNumber:{type:Number}, // 订单商品个数
  amountReal:{type:Number},
  pay_status: { // 支付状态： 0 表示未支付     1 已经支付
    type: Number,
    default: 0
  },   
  pay_type: { type: String },   // 支付类型： alipay    wechat  
  order_status: {    // 订单状态： 0 待付款  1 已付款,待发货  2 待收货  3、待评价  4、交易成功   5、退货     6、取消      
    type: Number,
    default: 10
  },
  add_time: {
    type: Number,
    default: d.getTime()
  }
});

module.exports = mongoose.model('Order', orderSchema, 'order');

