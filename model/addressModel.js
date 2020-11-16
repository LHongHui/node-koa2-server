var mongoose = require('./db.js')
const Schema = mongoose.Schema;
const d = new Date();
const AddressSchema = new Schema({
  uid: { type: Schema.Types.ObjectId },
  name: { type: String },
  phone: { type: String },
  province: { type: String },
  city: { type: String },
  district: { type: String },
  addressInfo: { type: String }, 
  default_address: { type: Number, default: 1 },
  add_time: {
    type: Number,
    default: d.getTime(),
  },
});

module.exports = mongoose.model('Address', AddressSchema, 'address');


