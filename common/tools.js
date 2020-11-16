let tools = {
	formatTime() {
		return sd = require('silly-datetime');
	},
	md5(str) {
		var md5 = require('md5');
		return md5(str)
	},
	getTime() {

		const d = new Date();

		return d.getTime();

	},
	getRandomNum() {
		let random_str = '';
		for (let i = 0; i < 4; i++) {
			random_str += Math.floor(Math.random() * 10);
		}
		return random_str;
	},

	getOrderId() {

		//订单如何生成

		var nowTime = this.getTime();

		var randomNum = this.getRandomNum();
		return nowTime.toString() + randomNum.toString();

	}

}
module.exports = tools;


