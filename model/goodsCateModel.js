       /* 表关系:自关联
        * 
        *                     pid
                    1电视           0
        *           2手机           0
        * 
        *           3 TCL电视    1
        *           4 索尼电视   1
        *           5 三星电视   1
        * 
        *           6 小米手机   2
        *           7 联想手机   2
        *           8 华为手机   2
        * 
        *   data =[
        *        {
        * 	        'title':'电视'，
        *           'cate_img':'xxxx.jpg',
        *           'items':[
        *                 {'title':'TCL电视','cate_img':'xxxx.jpg'}
        *                 {'title':'索尼电视','cate_img':'xxxx.jpg'}
        *                 {'title':'三星电视','cate_img':'xxxx.jpg'}
        *           ]
        * 
        *       },
        *       {
        * 	        'title':'手机'，
        *           'cate_img':'xxxx.jpg',
        *           'items':[
        *                 {'title':'小米手机','cate_img':'xxxx.jpg'}
        *                 {'title':'联想手机','cate_img':'xxxx.jpg'}
        *                 {'title':'华为手机','cate_img':'xxxx.jpg'}
        *           ]
        * 
        *       },
        * 
        *   ]
        * 
 
        * 
       */
           
      var mongoose = require('./db.js');
	    const Schema = mongoose.Schema;
	
	    var d=new Date();   
	    const GoodsCateSchema = new Schema({
	      title: { type: String  },    // 分类名称
	      cate_img: { type: String  },   // 分类的图像
//	      link:{                        // 分类的链接地址
//	        type: String 
//	      },
//	      pid:{                        // 父级id
//	        type:Schema.Types.Mixed  //混合类型 
//	      },           
	      status: { type: Number,default:1  },  //状态 0,1  
	
	      sort: { type: Number,default:100 },   // 排序
	      add_time: {                  //添加时间
	        type:Number,        
	        default: d.getTime()    
	      }
	     
	    });
        module.exports =mongoose.model('GoodsCate', GoodsCateSchema,'goods_cate');
