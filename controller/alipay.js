'use strict';
const AlipayService = require('../common/alipay.js');
class AlipayController {
    async pay(ctx) {
        // 前端传递数据
        var uid = ctx.request.body.uid;
        var total_price = ctx.request.body.total_price;
        var order_id = ctx.request.body.order_id;
        var return_url = ctx.request.body.return_url;
        var d = new Date();
        console.log(uid, total_price, order_id);

    }


    //支付成功以后更新订单   必须正式上线
    async alipayNotify() {

        const params = ctx.request.body; //支付宝系统给服务器对应的路由的数据，接收 post 提交的数据

        console.log(params);
        //验证异步通知的数据是否正确
        var result = await AlipayService.alipayNotify(params);

        console.log('-------------');

        console.log(result);


        if (result.code == 0) {

            if (params.trade_status == 'TRADE_SUCCESS') {
                console.log('成功')
                // 更新订单
                var out_trade_no_arr = params.out_trade_no.split('_');

                var order_id = out_trade_no_arr[0];
                /*
                   pay_status: { type: Number },   // 支付状态： 0 表示未支付     1 已经支付
                   pay_type: { type: String },      // 支付类型： 1 alipay    2 wechat  
                */
                await DB.update('order', { "order_id": order_id }, { "pay_status": 1, 'pay_type': 'alipay' });
                //  更改库存... 事物回滚
                //var orderResult = await DB.find('order', { "order_id": order_id });
            }
            console.log('success');

        }

        //接收异步通知
    }

}

module.exports = new AlipayController();
