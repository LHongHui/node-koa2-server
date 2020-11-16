var mongoose = require('./db.js');
var d = new Date();

var Schema = mongoose.Schema;  // Schema 映射manager关系型数据库的表结构

const userLikeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId },
    itemId: { type: Schema.Types.ObjectId },
    sort: { type: Number },
    status: { type: Number, default: 1 },
    add_time: {
        type: Number,
        default: d.getTime(),
    },
});
module.exports = mongoose.model('UserLike', userLikeSchema, 'user_like');