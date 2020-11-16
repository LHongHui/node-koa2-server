$(function () {

	$('.aside h4').click(function () {

		//		$(this).toggleClass('active');


		$(this).siblings('ul').slideToggle();
	})

})

var app = {
	toggle: function (el, collectionName, attr, id) {

		$.get('/admin/changeStatus', { collectionName: collectionName, attr: attr, id: id }, function (data) {
			if (data.success) {
				if (el.src.indexOf('yes') != -1) {
					el.src = '/images/no.gif';
				} else {
					el.src = '/images/yes.gif';
				}
			}
		})

	},
	editNum: function (el, model, attr, id) {

		var val = $(el).html();

		var input = $("<input value='' size='5'/>");


		//把input放在sapn里面
		$(el).html(input);

		//让input获取焦点  给input赋值
		$(input).val(val).trigger('focus');


		//点击input的时候阻止冒泡
		$(input).click(function () {

			return false;
		})
		//鼠标离开的时候给sapn赋值
		$(input).blur(function () {

			var num = $(this).val();

			$(el).html(num);

			// console.log(model,attr,id)

			$.get('/admin/editNum', { model: model, attr: attr, id: id, num: num }, function (data) {

				console.log(data);
			})

		})

	}
}
