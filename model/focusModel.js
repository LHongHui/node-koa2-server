var mongoose = require('./db.js');
var d = new Date();

var Schema = mongoose.Schema;  // Schema 映射manager关系型数据库的表结构

const FocusSchema = new Schema({
  title: { type: String },
  // type: { type: Number },
  focus_img: { type: String },
  link: { type: String },
  sort: { type: Number },
  status: { type: Number, default: 1 },
  add_time: {
    type: Number,
    default: d.getTime(),
  },
});
module.exports = mongoose.model('Focus', FocusSchema, 'focus');