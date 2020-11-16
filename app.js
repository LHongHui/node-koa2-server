const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-session')

// 引入 cors 模块
var cors = require('koa-cors');
const index = require('./routes/index')
const admin = require('./routes/admin')

// 使用并且配置cors   app.use(cors())
app.use(cors({
	origin: function (ctx) {
		if (ctx.url === '/test') {
			return "*"; // 允许来自所有域名请求
		}
		return 'http://localhost:8080'  //'http://www.yiqigoumall.com';  //只允许域名访问
	},
	exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
	maxAge: 5,
	credentials: true, // 允许cookie跨越
	allowMethods: ['GET', 'POST', 'DELETE'], //设置允许的HTTP请求类型
	allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// 配置 session
app.keys = ['some secret hurr'];
const CONFIG = {
	key: 'koa:sess',
	maxAge: 864000,
	overwrite: true,
	httpOnly: true,
	signed: true,
	rolling: true,   /*每次请求都重新设置session*/
	renew: false
};
app.use(session(CONFIG, app));
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
	enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

// ejs 模板引擎
app.use(views(__dirname + '/views', { map: { html: 'ejs' } }));

// logger
app.use(async (ctx, next) => {
	const start = new Date()
	await next()
	const ms = new Date() - start
	console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(admin.routes(), admin.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
	console.error('server error', err, ctx)
});

module.exports = app
