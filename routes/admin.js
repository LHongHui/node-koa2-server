const router = require('koa-router')();
var manager = require('../model/managerModel.js');
var goodsCate = require('../model/goodsCateModel.js');
var goods = require('../model/goodsModel.js');
var order = require('../model/orderModel.js');
var focus = require('../model/focusModel.js');
router.prefix('/admin')

var url = require('url');
const ueditor = require('koa2-ueditor');

// 创建应用级中间件 ： 让后台的每个页面都访问此方法,判断用户是否登录
router.use(async function (ctx, next) {
	ctx.model = {
		manager: manager,
		goodsCate: goodsCate,
		goods: goods,
		order: order,
		focus
	}
	// 设置从来到哪去的路径
	ctx.state.prevPage = ctx.request.headers['referer']; //(重要)全局变量
	var pathname = url.parse(ctx.request.url).pathname;
	console.log(pathname);
	//判断是否登录
	if (ctx.session.userInfo) { //判断ctx.session.userInfo是否存在
		ctx.state.userInfo = ctx.session.userInfo;  //全局变量
		await next();
	} else {
		// 否则,去登录页面登录
		// 先判断 哪些页面不用判断ctx.session.userInfo
		if (pathname == '/admin/login' || pathname == '/admin/login/dologin' || pathname == '/admin/login/verify') {
			await next();
		} else {
			ctx.redirect('/admin/login');
		}
	}
})


router.get('/', async function (ctx, next) {
	await ctx.render('admin/index.html');
})

// 每个后台路由都能访问的公共处理的路由方法(等同于 baseController 类)
// 改变状态的公共方法 将 0 ->1 1->0
router.get('/changeStatus', async (ctx) => {
	//console.log(ctx.query);

	var collectionName = ctx.query.collectionName; /*数据库表*/
	var attr = ctx.query.attr; /*属性*/
	var id = ctx.query.id;   /*更新的 id*/

	console.log(collectionName, attr, id);

	var data = await ctx.model[collectionName].find({ "_id": id });
	console.log(data);
	if (data.length > 0) {
		if (data[0][attr] == 1) {
			var json = { /*es6 属性名表达式*/
				[attr]: 0
			};
		} else {
			var json = {
				[attr]: 1
			};
		}

		let updateResult = await ctx.model[collectionName].update({ "_id": id }, json);

		if (updateResult) {
			ctx.body = { "message": '更新成功', "success": true };
		} else {
			ctx.body = { "message": "更新失败", "success": false }
		}

	} else {
		ctx.body = { "message": '更新失败,参数错误', "success": false };
	}

})

// 公共删除封装
router.get('/del', async function (ctx) {
	var collection = ctx.query.collection; /*数据库表*/
	var _id = ctx.query._id;   /*删除 id*/
	var delResult = await ctx.model[collection].deleteOne({ "_id": _id });
	ctx.redirect(ctx.state.prevPage); //  /admin/goodsCate/ /admin/goods?page=2   从哪来返回哪去
})

// 公共的排序封装
router.get('/editNum', async function (ctx) {
	const model = ctx.request.query.model; /* 数据库表 Model*/
	const attr = ctx.request.query.attr; /* 更新的属性 如:sort */
	const id = ctx.request.query.id; /* 更新的 id*/
	const num = ctx.request.query.num; /* 数量*/

	const result = await ctx.model[model].find({ _id: id });

	if (result.length > 0) {

		const json = {/* es6 属性名表达式*/

			[attr]: num,
		};

		// 执行更新操作
		const updateResult = await ctx.model[model].updateOne({ _id: id }, json);

		if (updateResult) {
			ctx.body = { message: '更新成功', success: true };
		} else {

			ctx.body = { message: '更新失败', success: false };
		}

	} else {

		// 接口
		ctx.body = { message: '更新失败,参数错误', success: false };
	}
})

var managerRouter = require('./admin/manager.js');
var loginRouter = require('./admin/login.js');
var goodsCateRouter = require('./admin/goodsCate.js');
var goodsRouter = require('./admin/goods.js');
var orderRouter = require('./admin/order.js');
var focusRouter = require('./admin/focus.js');


router.use(managerRouter.routes(), managerRouter.allowedMethods());
router.use(loginRouter.routes(), loginRouter.allowedMethods());
router.use(goodsCateRouter.routes(), goodsCateRouter.allowedMethods());
router.use(goodsRouter.routes(), goodsRouter.allowedMethods());
router.use(orderRouter.routes(), orderRouter.allowedMethods());
router.use(focusRouter.routes(), focusRouter.allowedMethods());


/*
 * 思路: 将来 路由 对应 控制器中的 对象中的方法
 router.get('/main', controller.admin.index)
// manager模板
router.get('/manage/', controller.manager.index)
router.get('/manage/add', controller.manager.add)
router.get('/manage/doadd', controller.manager.doadd)
router.get('/manage/edit', controller.manager.edit)
router.get('/manage/edit', controller.manager.doedit)
*/


//注意上传图片的路由   ueditor.config.js配置图片post的地址


router.all('/editorUpload', ueditor(['public', {
	"imageAllowFiles": [".png", ".jpg", ".jpeg"],
	"imageUrlPrefix": "http://localhost:3000",
	"imagePathFormat": "/upload/ueditor/image/{yyyy}{mm}{dd}/{filename}"  // 保存为原文件名
}]))
module.exports = router
