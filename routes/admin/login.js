const router = require('koa-router')()
var svgCaptcha = require('svg-captcha'); // 安装并引入验证码

var managerModel = require('../../model/managerModel.js');  //导入mongoose 对应 manager表的对象模型
var tools = require('../../common/tools.js');
router.prefix('/login')
// 登录界面
router.get('/', async function (ctx) {
    await ctx.render('admin/login.html');
})

// 登录操作
router.post('/dologin',async (ctx)=>{
	
	console.log(ctx.session.code);
	console.log(ctx.request.body); // 接收post 数据
	// 1. 获得session 中存的验证码
	// 2.获得表单中 验证码,用户和密码 实现数据库验证登录
	var verify = ctx.request.body.verify;
	var username = ctx.request.body.username;
	var password = tools.md5(ctx.request.body.password);
	// 将验证码都toLocaleLowerCase() 转为小写
	if(ctx.session.code.toLocaleLowerCase()===verify.toLocaleLowerCase()){
		// 用户和密码 实现数据库验证登录
		var result = await managerModel.find({username:username,password:password});
		//console.log(result);
		if(result.length>0){
            //console.log('登录成功');
            // 将用户信息存在 session ,并且设置全局变量
            ctx.session.userInfo = result[0];
            ctx.state.userInfo = ctx.session.userInfo; //state 全局变量
            
            await ctx.render('admin/index');
		}else{
			//console.log('登录失败');
			await ctx.render('admin/error.html',{message:'用户名或密码不正确',redirectUrl:'/admin/login'});
		}
	}else{
		await ctx.render('admin/error.html',{message:'验证码不正确',redirectUrl:'/admin/login'});
	}
	
})

router.get('/verify',async function(ctx){
	
	    var captcha = svgCaptcha.create({
	        size:4,  //4位
	        fontSize: 50,
	        width: 120,
	        height:34,
	        background:"#cc9966"
	    });
	    //console.log(captcha.text);
	    // 将验证码存在 session 中
	    ctx.session.code=captcha.text;
	    //设置响应头
	    ctx.response.type = 'image/svg+xml';  // text/html
	    ctx.body=captcha.data;
})

// 退出
router.get('/loginout',async (ctx)=>{
	ctx.session.userInfo=null;
	ctx.redirect('/admin/login');
})
module.exports = router