
//收缩小组件
(function () {
    var trigger = AI('.J_SlideCase .J_trigger'),
        content = AI('.J_SlideCase .J_content');
    if (trigger.length && content.length) {
        trigger.click(function () {
            AI(this).hide();
            content.slideDown(50);
        });
        content.click(function () {
            AI(this).slideUp(100);
            trigger.show();
        });
    }
})();
//old code
if (AI('.scrollCards-container')) {
    var scrollCards = new Alipay.ScrollCards({
        container: AI('.scrollCards-container'),
        cardsNode: AI('.scrollCards'),
        preventDefault: false,
        callback: function (id, node) {
			window.scrollTo(0,1);
		}
    });
    Alipay.detectOrien.add(function () {
        scrollCards.adjust();
    });
    var scrollCard0 = function () {
        scrollCards.id = 0;
        scrollCards.scrollToPos(0);
    };
    AI('[data-cardId]').click(function (e) {
        if (!(this.type && this.type == 'checkbox')) {
            e.preventDefault();
            scrollCards.scrollToPos(AI(this).attr('data-cardId'));
        }
    });
    AI('.btn-nav-back').click(function (e) {
        e.preventDefault();
        scrollCard0();
    });
}
//集分宝
/*
* #ye
* #kj, #kj_select
* #hb, #hb_cb_text, #hb-ok, #hb-cancel, #hbContainer, input[name=coupon]
* #jfb, #jfb_cb_text, #jfb-ok, #jfb-cancel, #jfb_value, #jfb_error
* #pay_result_text
* #other_pay_method_text
* #find_pwd_link, #pwd_box
* 
*/
var ye_cb = AI('#ye'),
    kj_cb = AI('#kj_cb'),
    kj_select = AI('#kj_select'),
    hb_cb = AI('#hb'),
    jfb_cb = AI('#jfb'),
    hb_ok = AI('#hb-ok'),
    hb_cancel = AI('#hb-cancel'),
    jfb_ok = AI('#jfb-ok'),
    jfb_cancel = AI('#jfb-cancel');
//金额模块
var MoneyModule = (function () {
    function _fixed(n, type) {
        //默认保留两位小数
        var n = Math.round(n * 100) / 100;
        type == 'str' ? n = (n).toFixed(2) : null;
        return n;
    };

    function _getVal(str) {
        var o = AI(str);
        return o && o.val() || '';
    };

    function _setVal(str, val) {
        var o = AI(str);
        return o && o.val('' + val) || '';
    };

    function _disabledCheckBox(o, disabled) {
        //禁用checkbox
        var _arr = [].concat(o);
        for (var i = 0, l = _arr.length; i < l; i++) {
            if (!_arr[i]) {
                continue;
            }
            disabled ? _arr[i].attr('checked', false) : null;
            _arr[i].attr('disabled', disabled);
            if (disabled) {
                switch (_arr[i].attr('id')) {
                case 'ye':
                    _data('balance_to_pay', 0);
                    break;
                case 'hb':
                    _data('coupon_amount', 0);
                    _data('coupon_list', 0);
                    break;
                case 'jfb':
                    _data('point_amount', 0);
                    break;
                case 'kj_cb':
                    _data('kj_amount', 0);
                    kj_select.addClass('hide');
                    break;
                }
            }
        }
    };

    function _adjustAmount(cbid) {
        //调整金额
        var dval = 0, //还需支付
            total = 0; //支付总额
        var _changeAmount = function (name, a, b) {
            var val;
            if (a >= b) {
                val = b;
            } else {
                val = a;
            }
            val = _fixed(val)
            _data(name, val);
            return val;
        };
        if (hb_cb.attr('checked') && jfb_cb.attr('checked')) {
            if (cbid == 'hb') {
                _changeAmount('coupon_amount', _mount.pay_amount - _mount.point_amount2, _mount.coupon_amount);
            }
            if (cbid == 'jfb') {
                _changeAmount('point_amount', (_mount.pay_amount - _mount.coupon_amount) * 100, _mount.point_amount2 * 100);
            }
        }
        if (hb_cb.attr('checked')) {
            total += _changeAmount('coupon_amount', _mount.pay_amount, _mount.coupon_amount);
        }
        if (jfb_cb.attr('checked')) {
            dval = _mount.pay_amount - total;
            total += _changeAmount('point_amount', _mount.point_amount2 * 100, dval * 100) / 100;
        }
        if (ye_cb.attr('checked') || _mount.available_amount > _mount.pay_amount) {
            dval = _mount.pay_amount - total;
            total += _changeAmount('balance_to_pay', _mount.available_amount, dval);
        }
        if (kj_cb.attr('checked')) {
            dval = _mount.pay_amount - total;
			//快捷补足 by litian
			_mount.kj_amount = dval > 0 ? dval : _mount.kj_amount;
            total += _changeAmount('kj_amount', _mount.kj_amount, dval);
			
        }
    };

    function _checkPay() {
        //支付文案
        var dval = 0,
            html = '';
        AI('#pay_result_text').html(' ');
        if (_mount.balance_to_pay > 0) {
            dval = _fixed(dval + _mount.balance_to_pay);
            html += '<p>余额支付：<mark class="t-size-16px">' + _fixed(_mount.balance_to_pay, 'str') + '</mark>元&nbsp;&nbsp;</p>';
        }
		//显示红包个数
		var coupon_quantity = _getVal('[name=coupon_quantity]'),
		    coupon_quantityHtml = parseFloat(coupon_quantity) > 0 ? '<mark class="t-color-red">（'+ coupon_quantity +'个）</mark>' : '';
        if (_mount.coupon_amount > 0) {
            dval = _fixed(dval + _mount.coupon_amount);
            AI('#hb_cb_text').html('使用红包' + _fixed(_mount.coupon_amount, 'str') + '元');
            html += '<p>红包支付：<mark class="t-size-16px">' + _fixed(_mount.coupon_amount, 'str') + '</mark>元&nbsp;&nbsp;</p>';
        } else {
            hb_cb[0] && AI('#hb_cb_text').html('使用红包 ' + coupon_quantityHtml);
        }
        if (_mount.point_amount2 > 0) {
            dval = _fixed(dval + _mount.point_amount2);
            AI('#jfb_cb_text').html('使用集分宝' + parseInt(_mount.point_amount) + '个&nbsp;&nbsp;抵扣' + _fixed(_mount.point_amount2, 'str') + '元');
            html += '<p>集分宝支付：<mark class="t-size-16px">' + _fixed(_mount.point_amount2, 'str') + '</mark>元&nbsp;&nbsp;</p>';
        } else {
            jfb_cb[0] && AI('#jfb_cb_text').html('使用集分宝');
        }
        if (_mount.kj_amount > 0) {
            //快捷补足
            html += '<p>快捷支付：<mark class="t-size-16px">' + _fixed(_mount.pay_amount - dval, 'str') + '</mark>元&nbsp;&nbsp;</p>';
            dval = _mount.pay_amount;
        }else{
			
		}
        if (_mount.available_amount >= _mount.pay_amount) {
            //足以支付时
            if (_fixed(_mount.pay_amount - dval) > 0) {
                html = '<p>余额支付：<mark class="t-size-16px">' + _fixed(_mount.pay_amount - dval, 'str') + '</mark>元&nbsp;&nbsp;</p>' + html;
                dval = _mount.pay_amount;
            }
        }
        //
        html != '' ? AI('#pay_result_text').html(html) : null;
        if (dval >= _mount.pay_amount) {
            //足以支付
            AI('#other_pay_method_text').html('您还可以使用其他付款方式');
            _disablePwdBox(false);
        } else {
            if (_mount.balance_to_pay > 0 || _mount.coupon_amount > 0 || _mount.point_amount2 > 0) {
                //任一支付方式大于0，但不足以支付(除卡通)
                html += '<p>还需支付：<mark class="t-color-orange t-size-16px">' + _fixed(_mount.pay_amount - dval, 'str') + '</mark>元</p>';
                html != '' ? AI('#pay_result_text').html(html) : null;
                AI('#other_pay_method_text').html('余额不足，请选择其他方式支付');
            } else {
                AI('#pay_result_text').html('<p>支付金额：<mark class="t-color-orange t-size-16px">' + _fixed(_mount.pay_amount, 'str') + '</mark>元</p>');
                AI('#other_pay_method_text').html('您还可以使用其他付款方式');
            }
            _disablePwdBox(true);
        }
    };
    var _getInputMount = function () {
        /*
       * pay_amount 应付总价
       * available_amount 可用余额
       * availablePoint 可用集分宝
       * balance_to_pay 余额支付
       * kj_amount 卡通支付
       * coupon_amount 红包支付
       * point_amount 集分宝支付（个）
       * point_amount2 集分宝支付（元）
      */
        var o = {},
            arr = ['pay_amount', 'available_amount', 'availablePoint', 'balance_to_pay', 'kj_amount', 'coupon_amount', 'point_amount', 'bank_amount'];
        for (var i = 0, l = arr.length; i < l; i++) {
            o[arr[i]] = parseFloat(_getVal('input[name=' + arr[i] + ']')) || 0;
        }
        o['point_amount2'] = _fixed(o['point_amount'] / 100);
        return o;
    };
    var _mount = _getInputMount();
    var _data = function (name) {
        var _val = 0;
        if (arguments.length > 1) {
            _val = _setVal('input[name=' + name + ']', typeof arguments[1] == 'number' ? _fixed(arguments[1]) : arguments[1]);
            if (_mount.hasOwnProperty(name)) {
                _mount[name] = _fixed(parseFloat(arguments[1]) || 0);
                name == 'point_amount' ? _mount['point_amount2'] = _fixed(_mount[name] / 100) : null;
            }
        } else {
            _val = _getVal('input[name=' + name + ']');
        }
        return _val;
    };
	/*
	* 老卡提前时查询服务费 by litian
	*/
	var _checkHasChargeFee = function(){
		var kj_amount = _mount.kj_amount;
		var _inputData = _data;
		var select = kj_select.get(0);
		if(!select){return;}
		var option = select.options[select.selectedIndex],
			bankCode = AI(option).attr("bankCode"),
			hasChargeFee = AI(option).attr("hasChargeFee"),
			campaignId = AI(option).attr("campaignId") ? AI(option).attr("campaignId") : "",
			awid = _inputData('awid'),
			orderId = _inputData('orderId'),
			AjaxUrl = _inputData('AjaxUrl'),
			_kjErrorNode = AI("#J_kjError"),
			tip = '使用港澳地区信用卡，将收取一定费用。',
			pay_result_text = AI("#pay_result_text"),
			chargeFeeBox = AI("<p class='hide'>手续费：<mark class='t-red t-size-16px' id='J_chargeFeeBox'></mark>元</p>"),
			totalBox = AI("<p class='hide'>总共支付：<mark class='t-color-orange t-size-16px' id='J_totalBox'></mark>元</p>");
			
		if(kj_amount > 0 && !kj_select.hasClass("hide") && hasChargeFee && hasChargeFee == "true"){
			//检查是否显示优惠渠道标识
			var availableDiscount = Discount.exaAvailableDiscount(),cid; 
			if(availableDiscount){
				cid = campaignId;
			}else{
				cid = "";
			}
			var requestData = '{"bankCode":"'+bankCode+'","depositAmount":"'+ kj_amount +'","orderId":"'+ orderId +'","campaignId":"'+ cid +'"}';
			var data = 'awid='+ awid +'&operationType=GET_CHANNEL_CHARGE_FEE&requestData='+ requestData +'';
			//请求数据
            var io = new AI.ajax(AjaxUrl, {
                type: 'post',
                data: data,
                on: {
                    failure:function(){
						_kjErrorNode.empty().html("该交易不支持使用外卡支付，请选择其他付款方式。");
						_kjErrorNode.removeClass('hide');
					},
                    success:function(data){
						//console.log(data);
						if(data.resultStatus == 100){
							pay_result_text.append(chargeFeeBox);
							pay_result_text.append(totalBox);
							chargeFeeBox.find("#J_chargeFeeBox").html(data.chargeFee);
							totalBox.find("#J_totalBox").html(data.realPaymentAmount);
							_kjErrorNode.empty().html(tip);
							chargeFeeBox.removeClass('hide');
							totalBox.removeClass('hide');
							_kjErrorNode.removeClass('hide');
						}else{
							_kjErrorNode.empty().html(data.errorMessage);
							_kjErrorNode.removeClass('hide');
						}
					}
                },
                timeout: 12000,
                dataType: 'json'
            });
            io.send();
		}else{
			chargeFeeBox.addClass('hide');
			totalBox.addClass('hide');
			_kjErrorNode.addClass('hide');
		}
	};
    var _rule = function (cbid) {
        //基本交互规则
        //调整金额
        _adjustAmount(cbid);
        //
        if (_mount.coupon_amount >= _mount.pay_amount) {
            //红包足以支付
            _disabledCheckBox([ye_cb, jfb_cb, kj_cb], true);
        } else if (_mount.point_amount2 >= _mount.pay_amount) {
            //集分宝足以支付
            _disabledCheckBox([ye_cb, hb_cb, kj_cb], true);
        } else {
			if(_fixed(_mount.balance_to_pay + _mount.coupon_amount + _mount.point_amount2) >= _mount.pay_amount){
				//（余额+红包＋集分宝）足以支付
				_disabledCheckBox([kj_cb], true);
			}
			if (_fixed(_mount.balance_to_pay + _mount.coupon_amount) >= _mount.pay_amount) {
				//未选集分宝，（余额＋红包）足以支付
				_disabledCheckBox([kj_cb], true);
			}
			if (_fixed(_mount.balance_to_pay + _mount.point_amount2) >= _mount.pay_amount) {
				//未选红包，（余额＋集分宝）足以支付
				_disabledCheckBox([kj_cb], true);
			}
			if (_fixed(_mount.coupon_amount + _mount.point_amount2) >= _mount.pay_amount) {
				//未选余额，（红包＋集分宝）足以支付
				_disabledCheckBox([ye_cb, kj_cb], true);
			}
        }
        if (cbid == 'ye' && !ye_cb.attr('checked')) {
            //不选余额
            _disabledCheckBox([hb_cb, jfb_cb, kj_cb], false);
        }
        if (cbid == 'hb' && !hb_cb.attr('checked')) {
            //不选红包
            _disabledCheckBox([ye_cb, jfb_cb, kj_cb], false);
        }
        if (cbid == 'jfb' && !jfb_cb.attr('checked')) {
            //不选集分宝
            _disabledCheckBox([ye_cb, hb_cb, kj_cb], false);
        }
		
		Discount.render(_mount);
		//这里必须先请求优惠金额再请求用户银行的服务费
		//因为服务费计算不包含用户已经享受的优惠
		//这里有优化可能，现在用户老卡提前时会出现需要请求两次后台的情况
		
		//检查优惠渠道 litian
		Discount.queryAmout();		
		//检查服务费 litian
		_checkHasChargeFee();
		
        _checkPay();
        LoadPayMethod.showMixPayMethod();
    };
    var _disablePwdBox = function (flag) {
        //密码框相关开关
        var pwd_box = AI('#pwd_box'),
            find_pwd_link = AI('#find_pwd_link');
        if (pwd_box && find_pwd_link) {
            flag ? AI('.mmError').html(' ') : null;
            AI('#find_pwd_link').css('display', flag ? 'none' : '-webkit-box');
            AI('#pwd_box')[flag ? 'addClass' : 'removeClass']('hide');
        }
    };
    return {
        //创建对象
        mount: _mount,
        _getInputMount: _getInputMount,
        data: _data,
        rule: _rule,
		fixed:_fixed,
		checkHasChargeFee:_checkHasChargeFee
    };
})();
var LoadPayMethod = function (cfg) {
    var _renderCard = function (cardId, cardTitle, cardData) {
        var html = [];
        if (cardData && cardData.length) {
            html.push('<div id="' + cardId + '" role="card" class="hide" style="float:none;">');
            html.push('<div id="title" style="margin-bottom:5px;"><a href="#" class="btn-nav-back">返回</a>');
            html.push('<h1>' + cardTitle + '</h1>');
            html.push('</div>');
            for (var i = 0; i < cardData.length; i++) {
                html.push('<section class="box-skin">');
				//添加优惠信息
				var disHtml = Discount.buildHTML(cardData[i]),
				 	campaignId = cardData[i].campaignId ? cardData[i].campaignId : "";	
				//渲染新卡时，加入活动id litian	
                html.push('<section class="box"> <a href="' + _buildURL(cardData[i].url) + '&campaignId='+ campaignId +'" class="layout-flex btn-list"> <span class="flex">' + cardData[i].text + '' + disHtml +'</span> <ins class="icon-arrow icon-arrow-right block"></ins> </a> </section>');
                html.push('</section>');
            }
            html.push('</div>');
            var _scrollCards = AI('.scrollCards-container .scrollCards');
            _scrollCards.append(html.join(''));
            AI('#' + cardId + ' .btn-nav-back').click(function (e) {
                e.preventDefault();
                scrollCard0();
            });
			
			//用户添加新卡的同样可以享受优惠 litian
			//用户通过其他支付方式添加新卡，可以使用组合支付，这个时候需要对用户享受优惠的权限做出判断
			//实时监控用户当前是否适用于使用优惠，绑定用户的点击事件，修改银行链接来。
			AI('#' + cardId + ' .box-skin a').click(function (e) {
				e.stopPropagation();
                this.href = Discount.buildURL(AI(this)).url;
            });
			
        }
    };
	
    //加载付款方式
    var _start = function () {
        //避免_triggerNodeText的值动态变化，只在第一次加载请求时赋值
        !_triggerNodeText ? _triggerNodeText = AI(_trigger.find('span')).html() : null;
        //
        var _loading = '正在请求数据<canvas width="23" height="23" style="float:none;position:absolute;margin:8px 0 0 5px;" class="canvas"></canvas>';
        AI(_trigger.find('span:first-child')).html(_loading);
        var loading = new DrawLoading({
            canvas: AI(_trigger.find('.canvas')).get(0)
        });
        loading.draw();
    };
    var _failure = function () {
        _click = false;
        //
        AI(_trigger.find('button')).addClass('error');
        AI(_trigger.find('span:first-child')).html('请求失败，请重试');
        //重新绑定事件
        _trigger.click(function (e) {
            _load(e);
        });
    };
    var _success = function (data) {
        var _jsondata = data,
            y = 0; //将滚动条滚动到这个位置
        //重定向
        if (_jsondata.stat == 'redirect') {
            document.location.href = _jsondata.url;
        }
        if (_jsondata.resultStatus != '100') {
            //失败
            _failure();
            return;
        }
        //重置请求标志
        _requested = true;
        var html = '';
        if (cfg.scope == 'all') {
            var _recent = _jsondata.recent,
				_returnExCashier = _jsondata.returnExCashier,
                _payMethods = _jsondata.payMethods;
            if (_recent && _recent.channelCode) {
                var _channelCode = _recent.channelCode;
                html += '<p class="recent"';
                html += ' data-payMethod="' + _recent.channelCode + '"><strong>最近使用：</strong><a data-action="buildurl" data-url="' + _recent.url + '" href="' + _buildURL(_recent.url) + '">' + _recent.text + ''+ Discount.buildHTML(_recent) +'</a></p>';
            }
            if (_payMethods && _payMethods.length > 0) {
                for (var i = 0, l = _payMethods.length; i < l; i++) {
                    html += '<div class="button-dropdown-skin" role="' + _payMethods[i].status + '">' + '<button class="button-dropdown">' + '<span>' + _payMethods[i].name + '</span>';
                    //html += (_payMethods[i].status == 'GET_CREDIT_CARD' ? '<span class="t-color-orange" style="padding-left:10px;">（推荐）</span>' : '');
					//添加优惠信息
					var disHtml = Discount.buildHTML(_payMethods[i]);
					html += disHtml;
					
                    html += '<canvas class="arrow" width="12" height="7" style="margin:17px 3px 0 0;">' + '</canvas>' + '</button>' + '</div>';
                }
            }
			if (_returnExCashier && _returnExCashier.url) {
				var txt = _returnExCashier.text || "重新付款"
				html += '<p><a href="'+ _returnExCashier.url +'" style="padding:0px;">'+ _returnExCashier.text ||  +'</a></p>'
			}
            if (html) {
                AI('#J_other_pay_method_body').html(html);
                var _link = _triggerBody.find('.recent a[data-action="buildurl"]');
                _link && AI(_link).click(function (e) {
                    //e.preventDefault();
                    e.stopPropagation();
                    this.href = _buildURL(AI(this).attr('data-url'));
					//对优惠活动的资金渠道做处理
					this.href = Discount.buildURL(AI(this)).url;
                });
                var triggers = AI('#J_other_pay_method_body .button-dropdown-skin');
                for (var j = 0, jl = triggers.length; j < jl; j++) {
                    new LoadPayMethod({
                        trigger: AI(triggers[j]),
                        scope: ''
                    });
                    drawArrow(AI(triggers[j]).find('canvas.arrow').get(0));
                }
            }
        } else {
            var _bankList = _jsondata.bankList,
                _bindPhone = _jsondata.bindPhone,
                _role = _trigger.attr('role'),
                _listAll = _jsondata.listAll,
                _cardId;
            if (_listAll) {
                _cardId = 'card-' + (new Date()).getTime();
                _renderCard(_cardId, '添加新卡', _listAll);
            }
            if (_role == 'KT' && (!_bankList || _bankList.length == 0)) {
                AI(_trigger.find('.button-dropdown span')).after('<a style="display:inline;color:#0E4892;textshadow:1px 1px #fff;border:none;" href="' + (_inputData('applyKT') || '') + '">请申请卡通</a>');
            } else if (_role == 'KT' && (!_bindPhone || _bindPhone != 'true')) {
                AI(_trigger.find('.button-dropdown span')).after('<a style="display:inline;color:#0E4892;textshadow:1px 1px #fff;border:none;" href="' + (_inputData('bindPhone') || '') + '">请先绑定手机</a>');
            } else if (_bankList && _bankList.length > 0) {
                for (var i = 0, l = _bankList.length; i < l; i++) {
                    html += '<a data-action="buildurl" data-url="' + _bankList[i].url + '" href="';
                    if (/action=listAll/.test(_bankList[i].url)) {
                        html += 'javascript:void(0);';
                    } else {
                        html += _buildURL(_bankList[i].url);
                    }
					//添加优惠信息					
					var disHtml = Discount.buildHTML(_bankList[i]);				
                    html += '">' + _bankList[i].text + '' + disHtml + '</a>';
                }
                if (html) {
                    _buildTriggerBody();
                    _triggerBody.html(html);
                    var _link = _triggerBody.find('a[data-action="buildurl"]');
                    for (var k = 0, kl = _link.length; k < kl; k++) {
                        AI(_link[k]).click(function (e) {
                            e.stopPropagation();
							//e.preventDefault();
                            //链接中含有action=listAll的类型
                            if (_listAll && /action=listAll/.test(AI(this).attr('data-url'))) {
                                e.preventDefault();
                                scrollCards.scrollToPos(_cardId);
                                window.scrollTo(0, 1);
                            } else {
                                this.href = _buildURL(AI(this).attr('data-url'));
								//对优惠活动的资金渠道做处理
								this.href = Discount.buildURL(AI(this)).url;
                            }
                        });
                    }
                }
            }
        }
        y = AI('#J_other_pay_method_trigger').get(0).offsetTop - 40 + _trigger.get(0).offsetTop;
        window.scrollTo(0, y);
        if (html) {
            LoadPayMethod.showMixPayMethod();
            _triggerBody.slideDown(300, function () {
                _trigger.find('canvas.arrow').get(0).style.webkitTransform = 'rotate(-180deg)';
                _trigger.click(_load);
            });
        }
        //还原默认文案，放置渲染数据后面
        AI(_trigger.find('span:first-child')).html(_triggerNodeText);
		
		//渲染优惠渠道 litian
		Discount.render();
    };
    var _complete = function () {
        setTimeout(function () {
            AI(_trigger.find('button')).removeClass('error');
        }, 300);
    };
    var _buildURL = function (url) {
        //组装url
        if (!/\?\S*$/.test(url)) {
            url += '?';
        }
        var args_list = ['awid', 'is_pc_trade', 'pay_order', 'bizIdentity', 'balanceClose', 'need_sign', 'productType', 'balance_to_pay', 'coupon_list', 'coupon_amount', 'point_amount'];
        var _is_mix_pay = LoadPayMethod.isMixPay();
        url += '&is_mix_pay=' + _is_mix_pay;
        for (var i = 0, l = args_list.length; i < l; i++) {
			if(!AI('#ye').get(0) && args_list[i] === "balance_to_pay"){
				url += '&' + args_list[i] + '=';
			}else{
				url += '&' + args_list[i] + '=' + _inputData(args_list[i]);
			}
        }
        return encodeURI(url);
    };
    var _load = function (e) {
        //卸载事件，防止重复请求
        if (e) {
            var trigger = AI(e.currentTarget);
            trigger.unbind();
        }
        //如果已经请求到数据，重新为触发器绑定事件
        if (trigger && _requested) {
            trigger.click(_load);
        }
        if (_click) {
            _click = false;
            _triggerBody && _triggerBody.get(0) && _triggerBody.slideUp(300, function () {
                if (trigger) {
                    trigger.find('canvas.arrow').get(0).style.webkitTransform = 'rotate(0deg)';
                }
            });
        } else {
            _click = true;
            _triggerBody && _triggerBody.get(0) && _triggerBody.slideDown(300, function () {
                if (trigger) {
                    trigger.find('canvas.arrow').get(0).style.webkitTransform = 'rotate(-180deg)';
                }
            });
        }
        if (!_requested) {
            var AjaxUrl = _inputData('AjaxUrl');
            var operationType = _trigger.attr('role') || 'PAYTYPE',
                awid = _inputData('awid'),
                userID = _inputData('userID'),
                is_pc_trade = _inputData('is_pc_trade'),
                orderId = _inputData('orderId'),
				fromMainPage = _inputData('fromMainPage'),
                timestamp = new Date().getTime(),
                data = 'awid=' + awid + '&operationType=' + operationType + '&requestData={"ID":"' + userID + '","isPcTrade":"' + is_pc_trade + '","orderId":"' + orderId + '","fromMainPage":"'+ fromMainPage +'"}&timestamp=' + timestamp + '';
            //解决Android平台下对ajax数据错误缓存问题
            if (AI.UA.system === 'android') {
                AjaxUrl += '&androidTime=' + Math.random() + '';
            }
            //请求数据
            var io = new AI.ajax(AjaxUrl, {
                type: 'post',
                data: data,
                on: {
                    start: _start,
                    failure: _failure,
                    success: _success,
                    complete: _complete
                },
                timeout: 12000,
                dataType: 'json'
            });
            io.send();
        }
    };
    var _buildTriggerBody = function () {
        var _next = AI(_trigger[0].nextSibling);
        var role1 = _trigger.attr('role'),
            role2 = _next && _next.attr('role') || '';
        if (_next && role2 == (role1 + 'bankList')) {
            _triggerBody = _next;
        } else {
            _trigger.after('<div data-status="linkactive" role="' + (role1 + 'bankList') + '"></div>');
            _triggerBody = AI(_trigger[0].nextSibling);
        }
        return _triggerBody;
    };
	
	//对无支付能力资金渠道前置做处理
	//无支付能力用户可能拥有余额，红包和集分宝
	//我们对资金渠道做url处理，使银行资金渠道可以使用组合支付或者享受到优惠
	//同时对更多渠道中的银行错url处理，使他们可以使用组合支付或者享受到优惠
	AI("#J_DataBox").get(0) && AI("#J_DataBox").delegate(".payMethod-twocols a","click",function(e){
		 e.stopPropagation();
         this.href = _buildURL(AI(this).attr('data-url'));
		 //对优惠活动的资金渠道做处理
		 this.href = Discount.buildURL(AI(this)).url;
	});
	//储蓄卡新卡
	AI("#card-disablePaymentDebitcard").get(0) && AI("#card-disablePaymentDebitcard").delegate(".box-skin a","click",function(e){
		 e.stopPropagation();
         this.href = _buildURL(AI(this).attr('data-url'));
		 //对优惠活动的资金渠道做处理
		 this.href = Discount.buildURL(AI(this)).url;
	});
	//信用卡新卡
	AI("#card-disablePaymentCreditcard").get(0) && AI("#card-disablePaymentCreditcard").delegate(".box-skin a","click",function(e){
		 e.stopPropagation();
         this.href = _buildURL(AI(this).attr('data-url'));
		 //对优惠活动的资金渠道做处理
		 this.href = Discount.buildURL(AI(this)).url;
	});

    var _inputData = MoneyModule.data;
    var _click = false,
        _requested = false,
        _anim;
    var _trigger = cfg.trigger,
        _triggerBody = cfg.triggerBody,
        _triggerNodeText;
    //绑定事件
    _trigger && _trigger.click(function (e) {
        _load(e);
    });
    return {
        load: _load
    };
};
LoadPayMethod.isMixPay = function () {
    var _mount = MoneyModule._getInputMount(),
        _is_mix_pay;
    var total = Math.round((_mount.balance_to_pay + _mount.coupon_amount + _mount.point_amount2) * 100) / 100;
    if ((_mount.balance_to_pay > 0 || _mount.coupon_amount > 0 || _mount.point_amount2 > 0) && total < _mount.pay_amount && _mount.available_amount < _mount.pay_amount && _mount.kj_amount <= 0 && _mount.bank_amount <= 0) {
        _is_mix_pay = true;
    } else {
        _is_mix_pay = false;
    }
    return _is_mix_pay;
};
LoadPayMethod.showMixPayMethod = function () {
    //筛选混合支付
    //这里的is_mix_pay和上面的不一样，上面只会在首推卡通时需要
    var _is_mix_pay = LoadPayMethod.isMixPay();
    var recent = AI('#J_other_pay_method_body .recent');
    if (recent) {
        var recentPayMethod = recent.attr('data-payMethod');
        //if ((recentPayMethod === 'unionpay' || recentPayMethod === 'creditcard' || recentPayMethod === 'debitcard' || recentPayMethod === 'phonecard') && _is_mix_pay) {
        //new rule 快捷支付可以用于组合支付
        if ((recentPayMethod === 'unionpay' || recentPayMethod === 'phonecard') && _is_mix_pay) {
            recent.css('display', 'none');
        } else {
            recent.css('display', '-webkit-box');
        }
    }
    var payMethod = AI('#J_other_pay_method_body div[role]');
    if (payMethod) {
        AI.each(payMethod, function (i, o) {
            var role = AI(o).attr('role');
            //if ((role == 'YLK' || role == "YLKbankList" || role == 'XYK' || role == "XYKbankList" || role == 'JJK' || role == "JJKbankList" || role == 'QT' || role == "QTbankList") && _is_mix_pay) {
            //new rule 快捷支付可以用于组合支付
            if ((role == 'YLK' || role == "YLKbankList" || role == 'QT' || role == "QTbankList") && _is_mix_pay) {
                if (!/bankList$/.test(role)) {
                    AI(o).addClass('hide');
                } else {
                    AI(o).css('display', 'none');
                }
            } else {
                if (!/bankList$/.test(role)) {
                    AI(o).removeClass('hide');
                } else {
                    if (AI(o).attr('open') == '1') {
                        AI(o).css('display', 'block');
                    }
                }
            }
        });
    }
};

/*
* 优惠渠道对象 处理页面相关的优惠渠道 litian
*/
var Discount = {
	availableDiscount:true, //{ Boolean } 优惠是否可用，默认可用
	html:'<span class="discount" data-campaignId="{campaignId}">{discountText}</span>', //{ String } 渠道优惠html模板
	desHtml:'<p class="discountDes hide"></p>', //{ String } 老卡提前时提示优惠
	_hide:function(){
		AI(".discount").addClass("hide");
		AI("#J_disAmountBox").get(0) && AI("#J_disAmountBox").addClass("hide");
		AI(".discountDes").get(0) && AI(".discountDes").addClass("hide");
		//对已存卡提前的下拉框处理
		var select = kj_select.get(0);
		if(select){
			var options = select.options;
			for(var i=0;i<options.length;i++){
				var option = AI(options[i]);
				var text = option.text().replace(" 惠","");
				option.text(text).removeClass("t-orange");
			}
		}
	},
	_show:function(){
		AI(".discount").removeClass("hide");
		//对已存卡提前的下拉框处理
		var select = kj_select.get(0);
		if(select){
			var options = select.options;
			for(var i=0;i<options.length;i++){
				var option = AI(options[i]);
				if(option.attr("isDiscount") == "true"){
					var text = option.text().indexOf(" 惠") > -1 ? option.text() : option.text() + ' 惠';
					option.text(text).addClass("t-orange");
				}
			}
		}
	}
};
/*
* 建立优惠渠道标识
* @param { json } data 优惠渠道的信息
*/
Discount.buildHTML = function(data){
	var disHtml = '';
	if((data.discount || data.discount == "true") && data.discount != "false"){
		var discountText = data.discountText ? data.discountText : "";
		var campaignId = data.campaignId ? data.campaignId : '';
		disHtml = Discount.html.replace('{discountText}',discountText);
		disHtml = disHtml.replace('{campaignId}',campaignId);
	}
	return disHtml;
};
/*
* 处理有优惠渠道的资金渠道链接
* @param { jqueryObject } link 链接a对象
*/
Discount.buildURL = function(link){
	var _link = link,url = _link.attr("href");
	//检查该资金渠道是否有优惠活动
	var channelHasDiscount = _link.find(".discount").length > 0;
	//用于替换url中的campaignId
	//如果已经存在campaignId,campaignId有值则替换,campaignId无值则加上值
	//不存在campaignId,将campaignId加入到url最后
	var _replaceCamId = function(url,id){
		if(url){
			var id = id || "";
			if(url.indexOf("&campaignId=") > -1){
				url.replace(/&campaignId=[^&]{0,}&?/,'&campaignId=' + id + '&');
			}else{
				url = url + '&campaignId=' + id;
			}
		}
		return url;
	}
	if(channelHasDiscount && !_link.find(".discount").hasClass("hide")){
		var campaignId = _link.find(".discount").attr("data-campaignId") ? _link.find(".discount").attr("data-campaignId") : "";
		//替换campaignId值
		url = _replaceCamId(url,campaignId);
	}else{
		url = url.replace(/&campaignId=[^&]{0,}&?/,"");
	}
	//修改url的href值
	_link.attr("href",url);
	return {
		link:_link,
		url:url
	}
};
/*
* 如果用的账户金额足够支付时用户不使用快捷和账户金额组合支付，账户金额不足支付用户就使用组合支付
* 检查是否显示优惠渠道标识 ,如果使用了组合支付不能享受优惠，没使用组合支付可以享受优惠
* {object} _mount 资金对象，如果没有传入则使用全局对象MoneyModule.mount；
*/
Discount.exaAvailableDiscount = function(mount){
	var _mount = mount || MoneyModule.mount,
		pay_amount = _mount.pay_amount,
		total = _mount.balance_to_pay + _mount.coupon_amount + _mount.point_amount2;
		
	//检查优惠是否可用并缓存到Discount.availableDiscount中	
	if(total > 0 && total < pay_amount){
		Discount.availableDiscount = false;
	}else{
		Discount.availableDiscount = true;
	}
	return Discount.availableDiscount;
};
/*
* 筛选，渲染资金渠道优惠 
*@param { object } mount 收银台资金对象
*/
Discount.render = function(mount){
	//检查是否显示优惠渠道标识
	var availableDiscount = Discount.exaAvailableDiscount();
	//显示或者隐藏优惠
	if(availableDiscount){
		Discount._show();
	}else{
		Discount._hide();
	}
};
/*
* 老卡提前时查询优惠金额
*/
Discount.queryAmout = function(){
	//检查是否显示优惠渠道标识
	var availableDiscount = Discount.exaAvailableDiscount();
	//获取快捷提前的下拉框Dom原生对象
	var select = kj_select.get(0);
	//引入几个其他组件的对象
	var _inputData = MoneyModule.data,_mount = MoneyModule.mount;
	//确保和老卡提前的两个数据时隐藏状态
	AI("#J_disAmountBox").addClass('hide');
	AI(".discountDes").addClass('hide');
	//三个条件下执行：1.有快捷老卡，2.用户使用了快捷，3.用户没有使用组合支付
	if(select && !kj_select.hasClass("hide") && availableDiscount){
		/*
		*将优惠相关的节点加入文档中并初始化
		*/
		//显示优惠提示信息
		if(!AI(".discountDes").get(0)){
			kj_select.after(Discount.desHtml);
		}
		//显示抵扣金额
		if(!AI('#J_disAmountBox').get(0)){
			AI("#pay_result_text").before("<p class='hide' id='J_disAmountBox'>抵扣金额：<mark class='t-orange t-size-16px'></mark>元（集分宝兑换券）</p>");
		}else{
			AI('#J_disAmountBox').find("mark").empty();
		}
		//服务端需要的优惠金额参数
		if(!AI('[name="discountAmount"]').get(0)){
			AI("#paymentForm").append('<input type="hidden" name="discountAmount" value="0.00" />');
		}else{
			AI('[name="discountAmount"]').val("0.00");
		}
		
		//获取一些需要的数据
		var option = AI(select.options[select.selectedIndex]),
			awid = _inputData('awid'),
			orderId = _inputData('orderId'),
			AjaxUrl = _inputData('AjaxUrl'),
			campaignId = option.attr("campaignId"),
			pay_result_text = AI("#pay_result_text"),
			_desNode = AI(".discountDes"),	
			discountAmount = AI('[name="discountAmount"]'),
		    disAmountBox = AI("#J_disAmountBox");
				
		//老卡银行有优惠时请求优惠金额				
		if(option.attr("isDiscount") == "true"){
			var requestData = '{"campaignId":"'+campaignId+'","orderId":"'+ orderId +'"}';
			var data = 'awid='+ awid +'&operationType=GET_DIS_DETAIL&requestData='+ requestData +'';
			//请求数据
            var io = new AI.ajax(AjaxUrl, {
                type: 'post',
                data: data,
                on: {
                    failure:function(){
						_desNode.empty().removeClass('hide').addClass("t-red").html("优惠请求失败");
						disAmountBox.addClass('hide');
					},
                    success:function(data){
						if(data.resultStatus == "100"){
							_desNode.empty().text(data.desc);
							_desNode.removeClass("t-red").removeClass('hide');
							disAmountBox.find("mark").empty().text(data.amount);
							discountAmount.val(data.amount);
							var _kj_amount = MoneyModule.fixed((parseFloat(MoneyModule.mount.pay_amount) - parseFloat(data.amount)),'str');
							MoneyModule.data("kj_amount",_kj_amount);
							disAmountBox.next().find("mark:eq(0)").text(_kj_amount);
							disAmountBox.removeClass('hide');
						}else{
							_desNode.empty().html("优惠请求失败");
							_desNode.addClass("t-red").removeClass('hide');
							disAmountBox.addClass('hide');
						}
					}
                },
                timeout: 12000,
                dataType: 'json'
            });
            io.send();
		}else{
			_desNode.empty().addClass('hide');
			disAmountBox.addClass('hide');
		}
	}
};

(function () {
    //初始化及事件
    var _mount = MoneyModule.mount,
        _data = MoneyModule.data,
        _rule = MoneyModule.rule,
		_checkHasChargeFee = MoneyModule.checkHasChargeFee;
    var _initHiddenInputData = function () {
        //页面隐藏域数据订正
        //防止页面中没有以下的checkbox被选，但交互数据有值的bug
        if (!ye_cb[0] && _mount.balance_to_pay > 0) {
            _data('balance_to_pay', 0);
        }
        if (!kj_cb[0] && _mount.kj_amount > 0) {
            _data('kj_amount', 0);
        }
        if (!hb_cb[0] && _mount.coupon_amount > 0) {
            _data('coupon_amount', 0);
            _data('coupon_list', 0);
        }
        if (!jfb_cb[0] && _mount.point_amount > 0) {
            _data('point_amount', 0);
        }
        /*var total = _mount.balance_to_pay + _mount.coupon_amount + _mount.point_amount;
        if ((_mount.balance_to_pay > 0 || _mount.coupon_amount > 0 || _mount.point_amount > 0) && total < _mount.pay_amount && _mount.available_amount < _mount.pay_amount && _mount.kj_amount <= 0) {
            _data('is_mix_pay', 'true');
        } else {
            _data('is_mix_pay', 'false');
        }*/
    };
    //checkbox事件
    var ye_cb_event = function () {
        if (this.checked) {
            _data('balance_to_pay', _mount.available_amount);
        } else {
            _data('balance_to_pay', 0);
        }
        _rule('ye');
    };
    var kj_cb_event = function () {
        if (this.checked) {
            var dval;
            dval = _mount.pay_amount - _mount.balance_to_pay - _mount.coupon_amount - _mount.point_amount2;
            _data('kj_amount', dval);
            kj_select && kj_select.removeClass('hide');
        } else {
            _data('kj_amount', 0);
            kj_select && kj_select.addClass('hide');
			AI("#J_kjError").addClass('hide');
			AI(".discountDes").addClass('hide');
        }
        _rule('kj');
    };
	var kj_select_event = function(){		
		_rule('kj');
	}
    var hb_cb_event = function () {
        if (this.checked) {
            scrollCards.scrollToPos(AI(this).attr('data-cardId'));
        } else {
            //init
            _init_hb();
        }
		_rule('hb');
    };
    var jfb_cb_event = function () {
        if (this.checked) {
           /*
			* 还需支付 还需支付 = 总金额 - 红包支付
			*/
            var dval = Math.round((_mount.pay_amount - _mount.coupon_amount) * 100);
			if (dval > _mount.availablePoint) {
				dval = _mount.availablePoint
			}
			_data('point_amount', dval);
           _rule('jfb');
        } else {
            _data('point_amount', 0);
            _rule('jfb');
        }
    };
    var _checkCouponMerge = function () {
        //检测红包是否可以合并支付
        var _val = AI(this).attr('data-isMerge'),
            _ck = AI(this).attr('checked'),
            _ck_flag = false;
        _coupons.forEach(function (o) {
            if (_ck) {
                if (AI(o).attr('data-isMerge') != _val || _val === 'false') {
                    //不是同一类型的红包禁用
                    AI(o).attr('checked', false);
                    AI(o).attr('disabled', true);
                }
            } else {
                if (AI(o).attr('data-isMerge') == _val && AI(o).attr('checked')) {
                    //统计同一类型的红包是否还有选中的
                    _ck_flag = true;
                }
            }
        });
        if (!_ck) {
            _coupons.forEach(function (o) {
                if (!_ck_flag && AI(o).attr('data-isMerge') != _val || _val === 'false') {
                    //同一类型的红包没有一个选中时，启用其它类型的红包
                    AI(o).attr('disabled', false);
                }
            });
        }
        if (_ck) {
            AI(this).attr('disabled', false);
            AI(this).attr('checked', true);
        }
    };
    var _init_hb = function () {
        //初使化红包数据
        _data('coupon_amount', 0);
        _data('coupon_list', 0);
        _coupons.forEach(function (o) {
            o.checked = false;
            o.disabled = false;
        });
    };
    var hb_ok_event = function () {
        var _coupon_list = '';
        var _coupon_amount = 0;
        _coupons.forEach(function (o) {
            if (o.checked) {
                _coupon_list += o.value + ';';
                _coupon_amount += parseFloat(o.getAttribute('data-HB')) || 0;
            }
        });
        if (_coupon_list == '') {
            hb_cb.attr('checked', false);
            _data('coupon_amount', 0);
            _data('coupon_list', 0);
        } else {
            _data('coupon_amount', _coupon_amount);
            _data('coupon_list', _coupon_list);
            _rule('hb');
        }
        //
        scrollCard0();
    };
    var hb_cancel_event = function () {
        hb_cb.attr('checked', false);
        _init_hb();
        //
        scrollCard0();
    };
    var jfb_ok_event = function () {
        var dval, _errorNode = AI('#jfb_error');
        var _jfb_value = AI('#jfb_value').val().replace(/^\s*|\s*$/g, '');
        AI('#jfb_value').val(_jfb_value);
        if (_jfb_value == '' || _jfb_value == '0') {
            jfb_cb.attr('checked', false);
            _errorNode.addClass('hide');
            _errorNode.html(' ');
            scrollCard0();
        } else {
            dval = Math.round((_mount.pay_amount - _mount.coupon_amount) * 100) / 100;
            if (!/^[0-9]*$/.test(_jfb_value) || parseFloat(_jfb_value) <= 0) {
                //只能是正整数
                _errorNode.removeClass('hide');
                _errorNode.html('集分宝数量必须是大于0的整数，请重新输入。');
            } else {
                _jfb_value = parseFloat(_jfb_value);
                if ((_jfb_value) > _mount.availablePoint) {
                    _errorNode.removeClass('hide');
                    _errorNode.html('输入数量大于可用集分宝数量，请重新输入。');
                } else if (parseFloat(_jfb_value / 100) > dval) {
                    _errorNode.removeClass('hide');
                    _errorNode.html('输入数量大于应付金额，请重新输入。');
                } else {
                    _errorNode.addClass('hide');
                    _errorNode.html(' ');
                    _data('point_amount', _jfb_value);
                    _rule('jfb');
                    //
                    scrollCard0();
                }
            }
        }
    };
    var jfb_cancel_event = function () {
        //init
        jfb_cb.attr('checked', false);
        _data('point_amount', 0);
        //清除出错信息
        var _errorNode = AI('#jfb_error');
        _errorNode.addClass('hide');
        _errorNode.html(' ');
        //
        scrollCard0();
    };
	
	/*
	*为收银台绑定事件
	*/
    ye_cb[0] && ye_cb.click(function () {
        ye_cb_event.call(this);
    });
    kj_cb[0] && kj_cb.click(function () {
        kj_cb_event.call(this);
    });
	//快捷提前，老用户选择快捷银行时绑定事件
	kj_select[0] && kj_select.change(function(){
		kj_select_event.call(this);
	});
    hb_cb[0] && hb_cb.click(function () {
        hb_cb_event.call(this);
    });
    jfb_cb[0] && jfb_cb.click(function () {
        jfb_cb_event.call(this);
    });
    var _coupons = AI('#hbContainer input[name=coupon]'),
        arr = [];
		//将红包的dom集合放入数组
		for (var c = 0, l = _coupons.length; c < l; c++) {
			arr.push(_coupons[c]);
		}
		_coupons = arr;
		if (_coupons && _coupons.length) {
			//为所有红包添加事件
			_coupons.forEach(function (o) {
				AI(o).click(_checkCouponMerge);
			});
        }
    hb_ok && hb_ok.click(function () {
        hb_ok_event.call(this);
    });
    hb_cancel && hb_cancel.click(function () {
        hb_cancel_event.call(this);
    });
    jfb_ok && jfb_ok.click(function () {
        jfb_ok_event.call(this);
    });
    jfb_cancel && jfb_cancel.click(function () {
        jfb_cancel_event.call(this);
    });
	
    //初始化checkbox
    ye_cb[0] && ye_cb.attr('disabled', false);
    kj_cb[0] && kj_cb.attr('disabled', false);
    hb_cb[0] && hb_cb.attr('disabled', false);
    jfb_cb[0] && jfb_cb.attr('disabled', false);
	
    //隐藏域数据订正
    if (AI('input[name=available_amount]') != null) {
        //支付页面1和2都调同一个JS，此处判断available_amount隐藏域来做区分
        //_initHiddenInputData();
    }
	
	//初始化其他支付方式
    var loadAllPayMethod = new LoadPayMethod({
        trigger: AI('#J_other_pay_method_trigger'),
        triggerBody: AI('#J_other_pay_method_body'),
        scope: 'all'
    });
	
	//无支付能力引导 后台来对用户的支付能力做判断
    if (AI('input[name=needOpenChannels]') && AI('input[name=needOpenChannels]').val() == "true") {
        loadAllPayMethod.load();
    }
	
	//初始化页面对优惠标识的渲染
	//用户使用浏览器后退以后，页面对优惠标识的渲染会有错误因此需要初始化
	Discount.render();
	//这里必须先请求优惠金额在请求用户银行的服务费
	//因为服务费不能包含用户已经享受的优惠金额
	//这里有优化可能，现在用户老卡提前时会出现需要请求两次后台的情况
	//快捷提前时,检查默认的老卡是否有优惠
	Discount.queryAmout();
	//快捷提前时，检查默认选中银行是否需要支付服务费
	_checkHasChargeFee();
	
	//多笔合并查看交易详情
	if(AI("#J-detailTrigger").get(0) && AI("#card-goodsDetail").get(0) && AI('.scrollCards').get(0)){
		var detailTrigger = AI("#J-detailTrigger");
		var goodsDetail = AI("#card-goodsDetail");
		
		goodsDetail.attr("role","card")
			 	   .appendTo(AI('.scrollCards'))
				   .css("float","none")
				   .find(".title").css("margin-bottom","5px");
				   
		detailTrigger.click(function(e){
			e.preventDefault();
			scrollCards.scrollToPos("card-goodsDetail");          
		});
		AI('.btn-nav-back',goodsDetail).click(function (e) {
			e.preventDefault();
			scrollCard0();
		});
	}	
})();