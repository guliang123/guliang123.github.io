$(function(){
    $("img.scale").imageScale();
    setHeight();
    function setHeight(){
        var menuHArray=[];
        $(".menu-list-col").each(function(){
            var menuH=$(this).find(".menu-area").actual("outerHeight");
            menuHArray.push(menuH);
        });
        var maxH=Math.max.apply(null,menuHArray);
        $(".menu-list-col").find(".menu-area").height(maxH);
        $(".menu-list-col:last-child").css("border","none")
    }//���õ��������˵����߶�
    $(".navItem").each(function(){
        $(this).on("mouseover",function(){
            $(".top").addClass("active");
            $(this).addClass("active");
            $(this).find(".nav_dropdown").show();
        });
        $(this).on("mouseleave",function(){
            $(".top").removeClass("active");
            $(this).removeClass("active");
            $(this).find(".nav_dropdown").hide();
        });
    })//��������
    $(".menu_btn").click(function(){
        if($(this).hasClass("active")){
            $(this).removeClass("active");
            $(".wap_nav").stop().slideUp();
            //$(".wap_second").hide();
            //$(".wap_third").hide();
        }else{
            $(this).addClass("active");
            $(".wap_nav").stop().slideDown();
        }
    })
    $(".wap-menuItem").each(function(){
        $(this).find(".wap_itemtit .wap_spanIm").click(function(){
            if($(this).parents(".wap-menuItem").hasClass("active")){
                $(this).parents(".wap-menuItem").removeClass("active");
                $(this).parents(".wap_itemtit").siblings(".wap_second").stop().slideUp();
            }else{
                $(this).parents(".wap-menuItem").addClass("active");
                $(this).parents(".wap-menuItem").siblings('.wap-menuItem').removeClass("active");
                $(this).parents(".wap_itemtit").siblings(".wap_second").stop().slideDown();
                $(this).parents(".wap-menuItem").siblings('.wap-menuItem').find(".wap_second").stop().slideUp();
            }

        })
    });
    $(".wap_seondItem").each(function(){
        $(this).find(".wap_thirdTit .wap_thirdIm").click(function(){
            if($(this).parents(".wap_seondItem").hasClass("active")){
                $(this).parents(".wap_seondItem").removeClass("active");
                $(this).parents(".wap_thirdTit").siblings(".wap_third").stop().hide();
            }else{
                $(this).parents(".wap_seondItem").addClass("active");
                $(this).parents(".wap_seondItem").siblings(".wap_seondItem").removeClass("active");
                $(this).parents(".wap_thirdTit").siblings(".wap_third").stop().show();
                $(this).parents(".wap_seondItem").siblings(".wap_seondItem").find(".wap_third").stop().hide();
            }

        })
    })
    $(".wap_footItem").each(function(){
        $(this).find(".wap_menuTit span").click(function(){
            if($(this).parents(".wap_footItem").hasClass("active")){
                $(this).parents(".wap_footItem").removeClass("active");
                $(this).parents(".wap_menuTit").siblings(".wap_footSecond").stop().slideUp();
            }else{
                $(this).parents(".wap_footItem").addClass("active");
                $(this).parents(".wap_menuTit").siblings(".wap_footSecond").stop().slideDown();
            }

        })
    });
})