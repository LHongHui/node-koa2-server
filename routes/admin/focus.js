const router = require('koa-router')()
router.prefix('/focus');

var tools = require('../../common/tools.js');

var focus = require('../../model/focusModel.js');


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


router.get('/', async function (ctx) {
	// 连接Mongo 实现数据查询显示  调用方法  find(集合名,查询条件)

	var results = await focus.find({});
	await ctx.render('admin/focus/index.html', { data: results, sd: tools.formatTime() });
})

// 添加
router.get('/add', async function (ctx) {
	await ctx.render('admin/focus/add.html');
})
router.post('/doadd', upload.single('focus_img'), async function (ctx) {
	console.log(ctx.req.file);
	if (ctx.req.file == undefined || ctx.req.file == null) {
		//ctx.redirect(prevPage);

		await ctx.render('admin/error.html', { message: '图像必须上传', redirectUrl: '/admin/focus/add' });
	} else {
		var focus_image = ctx.req.file.path.substr(7).replace(/\\/g, '/');
		var title = ctx.req.body.title;
		var link = ctx.req.body.link;
		var sort = ctx.req.body.sort;

		var myFocus = new focus({
			title: title,
			focus_img: focus_image,
			link: link,
			sort: sort
		})
		await myFocus.save();

		ctx.redirect('/admin/focus');
	}
})

// 更新
router.get('/edit', async function (ctx) {
	var id = ctx.request.query._id;
	console.log(id);
	var result = await focus.find({ _id: id });
	await ctx.render('admin/focus/edit.html', { dataone: result[0] });
})

router.post('/doEdit', upload.single('focus_img'), async (ctx) => {

	if (ctx.req.file == "undefined" || ctx.req.file == "null") {
		// 不修改图像
		var _id = ctx.req.body._id;
		var title = ctx.req.body.title;
		var link = ctx.req.body.link;
		var sort = ctx.req.body.sort;
		var status = ctx.req.body.status;
		console.log(ctx.request.body);
		var updateResult = await focus.updateOne({ "_id": _id }, { "title": title, "link": link, "sort": sort, "status": status });
	} else {
		var focus_img = ctx.req.file.path.substr(7).replace(/\\/g, '/');
		var _id = ctx.req.body._id;
		var title = ctx.req.body.title;
		var link = ctx.req.body.link;
		var sort = ctx.req.body.sort;
		var status = ctx.req.body.status;
		console.log(ctx.request.body);
		var updateResult = await focus.updateOne({ "_id": _id }, { "title": title, "focus_img": focus_img, "link": link, "sort": sort, "status": status });
	}

	ctx.redirect('/admin/focus');


})

module.exports = router