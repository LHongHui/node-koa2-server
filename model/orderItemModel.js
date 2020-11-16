var mongoose = require('./db.js')
const Schema = mongoose.Schema;
const d = new Date();
const orderItemSchema = new Schema({
  uid: { type: Schema.Types.ObjectId }, //用户编号
  order_id: { type: Schema.Types.ObjectId }, //订单号  order 的 _id
  product_title: { type: String },  //商品名称
  product_id: { type: Schema.Types.ObjectId },// 商品编号
  product_img: { type: String }, //商品图像
  product_price: { type: Number }, // 商品价格
  product_num: { type: Number }, //商品数量

  add_time: {
    type: Number,
    default: d.getTime(),
  }
});

module.exports = mongoose.model('OrderItem', orderItemSchema, 'order_item');
