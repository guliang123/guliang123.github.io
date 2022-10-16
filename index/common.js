$(function(){
	// 手机导航
	$(".subnav").parent().addClass("has_subnav");
	$("nav ul>li").click(function(){
		$(this).toggleClass("current").siblings().removeClass("current");
	})
	
	$(".menu").click(function(){
		$("body").toggleClass("active");
	})
	
	// 首页-产品提供
	$(".iampro_box .iampro_con ul").append("<li class='last_one flex_box'><i class='iconfont iconfuxuankuangxuanzhong'></i><span>······</span></li>")
	
	// 首页-客户
	var swiper = new Swiper('.cus_swiper .swiper-container', {
      slidesPerView:1.6,
      spaceBetween:20,
	  centeredSlides:true,
	  loop:true,
	  speed:800,
	  autoplay: {
	  	delay:4000,
	  	disableOnInteraction:false,
	  },
      pagination:{
        el: '.cus_swiper .swiper-pagination',
        clickable: true,
      },
    });
	
	// 页脚导航
	$(".footer_box .footer_nav ul>li").click(function(){
		$(this).toggleClass("active").siblings().removeClass("active");
	})
	
	// 内页-客户(标杆案例)
	$(".icus_case ul li .icus_top").click(function(){
		$(this).parent().toggleClass("is-active").siblings().removeClass("is-active")
	})
	
	// 内页-客户(感谢信)
	var swiper = new Swiper('.icus_letter .swiper-container', {
	  spaceBetween:5,
	  speed:800,
	  autoplay: {
	  	delay:5000,
	  	disableOnInteraction:false,
	  },
      pagination: {
        el: '.icus_letter .swiper-pagination',
		clickable: true,
      },
    });
	
	// 内页-客户(客户列表)
	$(".icus_list .icus_tabs ul li").click(function(){
		var index = $(this).index();
		$(this).addClass("is-active").siblings().removeClass("is-active");
		$(".icus_list .icus_con .icus_item").hide();
		$(".icus_list .icus_con .icus_item").eq(index).fadeIn();
	})
	
	// 内页-行业解决方案详情页
	var swiper = new Swiper('.isolui_cus .swiper-container', {
	  loop:true,
	  speed:800,
	  autoplay: {
	  	delay:3000,
	  	disableOnInteraction:false,
	  },
	  navigation: {
	    nextEl: '.isolui_cus .swiper-button-next',
	    prevEl: '.isolui_cus .swiper-button-prev',
	  },
	});
	
	// 内页-产品与服务
	$(".ipser_inno .ipser_con .ipser_tabs ul .ipser_item").click(function(){
		var index = $(this).index();
		$(this).addClass("active").siblings().removeClass("active");
		$(".ipser_inno .ipser_con .ipser_wrap .ipser_item").hide();
		$(".ipser_inno .ipser_con .ipser_wrap .ipser_item").eq(index).fadeIn();
	})
	
	// 内页-资源中心
	var swiper = new Swiper('.ires_swiper .swiper-container', {
	  loop:true,
	  speed:800,
	  // autoplay: {
	  // 	delay:3000,
	  // 	disableOnInteraction:false,
	  // },
	  navigation: {
	    nextEl: '.ires_swiper .swiper-button-next',
	    prevEl: '.ires_swiper .swiper-button-prev',
	  },
	});
	
	// 列表分页美化
	$(".list_pages .pagination li").each(function(index){
		var pageText=$(".list_pages .pagination li").eq(index).find("a").text();
		if(pageText=="«"){
			$(".list_pages .pagination li").eq(index).find("a").html("<i class='iconfont iconjiantou-you'></i>");
			$(".list_pages .pagination li").eq(index).addClass("pg_prev");
		}else if(pageText=="»"){
			$(".list_pages .pagination li").eq(index).find("a").html("<i class='iconfont iconjiantou-you'></i>");
			$(".list_pages .pagination li").eq(index).addClass("pg_next");
		}
	})
	
	// 内页-生态圈
	var galleryThumbs = new Swiper('.ieco_swiper .gallery-thumbs', {
      // spaceBetween:15,
      slidesPerView:'auto',
			slideToClickedSlide:true,
			clickable: true,
      // freeMode: true,
      // watchSlidesVisibility: true,
      // watchSlidesProgress: true,
    });
    var galleryTop = new Swiper('.ieco_swiper .gallery-top', {
      spaceBetween: 10,
      navigation: {
        nextEl: '.ieco_swiper .swiper-button-next',
        prevEl: '.ieco_swiper .swiper-button-prev',
      },
      thumbs: {
        swiper: galleryThumbs
      }
    });
	
		var swiper = new Swiper('.ieco_swiper .swiper-containerX', {
		  loop:true,
		  speed:800,
		  autoplay: {
		  	delay:4000,
		  	disableOnInteraction:false,
		  },
		  pagination: {
		    el: '.ieco_swiper .swiper-paginationX',
				clickable: true,
		  },
		});
		
		// 内页-关于竹云（竹云荣誉）
		var galleryThumbs = new Swiper('.iabo_honor .gallery-thumbs', {
      slidesPerView: 4,
      freeMode: true,
      watchSlidesVisibility: true,
      watchSlidesProgress: true,
    });
    var galleryTop = new Swiper('.iabo_honor .gallery-top', {
      spaceBetween: 10,
      thumbs: {
        swiper: galleryThumbs
      }
    });
		
		var swiper = new Swiper('.iabo_honor .swiper-containerX', {
			slidesPerView:2,
			slidesPerGroup:2,
		  loop:true,
		  speed:800,
		  autoplay: {
		  	delay:4000,
		  	disableOnInteraction:false,
		  },
		  pagination: {
		    el: '.iabo_honor .swiper-paginationX',
				clickable: true,
		  },
		});
		
		// 内页-关于竹云（办公环境）
		var swiper = new Swiper('.iabo_envi .swiper-container', {
			spaceBetween:10,
		  loop:true,
		  speed:800,
		  autoplay: {
		  	delay:4000,
		  	disableOnInteraction:false,
		  },
		  navigation: {
		    nextEl: '.iabo_envi .swiper-button-next',
		    prevEl: '.iabo_envi .swiper-button-prev',
		  },
		});
		
		// 数字递增
			$('.counter').countUp({
				delay:20,
				time:3000,
			});
			
		// 内页-企业文化（企业文化展示）
		$(".icul_show .icul_con ul>li").each(function(){
			var thisClass = $(this).attr("class");
			var swiper = new Swiper('.' + thisClass + ' .swiper-container',{
				loop:true,
				spaceBetween:10,
				speed:800,
				autoplay: {
					delay:4000,
					disableOnInteraction:false,
				},
				navigation: {
				  nextEl:'.'+ thisClass + ' .swiper-button-next',
				  prevEl:'.'+ thisClass + ' .swiper-button-prev',
				},
			});
		});
	
	
	


	
	
	
	
	
	
})
// 鼠标滚动动效
wow = new WOW(
	{
	animateClass:'animated',
	offset:100,
	callback:function(box) {
		console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
	}
	}
);
wow.init();

$(function(){
	// 内页-解决方案
	var galleryThumbs4 = new Swiper('.isolu_bus .gallery-thumbs', {
	  slidesPerView:3,
	  centerInsufficientSlides:true,
	  centeredSlides : true,
	  loop:true,
	  speed:600,
	  loopedSlides:5,
	  clickable: true,
	  // freeMode: true,
	  watchSlidesVisibility: true,
	  watchSlidesProgress: true,
	});
	var galleryTop4 = new Swiper('.isolu_bus .gallery-top', {
	  spaceBetween: 10,
	  loop:true,
	  loopedSlides:5,
	  navigation: {
	    nextEl: '.isolu_bus .swiper-button-next',
	    prevEl: '.isolu_bus .swiper-button-prev',
	  },
	  // speed:600,
	  // autoplay: {
	  // 	delay:4000,
	  // 	disableOnInteraction:false,
	  // },
	  // thumbs: {
	  //   swiper: galleryThumbs4
	  // }
	});
	galleryThumbs4.controller.control = galleryTop4;//Swiper1控制Swiper2，需要在Swiper2初始化后
	galleryTop4.controller.control = galleryThumbs4;//Swiper2控制Swiper1，需要在Swiper1初始化后
	
})

$(function(){
	// 内页-解决方案
	var galleryThumbs5 = new Swiper('.isolu_indu .gallery-thumbs', {
	  slidesPerView:3,
	  centerInsufficientSlides:true,
	  centeredSlides : true,
	  loop:true,
	  loopedSlides:5,
	  clickable: true,
	  speed:600,
	  // freeMode: true,
	  watchSlidesVisibility: true,
	  watchSlidesProgress: true,
	});
	var galleryTop5 = new Swiper('.isolu_indu .gallery-top', {
	  spaceBetween: 10,
	  loop:true,
	  loopedSlides:5,
	  navigation: {
	    nextEl: '.isolu_indu .swiper-button-next',
	    prevEl: '.isolu_indu .swiper-button-prev',
	  },
	  // speed:600,
	  // autoplay: {
	  // 	delay:4000,
	  // 	disableOnInteraction:false,
	  // },
	  // thumbs: {
	  //   swiper: galleryThumbs4
	  // }
	});
	galleryThumbs5.controller.control = galleryTop5;//Swiper1控制Swiper2，需要在Swiper2初始化后
	galleryTop5.controller.control = galleryThumbs5;//Swiper2控制Swiper1，需要在Swiper1初始化后
	
})

// placeholder的兼容
$(function(){
if(!placeholderSupport()){   // 判断浏览器是否支持 placeholder
	$('[placeholder]').focus(function() {
		var input = $(this);
		if (input.val() == input.attr('placeholder')) {
			input.val('');
			input.removeClass('placeholder');
		}
	}).blur(function() {
		var input = $(this);
		if (input.val() == '' || input.val() == input.attr('placeholder')) {
			input.addClass('placeholder');
			input.val(input.attr('placeholder'));
		}
	}).blur();
};
})
function placeholderSupport() {
	return 'placeholder' in document.createElement('input');
}
