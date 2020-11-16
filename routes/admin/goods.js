const router = require('koa-router')()
router.prefix('/goods');

var tools = require('../../common/tools.js');

var goodsCate = require('../../model/goodsCateModel.js');
var goods = require('../../model/goodsModel.js');
var goodsImage = require('../../model/goodsImageModel.js');

//图片上传模块

const multer = require('koa-multer');
var storage = multer.diskStorage({
	//  destination: function (req, file, cb) {
	//
	//
	//      cb(null, 'public/upload');   /*配置图片上传的目录     注意：图片上传的目录必须存在*/
	//  },
	destination: 'public/upload/' + new Date().getFullYear() + (new Date().getMonth() + 1) + new Date().getDate() + Math.floor(Math.random()*10000),
	filename: function (req, file, cb) {   /*图片上传完成重命名*/
		var fileFormat = (file.originalname).split(".");   /*获取后缀名  分割数组*/
		cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
	}
})
var upload = multer({ storage: storage });


router.get('/', async function (ctx) {
	// 连接Mongo 实现数据查询显示  调用方法  find(集合名,查询条件)
	// 1. 动态当前页
	var page = ctx.request.query.page || 1;

	var keyword = ctx.request.query.keyword;

	// 注意
	var json = {};
	if (keyword) {   //{title:{$regex:/羽绒裤/}}     
		json = Object.assign({ title: { $regex: new RegExp(keyword) } });
	}
	// 2. 每页显示条数
	var pageSize = 3;
	// 3. 总条数
	var totals = await goods.find(json).count();
	// 4. 总页数
	var totalPages = Math.ceil(totals / pageSize);
	// 5.每页开始的编号
	var offset = (page - 1) * pageSize;
	//	
	//	// 分页   skip(offset).limit(pageSize)
	//var results = await goods.find(json).skip(offset).limit(pageSize).sort({"sort":-1});

	var results = await ctx.model.goods.aggregate([

		{
			$lookup: {  // 两表联合 jion
				from: 'goods_cate',
				localField: 'cate_id',
				foreignField: '_id',
				as: 'catelist',
			},
		},
		{
			$match: json   // where查询条件 模糊查询
		},
		
		{
			$skip: offset,  // 分页
		},
		{
			$limit: pageSize,  // 分页
		},
		{
			$sort: { "sort": -1 }
		}

	]);

	console.log(results);

	await ctx.render('admin/goods/index.html', {
		data: results,
		sd: tools.formatTime(),
		totalPages,
		page,
		keyword
	});
})
//
// 添加
router.get('/add', async function (ctx) {
	// 查询 goodsCate 表中所有的分类信息
	var results = await goodsCate.find({});
	await ctx.render('admin/goods/add.html', { goodsCate: results });
})
router.post('/doadd', upload.fields([
	{
		name: 'goods_img',
		maxCount: 5
	}
]), async function (ctx) {

	if (ctx.req.files['goods_img'] == undefined || ctx.req.files['goods_img'] == null) {
		//ctx.redirect(prevPage);

		await ctx.render('admin/error.html', { message: '图像必须上传', redirectUrl: '/admin/goods/add' });
	} else {
		// 图像路径拼接  upload/2224ev.jpg,upload/dfdfdf.jpg,
		var goods_image_list = ctx.req.files['goods_img'];
		var goods_img = [];
		for (k in goods_image_list) {
			goods_img.push(goods_image_list[k].path.substr(7).replace(/\\/g, '/'));
		}

		var title = ctx.req.body.title;
		var sub_title = ctx.req.body.sub_title;
		var cate_id = ctx.req.body.cate_id;
		var goods_number = ctx.req.body.goods_number;
		var shop_price = ctx.req.body.shop_price;
		var market_price = ctx.req.body.market_price;
		var goods_size = JSON.stringify(ctx.req.body.goods_size);
		var goods_color = JSON.stringify(ctx.req.body.goods_color);
		var goods_keywords = ctx.req.body.goods_keywords;
		var goods_content = ctx.req.body.goods_content;
		var sort = ctx.req.body.sort;
		var is_new = ctx.req.body.is_new || 0;
		var is_hot = ctx.req.body.is_hot || 0;
		var is_best = ctx.req.body.is_best || 0;
		var goods_cover = goods_img[0];
		var goods_img =JSON.stringify(goods_img);
		var properties =[];
		var	properties =[
            {
            	id:'0001',
				optionValueId:'',
				childsCurGoods:[]
            },
            {
            	id:'0002',
            	optionValueId:'',
            	childsCurGoods:[]
            }
		]
		for(var i=0; i<ctx.req.body.goods_color.length;i++){
			properties[0].childsCurGoods.push({
				
					id:'0'+i,
					name:ctx.req.body.goods_color[i],
					active:false
				
			})
		}
		for(var i=0; i<ctx.req.body.goods_size.length;i++){
			properties[1].childsCurGoods.push({
				
				
					id:'0'+i,
					name:ctx.req.body.goods_size[i],
					active:false
				
			})
		}
		var goodss = new goods({
			title,
			sub_title,
			cate_id,
			goods_number,
			shop_price,
			market_price,
			goods_img,
			goods_cover,
			properties,
			goods_size,
			goods_color,
			goods_keywords,
			goods_content,
			sort,
			is_new,
			is_hot,
			is_best
		})
		//console.log(ctx.req.files);
		var addResult = await goodss.save();

		//  goodsImage 表中 img_url 的单个图像一个一个存到数据库中
		for (var i = 0; i < goods_image_list.length; i++) {
			const goodsImgRes = new goodsImage({
				goods_id: addResult._id,
				img_url: goods_image_list[i].path.substr(7).replace(/\\/g, '/')// /upload/20191111/22324353.jpg
			});

			await goodsImgRes.save();
		}
		ctx.redirect('/admin/goods');
	}

})
//
//// 更新
router.get('/edit', async function (ctx) {
	var id = ctx.request.query._id;

	var catResults = await goodsCate.find({});
	var result = await goods.find({ _id: id });
	console.log('###', ctx.state.prevPage);

	// 去 goodsImage 表中查找当前产品的所有图像
	var goodsImageresult = await goodsImage.find({ goods_id: id });
	await ctx.render('admin/goods/edit.html',
		{
			dataone: result[0],
			goodsCate: catResults,
			goodsImage: goodsImageresult,
			prevPage: ctx.state.prevPage   // /admin/goods?page=2
		});
})
//
router.post('/doedit', upload.fields([
	{
		name: 'goods_img',
		maxCount: 5
	}
]), async function (ctx) {

	var prevPage = ctx.req.body.prevPage;
	var _id = ctx.req.body._id;
	
	    var	properties =[
            {
            	id:'0001',
				optionValueId:'',
				childsCurGoods:[]
            },
            {
            	id:'0002',
            	optionValueId:'',
            	childsCurGoods:[]
            }
		]
		for(var i=0; i<ctx.req.body.goods_color.length;i++){
			properties[0].childsCurGoods.push({
				
					id:'0'+i,
					name:ctx.req.body.goods_color[i],
					active:false
				
			})
		}
		for(var i=0; i<ctx.req.body.goods_size.length;i++){
			properties[1].childsCurGoods.push({
				
				
					id:'0'+i,
					name:ctx.req.body.goods_size[i],
					active:false
				
			})
		}
	if (ctx.req.files['goods_img'] == undefined || ctx.req.files['goods_img'] == null) {
        const result = await goods.find({_id:_id});
		var title = ctx.req.body.title;
		var sub_title = ctx.req.body.sub_title;
		var cate_id = ctx.req.body.cate_id;
		var goods_number = ctx.req.body.goods_number;
		var shop_price = ctx.req.body.shop_price;
		var market_price = ctx.req.body.market_price;
		var goods_size = JSON.stringify(ctx.req.body.goods_size);
		var goods_color = JSON.stringify(ctx.req.body.goods_color);
		var goods_keywords = ctx.req.body.goods_keywords;
		var goods_content = ctx.req.body.goods_content;
		var sort = ctx.req.body.sort;
		var is_new = ctx.req.body.is_new || 0;
		var is_hot = ctx.req.body.is_hot || 0;
		var is_best = ctx.req.body.is_best || 0;
		var goods_cover = result[0].goods_cover;
		var updateResult = await goods.updateOne({ "_id": _id }, {
			title,
			sub_title,
			cate_id,
			goods_number,
			shop_price,
			market_price,
			goods_size,
			goods_color,
			properties,
			goods_cover,
			goods_keywords,
			goods_content,
			sort,
			is_new,
			is_hot,
			is_best
		});
	} else {
		// 图像路径拼接  upload/2224ev.jpg,upload/dfdfdf.jpg,
		var goods_image_list = ctx.req.files['goods_img'];
		var goods_img_string = '';
		var goods_img =[];
		for (k in goods_image_list) {
			goods_img.push(goods_image_list[k].path.substr(7).replace(/\\/g, '/'));
		}
		var title = ctx.req.body.title;
		var sub_title = ctx.req.body.sub_title;
		var cate_id = ctx.req.body.cate_id;
		var goods_number = ctx.req.body.goods_number;
		var shop_price = ctx.req.body.shop_price;
		var market_price = ctx.req.body.market_price;
		var goods_size = JSON.stringify(ctx.req.body.goods_size);
		var goods_color = JSON.stringify(ctx.req.body.goods_color);
		var goods_keywords = ctx.req.body.goods_keywords;
		var goods_content = ctx.req.body.goods_content;
		var sort = ctx.req.body.sort;
		var is_new = ctx.req.body.is_new || 0;
		var is_hot = ctx.req.body.is_hot || 0;
		var is_best = ctx.req.body.is_best || 0;
		var goods_cover = goods_img[0];
		var goods_img =JSON.stringify(goods_img);
		
		var updateResult = await goods.updateOne({ "_id": _id }, {
			title,
			sub_title,
			cate_id,
			goods_number,
			shop_price,
			market_price,
			goods_img,
			goods_cover,
			goods_size,
			goods_color,
            properties,
			goods_keywords,
			goods_content,
			sort,
			is_new,
			is_hot,
			is_best
		});
		//  ctx.state.prevPage 返回到上一页路径上 
		//ctx.redirect('/admin/goods');

		// 修改添加图像
		for (var i = 0; i < goods_image_list.length; i++) {
			const goodsImgRes = new goodsImage({
				goods_id: _id,
				img_url: goods_image_list[i].path.substr(7).replace(/\\/g, '/')
			});

			await goodsImgRes.save();
		}

	}
	ctx.redirect(prevPage);

})


// 删除图像goodsImageRemove
router.post('/goodsImageRemove', async function (ctx) {

	const goods_image_id = ctx.request.body.goods_image_id;

	// 注意  图片要不要删掉   fs模块删除以前当前数据对应的图片
    const resultImg = await goodsImage.find({ _id:goods_image_id });
    const result = await goodsImage.deleteOne({ _id:goods_image_id }); // 注意写法
	const result2 = await goods.find({_id:resultImg[0]['goods_id']});
    let path = resultImg[0]['img_url'];

    let goods_img = JSON.parse(result2[0].goods_img);
    console.log(goods_img[0]==path);
    for(var i=0; i<goods_img.length;i++){
        if(goods_img[i]==path){
            let index = i;
            console.log(index);
            result2[0].goods_img =JSON.stringify(goods_img.splice(index,1));
	        result2[0].goods_cover = goods_img[index];
	        console.log(result2);
	        var updateResult = await goods.updateOne({ "_id":resultImg[0]['goods_id']}, result2[0]);
            break;
        }
    }
	
	
    
	if (result) {

		ctx.body = { success: true, message: '删除数据成功' };  // json
	} else {

		ctx.body = { success: false, message: '删除数据失败' }; //json
	}

})
module.exports = router