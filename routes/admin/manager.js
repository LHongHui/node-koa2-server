const router = require('koa-router')()
router.prefix('/manager')

// mongoose 对象中 数据manager表的模型对象
var managerModel = require('../../model/managerModel');

var tools = require('../../common/tools.js');


router.get('/', async function (ctx, next) {
  // 连接Mongo 实现数据查询显示  调用方法  find(集合名,查询条件)
  var results = await managerModel.find({});
  
  await ctx.render('admin/manager/index.html',{data:results,sd:tools.formatTime()})
  //ctx.body = '我是管理员列表页'
})

// 添加
router.get('/add',async (ctx)=>{
	
	    await  ctx.render('admin/manager/add');
	
})
	
router.post('/doAdd',async (ctx)=>{
	
	    var username=ctx.request.body.username;
	    var password=tools.md5(ctx.request.body.password);
	    //console.log(password);
	    var mobile=ctx.request.body.mobile;
	  
	   var manager =  new managerModel({
	   	   username:username,
	   	   password:password,
	   	   mobile:mobile
	   })
	   var addResult =await  manager.save();  //添加
	
	   ctx.redirect('/admin/manager');


	})
	
	// 修改
	
	router.get('/edit',async (ctx)=>{
	
	
	    var _id=ctx.query._id;
	
	    var result=await  managerModel.find({"_id":_id});
	
	
	    await ctx.render('admin/manager/edit',{
	       dataone:result[0]
	   })
	
	})
	
	router.post('/doEdit',async (ctx)=>{
	
	          var _id=ctx.request.body._id;
	          var password=tools.md5(ctx.request.body.password);
	          var mobile=ctx.request.body.mobile;
	 
	          var updateResult=await managerModel.updateOne({"_id":_id},{"password":password,"mobile":mobile});
	          ctx.redirect('/admin/manager');
	         
	
	})
//	
//	// 删除
//	router.get('/del',async (ctx)=>{
//	    var _id=ctx.request.query._id;
//	    console.log(_id);
//	    var delResult=await managerModel.deleteOne({"_id":_id});
//	    ctx.redirect('/admin/manager');
//	
//	})

module.exports = router