const router = require('koa-router')()
router.prefix('/order');

var tools = require('../../common/tools.js');

var order = require('../../model/orderModel.js');

router.get('/', async function (ctx) {
	// 连接Mongo 实现数据查询显示  调用方法  find(集合名,查询条件)

	var results = await order.find({});

	await ctx.render('admin/order/index.html', { data: results, sd: tools.formatTime() });
})

///orderchangeToFinished
router.get('/admin/orderchangeToFinished', async (ctx, next) => {
	var orderId = ctx.request.query.orderId;
	var data = await order.find({ "_id": orderId });
	if (data[0].order_status == 20) {
		var json = { /*es6 属性名表达式*/
			[attr]: 40
		};
	} else {
		var json = {
			[attr]: 20
		};
	}
	var updateResult = await order.updateOne({ "_id": orderId }, json);
	if (updateResult) {
		ctx.body = {
			success: true,
			message: "订单完成"
		}
	}
})


module.exports = router