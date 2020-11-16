const router = require('koa-router')()
router.prefix('/goodsCate');

var tools = require('../../common/tools.js');

var goodsCate = require('../../model/goodsCateModel.js');
var goodsImage = require('../../model/goodsImageModel.js');

//图片上传模块

const multer = require('koa-multer');
var storage = multer.diskStorage({
	//  destination: function (req, file, cb) {
	//
	//
	//      cb(null, 'public/upload');   /*配置图片上传的目录     注意：图片上传的目录必须存在*/
	//  },
	destination: 'public/upload/' + new Date().getFullYear() + (new Date().getMonth() + 1) + new Date().getDate(),
	filename: function (req, file, cb) {   /*图片上传完成重命名*/
		var fileFormat = (file.originalname).split(".");   /*获取后缀名  分割数组*/
		cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
	}
})
var upload = multer({ storage: storage });

router.get('/',async function(ctx){
	// 连接Mongo 实现数据查询显示  调用方法  find(集合名,查询条件)
	
    var results = await goodsCate.find({});
 
	await ctx.render('admin/goodsCate/index.html',{data:results,sd:tools.formatTime()});
})

// 添加
router.get('/add', async function(ctx){
	await ctx.render('admin/goodsCate/add.html');
})
router.post('/doadd', upload.fields([
	{
		name: 'cate_img',
		maxCount: 5
	}
]),async function(ctx){
	if (ctx.req.files['cate_img'] == undefined || ctx.req.files['cate_img'] == null) {
		//ctx.redirect(prevPage);

		await ctx.render('admin/error.html', { message: '图像必须上传', redirectUrl: '/admin/goods/add' });
	} else {
		// 图像路径拼接  upload/2224ev.jpg,upload/dfdfdf.jpg,
		var goods_image_list = ctx.req.files['cate_img'];
		var goods_img_string = '';
		for (k in goods_image_list) {
			goods_img_string += goods_image_list[k].path.substr(7).replace(/\\/g, '/') + ',';
		}
		console.log(ctx.req.body);
		var title = ctx.req.body.title;
		var sort =  ctx.req.body.sort;
		
		var cate  = new goodsCate({
			title:title,
			cate_img:goods_img_string,
			sort:sort
		})
		var addResult =await  cate.save();
		
		ctx.redirect('/admin/goodsCate');
	}
})

// 更新
router.get('/edit', async function(ctx){
	var id = ctx.request.query._id;
	console.log(id);
	var result = await goodsCate.find({_id:id});
	await ctx.render('admin/goodsCate/edit.html',{
		dataone:result[0]
	});

})

router.post('/doEdit',upload.fields([
	{
		name: 'cate_img',
		maxCount: 5
	}
]),async (ctx)=>{
	
	if (ctx.req.files['cate_img'] == undefined || ctx.req.files['cate_img'] == null) {
	    var _id=ctx.req.body._id;
	    var title=ctx.req.body.title;
	    var sort=ctx.req.body.sort;
	    var status = ctx.req.body.status;
	    var updateResult=await goodsCate.updateOne({"_id":_id},{"title":title,"sort":sort,"status":status});
	}else{
		// 图像路径拼接  upload/2224ev.jpg,upload/dfdfdf.jpg,
		var goods_image_list = ctx.req.files['cate_img'];
		var goods_img_string = '';
		for (k in goods_image_list) {
			goods_img_string += goods_image_list[k].path.substr(7) + ',';
		}
		var _id=ctx.req.body._id;
	    var title=ctx.req.body.title;
	    var sort=ctx.req.body.sort;
	    var status = ctx.req.body.status;
	    console.log(ctx.req.body);
        await goodsCate.deleteOne({ "_id": _id });
	    var cate  = new goodsCate({
	    	"_id":_id,
	    	"title":title,
	    	"cate_img":goods_img_string,
	    	"sort":sort,
	    	"status":status
	    })
	    var updateResult=await cate.save();
	    	
	}  
	ctx.redirect('/admin/goodsCate');       
	
})

module.exports = router