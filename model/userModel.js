var mongoose = require('./db.js')
const Schema = mongoose.Schema;
const d = new Date();
const userSchema = new Schema({
  nickname:{ type: String },
  avatar:{ type: String },
  openid:{ type: String },
  phone: { type: String },
  last_ip: { type: String },
  salt: { type: String }, // 信息加密
  add_time: {
    type: Number,
    default: d.getTime(),
  },
  email: {

    type: String,
    default: '',

  },
  count_id_no_confirm:{ type: Number,default:0 }, // 待收货(未确认)
  count_id_no_pay:{ type: Number,default:0}, // 待付款
  count_id_no_reputation:{ type: Number,default:0}, // 待评价
  count_id_no_transfer:{ type: Number,default:0}, // 待发货
  status: {
    type: Number,
    default: 1
  },
});
module.exports = mongoose.model('User', userSchema, 'user');
