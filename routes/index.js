const router = require('koa-router')()
var mongoose = require('../model/db.js')
var goods = require('../model/goodsModel.js');
var goodsCate = require('../model/goodsCateModel.js');
var order = require('../model/orderModel.js');
var orderItem = require('../model/orderItemModel.js');
var User = require('../model/userModel.js');
var address = require('../model/addressModel.js');
var focus = require('../model/focusModel.js');
var userLike = require('../model/userLikeModel.js');
var ShopList = require('../model/shopListModel.js');
var tools = require('../common/tools.js');

const WXBizDataCrypt = require('../module/WXBizDataCrypt.js'); // 解密js
const tools2=require('../module/tools.js');
let wxConfig = require('../module/config.js').wxConfig;
const wxPay=require('../module/wxPay.js');

router.get('/', async (ctx, next) => {
	await ctx.render('index');
})

// 轮播图
// /index/carousels
router.get('/index/carousels', async function (ctx) {
	var results = await focus.find({}).sort({ "sort": -1 });
	if (results.length > 0) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": results
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "没有查询到轮播图",
			"data": []
		};
	}
})
 //查询当前用户所有收藏的商品：http://localhost:3000/items/goodsFavList

 router.get('/index/items/goodsFavList', async function (ctx) {
	var userId =  ctx.request.query.userId;
	var resultitemIds = await userLike.find({userId:userId});
    console.log(resultitemIds);
	if(resultitemIds.length){
		    console.log(111)
			var goodsIds = [];
			for (let i = 0; i < resultitemIds.length; i++) {
				goodsIds.push({
					_id: resultitemIds[i].itemId  // 获得 userId 用户收藏的 商品编号 itemId
				});
			}
		    if(!goodsIds){
                return;
		    }
			var results = await goods.find({
				$or: goodsIds,    // $or:[{_id:xxx1},{_id:xxxx2}]
			}).sort({ "sort": -1 });
	}else{
		var results =[];
	}
	if (results.length) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": results
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "没有查询到内容",
			"data": []
		};
	}
})
// 精品,最新,热销商品
// router.get('/index/items/:type', async function (ctx) {
// 	var type = ctx.params.type;  // is_best,is_hot,is_new
// 	console.log(typeof type);
// 	var results = await goods.find({ [type]: 1 }).sort({ "sort": -1 });
// 	if (results.length > 0) {
// 		ctx.body = {
// 			"success": true,
// 			"message": "OK",
// 			"data": results
// 		};
// 	} else {
// 		ctx.body = {
// 			"success": false,
// 			"message": "没有查询到内容",
// 			"data": []
// 		};
// 	}
// })

router.get('/index/items/:type', async function (ctx) {
	var type = ctx.params.type;
	// 1. 动态当前页
	var page = ctx.request.query.page || 1; // 当前页page 重要

	// 2. 每页显示条数
	var pageSize = 6;
	// 3. 总条数
	var totals = await goods.find({ [type]: 1 }).count();
	// 4. 总页数
	var totalPages = Math.ceil(totals / pageSize);
	// 5.每页开始的编号
	var offset = (page - 1) * pageSize;
	//
	//	// 分页   skip(offset).limit(pageSize)
	var results = await goods.find({ [type]: 1 }).skip(offset).limit(pageSize).sort({"sort":-1});

	console.log(results);

	if (results.length > 0) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": results
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "没有查询到内容",
			"data": []
		};
	}
})

// 获得所有分类名称信息
router.get('/cats', async function (ctx) {
	var results = await goodsCate.find({}).sort({ "sort": -1 });
	if (results.length > 0) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": results
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "没有查询分类内容",
			"data": []
		};
	}
})
// /items/searchByCat?catId='+this.curId
// 通过分类id  查找对应商品
router.get('/items/searchByCat', async function (ctx) {
	var catId = ctx.query.catId;
	var results = await goods.find({ "cate_id": catId }).sort({ "sort": -1 });
	if (results.length > 0) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": results
		};
	} else {
		ctx.body = {
			"success": 0,
			"message": "没有查询分类对应的商品",
			"data": []
		};
	}
})

// 调用产品详情页
///items/searchById?itemId
router.get('/items/searchById', async function (ctx) {
	var itemId = ctx.query.itemId;
	var result = await goods.find({ "_id": itemId }).sort({ "sort": -1 });
	if (result.length > 0) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": result[0]
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "没有查询到具体商品",
			"data": []
		};
	}
})

/*
    把商品id的字符串转化成数组
     @param {String} str - ids的字符串

      5bc6a8c777dc3d1c849fba47，5be3f1d322f56e2fc8a694f2,5be940719567312f28240bff

      [{_id:5bc6a8c777dc3d1c849fba47},{_id:5be3f1d322f56e2fc8a694f2}]
  */


function strToArray(str) {

	try {
		let tempIds = [];
		if (str) {
			const idsArr = str.replace(/,/g, ',').split(',');
			if (idsArr[idsArr.length - 1] == '') {
				idsArr.pop();
			}
			for (let i = 0; i < idsArr.length; i++) {
				tempIds.push({
					_id: idsArr[i],
				});
			}

		} else {
			tempIds = [{ 1: -1 }];

		}
		return tempIds;


	} catch (error) {
		return [{ 1: -1 }]; // 返回一个不成立的条件
	}


}
// 通过购物车中的商品查找对应 数据库中的 goods商品信息
//item/queryItems?itemIds='+itemIds
// http://localhost:3000/item/queryItems?itemIds=5dca47d7dca4502bb823e36c,5dca12919078a521a0f3e275
router.get('/item/queryItems', async function (ctx) {

	var itemIds = ctx.request.query.itemIds; //转成二维数组
	var goodsIds = strToArray(itemIds);
	console.log(goodsIds)
	var results = await goods.find({
		$or: goodsIds,    // $or:[{_id:xxx1},{_id:xxxx2}]
	}).sort({ "sort": -1 });
	if (results.length > 0) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": results
		};
	} else {
		ctx.body = {
			"success": true,
			"message": "没有查询到具体商品",
			"data": []
		};
	}
})

// 获得用户信息订单状态
router.get('/getUserOrderStaus', async function (ctx) {
	var uid =  ctx.request.query.userId;

	const userResultL = await User.find({_id:uid});
	if (userResultL) {
		ctx.body = {
			success: true,
			message: "用户的订单状态",
			data:{
				count_id_no_confirm,
				count_id_no_pay,
				count_id_no_reputation,
				count_id_no_transfer
			}
		}
	} else {

		ctx.body = {
			success: false,
			message: "此用户不存在"
		}
	}
});


/*地址接口****************************************************************/

// GET-/address/addressList/{userId}
// 查询用户收货地址列表
router.get('/address/addressList/:userId', async function (ctx) {

	var uid = ctx.params.userId;

	var results = await address.find({ 'uid': uid }).sort({ "default_address": -1 });
	if (results.length > 0) {
		ctx.body = {
			"success": true,
			"message": "查询用户对应地址列表成功",
			"data": results
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "查询用户对应地址列表失败",
			"data": []
		};
	}
})


// POST-/address/createOrUpdate
// 创建/修改收货地址
router.post('/address/createOrUpdate', async function (ctx) {
	var uid = ctx.request.body.userId;  // string 类型？转 ObjectId类型
	var name = ctx.request.body.receiver;
	var phone = ctx.request.body.mobile;
	var province = ctx.request.body.province;
	var city = ctx.request.body.city;
	var district = ctx.request.body.district;
	var addressInfo = ctx.request.body.descAddress;
	console.log(uid, name, phone, province, city, district, addressInfo);

	var addressId = ctx.request.query.addressId; // ？ 接收地址编号
	console.log(addressId);
	if (addressId == 'undefined'|| addressId == 'null' || addressId == '') {
		// 添加操作
		const addressCount = await address.find({ uid }).count();
		if (addressCount > 20) {
			this.ctx.body = {
				success: false,
				message: '增加收货地址失败 收货地址数量超过限制',
			};
		} else {
			// 添加新地址时，将用户对应的旧地址 default_address 设置为 0(不是默认地址)
			await address.updateMany({ uid }, { default_address: 0 });
			const addressModel = new address({
				uid,
				name,
				phone,
				province,
				city,
				district,
				addressInfo
			});
			// 保存用户
			const addressResult = await addressModel.save();
			if (addressResult) {
				ctx.body = {
					success: true,
					message: "添加地址成功"
				}
			}
		}

	} else {

		// 更新操作
		const updateResult = await address.updateOne(
			{ "_id": addressId },
			{
				uid,
				name,
				phone,
				province,
				city,
				district,
				addressInfo
			}
		);
		if (updateResult) {
			ctx.body = {
				success: true,
				message: "更新地址成功"
			}
		} else {
			ctx.body = {
				success: false,
				message: "更新地址失败"
			}
		}


	}

})

// POST-/address/fetch
//http://localhost:3000/address/fetch?userId='+userId+'&addressId='+this.addressId
// 查询地址
router.get('/address/fetch', async function (ctx) {
	var userId = ctx.request.query.userId;
	var addressId = ctx.request.query.addressId;
	var results = await address.find({ _id: addressId, uid: userId }).sort({ "sort": -1 });
	if (results.length > 0) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": results[0]
		};
	} else {
		ctx.body = {
			"success": true,
			"message": "没有查询地址编号对应地址",
			"data": []
		};
	}
})



// GET-/address/setDefault
// 设置默认的用户收货地址
router.get('/address/setDefault', async function (ctx) {
	var uid = ctx.request.query.userId;  //用户编号
	var addressId = ctx.request.query.addressId; // 用户地址编号
	await address.updateMany({ uid: uid }, { default_address: 0 });
	await address.updateMany({ uid: uid, "_id": addressId }, { default_address: 1 });
	ctx.body = {
		success: true,
		msg: '更新默认收货地址成功'
	};
})

// POST-/address/delete/{addressId}
// 删除用户收货地址
router.get('/address/delete/:addressId', async function (ctx) {
	var uid = ctx.request.query.userId;  //用户编号
	var addressId = ctx.params.addressId;
	var delResult = await address.deleteOne({ _id: addressId,uid:uid}).sort({ "sort": -1 });

	ctx.body = {
		success: true,
		msg: '删除地址成功'
	};

})


// GET-/address/default/{userId}
// 查询用户默认收货地址
router.get('/address/default/:userId', async function (ctx) {
	var userId = ctx.params.userId;
	var defaultResult = await address.find({ uid: userId, default_address: 1 });

	if(defaultResult.length){
		ctx.body = {
			success: true,
			msg: '查询到默认地址',
			data: defaultResult[0]
		};
	}else{
		ctx.body = {
			success: false,
			msg: '没有默认地址',

		};
	}

})


/**订单处理 =====================================================================*/
function itemToArray(itemStr) {
	var items = itemStr.split(','); // [1001|5,2000|3,3043|2]
	items.pop();
	var itemsObj = [];  // [{_id:1001,num:5},{_id:2000,num:3}]
	for (k in items) {
		itemOne = items[k].split('|');
		itemsObj.push(
			{
				_id: itemOne[0],
				num: itemOne[1]
			}
		)
	}
	return itemsObj;
}
// POST - /order/createOrder
// 生成[待付款]订单
router.post('/order/createOrder', async function (ctx) {
	const uid = ctx.request.body.userId;
	const itemStr = ctx.request.body.itemStr;
	const addressId = ctx.request.body.addressId;
	const peisongType = ctx.request.body.peisongType;
	const remark = ctx.request.body.remark;
	//itemStr=1001|5,1002|3
	let addressResult = await address.find({ "uid": uid, "default_address": 1 });

	var cartList = itemToArray(itemStr);
	//console.log(addressResult,cartList);
	if (addressResult && addressResult.length > 0 && cartList && cartList.length > 0) {
		var all_price = 0;
		var goodsNumber =0;
		var orderList = [];
		for (k in cartList) {
			var resultOne = await goods.find({ _id: cartList[k]._id });
			if (resultOne) {
				all_price += resultOne[0].shop_price * parseInt(cartList[k].num);
				goodsNumber++;
				orderList.push({
					_id: resultOne[0]._id,
					title: resultOne[0].title,
					goods_cover: resultOne[0].goods_cover,
					shop_price: resultOne[0].shop_price,
					num: cartList[k].num,

				})
			}
		}
		console.log(orderList);
		//执行提交订单的操作
		let order_id = tools.getOrderId();
		let name = addressResult[0].name;
		let phone = addressResult[0].phone;
		let address = addressResult[0].address;
		let pay_status = 0;
		let pay_type = '';
		let order_status = 0;
		let yunPrice = 8;
		let amountReal = all_price+yunPrice;
		let orderModel = new order({
			order_id,
			uid,
			name,
			phone,
			address,
			pay_status,
			pay_type,
			order_status,
			all_price,
			peisongType,
			yunPrice,
			goodsNumber,
			remark,
			amountReal
		});
		let orderResult = await orderModel.save();

		if (orderResult && orderResult._id) {
			//增加商品信息
			for (let i = 0; i < orderList.length; i++) {
				let json = {
					"uid": uid,
					"order_id": orderResult._id,   //订单id
					"product_title": orderList[i].title,
					"product_id": orderList[i]._id,
					"product_img": orderList[i].goods_cover,
					"product_price": orderList[i].shop_price,
					"product_num": orderList[i].num
				}

				let orderItemModel = new orderItem(json);
				await orderItemModel.save();

			}
			ctx.body = {
				success: true,
				msg: '生成订单',
				data: {
					orderId:orderResult.order_id,
					amountReal,
					yunPrice
				}
			};
		} else {
			ctx.body = {
				success: false,
				msg: '失败',
				data: []
			};
		}
	} else {
		ctx.body = {
			success: false,
			msg: '失败',
			data: []
		};
	}
})

// 确认订单信息
router.get('/confirm', async function (ctx) {


	var orderId = ctx.request.query.orderId;


	var orderResult = await order.find({ "order_id": orderId });

	if (orderResult && orderResult.length > 0) {

		//获取商品
		var orderItemResult = await orderItem.find({ "order_id": orderResult[0]._id });
		ctx.body = {
			success: true,
			msg: '成功',
			data: {
				orderResult: orderResult[0],
				orderItemResult: orderItemResult,
				id: orderId

			}
		};

	} else {
		//错误
		ctx.body = {
			success: false,
			msg: '失败',
			data: []
		};
	}

});



// 订单状态： order_status ： 0 待付款  1 已付款(待发货)  2 待收货  3、待评价  4、交易成功   99 退货     -1 取消
// POST - /order/queryAllOrders
// 查询所有订单
router.get('/order/queryAllOrders', async function (ctx) {
	var userId = mongoose.Types.ObjectId(ctx.request.query.userId);
	//var userId =  ctx.request.query.userId;
	var orderStatus = ctx.request.query.orderStatus;
	console.log(userId, orderStatus)
	if (orderStatus == '' || orderStatus =='undefined' || orderStatus =='null') {
		var json = {
			uid: userId
		}
	} else {
		var json = {
			uid: userId,
			order_status: parseInt(orderStatus)
		}
	}
	console.log(json);
	var results = await order.aggregate([

		{
			$lookup: {  // 两表联合 jion
				from: 'order_item',
				localField: '_id',
				foreignField: 'order_id',
				as: 'itemList',
			},
		},
		{
			$match: json   // where查询条件 模糊查询
		},
		{
			$sort: { "add_time": -1 }
		}

	]);
	console.log(results);
	if (results.length > 0) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": results
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "没有查询到订单内容",
			"data": []
		};
	}
})

// get - /order/orderStatistics
// 获得项目状态
router.get('/order/orderStatistics', async (ctx, next) => {
	var userId =  ctx.request.query.userId;
	userorderStatistics = await User.find({_id:userId});
	console.log(userorderStatistics)
	if (userorderStatistics) {
		ctx.body = {
			success: true,
			message: "返回订单状态",
			data:{
				count_id_no_confirm:userorderStatistics[0].count_id_no_confirm,
				count_id_no_pay:userorderStatistics[0].count_id_no_pay,
				count_id_no_reputation:userorderStatistics[0].count_id_no_reputation,
				count_id_no_transfer:userorderStatistics[0].count_id_no_transfer
			}
		}
	}
})


// POST - /order/changeToCanceled
// 订单状态变更: 待付款 -> 已取消
router.get('/order/changeToCanceled', async (ctx, next) => {
	var userId =  ctx.request.query.userId;
	var orderId = ctx.request.query.orderId;
	userResult = await User.find({_id:userId});
	if(userResult){
		var updateResult = await order.updateOne(
			{ "_id": orderId },
			{
				order_status: -1  // 取消订单
			}
		);
		if (updateResult) {
			ctx.body = {
				success: true,
				message: "订单取消了"
			}
		}
	}else{
		    ctx.body = {
				success: true,
				message: "没有登录用户请登录"
			}
	}
})


// POST - /order/changeToFinished
// 订单状态变更: 待收货 -> 已完成
router.get('/order/changeToFinished', async (ctx, next) => {
	var userId =  ctx.request.query.userId;
	var orderId = ctx.request.query.orderId;
	userResult = await User.find({_id:userId});
	if(userResult){
		var updateResult = await order.updateOne(
			{ "_id": orderId },
			{
				order_status: 4
			}
		);
		if (updateResult) {
			ctx.body = {
				success: true,
				message: "订单完成"
			}
		}
	}else{
		    ctx.body = {
				success: true,
				message: "没有登录用户请登录"
			}
	}
})



// 商品搜索
router.get('/index/search', async function (ctx) {
	var keyword = ctx.request.query.keyword;
    var orderBy = ctx.request.query.orderBy;
	// 注意: 模糊查询 ,  new RegExp(keyword) ,keyword变量 .  reg =/羽绒服/ 不能传变量
	var json = {};
	if (keyword) {   //{title:{$regex:/羽绒裤/}}
		json = Object.assign({ title: { $regex: new RegExp(keyword) } });
	}

    if(orderBy){
        // orderBy: is_new 最新商品,click_count 销量, shop_price 价格 排序
	   var results = await goods.find(json).sort({ [orderBy]: -1 });
    }else{

	    var results = await goods.find(json).sort({ sort: -1 });
    }


	if (results.length > 0) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": results
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "没有查询内容",
			"data": []
		};
	}
})


// 用户收藏商品: userLike 中的添加操作   /item/like
router.get('/item/like', async function (ctx) {
	var userId = ctx.request.query.userId;
	var itemId = ctx.request.query.itemId;
	const userLikeModel = new userLike({
		userId,
		itemId
	});
	// 保存用户
	const userLikeResult = await userLikeModel.save();
	if (userLikeResult) {
		ctx.body = {
			"success": true,
			"message": "收藏成功"
		};
	}
})

// 用户取消收藏商品  /item/unlike
router.get('/item/unlike', async function (ctx) {
	var userId = ctx.request.query.userId;
	var itemId = ctx.request.query.itemId;
	var delResult = await userLike.deleteOne({ "userId": userId, "itemId": itemId });
	if (delResult) {
		ctx.body = {
			"success": true,
			"message": "取消收藏"
		};
	}else{
		ctx.body = {
			"success": false,
			"message": "取消收藏失败"
		};
	}
})

// 查询用户是否收藏商品  /item/userIsLikeItem

router.get('/item/userIsLikeItem', async function (ctx) {
	var userId = ctx.request.query.userId;
	var itemId = ctx.request.query.itemId;
	var results = await userLike.find({ "userId": userId, "itemId": itemId });
	if (results.length) {
		ctx.body = {
			"success": true,
			"message": "收藏过",
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "未收藏",
		};
	}
})

router.post('/items/addShop', async function (ctx) {
        var  id  = ctx.request.body.id;
        var userId = ctx.request.body.userId;
        if (!ctx.request.body.id) {
            return
        }
        var orderId = ctx.request.query.orderId;
		userResult = await User.find({_id:userId});
		if(userResult){
		        const goodsData = await ShopList.findOne({ cid: id, uid: userId })
		        console.log( ctx.request.body.count);
		        // 购物车已经有了这条商品，商品默认+1
		        if (goodsData) {
		            await ShopList.updateOne({ cid: id, uid: userId }, {
		                $set: {
		                    count: goodsData.count +=  parseInt(ctx.request.body.count),
		                    mallPrice: goodsData.shop_price*(goodsData.count +=  parseInt(ctx.request.body.count))
		                }
		            })
		        } else {  // 说明没有这条数据
		            // 查到这条商品数据
		            console.log(id);
		            let mygoods =  await goods.findOne({_id:id})
		            console.log(mygoods);
		            let newGoods= new ShopList({
		                uid: userId,
		                title:mygoods.title,
		                shop_price: mygoods.shop_price,
		                cid: mygoods._id,
		                goods_cover: mygoods.goods_cover,
		                title: mygoods.title,
		                mallPrice: mygoods.shop_price*ctx.request.body.count,
		                check: false,
		                store: mygoods.goods_number,
		                count: ctx.request.body.count,

		                add_time: +new Date()
		            })
		            await newGoods.save()
		        }

					ctx.body = {
						"success": true,
						"message": "添加购物车成功",
						"data":[]
					};
			}else{
				    ctx.body = {
						"success": false,
						"message": "添加购物车失败,没登陆请登录"
					};
			}

})

// 获得购物车信息
router.get('/items/getShop', async function (ctx) {
    var userId = ctx.request.query.userId;
    if(userId){
	    const goodsData = await ShopList.find({uid: userId })
	    var totalNumber = 0;
	    if (goodsData) {
	    	for(var k in goodsData){
	            totalNumber += goodsData[k].count
	    	}
			ctx.body = {
				"success": true,
				"message": "OK",
				"data": goodsData,
				"totalNumber":totalNumber
			};
		} else {
			ctx.body = {
				"success": false,
				"message": "没有商品",
				"data": []
			};
		}
    }else{
    		ctx.body = {
				"success": false,
				"message": "查询购物车商品失败,请登录",
				"data": []
			};
    }

})
/*
 properties:[
        {
          _id:'',
          optionValueId:'',
          name:'颜色'
          childsCurGoods:[
            _id:'',

    [{_id:5bc6a8c777dc3d1c849fba47,childsCurGoods:{_id:fdfd2222}},{_id:5be3f1d322f56e2fc8a694f2}]

*/
function strToObject(str) {

	try {
		let tempIds = [];
		if (str) {
			const arr = str.replace(/,/g, ',').split(',');
			if (arr[arr.length - 1] == '') {
				arr.pop();
			}
			for (let i = 0; i < arr.length; i++) {
				const subidsArr = arr[i].split(':');
				tempIds.push({
					id:subidsArr[0],
					childsCurGoods:{_id:subidsArr[1]}
				});
			}

		} else {
			tempIds = [{ 1: -1 }];

		}
		return tempIds;


	} catch (error) {
		return [{ 1: -1 }]; // 返回一个不成立的条件
	}


}

// 获得当前商品的价格
router.get('/items/goodsPrice', async function (ctx) {
    var id = ctx.request.query.id;
    var propertyChildIds = ctx.request.query.propertyChildIds;
    var goodsIds = strToObject(propertyChildIds);

    const goodsData = await goods.findOne({_id:id,$or:goodsIds})

    if (goodsData) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": goodsData
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "没有商品",
			"data": []
		};
	}

})

// 修改购物车
router.post('/items/editShop', async function (ctx) {
        let id = ctx.request.body.id;
        let userId= ctx.request.body.userId;
	        if (!ctx.request.body.id) {
	            return
	        }
	    if(userId){
           const goodsData = await ShopList.findOne({ cid: id, uid:userId })

	        // 购物车已经有了这条商品，商品默认+1
	        if (goodsData) {
	            await ShopList.updateOne({ cid: id, uid: userId }, {
	                $set: {
	                    count: ctx.request.body.count,
	                    mallPrice: goodsData.shop_price*ctx.request.body.count,
	                }
	            })
	        }

			ctx.body = {
				"success": true,
				"message": "修改购物车成功",

			};

	    }else{
	    	ctx.body = {
				"success": false,
				"message": "没登陆请去登录",

			};
	    }
})

// 删除购物车
router.get('/items/delShop', async function (ctx) {
        const { id } = ctx.request.query;
        var userId = ctx.request.query.userId;
        if (!ctx.request.query.id) {
            return
        }
        if(userId){
            const result = await ShopList.deleteOne({ cid: id, uid: userId })

			ctx.body = {
				"success": true,
				"message": "删除购物车成功",

			};
		}else{
			ctx.body = {
				"success": false,
				"message": "删除购物车失败,没登陆请登录",

			};
		}

})

// 清空购物车购物车
router.get('/items/delShopAll', async function (ctx) {
        var userId = ctx.request.query.userId;
        if(userId){
	        const result = await ShopList.deleteMany({uid:userId })
			ctx.body = {
				"success": true,
				"message": "清空所有购物车",

			};
		}else{
			ctx.body = {
				"success": false,
				"message": "清空购物车失败,没登陆请登录",

			};
		}

})

// 获得订单详情信息
//getorderDetail
router.get('/getorderDetail', async function (ctx) {

    var userId = mongoose.Types.ObjectId(ctx.request.query.userId);
    var orderId = mongoose.Types.ObjectId( ctx.request.query.orderId);
    var json ={
    	uid:userId,
    	_id:orderId
    }
    var results = await order.aggregate([

		{
			$lookup: {  // 两表联合 jion
				from: 'order_item',
				localField: '_id',
				foreignField: 'order_id',
				as: 'itemList',
			},
		},
		{
			$match: json   // where查询条件 模糊查询
		},
		{
			$sort: { "add_time": -1 }
		}

	]);
	console.log(results);
	if (results.length > 0) {
		ctx.body = {
			"success": true,
			"message": "OK",
			"data": results
		};
	} else {
		ctx.body = {
			"success": false,
			"message": "没有查询到订单内容",
			"data": []
		};
	}

})

//小程序授权登录

//获取openId的方法

router.get('/login',async ctx=>{
    var code = ctx.request.query.code;
    var encryptedData = ctx.request.query.encryptedData;
    var iv = ctx.request.query.iv;

    var tooken=await wxPay.getTooken(code); // 1. 通过微信传递过来的code 换取 微信openid,session_key
    tooken=JSON.parse(tooken);

    // 解密小程序传递过来的值
    if(tooken.openid){
        //保存openid
        var result=await User.find({'openid':tooken.openid});
        if(result.length>0){
        	// 登录
            ctx.body = {
				"success": true,
				"message": "登录成功",
				"data":{
					token:result[0].openid,
					uid:result[0]._id,
					salt:result[0].salt,
				}
			};
        }else{
        	// 第一次登录: 注册
        	// 2. 将 encryptedData,vi 前端传递过来的微信的信息解码
        	const pc = new WXBizDataCrypt(wxConfig.appid, tooken.session_key);
		    const data = pc.decryptData(encryptedData, iv);

		    console.log(data)
        	let json ={
        		nickname:data.nickName,
        		avatar:data.avatarUrl,
                openid:tooken.openid,
                phone:'',
                add_time:tools2.getTime(),
                salt:tools2.md5(Math.random()*100000+'random')
            };
            const userModel = new User(json);
            await userModel.save();
            var userResult = await User.find({'openid':tooken.openid})
            ctx.body = {
				"success": true,
				"message": "登录成功",
				"data":{
					token:userResult[0].openid,
					uid:userResult[0]._id,
					salt:userResult[0].salt,
				}
			};
        }
    }else{

        ctx.body = {
			"success": false,
			"message": "登录失败",

		};
    }



})

router.get('/getUserApiInfo',async ctx=>{
        var token = ctx.request.query.token;
        var result=await User.find({'openid':token});

        if(result.length>0){
            ctx.body = {
				"success": true,
				"message": "登录成功",
				"data":{
					nickName:result[0].nickname,
        		    avatarUrl:result[0].avatar,
        		    phone:result[0].phone
				}
			};
        }

})

router.get('/checkToken',async ctx=>{
        var token = ctx.request.query.token;
        var result=await User.find({'openid':token});

        if(result.length>0){
            ctx.body = {
				"success": true,
				"message": "验证token成功",
			};
        }

})

// 绑定手机
router.get('/bindMobileWxa',async ctx=>{
    var code = ctx.request.query.code;
    var encryptedData = ctx.request.query.encryptedData;
    var iv = ctx.request.query.iv;

    var tooken=await wxPay.getTooken(code);
    tooken=JSON.parse(tooken);
    console.log(tooken);

    // 解密小程序传递过来的值
    if(tooken.openid){
        //保存openid
        var result=await User.find({'openid':tooken.openid});
        const pc = new WXBizDataCrypt(wxConfig.appid, tooken.session_key);
		const data = pc.decryptData(encryptedData, iv);
		console.log(data)
        if(result.length>0){
        	 await User.updateOne(
				{ "_id": result[0]._id },
				{

					phone:data.phoneNumber

				}
			);
            ctx.body = {
				"success": true,
				"message": "手机绑定成功",
			};
        }else{
	        ctx.body = {
				"success": false,
				"message": "手机绑定失败",

			};
		}
    }else{
    	    ctx.body = {
				"success": false,
				"message": "手机绑定失败",

			};
    }



})

// const postData = {
//     token: wx.getStorageSync('token'),
//     money: money,
//     sign: sign,
//     orderId: orderId
//   }
router.post('/dowxPay',async (ctx)=>{


    var openid = ctx.request.body.token || '';
     var uid = ctx.request.body.uid || '';

    var sign = ctx.request.body.sign || ''; // 前端的签名


    var money = ctx.request.body.money || '';
    var orderId = ctx.request.body.orderId || '';

    var d=new Date();

    var userinfo=await User.find({"openid":openid});

    var serverSign=tools2.sign({  // 后端签名
        uid:uid,
        token:openid,
        salt:userinfo[0].salt // 从 user表中拿到 salt
    })
    //console.log(openid,serverSign,sign);

    if(userinfo.length>0 && serverSign==sign){   /*用户信息正确*/


                var spbill_create_ip = ctx.request.ip.replace(/::ffff:/, ''); // 获取客户端ip
                var body = '微店在线支付'; // 商品描述
                var notify_url = wxConfig.notifyUrl+'/notifyShopOrder' // 支付成功的回调地址  可访问 不带参数
                var out_trade_no =orderId; // 商户订单号
                var total_fee =money; // 订单价格
                var result= await wxPay.pay(openid,spbill_create_ip,body,notify_url,out_trade_no,total_fee);
                ctx.body={
                    success:true,
                    result:result
                };



    }else{

        ctx.body={"success":false,'message':"非法请求"};

    }

})


router.post('/notifyShopOrder',async (ctx)=>{

    var  data=ctx.request.body.xml;
    cosole.log(data);
    var  sign=wxPay.notifySignjsApi(data);

    /*签名验证通过，更新订单*/
    if(sign==data.sign[0]){


        var orderResult=await order.find({'_id':data.out_trade_no[0]});

        if(orderResult){

            //更新订单信息
            order.update({'_id':data.out_trade_no[0]},{
                pay_status:1,
                order_status:1
            })
            ctx.body=`<xml>
                    <return_code><![CDATA[SUCCESS]]></return_code>
                <return_msg><![CDATA[OK]]></return_msg>
                </xml>`;

        }else{

            ctx.body='fail';
        }


    }

})

// 修改购物车
router.post('/items/editShopCheck', async function (ctx) {
        let id = ctx.request.body.id;
        //const { _id } = ctx.session.userInfo   // 用户id
				let _id= ctx.request.body.userId;
        // let _id = '1100'
        if (!ctx.request.body.id) {
            return
        }
        console.log(ctx.request.body.check,id);
        const goodsData = await ShopList.findOne({ cid: id, uid: _id })

        // 购物车已经有了这条商品，商品默认+1
        if (goodsData) {
            await ShopList.updateOne({ cid: id, uid: _id }, {
                $set: {
                    check:ctx.request.body.check
                }
            })
        }

			ctx.body = {
				"success": true,
				"message": "修改购物车check状态成功",
				"data":[]
			};

})

module.exports = router;
