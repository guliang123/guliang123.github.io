/* Minification failed. Returning unminified contents.
(1802,54-55): run-time error JS1195: Expected expression: ]
(1802,54-55): run-time error JS1003: Expected ':': ]
(1802,61-62): run-time error JS1006: Expected ')': $
(1803,9-10): run-time error JS1195: Expected expression: )
(1803,9-10): run-time error JS1195: Expected expression: )
(3469,10489-10490): run-time error JS1010: Expected identifier: .
(3469,10489-10490): run-time error JS1195: Expected expression: .
(3469,14236-14237): run-time error JS1010: Expected identifier: .
(3469,14236-14237): run-time error JS1195: Expected expression: .
(3469,15790-15791): run-time error JS1010: Expected identifier: .
(3469,15790-15791): run-time error JS1195: Expected expression: .
(3469,28427-28428): run-time error JS1010: Expected identifier: .
(3469,28427-28428): run-time error JS1195: Expected expression: .
(3469,28506-28507): run-time error JS1010: Expected identifier: .
(3469,28506-28507): run-time error JS1195: Expected expression: .
(1802,56-57): run-time error JS1314: Implicit property name must be identifier: 6
(1802,58-60): run-time error JS1314: Implicit property name must be identifier: 20
(1802,53-54): run-time error JS1013: Syntax error in regular expression: ?
 */
(function ($) {

    'use strict';

    if (typeof _wpcf7 === 'undefined' || _wpcf7 === null) {
        return;
    }

    _wpcf7 = $.extend({
        cached: 0,
        inputs: []
    }, _wpcf7);

    $.fn.wpcf7InitForm = function () {
        this.ajaxForm({
            beforeSubmit: function (arr, $form, options) {
                $form.wpcf7ClearResponseOutput();
                $form.find('[aria-invalid]').attr('aria-invalid', 'false');
                $form.find('.ajax-loader').addClass('is-active');
                return true;
            },
            beforeSerialize: function ($form, options) {
                $form.find('[placeholder].placeheld').each(function (i, n) {
                    $(n).val('');
                });
                return true;
            },
            data: { '_wpcf7_is_ajax_call': 1 },
            dataType: 'json',
            success: $.wpcf7AjaxSuccess,
            error: function (xhr, status, error, $form) {
                var e = $('<div class="ajax-error"></div>').text(error.message);
                $form.after(e);
            }
        });

        if (_wpcf7.cached) {
            this.wpcf7OnloadRefill();
        }

        this.wpcf7ToggleSubmit();

        this.find('.wpcf7-submit').wpcf7AjaxLoader();

        this.find('.wpcf7-acceptance').click(function () {
            $(this).closest('form').wpcf7ToggleSubmit();
        });

        this.find('.wpcf7-exclusive-checkbox').wpcf7ExclusiveCheckbox();

        this.find('.wpcf7-list-item.has-free-text').wpcf7ToggleCheckboxFreetext();

        this.find('[placeholder]').wpcf7Placeholder();

        if (_wpcf7.jqueryUi && !_wpcf7.supportHtml5.date) {
            this.find('input.wpcf7-date[type="date"]').each(function () {
                $(this).datepicker({
                    dateFormat: 'yy-mm-dd',
                    minDate: new Date($(this).attr('min')),
                    maxDate: new Date($(this).attr('max'))
                });
            });
        }

        if (_wpcf7.jqueryUi && !_wpcf7.supportHtml5.number) {
            this.find('input.wpcf7-number[type="number"]').each(function () {
                $(this).spinner({
                    min: $(this).attr('min'),
                    max: $(this).attr('max'),
                    step: $(this).attr('step')
                });
            });
        }

        this.find('.wpcf7-character-count').wpcf7CharacterCount();

        this.find('.wpcf7-validates-as-url').change(function () {
            $(this).wpcf7NormalizeUrl();
        });

        this.find('.wpcf7-recaptcha').wpcf7Recaptcha();
    };

    $.wpcf7AjaxSuccess = function (data, status, xhr, $form) {
        if (!$.isPlainObject(data) || $.isEmptyObject(data)) {
            return;
        }

        _wpcf7.inputs = $form.serializeArray();

        var $responseOutput = $form.find('div.wpcf7-response-output');

        $form.wpcf7ClearResponseOutput();

        $form.find('.wpcf7-form-control').removeClass('wpcf7-not-valid');
        $form.removeClass('invalid spam sent failed');

        if (data.captcha) {
            $form.wpcf7RefillCaptcha(data.captcha);
        }

        if (data.quiz) {
            $form.wpcf7RefillQuiz(data.quiz);
        }

        if (data.invalids) {
            $.each(data.invalids, function (i, n) {
                $form.find(n.into).wpcf7NotValidTip(n.message);
                $form.find(n.into).find('.wpcf7-form-control').addClass('wpcf7-not-valid');
                $form.find(n.into).find('[aria-invalid]').attr('aria-invalid', 'true');
            });

            $responseOutput.addClass('wpcf7-validation-errors');
            $form.addClass('invalid');

            $(data.into).wpcf7TriggerEvent('invalid');

        } else if (1 == data.spam) {
            $form.find('[name="g-recaptcha-response"]').each(function () {
                if ('' == $(this).val()) {
                    var $recaptcha = $(this).closest('.wpcf7-form-control-wrap');
                    $recaptcha.wpcf7NotValidTip(_wpcf7.recaptcha.messages.empty);
                }
            });

            $responseOutput.addClass('wpcf7-spam-blocked');
            $form.addClass('spam');

            $(data.into).wpcf7TriggerEvent('spam');

        } else if (1 == data.mailSent) {
            $responseOutput.addClass('wpcf7-mail-sent-ok');
            $form.addClass('sent');

            if (data.onSentOk) {
                $.each(data.onSentOk, function (i, n) { eval(n) });
            }

            $(data.into).wpcf7TriggerEvent('mailsent');

        } else {
            $responseOutput.addClass('wpcf7-mail-sent-ng');
            $form.addClass('failed');

            $(data.into).wpcf7TriggerEvent('mailfailed');
        }

        if (data.onSubmit) {
            $.each(data.onSubmit, function (i, n) { eval(n) });
        }

        $(data.into).wpcf7TriggerEvent('submit');

        if (1 == data.mailSent) {
            $form.resetForm();
        }

        $form.find('[placeholder].placeheld').each(function (i, n) {
            $(n).val($(n).attr('placeholder'));
        });

        $responseOutput.append(data.message).slideDown('fast');
        $responseOutput.attr('role', 'alert');

        $.wpcf7UpdateScreenReaderResponse($form, data);
    };

    $.fn.wpcf7TriggerEvent = function (name) {
        return this.each(function () {
            var elmId = this.id;
            var inputs = _wpcf7.inputs;

            /* DOM event */
            var event = new CustomEvent('wpcf7' + name, {
                bubbles: true,
                detail: {
                    id: elmId,
                    inputs: inputs
                }
            });

            this.dispatchEvent(event);

            /* jQuery event */
            $(this).trigger('wpcf7:' + name);
            $(this).trigger(name + '.wpcf7'); // deprecated
        });
    };

    $.fn.wpcf7ExclusiveCheckbox = function () {
        return this.find('input:checkbox').click(function () {
            var name = $(this).attr('name');
            $(this).closest('form').find('input:checkbox[name="' + name + '"]').not(this).prop('checked', false);
        });
    };

    $.fn.wpcf7Placeholder = function () {
        if (_wpcf7.supportHtml5.placeholder) {
            return this;
        }

        return this.each(function () {
            $(this).val($(this).attr('placeholder'));
            $(this).addClass('placeheld');

            $(this).focus(function () {
                if ($(this).hasClass('placeheld')) {
                    $(this).val('').removeClass('placeheld');
                }
            });

            $(this).blur(function () {
                if ('' === $(this).val()) {
                    $(this).val($(this).attr('placeholder'));
                    $(this).addClass('placeheld');
                }
            });
        });
    };

    $.fn.wpcf7AjaxLoader = function () {
        return this.each(function () {
            $(this).after('<span class="ajax-loader"></span>');
        });
    };

    $.fn.wpcf7ToggleSubmit = function () {
        return this.each(function () {
            var form = $(this);

            if (this.tagName.toLowerCase() != 'form') {
                form = $(this).find('form').first();
            }

            if (form.hasClass('wpcf7-acceptance-as-validation')) {
                return;
            }

            var submit = form.find('input:submit');

            if (!submit.length) {
                return;
            }

            var acceptances = form.find('input:checkbox.wpcf7-acceptance');

            if (!acceptances.length) {
                return;
            }

            submit.removeAttr('disabled');
            acceptances.each(function (i, n) {
                n = $(n);

                if (n.hasClass('wpcf7-invert') && n.is(':checked')
						|| !n.hasClass('wpcf7-invert') && !n.is(':checked')) {
                    submit.attr('disabled', 'disabled');
                }
            });
        });
    };

    $.fn.wpcf7ToggleCheckboxFreetext = function () {
        return this.each(function () {
            var $wrap = $(this).closest('.wpcf7-form-control');

            if ($(this).find(':checkbox, :radio').is(':checked')) {
                $(this).find(':input.wpcf7-free-text').prop('disabled', false);
            } else {
                $(this).find(':input.wpcf7-free-text').prop('disabled', true);
            }

            $wrap.find(':checkbox, :radio').change(function () {
                var $cb = $('.has-free-text', $wrap).find(':checkbox, :radio');
                var $freetext = $(':input.wpcf7-free-text', $wrap);

                if ($cb.is(':checked')) {
                    $freetext.prop('disabled', false).focus();
                } else {
                    $freetext.prop('disabled', true);
                }
            });
        });
    };

    $.fn.wpcf7CharacterCount = function () {
        return this.each(function () {
            var $count = $(this);
            var name = $count.attr('data-target-name');
            var down = $count.hasClass('down');
            var starting = parseInt($count.attr('data-starting-value'), 10);
            var maximum = parseInt($count.attr('data-maximum-value'), 10);
            var minimum = parseInt($count.attr('data-minimum-value'), 10);

            var updateCount = function ($target) {
                var length = $target.val().length;
                var count = down ? starting - length : length;
                $count.attr('data-current-value', count);
                $count.text(count);

                if (maximum && maximum < length) {
                    $count.addClass('too-long');
                } else {
                    $count.removeClass('too-long');
                }

                if (minimum && length < minimum) {
                    $count.addClass('too-short');
                } else {
                    $count.removeClass('too-short');
                }
            };

            $count.closest('form').find(':input[name="' + name + '"]').each(function () {
                updateCount($(this));

                $(this).keyup(function () {
                    updateCount($(this));
                });
            });
        });
    };

    $.fn.wpcf7NormalizeUrl = function () {
        return this.each(function () {
            var val = $.trim($(this).val());

            // check the scheme part
            if (val && !val.match(/^[a-z][a-z0-9.+-]*:/i)) {
                val = val.replace(/^\/+/, '');
                val = 'http://' + val;
            }

            $(this).val(val);
        });
    };

    $.fn.wpcf7NotValidTip = function (message) {
        return this.each(function () {
            var $into = $(this);

            $into.find('span.wpcf7-not-valid-tip').remove();
            $into.append('<span role="alert" class="wpcf7-not-valid-tip">' + message + '</span>');

            if ($into.is('.use-floating-validation-tip *')) {
                $('.wpcf7-not-valid-tip', $into).mouseover(function () {
                    $(this).wpcf7FadeOut();
                });

                $(':input', $into).focus(function () {
                    $('.wpcf7-not-valid-tip', $into).not(':hidden').wpcf7FadeOut();
                });
            }
        });
    };

    $.fn.wpcf7FadeOut = function () {
        return this.each(function () {
            $(this).animate({
                opacity: 0
            }, 'fast', function () {
                $(this).css({ 'z-index': -100 });
            });
        });
    };

    $.fn.wpcf7OnloadRefill = function () {
        return this.each(function () {
            var url = $(this).attr('action');

            if (0 < url.indexOf('#')) {
                url = url.substr(0, url.indexOf('#'));
            }

            var id = $(this).find('input[name="_wpcf7"]').val();
            var unitTag = $(this).find('input[name="_wpcf7_unit_tag"]').val();

            $.getJSON(url,
				{ _wpcf7_is_ajax_call: 1, _wpcf7: id, _wpcf7_request_ver: $.now() },
				function (data) {
				    if (data && data.captcha) {
				        $('#' + unitTag).wpcf7RefillCaptcha(data.captcha);
				    }

				    if (data && data.quiz) {
				        $('#' + unitTag).wpcf7RefillQuiz(data.quiz);
				    }
				}
			);
        });
    };

    $.fn.wpcf7RefillCaptcha = function (captcha) {
        return this.each(function () {
            var form = $(this);

            $.each(captcha, function (i, n) {
                form.find(':input[name="' + i + '"]').clearFields();
                form.find('img.wpcf7-captcha-' + i).attr('src', n);
                var match = /([0-9]+)\.(png|gif|jpeg)$/.exec(n);
                form.find('input:hidden[name="_wpcf7_captcha_challenge_' + i + '"]').attr('value', match[1]);
            });
        });
    };

    $.fn.wpcf7RefillQuiz = function (quiz) {
        return this.each(function () {
            var form = $(this);

            $.each(quiz, function (i, n) {
                form.find(':input[name="' + i + '"]').clearFields();
                form.find(':input[name="' + i + '"]').siblings('span.wpcf7-quiz-label').text(n[0]);
                form.find('input:hidden[name="_wpcf7_quiz_answer_' + i + '"]').attr('value', n[1]);
            });
        });
    };

    $.fn.wpcf7ClearResponseOutput = function () {
        return this.each(function () {
            $(this).find('div.wpcf7-response-output').hide().empty().removeClass('wpcf7-mail-sent-ok wpcf7-mail-sent-ng wpcf7-validation-errors wpcf7-spam-blocked').removeAttr('role');
            $(this).find('span.wpcf7-not-valid-tip').remove();
            $(this).find('.ajax-loader').removeClass('is-active');
        });
    };

    $.fn.wpcf7Recaptcha = function () {
        return this.each(function () {
            var events = 'wpcf7:spam wpcf7:mailsent wpcf7:mailfailed';
            $(this).closest('div.wpcf7').on(events, function (e) {
                if (recaptchaWidgets && grecaptcha) {
                    $.each(recaptchaWidgets, function (index, value) {
                        grecaptcha.reset(value);
                    });
                }
            });
        });
    };

    $.wpcf7UpdateScreenReaderResponse = function ($form, data) {
        $('.wpcf7 .screen-reader-response').html('').attr('role', '');

        if (data.message) {
            var $response = $form.siblings('.screen-reader-response').first();
            $response.append(data.message);

            if (data.invalids) {
                var $invalids = $('<ul></ul>');

                $.each(data.invalids, function (i, n) {
                    if (n.idref) {
                        var $li = $('<li></li>').append($('<a></a>').attr('href', '#' + n.idref).append(n.message));
                    } else {
                        var $li = $('<li></li>').append(n.message);
                    }

                    $invalids.append($li);
                });

                $response.append($invalids);
            }

            $response.attr('role', 'alert').focus();
        }
    };

    $.wpcf7SupportHtml5 = function () {
        var features = {};
        var input = document.createElement('input');

        features.placeholder = 'placeholder' in input;

        var inputTypes = ['email', 'url', 'tel', 'number', 'range', 'date'];

        $.each(inputTypes, function (index, value) {
            input.setAttribute('type', value);
            features[value] = input.type !== 'text';
        });

        return features;
    };

    $(function () {
        _wpcf7.supportHtml5 = $.wpcf7SupportHtml5();
        $('div.wpcf7 > form').wpcf7InitForm();
    });

})(jQuery);

/*
 * Polyfill for Internet Explorer
 * See https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
(function () {
    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event,
			params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();;
$(document).ready(function (e) {

    function get_query() {
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (!pair[0]) continue;
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }


    var badUrl = window.location.origin + window.location.pathname;
    /* Remove page from filter URL */
    var url = badUrl.replace(/page\/\d*\//i, '');
    var query = get_query();

    function get_exist_query_args(unsetkeys) {
        var query_args = "";

        $.each(query, function (k, v) {
            if ((typeof v !== "undefined") && ($.inArray(k, unsetkeys)===-1)) {
                query_args += k + "=" + v + "&";
            }
        });
        return query_args;
    }

    $('.filterby .select-options li').on('click', function (e) {
        var category = $(this).attr('rel');
        var query_args = get_exist_query_args(['category', "page", "title"]);
        query_args = querys(query_args, "category", category);
        var title = filterXSS($('.select-group .input-wrap input').val());
        query_args = querys(query_args, "title", title);
        window.location.href = filterXSS(url + '?' + query_args);      
    })

    function querys(query_args, key, value) {
        if (value) {
            query_args = key + "=" + value + "&" + query_args
        }
        return query_args;
    }
});
$(document).ready(function (e) {

    function get_query() {
        var query_string = {};
        var query = filterXSS(window.location.search.substring(1));
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (!pair[0]) continue;
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }

    var badUrl = filterXSS(window.location.origin + window.location.pathname);
    /* Remove page from filter URL */
    var url = badUrl.replace(/page\/\d*\//i, '');
    var query = get_query();

    function get_exist_query_args(unsetkeys) {
        var query_args = "";

        $.each(query, function (k, v) {
            if ((typeof v !== "undefined") && ($.inArray(k, unsetkeys) === -1)) {
                query_args += k + "=" + v + "&";
            }
        });
        return query_args;
    }

    //
    //$('.section__wrap .categories-filter li').on('click', function (e) {
    //    var main = $(this).attr('rel');
    //    var query_args = get_exist_query_args(['main', "pageIndex", "title"]);
    //    query_args = querys(query_args, "main", main);
    //    var title = filterXSS($('.select-group .input-wrap input').attr("value"));
    //    query_args = querys(query_args, "title", title);
    //    window.location.href = filterXSS(url + '?' + query_args)       
    //});
    
    function querys(query_args,key,value) {
        if (value) {
            query_args = key+"="+value+"&"+query_args
        }
        return query_args;
    }

    //$('.mobile-select-wrap .select-options li').on('click', function (e) {
    //    var main = $(this).attr('rel');
    //    var query_args = get_exist_query_args(['main', "pageIndex", "title"]);
    //    query_args = querys(query_args, "main", main);
    //    var title = filterXSS($('.select-group .input-wrap input').attr("value"));
    //    query_args = querys(query_args, "title", title);
    //    window.location.href = filterXSS(url + '?' + query_args)
    //});

    // NEWS  排序
    $('.orderby .select-options li').on('click', function (e) {
        var order = $(this).attr('rel');
        var query_args = get_exist_query_args(['order', "pageIndex", "title"]);
        query_args = querys(query_args, "order", order);
        var title = filterXSS($('.select-group .input-wrap input').val());
        query_args = querys(query_args, "title", title);
        window.location.href = filterXSS(url + '?' + query_args);
    });  


    $('.select-group button,.select-group .input-wrap button').on('click', function () {
        var query_args = get_exist_query_args(["page", "pageIndex", "title"]);
        var title = filterXSS($('.section__wrap .input-wrap input').val());
        query_args = querys(query_args, "title", title);
        window.location.href = filterXSS(url + '?' + query_args);
    });


    $(".select-group .input-wrap input").keydown(function (e) {
        var curKey = e.which;
        if (curKey == 13) {
            $(".select-group .input-wrap button").click();
            return false;
        }
    });

    if (document.documentElement.clientWidth >= 767) {
        $(".mobile-custom-select").each(Selectize);
    }

    function Selectize() {
        for (var selected, $this = $(this), numberOfOptions = $(this).children("option").length, i = 0; i < numberOfOptions; i++) $(this).children("option").eq(i).attr("selected") && (selected = i + 1);
        $this.addClass("select-hidden"),
        $this.wrap('<div class="select"></div>'),
        $this.after('<div class="select-styled"></div>');
        var $styledSelect = $this.next("div.select-styled");
        var $formSelect = $this.closest(".form-item__select");
        selected ? $styledSelect.text($this.children("option").eq(selected - 1).text()) : $styledSelect.text($this.attr("placeholder"));
        for (var $list = $("<ul />", {
            class: "select-options"
        }).insertAfter($styledSelect), i = 0; i < numberOfOptions; i++) $("<li />", {
            text: $this.children("option").eq(i).text(),
            rel: $this.children("option").eq(i).val()
        }).appendTo($list);
        if (selected) {
            $formSelect.addClass("not-empty")
        } else {
            $this.val("");
            $formSelect.removeClass("not-empty")
        }
        var $listItems = $list.children("li");
        $listItems.eq(selected - 1).addClass("active"),
        $styledSelect.click(function (e) {
            e.stopPropagation(),
                $("div.select-styled.active").not(this).each(function () {
                    $(this).removeClass("active").next("ul.select-options").hide();
                    $(this).closest(".form-item__select").removeClass("expend");
                }),
                $(this).toggleClass("active").next("ul.select-options").toggle();
            $formSelect.toggleClass("expend");
        }),
        $listItems.click(function (e) {
            e.stopPropagation(),
            $styledSelect.text($(this).text()).removeClass("active"),
            $this.val($(this).attr("rel")),
            $this.find("option[selected='selected']").removeAttr("selected"),
            $this.find("option[value='" + $(this).attr("rel") + "']").attr("selected", "selected"),
            $list.hide(),
            $list.closest(".form-item__select").removeClass("expend").addClass("not-empty").addClass("selected");
            $list.closest(".form-item__select").removeClass("expend");
            $list.closest(".form-item__select").find("select").removeClass("wpcf7-not-valid");
            $list.closest(".select").find(".wpcf7-not-valid-tip").remove();
            $list.closest(".select").append('<i class="required-det"></i>');
            $listItems.each(function (i, el) {
                $(el).removeClass("active");
            }),
            $(this).addClass("active");
            if ($this.hasClass("change-submit")) {
                $this.closest("form").submit();
            }
        }),
        $(document).click(function () {
            $styledSelect.removeClass("active");
            $formSelect.removeClass("expend");
            $list.hide()
        })
    }

});;
var pacteraMain = {
    /**
     * 阻止默认浏览器动作, link跳转，submit 提交 等。
     */
    preventDefault: function (e) {
        $(document).on("click", ".prevent-default", function (e) {
            if (e && e.preventDefault) {
                e.preventDefault(); //阻止默认浏览器动作(W3C) 
            } else {
                window.event.returnValue = false; //IE中阻止函数器默认动作的方式 
            }
        });
    },
    contact: function () {
        var $opener = $(".contact-module .contact-opener");
        var $popup = $(".contact-module .contact-popup");
        $opener.mouseover(function (e) {
            if (e && e.preventDefault) {
                e.preventDefault(); //阻止默认浏览器动作(W3C) 
            } else {
                window.event.returnValue = false; //IE中阻止函数器默认动作的方式 
            }
            $popup.css("transform", "translateX(0)");
            return false;
        });

        /*关闭联系我们详情*/
        $popup.find(".btn-close").click(function (e) {
            if (e && e.preventDefault) {
                e.preventDefault(); //阻止默认浏览器动作(W3C) 
            } else {
                window.event.returnValue = false; //IE中阻止函数器默认动作的方式 
            }
            $opener.show();
            $popup.css("transform", "translateX(100%)");
            return false;
        });

        /*显示联系我们详情*/
        $(document).click(function (e) {
            if ($(e.target).closest(".contact-module").length === 0) {
                $popup.css("transform", "translateX(100%)");
                $opener.show();
            }
        });
    },
    /**
    *联系我们提交信息
    */
    submitContact: function () {
        var $form = $("#cuntact-form"),
            $responseOutput = $form.find(".wpcf7-response-output");
        $form.on("click", "button[type='submit']", function (e) {
            var $submitButton = $(this);
            if (e && e.preventDefault) {
                e.preventDefault(); //阻止默认浏览器动作(W3C) 
            } else {
                window.event.returnValue = false; //IE中阻止函数器默认动作的方式 
            }
            $responseOutput.html('');
            var formData = $form.serializeJson();
            formData.VerificationKey = $form.find("[name=VerificationCode]").attr("data-key");
            if ($form.validate()) {
                $.ajax({
                    url: $form.attr("action"),
                    type: "post",
                    data: formData,
                    dataType: "json",
                    beforeSend: function () {
                        // 禁用按钮防止重复提交，加loading...
                        $submitButton.attr({ disabled: true });
                        $submitButton.addClass("is-active");
                    },
                    complete: function () {
                        // 回复按钮,移除loading...
                        $submitButton.removeAttr("disabled");
                        $submitButton.removeClass("is-active");
                        //刷新验证码
                        var $verificationImg = $form.find(".verification-img"),
                            newkey = $.newguid();
                        $verificationImg.attr("src", $verificationImg.attr("src").replace(new RegExp(/[^=]+$/), newkey));
                        $verificationImg.next("[name=VerificationCode]").attr("data-key", newkey);
                    },
                    success: function (data) {
                        if (data && data.Success) {
                            //百度回调代码
                            window._agl && window._agl.push(['track', ['success', { t: 3 }]]);
                            /*返回成功显示成功的信息， 清空form数据*/
                            $responseOutput.removeClass("wpcf7-validation-errors").addClass("wpcf7-mail-sent-ok").text(data.Message).show();
                            $form.reset();
                            $form.find(".not-empty:not(.form-item__select)").removeClass("not-empty");
                            
                        } else {
                            /*返回成功显示错误的信息*/
                            $responseOutput.removeClass("wpcf7-mail-sent-ok").addClass("wpcf7-validation-errors").text(data.Message).show();
                        }
                    },
                    error: function (e) {
                    }
                });
            } else {
                var errorFieldPosition = $form.find("[aria-invalid=true]:first").offset().top - 20;
                $('body,html').animate({ 'scrollTop': errorFieldPosition });
            }
        });
    },
    /*
    * 快速置顶
    * 当滚动条不在最顶部的时候显示 '快速置顶'
    */
    pageTop: function () {
        var $top = $('#top');
        $(window).scroll(function () {
            var scrollTop = $(window).scrollTop();
            if (scrollTop > 0) {
                $top.show();
            } else {
                $top.hide();
            }
        });
        /*绑定快速置顶方法， 做1秒动画延迟*/
        $top.click(function (e) {
            if (e && e.preventDefault) {
                e.preventDefault(); //阻止默认浏览器动作(W3C) 
            } else {
                window.event.returnValue = false; //IE中阻止函数器默认动作的方式 
            }
            $("html,body").stop().animate({ "scrollTop": 0 }, 1000, "swing");
        });
    },
    /*微信鼠标hover 隐藏 '联系我们' (否则会遮住微信二维码) */
    socialActive: function () {
        var $social = $(".footer__social a"),
            $contactModule = $(".contact-module");
        $social.hover(function () {
            $contactModule.addClass("hide");
        }, function () {
            $contactModule.removeClass("hide");
        });
    },
    /*
    *加载上传文件，触发隐藏input[file]
    */
    uploadFile: function () {
        $(document).on("click", "#uploadResume", function (e) {
            if (e && e.preventDefault) {
                e.preventDefault(); //阻止默认浏览器动作(W3C) 
            } else {
                window.event.returnValue = false; //IE中阻止函数器默认动作的方式 
            }
            var $inputFile = $(this).next("input[type='file']");
            if ($inputFile) {
                $inputFile.unbind().change(function (e) {
                    var file = e.delegateTarget.files[0];
                    //在此可以对选择的文件进行判断:文件类型 文件大小等

                    var allowFileType = $inputFile.attr("data-allow-type");
                    var maxZise = $inputFile.attr("data-max-size").match(/[1-9][0-9]*/g);

                    //获取上传文件后缀名
                    var fileExt = (/[.]/.exec(file.name)) ? /[^.]+$/.exec(file.name.toLowerCase()) : '';

                    var $fileText = $("#" + $inputFile.attr("data-message-element"));

                    if (maxZise && file.size > parseInt(maxZise[0]) * 1024 * 1024) { //判断文件大小 MB --> b
                        $fileText.addClass("error").html("文件大小必须小于" + maxZise[0] + "MB");
                        return;
                    } else if (allowFileType && $.inArray(fileExt[0], allowFileType.split('|')) === -1) { //判断文件类型
                        $fileText.addClass("error").html("文件格式不正确");
                        return;
                    } else {
                        $fileText.removeClass("error").html(file.name);
                    }
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                });
                $inputFile.trigger("click");
            }
        });

    },
    /**
    *提交职位申请
    */
    submitJobApplication: function () {
        var $form = $("#jobApplication-form"),
            $uploadResumeFile = $("#uploadResumeFile"),
            $responseOutput = $form.find(".wpcf7-response-output");

        $form.on("click", "button[type='submit']", function (e) {
            var $submitButton = $(this);
            
            if (e && e.preventDefault) {
                e.preventDefault(); //阻止默认浏览器动作(W3C) 
            } else {
                window.event.returnValue = false; //IE中阻止函数器默认动作的方式 
            }
            $responseOutput.html('');

            //check uplod file
            var isUpload = false;
            if ($uploadResumeFile.val() === "") {
                isUpload = false;
                $form.find(".fileText").addClass("error").html("请上传简历");
            }
            else if ($form.find(".error").length > 0) {
                isUpload = false;
            } else {
                isUpload = true;
            }

            if ($form.validate() && isUpload) {
                var formData = new FormData($form[0]);                
                if ($form.validate()) {
                    $.ajax({
                        url: $form.attr("action"),
                        type: "post",
                        data: formData, 
                        contentType: false,
                        processData: false,
                        beforeSend: function () {
                            // 禁用按钮防止重复提交，加loading...
                            $submitButton.attr({ disabled: true });
                            $submitButton.addClass("loading");
                        },
                        complete: function () {
                            // 回复按钮,移除loading...
                            $submitButton.removeAttr("disabled");
                            $submitButton.removeClass("loading");

                            //刷新验证码
                            var $verificationImg = $form.find(".verification-img"),
                                newkey = $.newguid();
                            $verificationImg.attr("src",
                                $verificationImg.attr("src").replace(new RegExp(/[^=]+$/), newkey));
                            $verificationImg.next("[name=VerificationCode]").attr("data-key", newkey);

                            if ($("#VerificationKey").length > 0) {
                                $("#VerificationKey").val(newkey);
                            }
                        },
                        success: function (data) {
                            if (data && data.Success) {
                                /*返回成功显示成功的信息， 清空form数据*/
                                $responseOutput.removeClass("wpcf7-validation-errors").addClass("wpcf7-mail-sent-ok").text(data.Message).show();
                                $form.reset();
                                $form.find(".fileText").html("");
                                $form.find(".not-empty:not(.form-item__select)").removeClass("not-empty");
                            } else {
                                /*返回成功显示错误的信息*/
                                $responseOutput.removeClass("wpcf7-mail-sent-ok").addClass("wpcf7-validation-errors").text(data.Message).show();
                            }
                        },
                        error: function (e) {
                            $responseOutput.removeClass("wpcf7-mail-sent-ok").addClass("wpcf7-validation-errors").text("system error").show();
                        }
                    });
                }
            } else {
                var errorField = $form.find("[aria-invalid=true]:first");
                if (errorField.length > 0) {
                    $('body,html').animate({ 'scrollTop': errorField.offset().top - 20 });
                }
            }
        });
    },
    /**
	*绑定用户登录/忘记密码
	*/
    bindAccountInfo: function () {
        var $loginPopup = $('#user-login');
        var $resetPasswordPopup = $('#user-resetpassword');
        var $btnuserresetpassword = $('#btn-user-resetpassword');
        var $loginform = $loginPopup.find('form');
        var $resetpasswordform = $resetPasswordPopup.find('form');
        var $loginCallbackMsg = $loginform.find('.callback-msg');
        var $resetpasswordCallbackMsg = $resetpasswordform.find('.callback-msg');
        var $resetPassword = $('#resetPassword');
        var $userResetPasswordBack = $('#userResetPassword-back');
        //open login popup
        $(".header").on("click", ".login", openLoginPopup);
        $(".mobile-nav").on("click", ".login", function () {
            $("html").removeClass("menu-opened");
            openLoginPopup();
        });

        function openLoginPopup() {
            $loginPopup.addClass("open");
            $("html, body").css("height", "100%");
            $loginPopup.find(".overlay").removeClass("fade-out").addClass("fade-in");
            $loginform.reset();
            window.downloadFileUrl = null;
        }

        //login submit
        $loginform.on("click", "button[type=submit]", function () { 
            var $submitButton = $(this);
            var formData = $loginform.serializeJson();
            formData.VerificationKey = $loginform.find("[name=VerificationCode]").attr("data-key"); 
            
            if ($loginform.validate()) { 
                $.ajax({
                    url: $loginform.attr("action"),
                    type: "post",
                    data: formData,
                    dataType: "json",
                    beforeSend: function () {
                        // 禁用按钮防止重复提交，加loading...
                        $submitButton.attr({ disabled: true });
                        $submitButton.addClass("loading");
                    },
                    complete: function () {
                        // 回复按钮,移除loading...
                        $submitButton.removeAttr("disabled");
                        $submitButton.removeClass("loading");
                        //刷新验证码
                        var $verificationImg = $loginform.find(".verification-img"),
                            newkey = $.newguid();
                        $verificationImg.attr("src",
                            $verificationImg.attr("src").replace(new RegExp(/[^=]+$/), newkey));
                        $verificationImg.next("[name=VerificationCode]").attr("data-key", newkey);
                    },
                    success: function (data) {
                        if (data && data.Success) {
                            $loginPopup.removeClass("open");
                            var downloadFileId = $loginform.attr('download-file-id');
                            if (downloadFileId) {
                                window.location.href = filterXSS(getDownlodFileUrl(downloadFileId));
                                setTimeout(function () {
                                    window.location.reload();
                                },
                                    1000);
                            } else {
                                /*刷新当前页面*/
                                window.location.reload();
                            }
                        } else {
                            /*返回成功显示错误的信息*/
                            $loginCallbackMsg.html(data.Message).removeClass('hide success-msg').addClass('error-msg');
                        }
                    },
                    error: function (e) {
                    }
                });
            }
        })

        //open reset password popup
        $resetPassword.on("click",
            function() {
                $loginPopup.removeClass("open");
                $("html, body").css("height", "auto");
                $resetPasswordPopup.addClass("open");
                $("html, body").css("height", "100%");
                $resetPasswordPopup.find(".overlay").removeClass("fade-out").addClass("fade-in");
                $resetpasswordform.reset();
                $userResetPasswordBack.attr('back-popup', 'login');
            });

        //reset password popup back
        var resetPasswordBack = function() {
            $resetPasswordPopup.removeClass("open");
            $("html, body").css("height", "auto");
            if ($userResetPasswordBack.attr('back-popup') === 'login') {
                openLoginPopup();
            } else if ($userResetPasswordBack.attr('back-popup') === 'appliedDemo') {
                var $applyDemoPopup = $('#applyDemo');
                var $nonexistUserApply = $('#nonexistUserApply');
                var $existUserApply = $('#existUserApply');
                $applyDemoPopup.addClass('open');
                $("html, body").css("height", "100%");
                $nonexistUserApply.addClass('hide');
                $existUserApply.removeClass('hide');
            }
        };

        $userResetPasswordBack.on("click", resetPasswordBack);

        //reset password submit
        $btnuserresetpassword.on("click", function () {            
            if ($resetpasswordform.validate()) {
                $.ajax({
                    url: $resetpasswordform.attr("action"),
                    type: "post",
                    data: $resetpasswordform.serializeJson(),
                    dataType: "json",
                    beforeSend: function () {
                        // 禁用按钮防止重复提交，加loading...
                        $btnuserresetpassword.attr({ disabled: true });
                        $btnuserresetpassword.addClass("loading");
                    },
                    complete: function () {
                        // 回复按钮,移除loading...
                        $btnuserresetpassword.removeAttr("disabled");
                        $btnuserresetpassword.removeClass("loading");
                    },
                    success: function (data) {
                        if (data && data.Success) {
                            $resetpasswordCallbackMsg.html(data.Message).removeClass('hide error-msg').addClass('success-msg');
                            setTimeout(function () {
                                /*关闭reset password popup,打开login popup*/
                                $resetPasswordPopup.removeClass("open");
                                $("html, body").css("height", "auto");
                                $resetPasswordPopup.find(".overlay").removeClass("fade-in").addClass("fade-out");
                                resetPasswordBack();
                            }, 3000);
                            
                        } else {
                            /*返回成功显示错误的信息*/
                            $resetpasswordCallbackMsg.html(data.Message).removeClass('hide success-msg').addClass('error-msg');
                        }
                    },
                    error: function (e) {
                    }
                });
            }
        });
    },
    /**
   *导航hover效果
   */
    Navigation: function () {
        var $headerMenu = $("#header-menu"),
            $menuItem = $headerMenu.children(),
            $subMenu = $menuItem.find(".menu__submenu"),
            activeItem,
            timer;

        var moseInSubMenu = false;

        $subMenu.on("mouseenter", function () {
            moseInSubMenu = true;
        }).on("mouseleave", function () {
            moseInSubMenu = false;
        });

        var mouseTrach = [];
        var moveHandler = function (e) {
            mouseTrach.push({
                x: e.pageX,
                y: e.pageY
            });
            if (mouseTrach.length > 3) {
                mouseTrach.shift();
            }
        }

        $headerMenu.on("mouseenter", function () {
            $(document).bind("mousemove", moveHandler);
        }).on("mouseleave", function () {
            if (activeItem) {
                activeItem.removeClass("active");
                activeItem = null;
            }
            $(document).unbind("mousemove", moveHandler);
        });

        function vector(a, b) {
            return {
                x: b.x - a.x,
                y: b.y - a.y
            };
        }

        function vectorPro(v1, v2) {
            return v1.x * v2.y - v1.y * v2.x;
        }

        function sameSign(a, b) {
            return (a ^ b) >= 0;
        }

        function isPoint(p, a, b, c) {
            var pa = vector(p, a);
            var pb = vector(p, b);
            var pc = vector(p, c);

            var t1 = vectorPro(pa, pb);
            var t2 = vectorPro(pb, pc);
            var t3 = vectorPro(pc, pa);

            return sameSign(t1, t2) && sameSign(t2, t3);
        }
        /*
        *是否需要延迟处理
        */
        function needDelay(ele, curMouse, prevMouse) {
            if (!curMouse || !prevMouse || ele.length === 0) {
                return false;
            }
            var offset = ele.offset();
            var topleft = {
                x: offset.left,
                y: offset.top
            };
            var topright = {
                x: offset.left + ele.width(),
                y: offset.top
            };

            return isPoint(curMouse, prevMouse, topleft, topright);
        }

        $menuItem.on("mouseenter", function (e) {
            if (!activeItem) {
                activeItem = $(this).addClass("active");
            }
            if (timer) {
                clearTimeout(timer);
            }

            var curMouse = mouseTrach[mouseTrach.length - 1],
                prevMouse = mouseTrach[mouseTrach.length - 2],
                $activeSubmenu = activeItem.find(".menu__submenu");

            var delay = needDelay($activeSubmenu, curMouse, prevMouse);
            if (delay) {
                timer = setTimeout(function () {
                    if (moseInSubMenu) {
                        return;
                    }
                    if (activeItem) {
                        activeItem.removeClass("active");
                    }
                    activeItem = $(e.currentTarget);
                    activeItem.addClass("active");
                    timer = null;
                }, 300);
            } else {
                var preActiveItem = activeItem;
                activeItem = $(this);
                preActiveItem.removeClass("active");
                activeItem.addClass("active");
            }
        });
    },
    /*为Verifiaction Code绑定方法*/
    bindVerificationCode: function () {
        $(".verification-wrap").on("click", ".verification-img", function () {
            var $this = $(this),
                newkey = $.newguid();
            $this.attr("src", $this.attr("src").replace(new RegExp(/[^=]+$/), newkey));
            $this.next("[name=VerificationCode]").attr("data-key", newkey);
            
            if ($("#VerificationKey").length > 0) {
                $("#VerificationKey").val(newkey);
            }
        });
    },
    /*为popup绑定方法*/
    bindPopup: function () {
        //close button
        $(".popup").on("click", ".btn-close", function () {
            var $popup = $(this).closest(".popup");
            $popup.find(".overlay").removeClass("fade-in").addClass("fade-out");
            $popup.removeClass("open");
            $("html, body").css("height", "auto");
        });

        //click overlay, close popup
        $(".popup").on("click", ".overlay", function () {
            if ($(window).outerWidth() < 500) {
                var $popup = $(this).closest(".popup");
                $(this).removeClass("fade-in").addClass("fade-out");
                $popup.removeClass("open");
                $("html, body").css("height", "auto");
            }
        });
    },
    /*为用户注册绑定方法*/
    submitRegister: function () {
        var $form = $("#register-form"),
            $responseOutput = $form.find(".wpcf7-response-output");
        $form.on("click",
            "button[type='submit']",
            function(e) {
                $responseOutput.html('');
                var formData = $form.serializeJson();
                var $submitButton = $(this);
                formData.VerificationKey = $form.find("[name=VerificationCode]").attr("data-key");
                if ($form.validate()) {
                    $.ajax({
                        url: $form.attr("action"),
                        type: "post",
                        data: formData,
                        dataType: "json",
                        beforeSend: function() {
                            // 禁用按钮防止重复提交，加loading...
                            $submitButton.attr({ disabled: true });
                            $submitButton.addClass("is-active");
                        },
                        complete: function() {
                            // 回复按钮,移除loading...
                            $submitButton.removeAttr("disabled");
                            $submitButton.removeClass("is-active");
                            //刷新验证码
                            var $verificationImg = $form.find(".verification-img"),
                                newkey = $.newguid();
                            $verificationImg.attr("src",
                                $verificationImg.attr("src").replace(new RegExp(/[^=]+$/), newkey));
                            $verificationImg.next("[name=VerificationCode]").attr("data-key", newkey);
                        },
                        success: function(data) {
                            if (data && data.Success) {
                                /*返回成功显示成功的信息， 清空form数据*/
                              if (data.Url) {
                                var fileid = getQueryString('fileid');
                                if (fileid) {
                                    window.location.href = filterXSS(getDownlodFileUrl(fileid));
                                  setTimeout(function() {
                                      window.location.href = filterXSS(data.Url);
                                    }, 1000);
                                } else {
                                    window.location.href = filterXSS(data.Url);
                                }
                              }
                              $responseOutput.removeClass("wpcf7-validation-errors").addClass("wpcf7-mail-sent-ok").text(data.Message).show();
                                $form.reset();
                                $form.find(".not-empty:not(.form-item__select)").removeClass("not-empty");
                            } else {
                                /*返回成功显示错误的信息*/
                                $responseOutput.removeClass("wpcf7-mail-sent-ok").addClass("wpcf7-validation-errors").text(data.Message).show();
                            }
                        },
                        error: function(e) {
                        }
                    });
                } else {
                    var errorFieldPosition = $form.find("[aria-invalid=true]:first").offset().top - 20;
                    $('body,html').animate({ 'scrollTop': errorFieldPosition });
                }
            });
    },
    /*为用户中心绑定方法*/
    submitUserCenter: function () {
        var $form = $("#user-center-form"),
            $responseOutput = $form.find(".wpcf7-response-output");
        $form.on("click", "button[type='submit']", function (e) {
            $responseOutput.html('');
            var formData = $form.serializeJson();
            var $submitButton = $(this);
            if ($form.validate()) {
                $.ajax({
                    url: $form.attr("action"),
                    type: "post",
                    data: formData,
                    dataType: "json",
                    beforeSend: function () {
                        // 禁用按钮防止重复提交，加loading...
                        $submitButton.attr({ disabled: true });
                        $submitButton.addClass("is-active");
                    },
                    complete: function () {
                        // 回复按钮,移除loading...
                        $submitButton.removeAttr("disabled");
                        $submitButton.removeClass("is-active");
                    },
                    success: function (data) {
                        if (data && data.Success) {
                            /*返回成功显示成功的信息， 清空form数据*/
                            if (data.Url) {
                                window.location.href = filterXSS(data.Url);
                            }
                            $responseOutput.removeClass("wpcf7-validation-errors").addClass("wpcf7-mail-sent-ok")
                                .text(data.Message).show();
                        } else {
                            /*返回成功显示错误的信息*/
                            $responseOutput.removeClass("wpcf7-mail-sent-ok").addClass("wpcf7-validation-errors")
                                .text(data.Message).show();
                        }
                    },
                    error: function (e) {
                    }
                });
            } else {
                var errorFieldPosition = $form.find("[aria-invalid=true]:first").offset().top - 20;
                $('body,html').animate({ 'scrollTop': errorFieldPosition });
            }
        });
    },
    bindPhoneEvent: function() {
        $(":input[aria-number=true]").on("blur", function() {
            $(this).val($.extractNumber($(this).val()));
        });
    },
    bindApplyDemo: function() {
        var $linkApplyDemo = $('.apply-demo');
        var $applyDemoPopup = $('#applyDemo');
        var $nonexistUserApply = $('#nonexistUserApply');
        var $existUserApply = $('#existUserApply');
        var $nonexistUserApplyForm = $('#nonexistUserApplyForm');
        var $existUserApplyForm = $('#existUserApplyForm');
        var $loginedApplyForm = $('#loginedApplyForm');
        var $applyDemoForm = $applyDemoPopup.find('form');
        var $productDemoId = $applyDemoForm.find('.productDemoId');
        var $loginLink = $('#login');
        var $resetPassword = $existUserApply.find('.resetPassword');

        $resetPassword.on('click',
            function () {
                $applyDemoPopup.removeClass('open');
                var $resetPasswordPopup = $('#user-resetpassword');
                var $resetpasswordform = $resetPasswordPopup.find('form');
                var $userResetPasswordBack = $('#userResetPassword-back');
                $resetPasswordPopup.addClass("open");
                $("html, body").css("height", "100%");
                $resetPasswordPopup.find(".overlay").removeClass("fade-out").addClass("fade-in");
                $resetpasswordform.reset();
                $userResetPasswordBack.attr('back-popup', 'appliedDemo');
            });

        $loginLink.on('click',
            function() {
                $nonexistUserApply.addClass('hide');
                $existUserApply.removeClass('hide');
            });

        $linkApplyDemo.on('click',
            function() {
                $applyDemoPopup.addClass('open');
                $("html, body").css("height", "100%");
                $applyDemoPopup.find('.overlay').removeClass('fade-out').addClass('fade-in');
                $applyDemoForm.reset();
                $nonexistUserApply.removeClass('hide');
                $existUserApply.addClass('hide');
                $productDemoId.val($(this).attr('demoid'));
            });

        //Nonexist user apply submit
        $nonexistUserApplyForm.on('click', 'button[type=submit]', function() {
            var $submitButton = $(this);
            var $callbackMsg = $nonexistUserApplyForm.find('.callback-msg');
            var formData = $nonexistUserApplyForm.serializeJson();
            var $verificationCode = $nonexistUserApplyForm.find('[name=VerificationCode]');
            if ($verificationCode.length) {
                formData.VerificationKey = $verificationCode.attr('data-key');
            }
            if ($nonexistUserApplyForm.validate()) {
                $.ajax({
                    url: $nonexistUserApplyForm.attr('action'),
                    type: 'post',
                    data: formData,
                    dataType: 'json',
                    beforeSend: function() {
                        // 禁用按钮防止重复提交，加loading...
                        $submitButton.attr({ disabled: true });
                        $submitButton.addClass('loading');
                    },
                    complete: function() {
                        // 回复按钮,移除loading...
                        $submitButton.removeAttr('disabled');
                        $submitButton.removeClass('loading');
                    },
                    success: function(data) {
                        if (data && data.Success) {
                            if (data.IsExistUser) {
                                $nonexistUserApply.addClass('hide');
                                $existUserApply.removeClass('hide');
                            } else {
                                $nonexistUserApplyForm.reset();
                                $callbackMsg.html(data.Message).removeClass('hide error-msg').addClass('success-msg');
                                setTimeout(function() {
                                    window.location.reload();
                                }, 5000);
                            }
                        } else {
                            /*返回成功显示错误的信息*/
                            $callbackMsg.html(data.Message).removeClass('hide success-msg').addClass('error-msg');
                        }
                    },
                    error: function(e) {
                    }
                });
            }
        });

        //Exist user apply submit
        $existUserApplyForm.on('click', 'button[type=submit]', function () {
            var $submitButton = $(this);
            var formData = $existUserApplyForm.serializeJson();
            var $callbackMsg = $existUserApplyForm.find('.callback-msg');
            var $verificationCode = $existUserApplyForm.find('[name=VerificationCode]');
            if ($verificationCode.length) {
                formData.VerificationKey = $verificationCode.attr("data-key");
            }
            if ($existUserApplyForm.validate()) {
                $.ajax({
                    url: $existUserApplyForm.attr("action"),
                    type: "post",
                    data: formData,
                    dataType: "json",
                    beforeSend: function () {
                        // 禁用按钮防止重复提交，加loading...
                        $submitButton.attr({ disabled: true });
                        $submitButton.addClass("loading");
                    },
                    complete: function () {
                        // 回复按钮,移除loading...
                        $submitButton.removeAttr("disabled");
                        $submitButton.removeClass("loading");
                    },
                    success: function (data) {
                        if (data && data.Success) {
                            $existUserApplyForm.reset();
                            $callbackMsg.html(data.Message).removeClass('hide error-msg').addClass('success-msg');
                            setTimeout(function() {
                                $applyDemoPopup.removeClass("open");
                                $("html, body").css("height", "auto");
                                window.location.reload();
                            }, 3000);
                        } else {
                            /*返回成功显示错误的信息*/
                            $callbackMsg.html(data.Message).removeClass('hide success-msg').addClass('error-msg');
                        }
                    },
                    error: function (e) {
                    }
                });
            }
        });

        //logined user apply submit
        $loginedApplyForm.on('click', 'button[type=submit]', function () {
            var $submitButton = $(this);
            var formData = $loginedApplyForm.serializeJson();
            var $callbackMsg = $loginedApplyForm.find('.callback-msg');
            var $verificationCode = $loginedApplyForm.find('[name=VerificationCode]');
            if ($verificationCode.length) {
                formData.VerificationKey = $verificationCode.attr("data-key");
            }
            if ($loginedApplyForm.validate()) {
                $.ajax({
                    url: $loginedApplyForm.attr("action"),
                    type: "post",
                    data: formData,
                    dataType: "json",
                    beforeSend: function () {
                        // 禁用按钮防止重复提交，加loading...
                        $submitButton.attr({ disabled: true });
                        $submitButton.addClass("loading");
                    },
                    complete: function () {
                        // 回复按钮,移除loading...
                        $submitButton.removeAttr("disabled");
                        $submitButton.removeClass("loading");
                        //刷新验证码
                        var $verificationImg = $form.find(".verification-img"),
                            newkey = $.newguid();
                        $verificationImg.attr("src",
                            $verificationImg.attr("src").replace(new RegExp(/[^=]+$/), newkey));
                        $verificationImg.next("[name=VerificationCode]").attr("data-key", newkey);
                    },
                    success: function (data) {
                        if (data && data.Success) {
                            var $email = $loginedApplyForm.find(':input[name=email]');
                            $email.attr({ 'data-default-value': $email.val(), 'value': $email.val() });
                            $loginedApplyForm.reset();
                            $callbackMsg.html(data.Message).removeClass('hide error-msg').addClass('success-msg');
                            setTimeout(function () {
                                $applyDemoPopup.removeClass("open");
                                $("html, body").css("height", "auto");
                            }, 3000);
                        } else {
                            /*返回成功显示错误的信息*/
                            $callbackMsg.html(data.Message).removeClass('hide success-msg').addClass('error-msg');
                        }
                    },
                    error: function (e) {
                    }
                });
            }
        });
    },
    bindAllowDownlod: function() {
      //var $linkAllowedDownload = $('.not-allowed-download');
      //var $loginPopup = $('#user-login');
      //var $loginform = $loginPopup.find('form');
      //$linkAllowedDownload.on('click',
      //  function() {
      //    $loginPopup.addClass("open");
      //    $("html, body").css("height", "100%");
      //    $loginPopup.find(".overlay").removeClass("fade-out").addClass("fade-in");
      //    $loginform.reset();
      //    var fileId = $(this).attr('download-file-id');
      //    $loginform.attr('download-file-id', fileId);
      //    var registerUrl = $loginform.find('.register').attr('href');
      //    $loginform.find('.register').attr('href', registerUrl + '?fileid=' + fileId);
      //  });
    },
    Requirement: function () {
        $('[name="c-select"]').click(function (e) {
            var $this = $(this);
            if ($this.hasClass('active')) {
                $this.removeClass('active')
            } else {
                $this.addClass('active');
            }
            e.stopPropagation();
        });

        $('[name="c-select"] li').click(function (e) {
            var val = $(this).text();
            $(this).parents('[name="c-select"]').find('input').val(val);
            $('[name="c-select"]').removeClass('active');
            e.stopPropagation();
        });

        $(document).click(function () {
            $('[name="c-select"]').removeClass('active');
        });

        //submit form
        var $form = $("#requirement-form"),
            $responseOutput = $form.find(".requirement-form-callbackMessage");
        $form.on("click", "button[type='submit']", function (e) {
            var $submitButton = $(this);
            if (e && e.preventDefault) {
                e.preventDefault(); //阻止默认浏览器动作(W3C) 
            } else {
                window.event.returnValue = false; //IE中阻止函数器默认动作的方式 
            }
            $responseOutput.html('');
            var formData = $form.serializeJson();
            formData.VerificationKey = $form.find("[name=VerificationCode]").attr("data-key");
            if ($form.validate()) {
                $.ajax({
                    url: $form.attr("action"),
                    type: "post",
                    data: formData,
                    dataType: "json",
                    beforeSend: function () {
                        // 禁用按钮防止重复提交，加loading...
                        $submitButton.attr({ disabled: true });
                        $submitButton.addClass("is-active");
                    },
                    complete: function () {
                        // 回复按钮,移除loading...
                        $submitButton.removeAttr("disabled");
                        $submitButton.removeClass("is-active");
                        //刷新验证码
                        var $verificationImg = $form.find(".verification-img"),
                            newkey = $.newguid();
                        $verificationImg.attr("src", $verificationImg.attr("src").replace(new RegExp(/[^=]+$/), newkey));
                        $verificationImg.next("[name=VerificationCode]").attr("data-key", newkey);
                    },
                    success: function (data) {
                        if (data && data.Success) {
                            //百度回调代码
                            window._agl && window._agl.push(['track', ['success', { t: 3 }]]);

                            /*返回成功显示成功的信息， 清空form数据*/
                            $responseOutput.removeClass("error").addClass("success").html(data.Message).show();
                            $form.reset();
                        } else {
                            /*返回成功显示错误的信息*/
                            $responseOutput.removeClass("success").addClass("error").html(data.Message).show();
                        }
                    },
                    error: function (e) {
                    }
                });
            } else {
                var errorFieldPosition = $form.find("[aria-invalid=true]:first").offset().top - 20;
                $('body,html').animate({ 'scrollTop': errorFieldPosition });
            }
        });
    }
}

$(function () {

    /*联系我们*/
    pacteraMain.contact();

    /*联系我们-提交信息*/
    pacteraMain.submitContact();

    /*TOP*/
    pacteraMain.pageTop();

    /*提交职位申请*/
    pacteraMain.submitJobApplication();

    pacteraMain.uploadFile();

    /*绑定用户登录/重置密码*/
    pacteraMain.bindAccountInfo();

    /*注册-提交信息*/
    pacteraMain.submitRegister();

    /*绑定用户pupup事件*/
    pacteraMain.bindPopup();

    /*导航hover效果*/
    pacteraMain.Navigation();

    /*阻止默认事件*/
    pacteraMain.preventDefault();

    /*绑定Verifiaction Code方法*/
    pacteraMain.bindVerificationCode();

    /*绑定用户中心提交方法*/
    pacteraMain.submitUserCenter();

    /*联系我们只保留数字*/
    pacteraMain.bindPhoneEvent();

    /*绑定产品试用方法*/
    pacteraMain.bindApplyDemo();

    /*绑定下载权限方法*/
    pacteraMain.bindAllowDownlod();

    /*绑定提交用户需求模块事件*/
    pacteraMain.Requirement();
});

function getDownlodFileUrl(fileId) {
  var template = '/-/media/{0}.ashx';
  return template.format(fileId.replace(/[\{\}\-]/g, '').toUpperCase());
}

$.fn.validate = function (params) {
    params = $.extend({}, { showErrorMsg: true }, params);
    var $this = $(this),
        validateResult = true;

    //validate input required
    $this.find(":input[aria-required=true]:not('.select')").each(function () {


        var $validTip = $(this).parent().find(".wpcf7-not-valid-tip");
        if ($.trim(this.value).length === 0) {
            var label = $(this).siblings(".label").text().replace('*', "");
            $(this).addClass("wpcf7-not-valid").attr({ "aria-invalid": true });
            if ($validTip.length > 0) {
                $validTip.html('请输入(' + label + ')');
            } else {
                $(this).parent().append('<span role="alert" class="wpcf7-not-valid-tip">请输入(' + label + ')</span>');
            }
            validateResult = false;
        } else {
            $(this).removeClass("wpcf7-not-valid").attr({ "aria-invalid": false });
            $validTip.remove();
        }
    });

    //validate select
    $this.find("select[aria-required=true], input.select[aria-required=true]").each(function () {
        var $sel = $(this);
        var $validTip = $(this).parent().find(".wpcf7-not-valid-tip");
        if ($sel.hasClass('select')) {
            $validTip = $sel.closest('.n-select').siblings(".wpcf7-not-valid-tip");
        }
        if ($.trim(this.value).length === 0) {
            var label = $(this).parent().siblings(".label").text().replace('*', "");
            $(this).addClass("wpcf7-not-valid").attr({ "aria-invalid": true });
            if ($validTip.length > 0) {
                $(this).closest(".form-item__select").addClass("not-valid");
                $validTip.html('请选择一项(' + label + ')');
            } else {
                if ($sel.hasClass('select')) {
                    $validTip = $sel.closest('.n-select').after('<span role="alert" class="wpcf7-not-valid-tip">请选择一项(' + label + ')</span>');
                } else {
                    $(this).closest(".form-item__select").addClass("not-valid");
                    $(this).parent().append('<span role="alert" class="wpcf7-not-valid-tip">请选择一项(' + label + ')</span>');
                }
            }
            validateResult = false;
        } else {
            $(this).removeClass("wpcf7-not-valid").attr({ "aria-invalid": false });
            $validTip.remove();
        }

        //add required det icon
        if (!$sel.hasClass('select')) {
            if ($sel.parent().find(".required-det").length === 0) {
                $sel.parent().append('<i class="required-det"></i>');
            }
        }
    });

    //validate password
    function validPassword(pw) {
        var patten = new RegExp(
            /^[a-zA-Z0-9!@#$%^&*()_\-+=\[{\]};:<>|./?]{6,20}$/
        );
        return patten.test(pw);
    }

    $this.find(":input[type=password]").each(function () {
        if ($.trim(this.value).length > 0) {
            var $validTip;
            var errorMsg;
            if (this.name === "password") {
                if (!validPassword(this.value)) {
                    $(this).addClass("wpcf7-not-valid").attr({ "aria-invalid": true });
                    $validTip = $(this).parent().find(".wpcf7-not-valid-tip");
                    errorMsg = "密码必须在6~20之间";
                    if ($validTip.length > 0) {
                        $validTip.html(errorMsg);
                    } else {
                        $(this).parent()
                            .append('<span role="alert" class="wpcf7-not-valid-tip">' + errorMsg + '</span>');
                    }
                    validateResult = false;
                } else {
                    $(this).removeClass("wpcf7-not-valid").attr({ "aria-invalid": false });
                    $(this).parent().find(".wpcf7-not-valid-tip").remove();
                }
            } else if (this.name === "confirmpassword") {
                if ($.trim($this.find("[name=password]").val()) !==
                    $.trim($this.find("[name=confirmpassword]").val())) {
                    $(this).addClass("wpcf7-not-valid").attr({ "aria-invalid": true });
                    $validTip = $(this).parent().find(".wpcf7-not-valid-tip");
                    errorMsg = "两次输入密码不一致";
                    if ($validTip.length > 0) {
                        $validTip.html(errorMsg);
                    } else {
                        $(this).parent()
                            .append('<span role="alert" class="wpcf7-not-valid-tip">' + errorMsg + '</span>');
                    }
                    validateResult = false;
                } else {
                    $(this).removeClass("wpcf7-not-valid").attr({ "aria-invalid": false });
                    $(this).parent().find(".wpcf7-not-valid-tip").remove();
                }
            }
        }
    });

    //validate email
    function validEmail(email) {
        var patten = new RegExp(
            /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/
        );
        return patten.test(email);
    }

    $this.find(":input[type=email]").each(function () {
        if ($.trim(this.value).length > 0) {
            if (!validEmail(this.value)) {
                var label = $(this).next(".label").text().replace('*', "");
                $(this).addClass("wpcf7-not-valid").attr({ "aria-invalid": true });
                var $validTip = $(this).parent().find(".wpcf7-not-valid-tip");
                if ($validTip.length > 0) {
                    $validTip.html('请输入正确的(' + label + ')');
                } else {
                    $(this).parent()
                        .append('<span role="alert" class="wpcf7-not-valid-tip">请输入正确的(' + label + ')</span>');
                }
                validateResult = false;
            } else {
                $(this).removeClass("wpcf7-not-valid").attr({ "aria-invalid": false });
                $(this).parent().find(".wpcf7-not-valid-tip").remove();
            }
        }
    });

    //validate telphone
    /**
    * 验证手机号码
    * 
    * 移动号码段:134 135 136 137 138 139 147 148 150 151 152 157 158 159 172 178 182 183 184 187 188 198
    * 联通号码段:130 131 132 145 146 155 156 166 171 175 176 185 186
    * 电信号码段:133 149 153 173 174 177 180 181 189 199
    * 虚拟运营商：170 171
    */
    function validTelphone(tel) {
        var patten = new RegExp(
            /^1[3|4|5|6|7|8|9][0-9]{9}$/
        );
        return patten.test(tel);
    }

    $this.find(":input[type=tel]").each(function () {
        if ($.trim(this.value).length > 0) {
            if (!validTelphone(this.value)) {
                var label = $(this).next(".label").text().replace('*', "");
                $(this).addClass("wpcf7-not-valid").attr({ "aria-invalid": true });
                var $validTip = $(this).parent().find(".wpcf7-not-valid-tip");
                if ($validTip.length > 0) {
                    $validTip.html('请输入正确的(' + label + ')');
                } else {
                    $(this).parent()
                        .append('<span role="alert" class="wpcf7-not-valid-tip">请输入正确的(' + label + ')</span>');
                }
                validateResult = false;
            } else {
                $(this).removeClass("wpcf7-not-valid").attr({ "aria-invalid": false });
                $(this).parent().find(".wpcf7-not-valid-tip").remove();
            }
        }
    });

    return validateResult;
};


/*
*文件大小字节单位转换 
*/
$.humanize = function (size) {
    var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    var ord = Math.floor(Math.log(size) / Math.log(1024));
    ord = Math.min(Math.max(0, ord), units.length - 1);

    var s = Math.round((size / Math.pow(1024, ord)) * 100) / 100;
    return s + ' ' + units[ord];
}

/*
* sting to bool
*/
$.bool = function (str) {
    return (/^true$/i).test(str);
};

/*
* Serialize form data to json  
*/
$.fn.serializeJson = function () {
    var serializeObj = {};
    var array = this.serializeArray();
    $(array).each(
        function () {
            if (serializeObj[this.name]) {
                if ($.isArray(serializeObj[this.name])) {
                    serializeObj[this.name].push(this.value);
                } else {
                    serializeObj[this.name] = [
                        serializeObj[this.name], this.value];
                }
            } else {
                serializeObj[this.name] = this.value;
            }
        });
    return serializeObj;
};

/*
* Generate guid  
*/
$.newguid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
};

/*
* Extract number
*/
$.extractNumber = function(str) {
    return str.replace(/[^0-9]/ig, "");
}

/*
*Form item reset, clear input, select and set default select value
*/
$.fn.reset = function() {
    var $this = $(this);
    $this.find('input:not([type="hidden"]), textarea').each(function() {
        var $input = $(this);
        var $formItem = $input.closest('.form-item');
        var dataDefaultValue = $input.attr('data-default-value');
        $input.removeClass('wpcf7-not-valid').attr('aria-invalid', false).val(dataDefaultValue);
        $formItem.find(".wpcf7-not-valid-tip").remove();
        if (!dataDefaultValue) {
            $formItem.removeClass('not-empty');
        }
    });

    $this.find('select').each(function() {
        var $select = $(this);
        var $formItem = $select.closest('.form-item');
        var defalutSelectValue = $select.attr("data-selected-value");
        if (defalutSelectValue) {
            $formItem.find(".select-styled").html(defalutSelectValue);
            $select.find('option').removeAttr("selected");
            $select.find('option:contains("' + defalutSelectValue + '")').attr('selected', true);
            $formItem.find('ul .active').removeClass('active');
            $formItem.find('ul li:contains("' + defalutSelectValue + '")').addClass('active');
        } else {
            $select.removeClass('wpcf7-not-valid').attr('aria-invalid', false);
            $select.find('option[selected]').attr('selected');
            $formItem.find(".wpcf7-not-valid-tip").remove();
            $formItem.removeClass('not-valid not-empty selected');
            $formItem.find(".select-styled").html('');
            $formItem.find(".select-options .active").removeClass('active');
        }
    });

    $this.find('.callback-msg').each(function() {
        var $this = $(this);
        $this.removeClass('success-msg error-msg').addClass('hide');
    });
}

function registerGoal(goalId) {
    if (goalId) {
        $.ajax({
            url: "/app/PacteraOWRendering/RegisterEvent",
            data: { eventId: goalId },
            type: "post"
        });
    }
}

String.prototype.format = function (args) {
  var result = this;
  if (arguments.length > 0) {
    if (arguments.length == 1 && typeof (args) == "object") {
      for (var key in args) {
        if (args[key] != undefined) {
          var reg = new RegExp("({" + key + "})", "g");
          result = result.replace(reg, args[key]);
        }
      }
    }
    else {
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != undefined) {
          var reg = new RegExp("({)" + i + "(})", "g");
          result = result.replace(reg, arguments[i]);
        }
      }
    }
  }
  return result;
}

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = filterXSS(window.location.search.substr(1)).match(reg);
  if (r != null) return unescape(r[2]); return null;
};
"use strict";
function Locations($, locations) {
    function hashChange() {
        router()
    }
    function locationsClick(e) {
        if (e.target.className.indexOf("mapTel") >= 0) { return true; }//Special handling by Yujin
        e.preventDefault();
        var target = e.target,
            link = target.closest("a");
        link && locationsContainer.contains(link) && linkClicked(link)
    }
    function crumbsClick(e) {
        var target = e.target,
            link = target.closest("a");
        link.classList.contains("first") || (e.preventDefault(), link && crumbsContainer.contains(link) && linkClicked(link))
    }
    function linkClicked(link) {
        history.pushState(null, "", link.href),
            document.title = link.title,
            router()
    }
    function router() {
        var pathArr = decodeURIComponent(window.location.href.replace(window.location.origin, "")).replace("#", "").replace(" ", "").replace("<", "").replace(">", "").replace("\\", "").replace("'", "").replace("\n", "").split("/").clean("");
        1 === pathArr.length ? renderLocations() : 2 === pathArr.length ? renderArea(pathArr[1]) : 3 === pathArr.length ? renderCity(pathArr[1], pathArr[2]) : renderError(),
            renderBreadcrumbs(pathArr)
    }
    function renderBreadcrumbs(pathArr) {

        //长度 分3，2，1  location,china,beijing location,apac location   
        if (pathArr.length == 1) {
            mapContainer.innerHTML = "<img src='../../Img/01-shijie.jpg'></img>";
        }
        else {
            //mapContainer.innerHTML = "";            
            var pathstr = "" + pathArr[1] + "";
            
            if (pathstr == "大中华区") {
                mapContainer.innerHTML = "<img src='../../Img/02-zhongguo.jpg'></img>";
            } else if (pathstr == "亚太地区") {
                mapContainer.innerHTML = "<img src='../../Img/05-yatai.jpg'></img>";
            }
        }


        var tempName = void 0,
            tempLink = void 0,
            containerContent = "";
        breadcrumbsArr = breadcrumbsArr.slice(0, 2);
        for (var i = 1; i < pathArr.length; i++) tempName = 1 === i ? locations[pathArr[i]].name : cities[pathArr[i]].name,
            tempLink = 1 === i ? locationsBaseUrl + pathArr[i] + "/" : locationsBaseUrl + pathArr[i - 1] + "/" + pathArr[i] + "/",
            breadcrumbsArr.push([tempName, tempLink]);
        for (var _i = 0; _i < breadcrumbsArr.length; _i++) containerContent +=
            function (crumb, last, first) {
                var crumbInner = void 0,
                    sep = "",
                    firstClass = first ? "first" : "";
                return last ? crumbInner = crumb[0] : (crumbInner = '<a class="' + firstClass + '" href="' + crumb[1] + '">' + crumb[0] + "</a>", sep = "|"),
                    "<span>" + crumbInner + "</span>" + sep
            }(breadcrumbsArr[_i], _i + 1 === breadcrumbsArr.length, !_i);
        crumbsContainer.innerHTML = containerContent
    }
    function renderLocations() {
        hideAllSections(),
            locationSection.classList.remove("hidden")
        //noRenderMap || map.flyTo({
        //    zoom: startZoom,
        //    center: [startCenter.x, startCenter.y]
        //})
    }
    function renderArea(area) {
        hideAllSections(),
            areaSection.classList.remove("hidden");
        var areaTitle = document.getElementById("areaTitle"),
            areaCitiesList = document.getElementById("areaCitiesList"),
            parentList = document.getElementById("locationCities-" + area),
            mapTop = mapContainer.getBoundingClientRect().top + window.pageYOffset,
            newTitle = document.createElement("h1");
        newTitle.innerHTML = locations[area].name,
            areaTitle.parentNode.insertBefore(newTitle, areaTitle),
            areaTitle.parentNode.removeChild(areaTitle),
            newTitle.setAttribute("id", "areaTitle"),
            areaCitiesList.innerHTML = parentList.innerHTML
        //noRenderMap || (zenscroll.toY(mapTop, 1e3), map.flyTo({
        //    center: [locations[area].lon, locations[area].lat],
        //    zoom: locations[area].zoom
        //}))
    }
    function renderCity(area, city) {

        hideAllSections(),
            citySection.classList.remove("hidden");
        var cityTitleArea = document.getElementById("cityTitleArea"),
            cityTitle = document.getElementById("cityTitle"),
            cityAddressList = document.getElementById("cityAddressList"),
            cityLink = document.getElementById("cityLink"),
            details = cities[city].detail,
            svg = '<svg class="icon icon-ico-arrow" aria-hidden="true" role="img"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-ico-arrow"></use></svg>';
        var newTitle = document.createElement("h1");
        newTitle.innerHTML = cities[city].name,
            cityTitle.parentNode.insertBefore(newTitle, cityTitle),
            cityTitle.parentNode.removeChild(cityTitle),
            newTitle.setAttribute("id", "cityTitle"),
            cityAddressList.innerHTML = "",
            cityTitleArea.innerHTML = locations[area].name,
            cityAddressList.innerHTML = "",
            cityLink.href = "/locations#/" + area;
        for (var i = 0; i < details.length; i++) {
            var li = document.createElement("li"),
                address = document.createElement("p"),
                phone = document.createElement("span"),
                mail = document.createElement("span"),
                time = document.createElement("span"),
                localTime = calcTime(details[i].gmt) + " - " + details[i].country + "/ GMT " + details[i].gmt;
            //details.length == 1 ? li.style = "width:100%" : details.length == 2 ? li.style = "width:50%" : details.length == 3 ? li.style = "width:33.3%" : li.style = "width:25%";
            details.length == 1 ? li.style.width = "100%" : details.length == 2 ? li.style.width = "50%" : details.length == 3 ? li.style.width = "33.3%" : li.style.width = "25%";
            li.classList.add("detail__item"),
                address.classList.add("detail__address"),
                phone.classList.add("detail__phone"),
                mail.classList.add("detail__mail"),
                time.classList.add("detail__time"),
                address.innerHTML = details[i].address,
                phone.innerHTML = renderPhoneHtml(details[i].phone),
                mail.innerHTML = '<svg class="icon icon-ico-mail" aria-hidden="true" role="img"><title>ico-mail</title><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-ico-mail"></use></svg>' + details[i].mail,
                time.innerHTML = localTime,
                runTimeTimer(time, details[i].country, details[i].gmt),
                li.innerHTML = svg,
                li.appendChild(address),
                li.appendChild(phone),
                //li.appendChild(mail),
                li.appendChild(time),
                cityAddressList.appendChild(li)
        }

        //alert(JSON.stringify(city));
        //noRenderMap || map.flyTo({
        //    center: [cities[city].lon, cities[city].lat],
        //    zoom: 5
        //})
    }
    function renderPhoneHtml(phoneStr) {
        var phoneHtml = '';
        if (phoneStr.indexOf("<br") > 0) {
            var phoneNumStr = phoneStr.replace(new RegExp("<br />", "g"), "T").replace(new RegExp("<br >", "g"), "T").split("T");
            for (var i = 0; i < phoneNumStr.length; i++) {
                var phoneNum = phoneNumStr[i];
                if (phoneNumStr[i].indexOf("/") > 0) { phoneNum = phoneNumStr[i].substring(0, phoneNumStr[i].indexOf("/")); }
                phoneNum = phoneNum.replace(new RegExp("\\.", "g"), "");
                if (i % 2 == 1) {
                    phoneHtml = phoneHtml + '<a class="mapTel marginLeft20" href="tel:' + phoneNum + '" >' + phoneNumStr[i] + '</a>';
                }
                else {
                    phoneHtml = phoneHtml + '<a class="mapTel" href="tel:' + phoneNum + '" >' + phoneNumStr[i] + '</a>';
                }
            }
        }
        else {
            var phoneNum = phoneStr;
            if (phoneNum.indexOf("/") > 0) { phoneNum = phoneNum.substring(0, phoneStr.indexOf("/")); }
            phoneNum = phoneNum.replace(new RegExp("\\.", "g"), "");
            phoneHtml = '<a class="mapTel" href="tel:' + phoneNum + '" >' + phoneStr + '</a>';
        }
        return phoneHtml;
    }
    function renderError() {
        hideAllSections(),
            errorSection.classList.remove("hidden")
    }
    function runTimeTimer(el, country, offset) {
        el.innerHTML = calcTime(offset) + " - " + country + "/ GMT " + offset,
            setTimeout(function () {
                runTimeTimer(el, country, offset)
            },
                1e3)
    }
    function calcTime(offset) {
        var d = new Date,
            utc = d.getTime() + 6e4 * d.getTimezoneOffset();
        return new Date(utc + 36e5 * offset).toLocaleTimeString()
    }
    function hideAllSections() {
        for (var i = 0; i < renderedSections.length; i++) renderedSections[i].classList.add("hidden")
    }
    function renderMarkers() {
        for (var _city in cities) {
            var el = document.createElement("div");
            el.className = "marker",
                el.style.backgroundImage = markerUrl,
                el.style.width = markerWidth,
                el.style.height = markerHeight,
                el.dataset.id = _city,
                el.dataset.area = cities[_city].area,
                el.title = cities[_city].name,
                new mapboxgl.Marker(el, {
                    offset: [markerOffset.x, markerOffset.y]
                }).setLngLat([cities[_city].lon, cities[_city].lat]).addTo(map)
        }
    }
    function onRendereMap() {
        mapContainer.classList.remove("blured"),
            mapContainer.addEventListener("mouseover", mapMouseHandler),
            mapContainer.addEventListener("mouseout", mapMouseHandler),
            mapContainer.addEventListener("click", mapClickHandler)
    }
    function mapMouseHandler(e) {
        var marker = e.target;
        marker.classList.contains("marker") && marker.classList.toggle("hovered")
    }
    function mapClickHandler(e) {
        var marker = e.target;
        marker.classList.contains("marker") && markerClick(marker)
    }
    function markerClick(marker) {
        var url = "/locations#/" + marker.dataset.area + "/" + marker.dataset.id + "/";
        history.pushState(null, "", url),
            router()
    }
    function detectIE() {
        var ua = window.navigator.userAgent,
            msie = ua.indexOf("MSIE ");
        if (msie > 0) return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
        if (ua.indexOf("Trident/") > 0) {
            var rv = ua.indexOf("rv:");
            return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10)
        }
        var edge = ua.indexOf("Edge/");
        return edge > 0 && parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10)
    }
    Array.prototype.clean = function (deleteValue) {
        for (var i = 0; i < this.length; i++) this[i] === deleteValue && (this.splice(i, 1), i--);
        return this
    };
    var accessToken = "pk.eyJ1IjoiZ3JpeiIsImEiOiJjaXl0azhzdWQwMDE3MzNsZGRlNjYwajZlIn0.PPD9iZMq_ogqtKzqA8RUHQ",
        styleUrl = "mapbox://styles/griz/cj0jajqx300j12srlsvj987r8",
        markerUrl = "url(/Img/marker.png)",
        markerWidth = "44px",
        markerHeight = "34px",
        //markerOffset = {
        //    x: -11,
        //    y: -32
        //    },
        markerOffset = {
            x: 12,
            y: -13
        },
        startZoom = 2,
        startCenter = {
            x: 20,
            y: 10
        },
        cities = {},
        map = void 0,
        mapContainer = document.getElementById("map"),
        locationsContainer = document.getElementById("locationsContainer"),
        renderedSections = document.getElementsByClassName("locations__rendered-section"),
        locationSection = document.getElementById("renderLocations"),
        areaSection = document.getElementById("renderArea"),
        citySection = document.getElementById("renderCity"),
        errorSection = document.getElementById("renderError"),
        crumbsContainer = document.getElementById("locationsBreadcrumbs"),
        noRenderMap = !1,
        locationsBaseUrl = window.location.origin + "/locations#/",
        breadcrumbsArr = [[crumbsContainer.children[0].innerText.trim(), $("#homePageUrl").text()], [crumbsContainer.children[1].innerText.trim(), locationsBaseUrl]]; !
            function (elem) {
                return !elem.offsetWidth && !elem.offsetHeight
            }(mapContainer) && mapContainer || (noRenderMap = !0);


    for (var area in locations) if (locations.hasOwnProperty(area) && locations[area].hasOwnProperty("cities")) {
        var citiesTemp = locations[area].cities;
        for (var city in citiesTemp) citiesTemp.hasOwnProperty(city) && (cities[city] = citiesTemp[city], cities[city].area = area)
    }

    mapContainer.innerHTML = "<img src='../../Img/01-shijie.jpg'></img>";

    locationsContainer && (locationsContainer.addEventListener("click", locationsClick), router()),
        crumbsContainer && crumbsContainer.addEventListener("click", crumbsClick),
        window.addEventListener("popstate", hashChange)
}
var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ?
    function (obj) {
        return typeof obj
    } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
    }; !
        function (factory) {
            var registeredInModuleLoader = !1;
            if ("function" == typeof define && define.amd && (define(factory), registeredInModuleLoader = !0), "object" === ("undefined" == typeof exports ? "undefined" : _typeof(exports)) && (module.exports = factory(), registeredInModuleLoader = !0), !registeredInModuleLoader) {
                var OldCookies = window.Cookies,
                    api = window.Cookies = factory();
                api.noConflict = function () {
                    return window.Cookies = OldCookies,
                        api
                }
            }
        }(function () {
            function extend() {
                for (var i = 0,
                    result = {}; i < arguments.length; i++) {
                    var attributes = arguments[i];
                    for (var key in attributes) result[key] = attributes[key]
                }
                return result
            }
            function init(converter) {
                function api(key, value, attributes) {
                    var result;
                    if ("undefined" != typeof document) {
                        if (arguments.length > 1) {
                            if (attributes = extend({
                                path: "/"
                            },
                                api.defaults, attributes), "number" == typeof attributes.expires) {
                                var expires = new Date;
                                expires.setMilliseconds(expires.getMilliseconds() + 864e5 * attributes.expires),
                                    attributes.expires = expires
                            }
                            try {
                                result = JSON.stringify(value),
                                    /^[\{\[]/.test(result) && (value = result)
                            } catch (e) { }
                            return value = converter.write ? converter.write(value, key) : encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent),
                                key = encodeURIComponent(String(key)),
                                key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent),
                                key = key.replace(/[\(\)]/g, escape),
                                document.cookie = [key, "=", value, attributes.expires ? "; expires=" + attributes.expires.toUTCString() : "", attributes.path ? "; path=" + attributes.path : "", attributes.domain ? "; domain=" + attributes.domain : "", attributes.secure ? "; secure" : ""].join("")
                        }
                        key || (result = {});
                        for (var cookies = document.cookie ? document.cookie.split("; ") : [], rdecode = /(%[0-9A-Z]{2})+/g, i = 0; i < cookies.length; i++) {
                            var parts = cookies[i].split("="),
                                cookie = parts.slice(1).join("=");
                            '"' === cookie.charAt(0) && (cookie = cookie.slice(1, -1));
                            try {
                                var name = parts[0].replace(rdecode, decodeURIComponent);
                                if (cookie = converter.read ? converter.read(cookie, name) : converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent), this.json) try {
                                    cookie = JSON.parse(cookie)
                                } catch (e) { }
                                if (key === name) {
                                    result = cookie;
                                    break
                                }
                                key || (result[name] = cookie)
                            } catch (e) { }
                        }
                        return result
                    }
                }
                return api.set = api,
                    api.get = function (key) {
                        return api.call(api, key)
                    },
                    api.getJSON = function () {
                        return api.apply({
                            json: !0
                        },
                            [].slice.call(arguments))
                    },
                    api.defaults = {},
                    api.remove = function (key, attributes) {
                        api(key, "", extend(attributes, {
                            expires: -1
                        }))
                    },
                    api.withConverter = init,
                    api
            }
            return init(function () { })
        }),
        document.body.className = document.body.className.replace("no-js", "js"),
        function () {
            function leaderClick(e) {
                var clicked = e.currentTarget;
                disableScroll(),
                    setTimeout(function () {
                        var checkClicked = clicked.parentNode.getElementsByClassName("clicked");
                        if (checkClicked.length) for (var _i = 0; _i < checkClicked.length; _i++) checkClicked[_i].classList.remove("clicked");
                        else clicked.classList.contains("clicked") || clicked.classList.add("clicked");
                        setTimeout(function () {
                            clicked.classList.contains("clicked") ? (runBlur(), runPopup(clicked)) : enableScroll()
                        },
                            300)
                    },
                        1)
            }
            function runBlur() {
                document.body.classList.add("body-blured")
            }
            function unBlur() {
                document.body.classList.remove("body-blured"),
                    document.body.classList.add("body-unblured"),
                    setTimeout(function () {
                        document.body.classList.remove("body-unblured")
                    },
                        800)
            }
            function runPopup(el) {

                $(".contact-module").css("display", "none");



                var elImg = el.getElementsByTagName("img")[0],
                    elHeading = el.getElementsByTagName("h4")[0],
                    elText = el.getElementsByClassName("popup-content")[0],
                    popup = document.createElement("div"),
                    bgWhite = document.createElement("div"),
                    heading = document.createElement("div"),
                    content = document.createElement("div"),
                    closer = document.createElement("div"),
                    img = new Image,
                    elTop = elImg.getBoundingClientRect().top,
                    elLeft = elImg.getBoundingClientRect().left,
                    finalLeft = void 0,
                    finalTop = document.documentElement.clientHeight / 2 - height / 2;
                document.documentElement.clientWidth < 1430 && document.documentElement.clientWidth >= 768 ? finalLeft = 15 : document.documentElement.clientWidth < 768 ? (finalLeft = 0, finalTop = 0) : finalLeft = document.documentElement.clientWidth / 2 - width / 2,
                    clickedLast = el,
                    isMobile.any() || (img.src = elImg.src, img.classList.add("leader-popup-img")),
                    elImg.getBoundingClientRect().width === elImg.naturalWidth && elImg.getBoundingClientRect().height === elImg.naturalHeight && isMobile.any() || (imageScaled.x = elImg.getBoundingClientRect().width / 380, imageScaled.y = elImg.getBoundingClientRect().height / 490, imageScaled.top = -(490 - elImg.getBoundingClientRect().height), bgScaled.sx = elImg.getBoundingClientRect().width / (document.documentElement.clientWidth - bgShift) - .001, bgScaled.sy = elImg.getBoundingClientRect().height / height - .001),
                    popup.classList.add("leader-popup"),
                    bgWhite.classList.add("bg-white"),
                    closer.classList.add("leader-popup-closer"),
                    popup.appendChild(bgWhite),
                    isMobile.any() || popup.appendChild(img),
                    popup.appendChild(closer),
                    isMobile.any() || (img.style.transform = "translateY(" + imageScaled.top + "px) scale( " + imageScaled.x + ", " + imageScaled.y + " )"),
                    isMobile.any() || (bgWhite.style.transform = "translate(" + bgScaled.tx + "px," + bgScaled.ty + "px) scale( " + bgScaled.sx + ", " + bgScaled.sy + " )"),
                    elHeading && (heading.innerHTML = elHeading.innerHTML),
                    elText && (content.innerHTML = elText.innerHTML),
                    heading.classList.add("leader-popup__heading"),
                    content.classList.add("leader-popup__cont"),
                    document.body.appendChild(popup),
                    popup.style.transform = "translate(" + (elLeft - pl) + "px, " + (elTop - pt) + "px)",
                    popup.appendChild(heading),
                    popup.appendChild(content),
                    setTimeout(function () {
                        popup.style.transform = "translate(" + finalLeft + "px, " + finalTop + "px)",
                            bgWhite.classList.add("show"),
                            bgWhite.style.transform = "",
                            isMobile.any() || img.classList.add("scaled"),
                            isMobile.any() || (img.style.transform = ""),
                            setTimeout(function () {
                                heading.classList.add("show"),
                                    content.classList.add("show"),
                                    closer.classList.add("show"),
                                    enableScroll(),
                                    setTimeout(function () {
                                        document.getElementById("page").addEventListener("click", closePopups, !0),
                                            openedIs = !0
                                    },
                                        0)
                            },
                                0)
                    },
                        0),
                    closer.addEventListener("click", closePopups)
            }
            function closePopups(e) {
                if (e.preventDefault(), e.stopPropagation(), openedIs) for (var popups = document.getElementsByClassName("leader-popup"), _i2 = 0; _i2 < popups.length; _i2++) closePopup(popups[_i2])
            }
            function closePopup(popup) {

                $(".contact-module").css("display", "block");

                var closer = popup.getElementsByClassName("leader-popup-closer")[0],
                    heading = popup.getElementsByClassName("leader-popup__heading")[0],
                    content = popup.getElementsByClassName("leader-popup__cont")[0],
                    img = popup.getElementsByTagName("img")[0],
                    bg = popup.getElementsByClassName("bg-white")[0],
                    elTop = clickedLast.getBoundingClientRect().top,
                    elLeft = clickedLast.getBoundingClientRect().left;
                disableScroll(),
                    heading.classList.remove("show"),
                    content.classList.remove("show"),
                    closer.classList.remove("show"),
                    document.getElementById("page").removeEventListener("click", closePopups, !0),
                    setTimeout(function () {
                        bg.classList.remove("show"),
                            isMobile.any() || img.classList.remove("scaled"),
                            popup.style.transform = "translate(" + (elLeft - pl) + "px, " + (elTop - pt) + "px)",
                            isMobile.any() || (img.style.transform = "translateY(" + imageScaled.top + "px) scale( " + imageScaled.x + ", " + imageScaled.y + " )"),
                            isMobile.any() || (bg.style.transform = "translate(" + bgScaled.tx + "px," + bgScaled.ty + "px) scale( " + bgScaled.sx + ", " + bgScaled.sy + " )"),
                            setTimeout(function () {
                                unBlur(),
                                    setTimeout(function () {
                                        popup.parentNode.removeChild(popup),
                                            clickedLast.classList.remove("clicked"),
                                            enableScroll()
                                    },
                                        0)
                            },
                                0)
                    },
                        0)
            }
            function preventDefault(e) {
                e = e || window.event,
                    e.preventDefault && e.preventDefault(),
                    e.returnValue = !1
            }
            function preventDefaultForScrollKeys(e) {
                if (keys && keys[e.keyCode]) return preventDefault(e),
                    !1
            }
            function disableScroll() {
                window.addEventListener && window.addEventListener("DOMMouseScroll", preventDefault, !1),
                    window.onwheel = preventDefault,
                    window.onmousewheel = document.onmousewheel = preventDefault,
                    window.ontouchmove = preventDefault,
                    document.onkeydown = preventDefaultForScrollKeys
            }
            function enableScroll() {
                window.removeEventListener && window.removeEventListener("DOMMouseScroll", preventDefault, !1),
                    window.onmousewheel = document.onmousewheel = null,
                    window.onwheel = null,
                    window.ontouchmove = null,
                    document.onkeydown = null
            }
            Array.prototype.clean = function (deleteValue) {
                for (var i = 0; i < this.length; i++) this[i] === deleteValue && (this.splice(i, 1), i--);
                return this
            };
            var leaders = document.getElementsByClassName("leader"),
                width = 1400,
                height = 550,
                pt = 30,
                pl = 60,
                clickedLast = void 0,
                openedIs = !1,
                imageScaled = {
                    x: 1,
                    y: 1,
                    top: 0
                },
                bgScaled = {
                    sx: .2714,
                    sy: .8909,
                    tx: 60,
                    ty: 30
                },
                bgShift = 30,
                isMobile = {
                    Android: function () {
                        return navigator.userAgent.match(/Android/i)
                    },
                    BlackBerry: function () {
                        return navigator.userAgent.match(/BlackBerry/i)
                    },
                    iOS: function () {
                        return navigator.userAgent.match(/iPhone|iPad|iPod/i)
                    },
                    Opera: function () {
                        return navigator.userAgent.match(/Opera Mini/i)
                    },
                    Windows: function () {
                        return navigator.userAgent.match(/IEMobile/i)
                    },
                    any: function () {
                        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()) && document.documentElement.clientWidth < 767
                    }
                },
                boardId = function () {
                    var locArr = window.location.href.split("/"),
                        locId = locArr[locArr.length - 1];
                    return 0 === locId.indexOf("#") && locId.slice(1)
                };
            boardId() && setTimeout(function () {
                $(document.getElementById(boardId())).find("span").click()
            },
                100),
                document.documentElement.clientWidth < 768 && (pt = 15, pl = 15, bgScaled.tx = 15, bgScaled.ty = 15, height = document.documentElement.clientHeight, bgShift = 0);
            for (var i = 0; i < leaders.length; i++) leaders[i].addEventListener("click", leaderClick);
            var keys = {
                37: 1,
                38: 1,
                39: 1,
                40: 1
            }
        }(),
        function (ElementProto) {
            "function" != typeof ElementProto.matches && (ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.mozMatchesSelector || ElementProto.webkitMatchesSelector ||
                function (selector) {
                    for (var element = this,
                        elements = (element.document || element.ownerDocument).querySelectorAll(selector), index = 0; elements[index] && elements[index] !== element;)++index;
                    return Boolean(elements[index])
                }),
                "function" != typeof ElementProto.closest && (ElementProto.closest = function (selector) {
                    for (var element = this; element && 1 === element.nodeType;) {
                        if (element.matches(selector)) return element;
                        element = element.parentNode
                    }
                    return null
                })
        }(window.Element.prototype),
        "undefined" != typeof LOCATIONS && Locations(jQuery, LOCATIONS),
        function ($) {
            function hoverSearch(e) {
                for (var base = e.currentTarget,
                    sibDivs = base.parentNode.getElementsByTagName("div"), i = 0; i < $(base).index(); i++) sibDivs[i].classList.add("before-hovered")
            }
            function unHoverSearch(e) {
                for (var base = e.currentTarget,
                    sibDivs = base.parentNode.getElementsByTagName("div"), i = 0; i < $(base).index(); i++) sibDivs[i].classList.remove("before-hovered")
            }
            function searchFocus(e) {
                for (var base = e.currentTarget.parentNode.parentNode,
                    sibDivs = base.parentNode.getElementsByTagName("div"), i = 0; i < $(base).index(); i++) sibDivs[i].classList.add("before-focused")
            }
            function searchBlur(e) {
                for (var base = e.currentTarget.parentNode.parentNode,
                    sibDivs = base.parentNode.getElementsByTagName("div"), i = 0; i < $(base).index(); i++) sibDivs[i].classList.remove("before-focused")
            }
            function btnHoverSvg(e) {
                e.currentTarget.parentNode.parentNode.getElementsByTagName("svg")[0].classList.toggle("hovered")
            }
            function hoverFormItem(e) {
                e.currentTarget.classList.toggle("hovered")
            }
            function controlFocus(e) {
                e.currentTarget.parentNode.parentNode.classList.toggle("focused")
            }
            function onRollupClick(e) {
                e.currentTarget.classList.toggle("closed"),
                    e.currentTarget.classList.toggle("opened")
            }
            function controlChange(e) {
                if (!e.currentTarget.value) return void e.currentTarget.parentNode.parentNode.classList.remove("not-empty");
                e.currentTarget.parentNode.parentNode.classList.add("not-empty")
            }
            function videoLoadStart(e) {
                var land = document.getElementById("landBannerVideoHere");
                bannerVideo.play(),
                    bannerVideo.classList.add("buffered"),
                    land && (land.src = bannerVideo.src),
                    stopIfMobile()
            }
            function stopIfMobile() {
                document.documentElement.clientWidth < 768 && bannerVideo.pause()
            }
            function clusterFire(e) {
                var id = e.currentTarget.dataset.for;
                document.getElementById(id).classList.toggle("red")
            }
            function toggleMobileMenu(e) {
                document.documentElement.classList.toggle("menu-opened")
            }
            function mainClick(e) {
                document.documentElement.classList.contains("menu-opened") && (e.preventDefault(), document.documentElement.classList.remove("menu-opened"))
            }
            function Selectize() {
                for (var selected, $this = $(this), numberOfOptions = $(this).children("option").length, i = 0; i < numberOfOptions; i++) $(this).children("option").eq(i).attr("selected") && (selected = i + 1);
                $this.addClass("select-hidden"),
                    $this.wrap('<div class="select"></div>'),
                    $this.after('<div class="select-styled"></div>');
                var $styledSelect = $this.next("div.select-styled");
                var $formSelect = $this.closest(".form-item__select");
                selected ? $styledSelect.text($this.children("option").eq(selected - 1).text()) : $styledSelect.text($this.attr("placeholder"));
                for (var $list = $("<ul />", {
                    class: "select-options"
                }).insertAfter($styledSelect), i = 0; i < numberOfOptions; i++) $("<li />", {
                    text: $this.children("option").eq(i).text(),
                    rel: $this.children("option").eq(i).val()
                }).appendTo($list);
                if (selected) {
                    $formSelect.addClass("not-empty")
                } else {
                    $this.val("");
                    $formSelect.removeClass("not-empty")
                }
                var $listItems = $list.children("li");
                $listItems.eq(selected - 1).addClass("active"),
                    $styledSelect.click(function (e) {
                        e.stopPropagation(),
                            $("div.select-styled.active").not(this).each(function () {
                                $(this).removeClass("active").next("ul.select-options").hide();
                                $(this).closest(".form-item__select").removeClass("expend");
                            }),
                            $(this).toggleClass("active").next("ul.select-options").toggle();
                        $formSelect.toggleClass("expend");
                    }),
                    $listItems.click(function (e) {
                        e.stopPropagation(),
                            $styledSelect.text($(this).text()).removeClass("active"),
                            $this.val($(this).attr("rel")),
                            $this.find("option[selected='selected']").removeAttr("selected"),
                            $this.find("option[value='" + $(this).attr("rel") + "']").attr("selected", "selected"),
                            $list.hide(),
                            $list.closest(".form-item__select").removeClass("expend").addClass("not-empty").addClass("selected");
                        $list.closest(".form-item__select").removeClass("expend");
                        $list.closest(".form-item__select").find("select").removeClass("wpcf7-not-valid");
                        $list.closest(".select").find(".wpcf7-not-valid-tip").remove();
                        $list.closest(".select").append('<i class="required-det"></i>');
                        $listItems.each(function (i, el) {
                            $(el).removeClass("active");
                        }),
                            $(this).addClass("active");
                        if ($this.hasClass("change-submit")) {
                            $this.closest("form").submit();
                        }
                    }),
                    $(document).click(function () {
                        $styledSelect.removeClass("active");
                        $formSelect.removeClass("expend");
                        $list.hide()
                    })
            }
            function industryMobileClick(e) {
                for (var clickedLink = e.currentTarget,
                    clickedList = clickedLink.parentNode.parentNode,
                    oldActive = clickedList.getElementsByClassName("active"), relSlider = clickedLink.parentNode.getElementsByClassName("swiper-container")[0], _i17 = 0; _i17 < oldActive.length; _i17++) oldActive[_i17].classList.remove("active");
                clickedLink.classList.add("active"),
                    relSlider && new Swiper(relSlider, {
                        pagination: relSlider.getElementsByClassName("swiper-pagination")[0]
                    })
            }
            function getComputedTranslateX(obj) {
                if (window.getComputedStyle) {
                    var style = getComputedStyle(obj),
                        transform = style.transform || style.webkitTransform || style.mozTransform,
                        mat = transform.match(/^matrix3d\((.+)\)$/);
                    return mat ? parseFloat(mat[1].split(", ")[13]) : (mat = transform.match(/^matrix\((.+)\)$/), mat ? parseFloat(mat[1].split(", ")[4]) : 0)
                }
            }
            var main = (document.getElementById("page"), document.getElementById("main")),
                $wrap = $("#submitReplaceInside"),
                $old = $wrap.find('input[type="submit"]'),
                $oldVal = $old.attr("value"),
                replaceBtns = document.getElementsByClassName("replace-button"),
                rollupMobile = document.getElementsByClassName("js-mobile-rollup"),
                bannerVideo = document.getElementById("bannerVideo"),
                fireClusters = document.getElementsByClassName("fire-cluster-map"),
                industryMobileScreen = 980,
                swiperNews = document.getElementById("swiperOnMobile"),
                navToggler = document.getElementById("navToggler"),
                industriesList = document.getElementById("industriesList"),
                sliderWithControl = (document.getElementById("map"), document.getElementsByClassName("slider-with-control")),
                tabs = document.getElementsByClassName("tabs__container"),
                storySlider = document.getElementById("storySlider"),
                statsSlider = document.getElementById("statsSlider"),
                searchSubmit = document.getElementsByClassName("search-submit"),
                formItems = document.getElementsByClassName("form-item"),
                headerSearchWrap = document.getElementById("headerSearchWrap"),
                searchForm = document.getElementById("search-form");
            $old && $old.replaceWith("<button>" + $oldVal + "</button>"),
                headerSearchWrap && (headerSearchWrap.addEventListener("mouseenter", hoverSearch), headerSearchWrap.addEventListener("mouseleave", unHoverSearch)),
                searchForm && (searchForm.addEventListener("focus", searchFocus), searchForm.addEventListener("blur", searchBlur));
            for (var i = 0; i < replaceBtns.length; i++) $(replaceBtns[i]).replaceWith("<button class='replaced-btn link-arrow -bigger -blue -grey-border'>" + replaceBtns[i].value + "</button>");
            for (var _i = 0; _i < rollupMobile.length; _i++) rollupMobile[_i].addEventListener("click", onRollupClick);
            for (var _i2 = 0; _i2 < searchSubmit.length; _i2++) searchSubmit[_i2].addEventListener("mouseenter", btnHoverSvg),
                searchSubmit[_i2].addEventListener("mouseleave", btnHoverSvg);
            for (var _i3 = 0; _i3 < formItems.length; _i3++) {
                var controlWrap = formItems[_i3].getElementsByClassName("wpcf7-form-control-wrap")[0],
                    control = formItems[_i3].getElementsByClassName("wpcf7-form-control")[0],
                    label = formItems[_i3].getElementsByClassName("label")[0],
                    detector = document.createElement("i");
                if (!controlWrap || !control) continue;
                detector.classList.add("required-det"),
                    void 0 != label && controlWrap.appendChild(label),
                    control.getAttribute("aria-required") && controlWrap.appendChild(detector),
                    "SELECT" === control.tagName && (control.parentNode.parentNode.classList.add("not-empty"), $(control).each(Selectize)),
                    formItems[_i3].addEventListener("mouseenter", hoverFormItem),
                    formItems[_i3].addEventListener("mouseleave", hoverFormItem),
                    control.addEventListener("keyup", controlChange),
                    control.addEventListener("focus", controlFocus),
                    control.addEventListener("blur", controlFocus),
                    control.addEventListener("blur", controlChange)
            }
            if (bannerVideo) {
                var srcArr = [],
                    lastVideo = +Cookies.get("homevideo");
                for (var key in bannerVideo.dataset) srcArr.push(bannerVideo.dataset[key]); !lastVideo || lastVideo < 0 || lastVideo > srcArr.length - 1 ?
                    function () {
                        bannerVideo.src = srcArr[0],
                            Cookies.set("homevideo", 1)
                    }() : function () {
                        bannerVideo.src = srcArr[lastVideo],
                            Cookies.set("homevideo", lastVideo + 1)
                    }(),
                    setTimeout(function () {
                        bannerVideo.addEventListener("loadeddata", videoLoadStart),
                            setTimeout(function (e) {
                                stopIfMobile(),
                                    stopIfMobile()
                            },
                                10)
                    },
                        10)
            }
            for (var _i4 = 0; _i4 < fireClusters.length; _i4++) fireClusters[_i4].addEventListener("mouseenter", clusterFire),
                fireClusters[_i4].addEventListener("mouseleave", clusterFire);
            if (document.documentElement.clientWidth < 450 && swiperNews && (function () {
                var slides = swiperNews.getElementsByTagName("li");
                $(swiperNews).wrap('<div class="swiper-container"></div>'),
                    $(swiperNews).after('<div class="swiper-pagination"></div>'),
                    swiperNews.classList.add("swiper-wrapper");
                for (var _i5 = 0; _i5 < slides.length; _i5++) slides[_i5].classList.add("swiper-slide");
                new Swiper(swiperNews.parentNode, {
                    pagination: swiperNews.parentNode.getElementsByClassName("swiper-pagination")[0]
                })
            }(),
                function () {
                    $(".related-slider").each(function () {
                        var $slider = $(this).find("ul"),
                            $slides = $slider.find("li");
                        $slider.wrap('<div class="swiper-container"></div>'),
                            $slider.after('<div class="swiper-pagination"></div>'),
                            $slider.addClass("swiper-wrapper"),
                            $slides.each(function () {
                                $(this).addClass("swiper-slide")
                            })
                    })
                }()), storySlider &&
                function (el) {
                    function slideChange(sw) {
                        setTimeout(function () {
                            for (var _i6 = 0; _i6 < yearsSet.length; _i6++) {
                                var shift = Math.abs(sw.activeIndex - _i6);
                                0 == shift ? (yearsSet[_i6].classList.remove("middle"), yearsSet[_i6].classList.remove("farther"), yearsSet[_i6].classList.remove("closest")) : shift < 3 ? (yearsSet[_i6].classList.remove("middle"), yearsSet[_i6].classList.remove("farther"), yearsSet[_i6].classList.add("closest")) : shift < 5 ? (yearsSet[_i6].classList.remove("farther"), yearsSet[_i6].classList.remove("closest"), yearsSet[_i6].classList.add("middle")) : (yearsSet[_i6].classList.remove("middle"), yearsSet[_i6].classList.remove("closest"), yearsSet[_i6].classList.add("farther"))
                            }
                            setTimeout(function () {
                                centeredYears()
                            },
                                4)
                        },
                            4)
                    }
                    function centeredYears() {
                        !
                            function (draw, duration) {
                                var start = performance.now();
                                requestAnimationFrame(function animate(time) {
                                    var timePassed = time - start;
                                    timePassed > duration && (timePassed = duration),
                                        draw(timePassed),
                                        timePassed < duration && requestAnimationFrame(animate)
                                })
                            }(function (timePassed) {
                                var active = years.getElementsByClassName("swiper-pagination-bullet-active")[0],
                                    shift = (years.getBoundingClientRect().left + years.clientWidth / 2 - active.getBoundingClientRect().left - active.clientWidth / 2) * timePassed / 400,
                                    translate = getComputedTranslateX(translater) + shift;
                                translater.style.transform = "translateX(" + translate + "px)"
                            },
                                400)
                    }
                    var years = el.getElementsByClassName("story-years")[0],
                        translater = years.getElementsByClassName("story-years__translater")[0],
                        yearsSet = years.getElementsByClassName("story-years__item"),
                        slider = el.getElementsByClassName("story-slider")[0],
                        prevBtn = el.getElementsByClassName("swiper-button-prev")[0],
                        nextBtn = el.getElementsByClassName("swiper-button-next")[0];
                    new Swiper(slider, {
                        nextButton: nextBtn,
                        prevButton: prevBtn,
                        onSlideChangeStart: slideChange,
                        onInit: slideChange,
                        autoHeight: !0,
                        pagination: translater,
                        paginationBulletRender: function (swipeSlider, index, className) {
                            return '<div class="story-years__item ' + className + '" data-index="' + index + '"><span>' + slider.getElementsByClassName("story-slider__item")[index].getElementsByTagName("h4")[0].innerHTML + "</span></div>"
                        },
                        paginationClickable: !0
                    })
                }(storySlider), sliderWithControl.length) for (var _i7 = 0; _i7 < sliderWithControl.length; _i7++) !
                    function (el) {
                        function sliderControl(e) {
                            for (var index = e.currentTarget.dataset.index,
                                _i9 = 0; _i9 < controls.length; _i9++) controls[_i9].classList.remove("active");
                            controlSwiper.slideTo(index),
                                e.currentTarget.classList.add("active")
                        }
                        function sliderChanged(swiper) {
                            var container = controls[swiper.activeIndex].parentNode,
                                style = window.getComputedStyle(container),
                                justify = style.getPropertyValue("justify-content"),
                                shift = -container.offsetWidth * swiper.activeIndex;
                            "flex-start" === justify && (container.style.transform = "translate(" + shift + "px, 0)");
                            for (var _i10 = 0; _i10 < controls.length; _i10++) controls[_i10].classList.remove("active");
                            controls[swiper.activeIndex].classList.add("active")
                        }
                        for (var controls = el.parentNode.getElementsByClassName("slider-control__item"), pagination = el.getElementsByClassName("swiper-pagination")[0], prevBtn = el.getElementsByClassName("swiper-button-prev")[0], nextBtn = el.getElementsByClassName("swiper-button-next")[0], controlSwiper = new Swiper(el, {
                            pagination: pagination,
                            nextButton: nextBtn,
                            prevButton: prevBtn,
                            onSlideChangeStart: sliderChanged
                        }), _i8 = 0; _i8 < controls.length; _i8++) controls[_i8].addEventListener("click", sliderControl)
                    }(sliderWithControl[_i7]);
            if (tabs.length) for (var _i11 = 0; _i11 < tabs.length; _i11++) !
                function (el) {
                    function tabsControl(e) {
                        for (var index = e.currentTarget.dataset.index,
                            _i13 = 0; _i13 < controls.length; _i13++) controls[_i13].classList.remove("active");
                        tabsSwiper.slideTo(index),
                            e.currentTarget.classList.add("active")
                    }
                    function tabsChanged(swiper) {
                        var container = controls[swiper.activeIndex].parentNode,
                            style = window.getComputedStyle(container),
                            justify = style.getPropertyValue("justify-content"),
                            shift = -container.offsetWidth * swiper.activeIndex;
                        "flex-start" === justify && (container.style.transform = "translate(" + shift + "px, 0)");
                        for (var _i14 = 0; _i14 < controls.length; _i14++) controls[_i14].classList.remove("active");
                        controls[swiper.activeIndex].classList.add("active")
                    }
                    for (var controls = el.parentNode.getElementsByClassName("tabs-control__item"), prevBtn = el.getElementsByClassName("swiper-button-prev")[0], nextBtn = el.getElementsByClassName("swiper-button-next")[0], tabsSwiper = new Swiper(el, {
                        onSlideChangeStart: tabsChanged,
                        nextButton: nextBtn,
                        prevButton: prevBtn
                    }), _i12 = 0; _i12 < controls.length; _i12++) controls[_i12].addEventListener("click", tabsControl)
                }(tabs[_i11]);
            navToggler.addEventListener("click", toggleMobileMenu),
                main.addEventListener("click", mainClick),
                $(".custom-select").each(Selectize),
                document.documentElement.clientWidth < 767 && ($(".mobile-custom-select").each(Selectize), statsSlider &&
                    function () {
                        var slides = statsSlider.getElementsByClassName("stats-item");
                        $(statsSlider).wrap('<div class="swiper-container slider"></div>'),
                            $(statsSlider).after('<div class="swiper-button-prev"></div>'),
                            $(statsSlider).after('<div class="swiper-button-next"></div>'),
                            statsSlider.classList.add("swiper-wrapper");
                        for (var _i15 = 0; _i15 < slides.length; _i15++) slides[_i15].classList.add("swiper-slide");
                        new Swiper(statsSlider.parentNode, {
                            autoplay: 5e3,
                            prevButton: ".swiper-button-prev",
                            nextButton: ".swiper-button-next"
                        })
                    }())
        }(jQuery),
        function () {
            var isWebkit = navigator.userAgent.toLowerCase().indexOf("webkit") > -1,
                isOpera = navigator.userAgent.toLowerCase().indexOf("opera") > -1,
                isIe = navigator.userAgent.toLowerCase().indexOf("msie") > -1; (isWebkit || isOpera || isIe) && document.getElementById && window.addEventListener && window.addEventListener("hashchange",
                    function () {
                        var element, id = location.hash.substring(1);
                        /^[A-z0-9_-]+$/.test(id) && (element = document.getElementById(id)) && (/^(?:a|select|input|button|textarea)$/i.test(element.tagName) || (element.tabIndex = -1), element.focus())
                    },
                    !1)
        }(),
        window.wdsWindowReady = {},
        function (window, $, app) {
            app.init = function () {
                app.cache(),
                    app.bindEvents()
            },
                app.cache = function () {
                    app.$c = {
                        window: $(window),
                        body: $(document.body)
                    }
                },
                app.bindEvents = function () {
                    app.$c.window.load(app.addBodyClass)
                },
                app.addBodyClass = function () {
                    app.$c.body.addClass("ready")
                },
                $(app.init)
        }(window, jQuery, window.wdsWindowReady);

//Internal Search Trigger
$(".search-form").submit(function (e) {
    $.ajax({
        type: "get",
        url: encodeURI("app/PacteraOWRendering/RegisterSearchTerm?searchKey=" + $(this).find(".search-form .search-field").val()),
    });
});;
$(document).ready(function () {
    $(".pacteraOW-swiper-container").each(function () {
        var slidesPerView = $(this).attr("slidesPerView");
        var slidesTotalView = parseInt($(this).attr("slidesTotalView"),10);
        var containerWidth = parseInt($(this).width(), 10);
        var prevOrNextVisible = true;
        if (slidesPerView == null) {
            slidesPerView=1;
        } else {
            slidesPerView = parseInt(slidesPerView, 10);
        }
        if (containerWidth > 1200) {
            if (slidesTotalView <= slidesPerView) {
                prevOrNextVisible = false;
            }
        } else if (containerWidth <= 1200 && containerWidth > 767) {
            if (slidesPerView > 4) {
                slidesPerView = 4;
            }
            if (slidesTotalView <= 4 && slidesTotalView <= slidesPerView) {
                prevOrNextVisible = false;
            }
        } else if (containerWidth <= 767 && containerWidth > 450) {
            if (slidesPerView > 2) {
                slidesPerView = 2;
            }
            if (slidesTotalView <= 2 && slidesTotalView <= slidesPerView) {
                prevOrNextVisible = false;
            }
        } else if (containerWidth <=450) {
            slidesPerView = 1;
            if (slidesTotalView <= 1) {
                prevOrNextVisible = false;
            }
        }
        if (!prevOrNextVisible) {
            $(this).addClass("recognition_awards_without_slider");
        } else {
            $(this).addClass("recognition_awards_with_slider");
        }
        var slidesPerColumn = $(this).attr("slidesPerColumn");
        if (slidesPerColumn == null) {
            slidesPerColumn = 1;
        }
        var slidesPerGroup = $(this).attr("slidesPerGroup");
        if (slidesPerGroup == null) {
            slidesPerGroup = 1;
        }
        var slidesSpaceBetween = $(this).attr("slidesSpaceBetween");
        if (slidesSpaceBetween == null) {
            slidesSpaceBetween = 0;
        }
        var allowLoop = $(this).attr("slideAllowLoop");
        if (allowLoop == null)
        {
            allowLoop = false;
        }
        var allowAutoPlay = 0;
        if ($(this).attr("allowAutoPlay") !== undefined) {
            if ($(this).attr("allowAutoPlay").toLowerCase() == "true") {
                allowAutoPlay = 3000;
            }
        }
        var allowSimulateTouch = true;
        if ($(this).attr("allowSimulateTouch")!=null && $(this).attr("allowSimulateTouch").toLowerCase() == "false") {
            allowSimulateTouch = false;
        }
        var videolist = $(this).find("video");
        var mySwiper = new Swiper(this, {
            pagination: $('.swiper-pagination', this),
            paginationClickable: true,
            autoplay: allowAutoPlay,
            loop: allowLoop,
            slidesPerView: slidesPerView,
            slidesPerColumn: slidesPerColumn,
            slidesPerGroup: slidesPerGroup,
            spaceBetween: slidesSpaceBetween,

            simulateTouch: allowSimulateTouch,
            nextButton: $('.swiper-button-next', this),
            prevButton: $('.swiper-button-prev', this),

            onSlideChangeEnd: function () {
                //轮播时暂停所有视频
                for (var k = 0 ; k < videolist.length; k++) {
                    videolist[k].pause();
                }
            }
        });

    });
});;
$(document).ready(function () {
    //重新获取video的swiper对象数组
    $(this).find(".PopupVideoIcon").each(function () {
        var playImg = $(this);
        var index = 1;
        /*点击单个play icon事件*/
        playImg.on("click", function () {
            if ($("body .PopupVideoitem" + index + "").length > 0) {
                var videoitem = $("body .PopupVideoitem" + index + "");
                videoitem[0].play();
                return;
            }
            index = index + 1;
            var videourl = $(this).attr("videoUrl");
            var goalId = $(this).attr("trackId");
            registerGoal(goalId);
            $("body").append("<div class=\"PopupVideoClass\"><img class=\"closeVideo\" src=\"/Img/closebox.png\"></img><video  class=\"banner__video buffered PopupVideoitem" + index + "\" src=\"" + videourl + "\"></video></div>");
            var videoitem = $("body .PopupVideoitem" + index + "");

            var CloseVideo = $(".PopupVideoClass .closeVideo");
            CloseVideo.on("click", function () {
                videoitem[0].pause();
                var parentEle = $(this).parent(".PopupVideoClass");
                parentEle.remove();
            });

            videoitem[0].play();
            /*暂停时事件*/
            videoitem.on("pause", function () {
                /*所有封面浮层show*/
                //playImg.show();
                // $(this).attr("style", "display:none");
                //$(this).attr("controls", false);
            });

            /*播放时事件*/
            videoitem.on("play", function () {
                //playImg.hide();
                var parentEle = $(this).parent(".PopupVideoClass");
                parentEle.show();
                $(this).attr("style", "");
                $(this).attr("poster", "");
                $(this).attr("controls", true);
            });

            /*停止时事件*/
            videoitem.on("ended", function () {
                this.pause();
            });
        });
    });
});
;
//function TabOnClick(obj) {
    //if ($(obj).hasClass("active")) { return; }
    //$(obj).siblings().removeClass("active");
    //$(obj).addClass("active");
    //var index = Number($(obj).attr("data-index"));
    //$($(obj).siblings()[0]).val(index);
    //$(obj).parent().siblings().removeClass("swiper-slide-active");
    //$($($(obj).parent().siblings()[0]).children().first().children()[index]).addClass("swiper-slide-active");
    //var position = -1080 * index;
    //$($(obj).parent().siblings()[0])[0].style.transform = "translate3d(" + position + "px, 0px, 0px)";
    //$($(obj).parent().siblings()[0])[0].style.transitionDuration = "1s";
//}

window.onresize = function () {
    var sliderLength = $('.pragraphSlider').length;
    if (sliderLength < 1) { return; }
    for (var i = 0 ; i < sliderLength; i++) {
        var activeIndex = $($('.pragraphSlider')[i]).find('.active').attr("data-index");
        $($($('.pragraphSlider')[i]).find('.active').siblings()[0]).val(activeIndex);
        var width = document.body.clientWidth;
        width = width >= 600 ? 1080 : width;
        var positionSrapper = -width * activeIndex;
        var positionControl = width >= 600 ? 0 : -width * activeIndex;
        //$($('.pragraphSlider')[0]).find('.swiper-wrapper')[0].style.transform = "translate3d(" + positionSrapper + "px, 0px, 0px)";
        $($('.pragraphSlider')[i]).find('.tabs-control')[0].style.transform = "translate3d(" + positionControl + "px, 0px, 0px)";
    }
};
$(document).ready(function ($) {
    var timelines = $('.cd-horizontal-timeline');

    if (timelines.length == 0) {
        return;
    }
    
    var eventsMinDistance = (checkMQ() == 'mobile') ? 85 : 215;
    initTimeline(timelines);

    function initTimeline(timelines) {
        timelines.each(function () {
            var timeline = $(this),
				timelineComponents = {};
            //cache timeline components 
            timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
            timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
            timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
            timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
            timelineComponents['timelineDates'] = parseDate(timelineComponents['timelineEvents']);
            timelineComponents['timelineNavigation'] = timeline.find('.cd-timeline-navigation');
            timelineComponents['eventsContent'] = timeline.children('.events-content');

            // when timeline date < 5, reset eventsMinDistance
            if (timelineComponents['timelineDates'].length == 2) {
                eventsMinDistance = (checkMQ() == 'mobile') ? 100 : 405;
            } else if (timelineComponents['timelineDates'].length == 3) {
                eventsMinDistance = (checkMQ() == 'mobile') ? 85 : 300;
            } else if (timelineComponents['timelineDates'].length == 4) {
                eventsMinDistance = (checkMQ() == 'mobile') ? 85 : 235;
            }

            //assign a left postion to the single events along the timeline
            setDatePosition(timelineComponents, eventsMinDistance);
            //assign a width to the timeline
            var timelineTotWidth = setTimelineWidth(timelineComponents, eventsMinDistance);
            //the timeline has been initialize - show it
            timeline.addClass('loaded');
            
            //focus first date
            timelineComponents['timelineEvents'].eq(0).addClass('selected');
            timelineComponents['eventsContent'].find('li').eq(0).addClass('selected');
            timelineComponents['timelineNavigation'].find('.prev').addClass('inactive');

            //detect click on the next arrow
            timelineComponents['timelineNavigation'].on('click', '.next', function (event) {
                event.preventDefault();
                updateSlide(timelineComponents, timelineTotWidth, 'next');
            });
            //detect click on the prev arrow
            timelineComponents['timelineNavigation'].on('click', '.prev', function (event) {
                event.preventDefault();
                updateSlide(timelineComponents, timelineTotWidth, 'prev');
            });
            //detect click on the a single event - show new event content
            timelineComponents['eventsWrapper'].on('click', 'a', function (event) {
                event.preventDefault();
                timelineComponents['timelineEvents'].removeClass('selected');
                $(this).addClass('selected');
                updateOlderEvents($(this));
                updateFilling($(this), timelineComponents['fillingLine'], timelineTotWidth);
                updateVisibleContent($(this), timelineComponents['eventsContent']);
            });

            //on swipe, show next/prev event content
            timelineComponents['eventsContent'].on('swipeleft', function () {
                var mq = checkMQ();
                (mq == 'mobile') && showNewContent(timelineComponents, timelineTotWidth, 'next');
            });
            timelineComponents['eventsContent'].on('swiperight', function () {
                var mq = checkMQ();
                (mq == 'mobile') && showNewContent(timelineComponents, timelineTotWidth, 'prev');
            });

            //keyboard navigation
            $(document).keyup(function (event) {
                if (event.which == '37' && elementInViewport(timeline.get(0))) {
                    showNewContent(timelineComponents, timelineTotWidth, 'prev');
                } else if (event.which == '39' && elementInViewport(timeline.get(0))) {
                    showNewContent(timelineComponents, timelineTotWidth, 'next');
                }
            });
        });
    }

    function updateSlide(timelineComponents, timelineTotWidth, string) {

        // check next/prev active
        var isInactive = false;
        if (timelineComponents['timelineNavigation'].find('.' + string).attr('class').indexOf("inactive") != -1) {
            isInactive = true;
        }

        //retrieve translateX value of timelineComponents['eventsWrapper']
        var translateValue = getTranslateValue(timelineComponents['eventsWrapper']),
			wrapperWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', ''));
        //translate the timeline to the left('next')/right('prev') 
        var newTranslateValue = (string == 'next')
			? translateTimeline(timelineComponents, translateValue - wrapperWidth + eventsMinDistance, wrapperWidth - timelineTotWidth)
			: translateTimeline(timelineComponents, translateValue + wrapperWidth - eventsMinDistance);

        if (isInactive) {
            return;
        }

        // set active on first point
        for (i = 0; i < timelineComponents['timelineDates'].length; i++) {
            var timelineDateLeft = Number(timelineComponents['timelineEvents'].eq(i).css('left').replace('px', ''));
            if (Math.abs(newTranslateValue) <= timelineDateLeft) {
                timelineComponents['timelineEvents'].eq(i).click();
                break;
            }
        }
    }

    function showNewContent(timelineComponents, timelineTotWidth, string) {
        //go from one event to the next/previous one
        var visibleContent = timelineComponents['eventsContent'].find('.selected'),
			newContent = (string == 'next') ? visibleContent.next() : visibleContent.prev();

        if (newContent.length > 0) { //if there's a next/prev event - show it
            var selectedDate = timelineComponents['eventsWrapper'].find('.selected'),
				newEvent = (string == 'next') ? selectedDate.parent('li').next('li').children('a') : selectedDate.parent('li').prev('li').children('a');

            updateFilling(newEvent, timelineComponents['fillingLine'], timelineTotWidth);
            updateVisibleContent(newEvent, timelineComponents['eventsContent']);
            newEvent.addClass('selected');
            selectedDate.removeClass('selected');
            updateOlderEvents(newEvent);
            updateTimelinePosition(string, newEvent, timelineComponents, timelineTotWidth);
        }
    }

    function updateTimelinePosition(string, event, timelineComponents, timelineTotWidth) {
        //translate timeline to the left/right according to the position of the selected event
        var eventStyle = window.getComputedStyle(event.get(0), null),
			eventLeft = Number(eventStyle.getPropertyValue("left").replace('px', '')),
			timelineWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', '')),
			timelineTotWidth = Number(timelineComponents['eventsWrapper'].css('width').replace('px', ''));
        var timelineTranslate = getTranslateValue(timelineComponents['eventsWrapper']);

        if ((string == 'next' && eventLeft > timelineWidth - timelineTranslate) || (string == 'prev' && eventLeft < -timelineTranslate)) {
            translateTimeline(timelineComponents, -eventLeft + timelineWidth / 2, timelineWidth - timelineTotWidth);
        }
    }

    function translateTimeline(timelineComponents, value, totWidth) {
        var eventsWrapper = timelineComponents['eventsWrapper'].get(0);
        value = (value > 0) ? 0 : value; //only negative translate value
        value = (!(typeof totWidth === 'undefined') && value < totWidth) ? totWidth : value; //do not translate more than timeline width
        setTransformValue(eventsWrapper, 'translateX', value + 'px');
        //update navigation arrows visibility
        (value == 0) ? timelineComponents['timelineNavigation'].find('.prev').addClass('inactive') : timelineComponents['timelineNavigation'].find('.prev').removeClass('inactive');
        (value == totWidth) ? timelineComponents['timelineNavigation'].find('.next').addClass('inactive') : timelineComponents['timelineNavigation'].find('.next').removeClass('inactive');

        return value;
    }

    function updateFilling(selectedEvent, filling, totWidth) {
        //change .filling-line length according to the selected event
        var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
			eventLeft = eventStyle.getPropertyValue("left"),
			eventWidth = eventStyle.getPropertyValue("width");
        eventLeft = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', '')) / 2;
        var scaleValue = eventLeft / totWidth;
        setTransformValue(filling.get(0), 'scaleX', scaleValue);
    }

    function setDatePosition(timelineComponents, min) {
        for (i = 0; i < timelineComponents['timelineDates'].length; i++) {
            timelineComponents['timelineEvents'].eq(i).css('left', (i + 1) * min + 'px');
        }
    }

    function setTimelineWidth(timelineComponents, width) {
        var totalWidth = (timelineComponents['timelineDates'].length + 1.2) * width;
        timelineComponents['eventsWrapper'].css('width', totalWidth + 'px');
        updateFilling(timelineComponents['timelineEvents'].eq(0), timelineComponents['fillingLine'], totalWidth);

        return totalWidth;
    }

    function updateVisibleContent(event, eventsContent) {
        var eventDate = event.data('date'),
			visibleContent = eventsContent.find('.selected'),
			selectedContent = eventsContent.find('[data-date="' + eventDate + '"]'),
			selectedContentHeight = selectedContent.height();

        if (selectedContent.index() == visibleContent.index()) {
            return;
        }

        if (selectedContent.index() > visibleContent.index()) {
            var classEnetering = 'selected enter-right',
				classLeaving = 'leave-left';
        } else {
            var classEnetering = 'selected enter-left',
				classLeaving = 'leave-right';
        }

        selectedContent.attr('class', classEnetering);
        visibleContent.attr('class', classLeaving).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
            visibleContent.removeClass('leave-right leave-left');
            selectedContent.removeClass('enter-left enter-right');
        });
        eventsContent.css('height', selectedContentHeight + 'px');
    }

    function updateOlderEvents(event) {
        event.parent('li').prevAll('li').children('a').addClass('older-event').end().end().nextAll('li').children('a').removeClass('older-event');
    }

    function getTranslateValue(timeline) {
        var timelineStyle = window.getComputedStyle(timeline.get(0), null),
			timelineTranslate = timelineStyle.getPropertyValue("-webkit-transform") ||
         		timelineStyle.getPropertyValue("-moz-transform") ||
         		timelineStyle.getPropertyValue("-ms-transform") ||
         		timelineStyle.getPropertyValue("-o-transform") ||
         		timelineStyle.getPropertyValue("transform");

        if (timelineTranslate.indexOf('(') >= 0) {
            var timelineTranslate = timelineTranslate.split('(')[1];
            timelineTranslate = timelineTranslate.split(')')[0];
            timelineTranslate = timelineTranslate.split(',');
            var translateValue = timelineTranslate[4];
        } else {
            var translateValue = 0;
        }

        return Number(translateValue);
    }

    function setTransformValue(element, property, value) {
        element.style["-webkit-transform"] = property + "(" + value + ")";
        element.style["-moz-transform"] = property + "(" + value + ")";
        element.style["-ms-transform"] = property + "(" + value + ")";
        element.style["-o-transform"] = property + "(" + value + ")";
        element.style["transform"] = property + "(" + value + ")";
    }

    //based on http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
    function parseDate(events) {
        var dateArrays = [];
        events.each(function () {
            dateArrays.push($(this).data('date'));
        });
        return dateArrays;
    }

    /*
		How to tell if a DOM element is visible in the current viewport?
		http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
	*/
    function elementInViewport(el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        while (el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }

        return (
		    top < (window.pageYOffset + window.innerHeight) &&
		    left < (window.pageXOffset + window.innerWidth) &&
		    (top + height) > window.pageYOffset &&
		    (left + width) > window.pageXOffset
		);
    }

    function checkMQ() {
        //check if mobile or desktop device
        return window.getComputedStyle(document.querySelector('.cd-horizontal-timeline'), '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "");
    }
});;
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){var FilterCSS=require("cssfilter").FilterCSS;var getDefaultCSSWhiteList=require("cssfilter").getDefaultWhiteList;var _=require("./util");function getDefaultWhiteList(){return{a:["target","href","title"],abbr:["title"],address:[],area:["shape","coords","href","alt"],article:[],aside:[],audio:["autoplay","controls","loop","preload","src"],b:[],bdi:["dir"],bdo:["dir"],big:[],blockquote:["cite"],br:[],caption:[],center:[],cite:[],code:[],col:["align","valign","span","width"],colgroup:["align","valign","span","width"],dd:[],del:["datetime"],details:["open"],div:[],dl:[],dt:[],em:[],font:["color","size","face"],footer:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],header:[],hr:[],i:[],img:["src","alt","title","width","height"],ins:["datetime"],li:[],mark:[],nav:[],ol:[],p:[],pre:[],s:[],section:[],small:[],span:[],sub:[],sup:[],strong:[],table:["width","border","align","valign"],tbody:["align","valign"],td:["width","rowspan","colspan","align","valign"],tfoot:["align","valign"],th:["width","rowspan","colspan","align","valign"],thead:["align","valign"],tr:["rowspan","align","valign"],tt:[],u:[],ul:[],video:["autoplay","controls","loop","preload","src","height","width"]}}var defaultCSSFilter=new FilterCSS;function onTag(tag,html,options){}function onIgnoreTag(tag,html,options){}function onTagAttr(tag,name,value){}function onIgnoreTagAttr(tag,name,value){}function escapeHtml(html){return html.replace(REGEXP_LT,"&lt;").replace(REGEXP_GT,"&gt;")}function safeAttrValue(tag,name,value,cssFilter){value=friendlyAttrValue(value);if(name==="href"||name==="src"){value=_.trim(value);if(value==="#")return"#";if(!(value.substr(0,7)==="http://"||value.substr(0,8)==="https://"||value.substr(0,7)==="mailto:"||value.substr(0,4)==="tel:"||value.substr(0,11)==="data:image/"||value.substr(0,6)==="ftp://"||value.substr(0,2)==="./"||value.substr(0,3)==="../"||value[0]==="#"||value[0]==="/")){return""}}else if(name==="background"){REGEXP_DEFAULT_ON_TAG_ATTR_4.lastIndex=0;if(REGEXP_DEFAULT_ON_TAG_ATTR_4.test(value)){return""}}else if(name==="style"){REGEXP_DEFAULT_ON_TAG_ATTR_7.lastIndex=0;if(REGEXP_DEFAULT_ON_TAG_ATTR_7.test(value)){return""}REGEXP_DEFAULT_ON_TAG_ATTR_8.lastIndex=0;if(REGEXP_DEFAULT_ON_TAG_ATTR_8.test(value)){REGEXP_DEFAULT_ON_TAG_ATTR_4.lastIndex=0;if(REGEXP_DEFAULT_ON_TAG_ATTR_4.test(value)){return""}}if(cssFilter!==false){cssFilter=cssFilter||defaultCSSFilter;value=cssFilter.process(value)}}value=escapeAttrValue(value);return value}var REGEXP_LT=/</g;var REGEXP_GT=/>/g;var REGEXP_QUOTE=/"/g;var REGEXP_QUOTE_2=/&quot;/g;var REGEXP_ATTR_VALUE_1=/&#([a-zA-Z0-9]*);?/gim;var REGEXP_ATTR_VALUE_COLON=/&colon;?/gim;var REGEXP_ATTR_VALUE_NEWLINE=/&newline;?/gim;var REGEXP_DEFAULT_ON_TAG_ATTR_3=/\/\*|\*\//gm;var REGEXP_DEFAULT_ON_TAG_ATTR_4=/((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a)\:/gi;var REGEXP_DEFAULT_ON_TAG_ATTR_5=/^[\s"'`]*(d\s*a\s*t\s*a\s*)\:/gi;var REGEXP_DEFAULT_ON_TAG_ATTR_6=/^[\s"'`]*(d\s*a\s*t\s*a\s*)\:\s*image\//gi;var REGEXP_DEFAULT_ON_TAG_ATTR_7=/e\s*x\s*p\s*r\s*e\s*s\s*s\s*i\s*o\s*n\s*\(.*/gi;var REGEXP_DEFAULT_ON_TAG_ATTR_8=/u\s*r\s*l\s*\(.*/gi;function escapeQuote(str){return str.replace(REGEXP_QUOTE,"&quot;")}function unescapeQuote(str){return str.replace(REGEXP_QUOTE_2,'"')}function escapeHtmlEntities(str){return str.replace(REGEXP_ATTR_VALUE_1,function replaceUnicode(str,code){return code[0]==="x"||code[0]==="X"?String.fromCharCode(parseInt(code.substr(1),16)):String.fromCharCode(parseInt(code,10))})}function escapeDangerHtml5Entities(str){return str.replace(REGEXP_ATTR_VALUE_COLON,":").replace(REGEXP_ATTR_VALUE_NEWLINE," ")}function clearNonPrintableCharacter(str){var str2="";for(var i=0,len=str.length;i<len;i++){str2+=str.charCodeAt(i)<32?" ":str.charAt(i)}return _.trim(str2)}function friendlyAttrValue(str){str=unescapeQuote(str);str=escapeHtmlEntities(str);str=escapeDangerHtml5Entities(str);str=clearNonPrintableCharacter(str);return str}function escapeAttrValue(str){str=escapeQuote(str);str=escapeHtml(str);return str}function onIgnoreTagStripAll(){return""}function StripTagBody(tags,next){if(typeof next!=="function"){next=function(){}}var isRemoveAllTag=!Array.isArray(tags);function isRemoveTag(tag){if(isRemoveAllTag)return true;return _.indexOf(tags,tag)!==-1}var removeList=[];var posStart=false;return{onIgnoreTag:function(tag,html,options){if(isRemoveTag(tag)){if(options.isClosing){var ret="[/removed]";var end=options.position+ret.length;removeList.push([posStart!==false?posStart:options.position,end]);posStart=false;return ret}else{if(!posStart){posStart=options.position}return"[removed]"}}else{return next(tag,html,options)}},remove:function(html){var rethtml="";var lastPos=0;_.forEach(removeList,function(pos){rethtml+=html.slice(lastPos,pos[0]);lastPos=pos[1]});rethtml+=html.slice(lastPos);return rethtml}}}function stripCommentTag(html){return html.replace(STRIP_COMMENT_TAG_REGEXP,"")}var STRIP_COMMENT_TAG_REGEXP=/<!--[\s\S]*?-->/g;function stripBlankChar(html){var chars=html.split("");chars=chars.filter(function(char){var c=char.charCodeAt(0);if(c===127)return false;if(c<=31){if(c===10||c===13)return true;return false}return true});return chars.join("")}exports.whiteList=getDefaultWhiteList();exports.getDefaultWhiteList=getDefaultWhiteList;exports.onTag=onTag;exports.onIgnoreTag=onIgnoreTag;exports.onTagAttr=onTagAttr;exports.onIgnoreTagAttr=onIgnoreTagAttr;exports.safeAttrValue=safeAttrValue;exports.escapeHtml=escapeHtml;exports.escapeQuote=escapeQuote;exports.unescapeQuote=unescapeQuote;exports.escapeHtmlEntities=escapeHtmlEntities;exports.escapeDangerHtml5Entities=escapeDangerHtml5Entities;exports.clearNonPrintableCharacter=clearNonPrintableCharacter;exports.friendlyAttrValue=friendlyAttrValue;exports.escapeAttrValue=escapeAttrValue;exports.onIgnoreTagStripAll=onIgnoreTagStripAll;exports.StripTagBody=StripTagBody;exports.stripCommentTag=stripCommentTag;exports.stripBlankChar=stripBlankChar;exports.cssFilter=defaultCSSFilter;exports.getDefaultCSSWhiteList=getDefaultCSSWhiteList},{"./util":4,cssfilter:8}],2:[function(require,module,exports){var DEFAULT=require("./default");var parser=require("./parser");var FilterXSS=require("./xss");function filterXSS(html,options){var xss=new FilterXSS(options);return xss.process(html)}exports=module.exports=filterXSS;exports.filterXSS=filterXSS;exports.FilterXSS=FilterXSS;for(var i in DEFAULT)exports[i]=DEFAULT[i];for(var i in parser)exports[i]=parser[i];if(typeof window!=="undefined"){window.filterXSS=module.exports}function isWorkerEnv(){return typeof self!=="undefined"&&typeof DedicatedWorkerGlobalScope!=="undefined"&&self instanceof DedicatedWorkerGlobalScope}if(isWorkerEnv()){self.filterXSS=module.exports}},{"./default":1,"./parser":3,"./xss":5}],3:[function(require,module,exports){var _=require("./util");function getTagName(html){var i=_.spaceIndex(html);if(i===-1){var tagName=html.slice(1,-1)}else{var tagName=html.slice(1,i+1)}tagName=_.trim(tagName).toLowerCase();if(tagName.slice(0,1)==="/")tagName=tagName.slice(1);if(tagName.slice(-1)==="/")tagName=tagName.slice(0,-1);return tagName}function isClosing(html){return html.slice(0,2)==="</"}function parseTag(html,onTag,escapeHtml){"use strict";var rethtml="";var lastPos=0;var tagStart=false;var quoteStart=false;var currentPos=0;var len=html.length;var currentTagName="";var currentHtml="";for(currentPos=0;currentPos<len;currentPos++){var c=html.charAt(currentPos);if(tagStart===false){if(c==="<"){tagStart=currentPos;continue}}else{if(quoteStart===false){if(c==="<"){rethtml+=escapeHtml(html.slice(lastPos,currentPos));tagStart=currentPos;lastPos=currentPos;continue}if(c===">"){rethtml+=escapeHtml(html.slice(lastPos,tagStart));currentHtml=html.slice(tagStart,currentPos+1);currentTagName=getTagName(currentHtml);rethtml+=onTag(tagStart,rethtml.length,currentTagName,currentHtml,isClosing(currentHtml));lastPos=currentPos+1;tagStart=false;continue}if((c==='"'||c==="'")&&html.charAt(currentPos-1)==="="){quoteStart=c;continue}}else{if(c===quoteStart){quoteStart=false;continue}}}}if(lastPos<html.length){rethtml+=escapeHtml(html.substr(lastPos))}return rethtml}var REGEXP_ILLEGAL_ATTR_NAME=/[^a-zA-Z0-9_:\.\-]/gim;function parseAttr(html,onAttr){"use strict";var lastPos=0;var retAttrs=[];var tmpName=false;var len=html.length;function addAttr(name,value){name=_.trim(name);name=name.replace(REGEXP_ILLEGAL_ATTR_NAME,"").toLowerCase();if(name.length<1)return;var ret=onAttr(name,value||"");if(ret)retAttrs.push(ret)}for(var i=0;i<len;i++){var c=html.charAt(i);var v,j;if(tmpName===false&&c==="="){tmpName=html.slice(lastPos,i);lastPos=i+1;continue}if(tmpName!==false){if(i===lastPos&&(c==='"'||c==="'")&&html.charAt(i-1)==="="){j=html.indexOf(c,i+1);if(j===-1){break}else{v=_.trim(html.slice(lastPos+1,j));addAttr(tmpName,v);tmpName=false;i=j;lastPos=i+1;continue}}}if(/\s|\n|\t/.test(c)){html=html.replace(/\s|\n|\t/g," ");if(tmpName===false){j=findNextEqual(html,i);if(j===-1){v=_.trim(html.slice(lastPos,i));addAttr(v);tmpName=false;lastPos=i+1;continue}else{i=j-1;continue}}else{j=findBeforeEqual(html,i-1);if(j===-1){v=_.trim(html.slice(lastPos,i));v=stripQuoteWrap(v);addAttr(tmpName,v);tmpName=false;lastPos=i+1;continue}else{continue}}}}if(lastPos<html.length){if(tmpName===false){addAttr(html.slice(lastPos))}else{addAttr(tmpName,stripQuoteWrap(_.trim(html.slice(lastPos))))}}return _.trim(retAttrs.join(" "))}function findNextEqual(str,i){for(;i<str.length;i++){var c=str[i];if(c===" ")continue;if(c==="=")return i;return-1}}function findBeforeEqual(str,i){for(;i>0;i--){var c=str[i];if(c===" ")continue;if(c==="=")return i;return-1}}function isQuoteWrapString(text){if(text[0]==='"'&&text[text.length-1]==='"'||text[0]==="'"&&text[text.length-1]==="'"){return true}else{return false}}function stripQuoteWrap(text){if(isQuoteWrapString(text)){return text.substr(1,text.length-2)}else{return text}}exports.parseTag=parseTag;exports.parseAttr=parseAttr},{"./util":4}],4:[function(require,module,exports){module.exports={indexOf:function(arr,item){var i,j;if(Array.prototype.indexOf){return arr.indexOf(item)}for(i=0,j=arr.length;i<j;i++){if(arr[i]===item){return i}}return-1},forEach:function(arr,fn,scope){var i,j;if(Array.prototype.forEach){return arr.forEach(fn,scope)}for(i=0,j=arr.length;i<j;i++){fn.call(scope,arr[i],i,arr)}},trim:function(str){if(String.prototype.trim){return str.trim()}return str.replace(/(^\s*)|(\s*$)/g,"")},spaceIndex:function(str){var reg=/\s|\n|\t/;var match=reg.exec(str);return match?match.index:-1}}},{}],5:[function(require,module,exports){var FilterCSS=require("cssfilter").FilterCSS;var DEFAULT=require("./default");var parser=require("./parser");var parseTag=parser.parseTag;var parseAttr=parser.parseAttr;var _=require("./util");function isNull(obj){return obj===undefined||obj===null}function getAttrs(html){var i=_.spaceIndex(html);if(i===-1){return{html:"",closing:html[html.length-2]==="/"}}html=_.trim(html.slice(i+1,-1));var isClosing=html[html.length-1]==="/";if(isClosing)html=_.trim(html.slice(0,-1));return{html:html,closing:isClosing}}function shallowCopyObject(obj){var ret={};for(var i in obj){ret[i]=obj[i]}return ret}function FilterXSS(options){options=shallowCopyObject(options||{});if(options.stripIgnoreTag){if(options.onIgnoreTag){console.error('Notes: cannot use these two options "stripIgnoreTag" and "onIgnoreTag" at the same time')}options.onIgnoreTag=DEFAULT.onIgnoreTagStripAll}options.whiteList=options.whiteList||DEFAULT.whiteList;options.onTag=options.onTag||DEFAULT.onTag;options.onTagAttr=options.onTagAttr||DEFAULT.onTagAttr;options.onIgnoreTag=options.onIgnoreTag||DEFAULT.onIgnoreTag;options.onIgnoreTagAttr=options.onIgnoreTagAttr||DEFAULT.onIgnoreTagAttr;options.safeAttrValue=options.safeAttrValue||DEFAULT.safeAttrValue;options.escapeHtml=options.escapeHtml||DEFAULT.escapeHtml;this.options=options;if(options.css===false){this.cssFilter=false}else{options.css=options.css||{};this.cssFilter=new FilterCSS(options.css)}}FilterXSS.prototype.process=function(html){html=html||"";html=html.toString();if(!html)return"";var me=this;var options=me.options;var whiteList=options.whiteList;var onTag=options.onTag;var onIgnoreTag=options.onIgnoreTag;var onTagAttr=options.onTagAttr;var onIgnoreTagAttr=options.onIgnoreTagAttr;var safeAttrValue=options.safeAttrValue;var escapeHtml=options.escapeHtml;var cssFilter=me.cssFilter;if(options.stripBlankChar){html=DEFAULT.stripBlankChar(html)}if(!options.allowCommentTag){html=DEFAULT.stripCommentTag(html)}var stripIgnoreTagBody=false;if(options.stripIgnoreTagBody){var stripIgnoreTagBody=DEFAULT.StripTagBody(options.stripIgnoreTagBody,onIgnoreTag);onIgnoreTag=stripIgnoreTagBody.onIgnoreTag}var retHtml=parseTag(html,function(sourcePosition,position,tag,html,isClosing){var info={sourcePosition:sourcePosition,position:position,isClosing:isClosing,isWhite:whiteList.hasOwnProperty(tag)};var ret=onTag(tag,html,info);if(!isNull(ret))return ret;if(info.isWhite){if(info.isClosing){return"</"+tag+">"}var attrs=getAttrs(html);var whiteAttrList=whiteList[tag];var attrsHtml=parseAttr(attrs.html,function(name,value){var isWhiteAttr=_.indexOf(whiteAttrList,name)!==-1;var ret=onTagAttr(tag,name,value,isWhiteAttr);if(!isNull(ret))return ret;if(isWhiteAttr){value=safeAttrValue(tag,name,value,cssFilter);if(value){return name+'="'+value+'"'}else{return name}}else{var ret=onIgnoreTagAttr(tag,name,value,isWhiteAttr);if(!isNull(ret))return ret;return}});var html="<"+tag;if(attrsHtml)html+=" "+attrsHtml;if(attrs.closing)html+=" /";html+=">";return html}else{var ret=onIgnoreTag(tag,html,info);if(!isNull(ret))return ret;return escapeHtml(html)}},escapeHtml);if(stripIgnoreTagBody){retHtml=stripIgnoreTagBody.remove(retHtml)}return retHtml};module.exports=FilterXSS},{"./default":1,"./parser":3,"./util":4,cssfilter:8}],6:[function(require,module,exports){var DEFAULT=require("./default");var parseStyle=require("./parser");var _=require("./util");function isNull(obj){return obj===undefined||obj===null}function shallowCopyObject(obj){var ret={};for(var i in obj){ret[i]=obj[i]}return ret}function FilterCSS(options){options=shallowCopyObject(options||{});options.whiteList=options.whiteList||DEFAULT.whiteList;options.onAttr=options.onAttr||DEFAULT.onAttr;options.onIgnoreAttr=options.onIgnoreAttr||DEFAULT.onIgnoreAttr;options.safeAttrValue=options.safeAttrValue||DEFAULT.safeAttrValue;this.options=options}FilterCSS.prototype.process=function(css){css=css||"";css=css.toString();if(!css)return"";var me=this;var options=me.options;var whiteList=options.whiteList;var onAttr=options.onAttr;var onIgnoreAttr=options.onIgnoreAttr;var safeAttrValue=options.safeAttrValue;var retCSS=parseStyle(css,function(sourcePosition,position,name,value,source){var check=whiteList[name];var isWhite=false;if(check===true)isWhite=check;else if(typeof check==="function")isWhite=check(value);else if(check instanceof RegExp)isWhite=check.test(value);if(isWhite!==true)isWhite=false;value=safeAttrValue(name,value);if(!value)return;var opts={position:position,sourcePosition:sourcePosition,source:source,isWhite:isWhite};if(isWhite){var ret=onAttr(name,value,opts);if(isNull(ret)){return name+":"+value}else{return ret}}else{var ret=onIgnoreAttr(name,value,opts);if(!isNull(ret)){return ret}}});return retCSS};module.exports=FilterCSS},{"./default":7,"./parser":9,"./util":10}],7:[function(require,module,exports){function getDefaultWhiteList(){var whiteList={};whiteList["align-content"]=false;whiteList["align-items"]=false;whiteList["align-self"]=false;whiteList["alignment-adjust"]=false;whiteList["alignment-baseline"]=false;whiteList["all"]=false;whiteList["anchor-point"]=false;whiteList["animation"]=false;whiteList["animation-delay"]=false;whiteList["animation-direction"]=false;whiteList["animation-duration"]=false;whiteList["animation-fill-mode"]=false;whiteList["animation-iteration-count"]=false;whiteList["animation-name"]=false;whiteList["animation-play-state"]=false;whiteList["animation-timing-function"]=false;whiteList["azimuth"]=false;whiteList["backface-visibility"]=false;whiteList["background"]=true;whiteList["background-attachment"]=true;whiteList["background-clip"]=true;whiteList["background-color"]=true;whiteList["background-image"]=true;whiteList["background-origin"]=true;whiteList["background-position"]=true;whiteList["background-repeat"]=true;whiteList["background-size"]=true;whiteList["baseline-shift"]=false;whiteList["binding"]=false;whiteList["bleed"]=false;whiteList["bookmark-label"]=false;whiteList["bookmark-level"]=false;whiteList["bookmark-state"]=false;whiteList["border"]=true;whiteList["border-bottom"]=true;whiteList["border-bottom-color"]=true;whiteList["border-bottom-left-radius"]=true;whiteList["border-bottom-right-radius"]=true;whiteList["border-bottom-style"]=true;whiteList["border-bottom-width"]=true;whiteList["border-collapse"]=true;whiteList["border-color"]=true;whiteList["border-image"]=true;whiteList["border-image-outset"]=true;whiteList["border-image-repeat"]=true;whiteList["border-image-slice"]=true;whiteList["border-image-source"]=true;whiteList["border-image-width"]=true;whiteList["border-left"]=true;whiteList["border-left-color"]=true;whiteList["border-left-style"]=true;whiteList["border-left-width"]=true;whiteList["border-radius"]=true;whiteList["border-right"]=true;whiteList["border-right-color"]=true;whiteList["border-right-style"]=true;whiteList["border-right-width"]=true;whiteList["border-spacing"]=true;whiteList["border-style"]=true;whiteList["border-top"]=true;whiteList["border-top-color"]=true;whiteList["border-top-left-radius"]=true;whiteList["border-top-right-radius"]=true;whiteList["border-top-style"]=true;whiteList["border-top-width"]=true;whiteList["border-width"]=true;whiteList["bottom"]=false;whiteList["box-decoration-break"]=true;whiteList["box-shadow"]=true;whiteList["box-sizing"]=true;whiteList["box-snap"]=true;whiteList["box-suppress"]=true;whiteList["break-after"]=true;whiteList["break-before"]=true;whiteList["break-inside"]=true;whiteList["caption-side"]=false;whiteList["chains"]=false;whiteList["clear"]=true;whiteList["clip"]=false;whiteList["clip-path"]=false;whiteList["clip-rule"]=false;whiteList["color"]=true;whiteList["color-interpolation-filters"]=true;whiteList["column-count"]=false;whiteList["column-fill"]=false;whiteList["column-gap"]=false;whiteList["column-rule"]=false;whiteList["column-rule-color"]=false;whiteList["column-rule-style"]=false;whiteList["column-rule-width"]=false;whiteList["column-span"]=false;whiteList["column-width"]=false;whiteList["columns"]=false;whiteList["contain"]=false;whiteList["content"]=false;whiteList["counter-increment"]=false;whiteList["counter-reset"]=false;whiteList["counter-set"]=false;whiteList["crop"]=false;whiteList["cue"]=false;whiteList["cue-after"]=false;whiteList["cue-before"]=false;whiteList["cursor"]=false;whiteList["direction"]=false;whiteList["display"]=true;whiteList["display-inside"]=true;whiteList["display-list"]=true;whiteList["display-outside"]=true;whiteList["dominant-baseline"]=false;whiteList["elevation"]=false;whiteList["empty-cells"]=false;whiteList["filter"]=false;whiteList["flex"]=false;whiteList["flex-basis"]=false;whiteList["flex-direction"]=false;whiteList["flex-flow"]=false;whiteList["flex-grow"]=false;whiteList["flex-shrink"]=false;whiteList["flex-wrap"]=false;whiteList["float"]=false;whiteList["float-offset"]=false;whiteList["flood-color"]=false;whiteList["flood-opacity"]=false;whiteList["flow-from"]=false;whiteList["flow-into"]=false;whiteList["font"]=true;whiteList["font-family"]=true;whiteList["font-feature-settings"]=true;whiteList["font-kerning"]=true;whiteList["font-language-override"]=true;whiteList["font-size"]=true;whiteList["font-size-adjust"]=true;whiteList["font-stretch"]=true;whiteList["font-style"]=true;whiteList["font-synthesis"]=true;whiteList["font-variant"]=true;whiteList["font-variant-alternates"]=true;whiteList["font-variant-caps"]=true;whiteList["font-variant-east-asian"]=true;whiteList["font-variant-ligatures"]=true;whiteList["font-variant-numeric"]=true;whiteList["font-variant-position"]=true;whiteList["font-weight"]=true;whiteList["grid"]=false;whiteList["grid-area"]=false;whiteList["grid-auto-columns"]=false;whiteList["grid-auto-flow"]=false;whiteList["grid-auto-rows"]=false;whiteList["grid-column"]=false;whiteList["grid-column-end"]=false;whiteList["grid-column-start"]=false;whiteList["grid-row"]=false;whiteList["grid-row-end"]=false;whiteList["grid-row-start"]=false;whiteList["grid-template"]=false;whiteList["grid-template-areas"]=false;whiteList["grid-template-columns"]=false;whiteList["grid-template-rows"]=false;whiteList["hanging-punctuation"]=false;whiteList["height"]=true;whiteList["hyphens"]=false;whiteList["icon"]=false;whiteList["image-orientation"]=false;whiteList["image-resolution"]=false;whiteList["ime-mode"]=false;whiteList["initial-letters"]=false;whiteList["inline-box-align"]=false;whiteList["justify-content"]=false;whiteList["justify-items"]=false;whiteList["justify-self"]=false;whiteList["left"]=false;whiteList["letter-spacing"]=true;whiteList["lighting-color"]=true;whiteList["line-box-contain"]=false;whiteList["line-break"]=false;whiteList["line-grid"]=false;whiteList["line-height"]=false;whiteList["line-snap"]=false;whiteList["line-stacking"]=false;whiteList["line-stacking-ruby"]=false;whiteList["line-stacking-shift"]=false;whiteList["line-stacking-strategy"]=false;whiteList["list-style"]=true;whiteList["list-style-image"]=true;whiteList["list-style-position"]=true;whiteList["list-style-type"]=true;whiteList["margin"]=true;whiteList["margin-bottom"]=true;whiteList["margin-left"]=true;whiteList["margin-right"]=true;whiteList["margin-top"]=true;whiteList["marker-offset"]=false;whiteList["marker-side"]=false;whiteList["marks"]=false;whiteList["mask"]=false;whiteList["mask-box"]=false;whiteList["mask-box-outset"]=false;whiteList["mask-box-repeat"]=false;whiteList["mask-box-slice"]=false;whiteList["mask-box-source"]=false;whiteList["mask-box-width"]=false;whiteList["mask-clip"]=false;whiteList["mask-image"]=false;whiteList["mask-origin"]=false;whiteList["mask-position"]=false;whiteList["mask-repeat"]=false;whiteList["mask-size"]=false;whiteList["mask-source-type"]=false;whiteList["mask-type"]=false;whiteList["max-height"]=true;whiteList["max-lines"]=false;whiteList["max-width"]=true;whiteList["min-height"]=true;whiteList["min-width"]=true;whiteList["move-to"]=false;whiteList["nav-down"]=false;whiteList["nav-index"]=false;whiteList["nav-left"]=false;whiteList["nav-right"]=false;whiteList["nav-up"]=false;whiteList["object-fit"]=false;whiteList["object-position"]=false;whiteList["opacity"]=false;whiteList["order"]=false;whiteList["orphans"]=false;whiteList["outline"]=false;whiteList["outline-color"]=false;whiteList["outline-offset"]=false;whiteList["outline-style"]=false;whiteList["outline-width"]=false;whiteList["overflow"]=false;whiteList["overflow-wrap"]=false;whiteList["overflow-x"]=false;whiteList["overflow-y"]=false;whiteList["padding"]=true;whiteList["padding-bottom"]=true;whiteList["padding-left"]=true;whiteList["padding-right"]=true;whiteList["padding-top"]=true;whiteList["page"]=false;whiteList["page-break-after"]=false;whiteList["page-break-before"]=false;whiteList["page-break-inside"]=false;whiteList["page-policy"]=false;whiteList["pause"]=false;whiteList["pause-after"]=false;whiteList["pause-before"]=false;whiteList["perspective"]=false;whiteList["perspective-origin"]=false;whiteList["pitch"]=false;whiteList["pitch-range"]=false;whiteList["play-during"]=false;whiteList["position"]=false;whiteList["presentation-level"]=false;whiteList["quotes"]=false;whiteList["region-fragment"]=false;whiteList["resize"]=false;whiteList["rest"]=false;whiteList["rest-after"]=false;whiteList["rest-before"]=false;whiteList["richness"]=false;whiteList["right"]=false;whiteList["rotation"]=false;whiteList["rotation-point"]=false;whiteList["ruby-align"]=false;whiteList["ruby-merge"]=false;whiteList["ruby-position"]=false;whiteList["shape-image-threshold"]=false;whiteList["shape-outside"]=false;whiteList["shape-margin"]=false;whiteList["size"]=false;whiteList["speak"]=false;whiteList["speak-as"]=false;whiteList["speak-header"]=false;whiteList["speak-numeral"]=false;whiteList["speak-punctuation"]=false;whiteList["speech-rate"]=false;whiteList["stress"]=false;whiteList["string-set"]=false;whiteList["tab-size"]=false;whiteList["table-layout"]=false;whiteList["text-align"]=true;whiteList["text-align-last"]=true;whiteList["text-combine-upright"]=true;whiteList["text-decoration"]=true;whiteList["text-decoration-color"]=true;whiteList["text-decoration-line"]=true;whiteList["text-decoration-skip"]=true;whiteList["text-decoration-style"]=true;whiteList["text-emphasis"]=true;whiteList["text-emphasis-color"]=true;whiteList["text-emphasis-position"]=true;whiteList["text-emphasis-style"]=true;whiteList["text-height"]=true;whiteList["text-indent"]=true;whiteList["text-justify"]=true;whiteList["text-orientation"]=true;whiteList["text-overflow"]=true;whiteList["text-shadow"]=true;whiteList["text-space-collapse"]=true;whiteList["text-transform"]=true;whiteList["text-underline-position"]=true;whiteList["text-wrap"]=true;whiteList["top"]=false;whiteList["transform"]=false;whiteList["transform-origin"]=false;whiteList["transform-style"]=false;whiteList["transition"]=false;whiteList["transition-delay"]=false;whiteList["transition-duration"]=false;whiteList["transition-property"]=false;whiteList["transition-timing-function"]=false;whiteList["unicode-bidi"]=false;whiteList["vertical-align"]=false;whiteList["visibility"]=false;whiteList["voice-balance"]=false;whiteList["voice-duration"]=false;whiteList["voice-family"]=false;whiteList["voice-pitch"]=false;whiteList["voice-range"]=false;whiteList["voice-rate"]=false;whiteList["voice-stress"]=false;whiteList["voice-volume"]=false;whiteList["volume"]=false;whiteList["white-space"]=false;whiteList["widows"]=false;whiteList["width"]=true;whiteList["will-change"]=false;whiteList["word-break"]=true;whiteList["word-spacing"]=true;whiteList["word-wrap"]=true;whiteList["wrap-flow"]=false;whiteList["wrap-through"]=false;whiteList["writing-mode"]=false;whiteList["z-index"]=false;return whiteList}function onAttr(name,value,options){}function onIgnoreAttr(name,value,options){}var REGEXP_URL_JAVASCRIPT=/javascript\s*\:/gim;function safeAttrValue(name,value){if(REGEXP_URL_JAVASCRIPT.test(value))return"";return value}exports.whiteList=getDefaultWhiteList();exports.getDefaultWhiteList=getDefaultWhiteList;exports.onAttr=onAttr;exports.onIgnoreAttr=onIgnoreAttr;exports.safeAttrValue=safeAttrValue},{}],8:[function(require,module,exports){var DEFAULT=require("./default");var FilterCSS=require("./css");function filterCSS(html,options){var xss=new FilterCSS(options);return xss.process(html)}exports=module.exports=filterCSS;exports.FilterCSS=FilterCSS;for(var i in DEFAULT)exports[i]=DEFAULT[i];if(typeof window!=="undefined"){window.filterCSS=module.exports}},{"./css":6,"./default":7}],9:[function(require,module,exports){var _=require("./util");function parseStyle(css,onAttr){css=_.trimRight(css);if(css[css.length-1]!==";")css+=";";var cssLength=css.length;var isParenthesisOpen=false;var lastPos=0;var i=0;var retCSS="";function addNewAttr(){if(!isParenthesisOpen){var source=_.trim(css.slice(lastPos,i));var j=source.indexOf(":");if(j!==-1){var name=_.trim(source.slice(0,j));var value=_.trim(source.slice(j+1));if(name){var ret=onAttr(lastPos,retCSS.length,name,value,source);if(ret)retCSS+=ret+"; "}}}lastPos=i+1}for(;i<cssLength;i++){var c=css[i];if(c==="/"&&css[i+1]==="*"){var j=css.indexOf("*/",i+2);if(j===-1)break;i=j+1;lastPos=i+1;isParenthesisOpen=false}else if(c==="("){isParenthesisOpen=true}else if(c===")"){isParenthesisOpen=false}else if(c===";"){if(isParenthesisOpen){}else{addNewAttr()}}else if(c==="\n"){addNewAttr()}}return _.trim(retCSS)}module.exports=parseStyle},{"./util":10}],10:[function(require,module,exports){module.exports={indexOf:function(arr,item){var i,j;if(Array.prototype.indexOf){return arr.indexOf(item)}for(i=0,j=arr.length;i<j;i++){if(arr[i]===item){return i}}return-1},forEach:function(arr,fn,scope){var i,j;if(Array.prototype.forEach){return arr.forEach(fn,scope)}for(i=0,j=arr.length;i<j;i++){fn.call(scope,arr[i],i,arr)}},trim:function(str){if(String.prototype.trim){return str.trim()}return str.replace(/(^\s*)|(\s*$)/g,"")},trimRight:function(str){if(String.prototype.trimRight){return str.trimRight()}return str.replace(/(\s*$)/g,"")}}},{}]},{},[2]);;
