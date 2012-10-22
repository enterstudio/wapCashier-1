<?php
$awid = trim($_GET['awid']);
$orderId = trim($_GET['orderId']);
?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="HandheldFriendly" content="true" />   
      <!-- nomal -->
  <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0;" name="viewport" />
      <meta content="yes" name="apple-mobile-web-app-capable" />
    <meta content="black" name="apple-mobile-web-app-status-bar-style" />
    <meta content="telephone=no" name="format-detection" />
    <meta content="email=no" name="format-detection" />
    <link charset="utf-8" type="text/css" href="http://wapcashier.stable.alipay.net/css/alipay.css" rel="stylesheet" />
    <link charset="utf-8" type="text/css" href="fix.css" rel="stylesheet" />
        <link href="http://wapcashier.stable.alipay.net/img/touch/startup.png" rel="apple-touch-icon-precomposed" />
    <script charset="utf-8" type="text/javascript" src="http://wapcashier.stable.alipay.net/js/jquery.min.js"></script>
    <script charset="utf-8" type="text/javascript" src="http://wapcashier.stable.alipay.net/js/widget.js"></script>
    <script charset="utf-8" type="text/javascript" src="http://wapcashier.stable.alipay.net/js/alipay-component.js"></script>
    <script charset="utf-8" type="text/javascript" src="http://wapcashier.stable.alipay.net/js/validator.js"></script>
    <!-- 安全支付标示 -->
        
    <title>收银台-高端版-支付宝</title>
    
    </head>
    <body>
      <noscript><section class="noScript">需开启javascript功能，才能正常使用手机支付宝。<a href="/home/nojstop.htm?awid=<?=$awid?>" >查看如何开启</a></section></noscript>
    <!--CMS 系统公告 开始--> 
            <!--CMS 系统公告 结束-->
            <div class="logo padding-LR-6px" id="top" data-status="noNav">
        
    <a href="http://wap.n85.alipay.net/index.htm?awid=<?=$awid?>"><img src="http://wapcashier.p73.alipay.net/img/touch/logo.png" alt="支付宝高端版" style="width:81px;height:37px;" /></a>
    <span>收银台</span>
  
</div>
          
          <!-- <?=$awid?> -->
<div class="scrollCards-container">
   <div class="scrollCards">
  <div role="card">

  

  <section class="simple-area margin-LR-6px J_SlideCase">
            <div class="J_content">
          <article class="productName">
            商品：<p>豆豆专用-01</p>
          </article>
              <article class="productName">来自：<p>FENG.RUAN</p></article>
                <p class="productName">应付：<mark class="t-color-orange">23.00</mark>元  &nbsp;&nbsp;
            </p>
        </div>
    </section>

    
    
    
            
  <div class="gradient-area margin-LR-6px">
    <form id="paymentForm" method="post" action="http://wapcashier.p73.alipay.net/cashier/trade_payment.htm?orderId=<?=$orderId?>&awid=<?=$awid?>" autocomplete="off">
      
        <input type="hidden" name="orderId" value="<?=$orderId?>"/>
                        <section>
      <article>
                  <input type="hidden" name="coupon_quantity" value=""/>
  
  <input type="hidden" name="balance_to_pay" value=""/>
      <input type="hidden" name="available_amount" value="63299828.26"/>
  <p>当前账户：快乐（13813813820）</p>
  
    
                  <p>可用余额：<mark class="ye t-color-green">63299828.26</mark>元</p>
        
          
        
        
            
                                    
              <input type="hidden" name="_form_token" value="ansjPmktobtoXL1wbupuwVXWCaUbgm4E"/>
      
            <input type="hidden" name="action" value="pay"/>
            <input type="hidden" name="pay_amount" value="23.00"/>
            <input type="hidden" name="coupon_list" value=""/>
              <input type="hidden" name="coupon_amount" value=""/>
              <input type="hidden" name="point_amount" value="" />
              <input type="hidden" name="availablePoint" value="0"/> 

            <input type="hidden" name="fromMainPage" value="true"/> 

              
                            <div style="width:100%;height:1px;margin-bottom:8px;margin-top:8px;background-color:#D5D5D5;overflow:hidden;"></div>
      <div class="payMoney find-password-container">
      

<aside id="pay_result_text">  

  <!-- 加上 集分宝足够 -->
          <p>余额支付：<mark class="t-size-16px">23.00</mark>元</p>
          </aside>

    </div>  
                              


    <div id="pwd_box" >
        <div class="fm-item">
      <div class="fm-error">    
</div>
      <input type="password" name="paymentPassword" id="password" placeholder="请输入支付密码" />
    </div>
    <p class="t-right mg-b8"> <a href="http://wap.n85.alipay.net/user/findPayPass.htm?action=retrievePayPwUI&awid=<?=$awid?>">找回支付密码</a> </p>                
    <div class="button-OK-skin"><input id="J_submit_payForm" type="submit" class="button-OK"  value="确认付款"  /></div>
  </div>

<script type="text/javascript">
AI(function () {
    var config = {
        'form': '#paymentForm',
        'rules': {
            '[name=paymentPassword]': {
                desc: '支付密码',
        minLen:6,
        maxLen:20
            },
            '[name=tokenPassword]': {
                desc: '宝令'
            }
        },
    };
    new AI.Widget.Validator(config);
});
</script>
    
      </article>
      </section>
    </form>
    </div>
    
    <input type="hidden" name="needOpenChannels" value= />

  
            <input type="hidden" name="AjaxUrl" value="/cashier/ajax_processor.json?awid=<?=$awid?>&fromMainPage=true" />  
<input type="hidden" name="awid" value="<?=$awid?>" />  


  
    <div class="payMethod">
       <div id="J_other_pay_method_trigger" class="button-dropdown-skin">
            <button class="button-dropdown" data-role="payMethodTrigger">
               <span id="other_pay_method_text">您还可以使用其他付款方式</span>
                 
            <canvas id="payTypeMenuIcon" width="20" height="20" class="arrow"></canvas>
            <script>
              var canvas = document.querySelector('#payTypeMenuIcon'),
                  context = canvas.getContext('2d'),
                  arcColor = '#8192ab';
              
              //绘制圆
              context.beginPath();
              context.arc(canvas.width/2,canvas.height/2,10,0,2*Math.PI,false);
              context.fillStyle = arcColor;
              context.fill();
              
              //绘制左箭头
              context.beginPath();
              context.translate(canvas.width/2+1,canvas.height/2);
              context.rotate(Math.PI/4);
              context.fillStyle = '#fff';
              context.fillRect(-5,1,7,2);
              
              //绘制右箭头
              context.rotate(Math.PI/-2);
              context.fillStyle = '#fff';
              context.fillRect(-3,0,7,2);
            </script>
        
            </button>
          </div>
          <div id="J_other_pay_method_body" class="payMethod-body">
            <span class="payMethod-body-shadow"></span>
          </div>
    </div>

    
  </div>

    <div role="card" class="hide" id="card-hb">
<section class="simple-area margin-LR-6px" role="hb" id="hbContainer">
  
                    
            </section>
        <section class="ap-he-trigger-bottom">
          <article class="wp7_twoButton">
            <a href="#" class="button-OK-skin" id="hb-ok"><span class="button-OK">确定</span></a>
            <span class="ap-he-trigger-bottom-j"></span>
            <a id="hb-cancel" href="javascript:void(0)" class="button-regular"><span>取消</span></a>
        </article>
    
</section>
</div>  
    <div role="card" class="hide" id="card-jfb">
      <section class="simple-area margin-LR-6px" role="jfb" id="jfbContainer">
        <details>
        <p>可用集分宝：0 个</p>
        <p id="jfb_error" class="error hide"></p>
          <span class="textFieldContainer"><input id="jfb_value" type="text" value="" /></span>
          <p>请输入您要使用的数量，100个集分宝抵扣1元</p>
        </details>
      </section>
      <section class="ap-he-trigger-bottom">
        <article class="wp7_twoButton"> 
          <a href="#" class="button-OK-skin" id="jfb-ok"><span class="button-OK">确定</span></a> 
          <span class="ap-he-trigger-bottom-j"></span> 
          <a id="jfb-cancel" href="javascript:void(0)" class="button-regular"><span>取消</span></a> 
        </article>
      </section>
</div>
  
  </div>
</div>

<div id='J_um_mob' style="display:none"></div>

<script type="text/javascript">
var umidSetCookieLaLink = "http://mobileumidprod.stable.alipay.net/la.htm";
var umidSetCookieDcLink = "http://mobileumidprod.stable.alipay.net/dc.htm";
var token = "P535a696e4245b7c917f41421ead9cddf";

(function(host) {
   var properties = ['innerWidth', 'innerHeight', 'outerWidth', 'outerHeight', 'screenX', 'screenY', 'availWidth', 'availHeight', 'colorDepth', 'width', 'height'],
      values = [];

   for(var i = 0, len = properties.length; i < len; i++) {
      var p = properties[i];
      values.push(host[p] || '-');
   }
   var method = host.encodeURIComponent || host.escape;
   param = method(values.join('|'));     
   var render = umidSetCookieDcLink + "?token=" + token;
   if(navigator.userAgent.indexOf('AppleWebKit') > 0 && navigator.vendor && navigator.vendor.indexOf('Apple') !== -1) {     
      render = umidSetCookieLaLink + "?token=" + token;   
   }      
   var url=render+"&jsInfo="+param; 
   if(navigator.userAgent.indexOf('AppleWebKit') > 0 && navigator.vendor && navigator.vendor.indexOf('Apple') !== -1) {  
   document.getElementById('J_um_mob').innerHTML = '<iframe src='+url+' width="0" height="0" frameborder="0"/>';
   }else{
   document.getElementById('J_um_mob').innerHTML = '<img src='+url+' width="0" height="0" frameborder="0"/>';
   }
})(this);
</script>
<noscript>
<img src='http://mobileumidprod.stable.alipay.net/dc.htm?token=P535a696e4245b7c917f41421ead9cddf' width="0" height="0" />
</noscript>



      <script charset="utf-8" type="text/javascript" src="http://wapcashier.stable.alipay.net/js/cashier-tongyi.js"></script>
    <!-- cashier/tile/foot_top.vm -->
<footer class="page-footer">
      <a href="http://wapcashier.p73.alipay.net/cashier/exCashier.htm?awid=<?=$awid?>&orderId=<?=$orderId?>&theme=st">返回标准版</a>
    <a href="http://wap.n85.alipay.net/index.htm?awid=<?=$awid?>">首页</a>
  <a href="http://wap.n85.alipay.net/help/help.htm?awid=<?=$awid?>">帮助</a>
  <a href="http://wap.n85.alipay.net/help/feedback.htm?awid=<?=$awid?>">反馈</a>
  <a href="#top">回顶部</a>
  <p>
    版权所有 2004-2012 支付宝
  </p>
  <div style="color:#BBD3E2;font:12px arial;text-align:center;">wapcashier.p73.alipay.net</div>
</footer>
<script>
  try{
    if(AI.UA.system === 'android'){
      fixAndroidPlaceHolderbug();
    }
    
    window.onload = function (){
      setTimeout(function(){
        window.scrollTo(0,1);
      },0);
      Alipay.detectOrien.regEventToWindow();
    };
  }catch(e){
    
  }
</script>

    <!-- debug=true -->
    </body>
</html>