$(function(){
    $('.is-nx').hover(function(){
    	$(this).addClass('animated flipInX');
    	$(this).find('h4').hide();
    	$('.is-nx-detail').show();
    },function(){
    	$('.is-nx-detail').hide();
    	$(this).find('h4').show();
    })

    $('.nxad-c li').hover(function(){
    	$(this).addClass('animated flipInX');
    	$(this).find('h4').hide();
    	$(this).find('p').show();
    },function(){
    	$(this).find('p').hide();
    	$(this).find('h4').show();
    })
    
    $('.mis-nx em').click(function(){
    	var switchText = ($(this).html()  == '展开')? '收起' : '展开';
    	$(this).html(switchText);
    	$('.mis-nx-detail').toggle();
    })
})

//EasyLiao	
document.write('<scri'+'pt type="text/javascript" src="//scripts.easyliao.com/js/easyliao.js"></s'+'cript>');

//EasyLiao popup
var swtClick =function(){
    openJesongChatByGroup(28537,59503)
    document.getElementById('jesong_chat_max_btn').click();
}

window.onload = function(){
	//zxbtn click
	if(document.getElementById('top')){
		var zxbtn = document.getElementById('zxbtn');
		zxbtn.onclick = function(){
			swtClick();
		}
	}
	//go top
	if(document.getElementById('top')){
		var top = document.getElementById('top');
		var scrollTop ;
		var timer = null;
		window.onscroll = function(){
		    scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
		    if (scrollTop > 20) {
		        top.style.display = "block";
		    } else {
		        top.style.display = "none";
		    }
		}
		top.onclick = function(){
		    clearInterval(timer);
		    timer = setInterval(function(){
		        var now = scrollTop;
		        var speed = (0-now)/10;
		        speed = speed>0?Math.ceil(speed):Math.floor(speed);
		        if(scrollTop==0){
		            clearInterval(timer);
		        }
		        document.documentElement.scrollTop =  scrollTop + speed;
		        document.body.scrollTop =  scrollTop + speed;
		    },30)
		}
	}
	

    window._agl = window._agl || [];
    (function () {
        _agl.push(
            ['production', '_f7L2XwGXjyszb4d1e2oxPybgD']
        );
        (function () {
            var agl = document.createElement('script');
            agl.type = 'text/javascript';
            agl.async = true;
            agl.src = 'https://fxgate.baidu.com/angelia/fcagl.js?production=_f7L2XwGXjyszb4d1e2oxPybgD';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(agl, s);
        })();
    })();
}
