    var mongoose=require('./db.js');
	var d=new Date();
	
	var Schema = mongoose.Schema;  // Schema 映射manager关系型数据库的表结构
   
    const managerSchema = new Schema({
      username: { type: String  },
      password: { type: String  },
      mobile: { type: String  },
      status: { type: Number,default:1  },
      add_time: {           
        type:Number,        
        default: d.getTime()  //当前时间戳
       }

    });
    
    // managerSchema 与真实 manager 表的关联
	module.exports=mongoose.model('Manager',managerSchema,'manager');  