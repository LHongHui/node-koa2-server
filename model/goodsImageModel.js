		var mongoose = require('./db.js')
		const Schema = mongoose.Schema;
		var d=new Date();   
	    const GoodsImageSchema = new Schema({
	      goods_id: {type:Schema.Types.ObjectId },  //产品id号
	      img_url: { type: String  },     // 图路径   upload/20191111/xxx.jpg
//	      color_id:{
//	        type:Schema.Types.Mixed,  //混合类型
//	        default: ''
//	      },
	      status: { type: Number,default:1  },
	      add_time: {           
	        type:Number,        
	        default: d.getTime()    
	      }
	     
	    });
	   
	module.exports = mongoose.model('GoodsImage', GoodsImageSchema,'goods_image');
