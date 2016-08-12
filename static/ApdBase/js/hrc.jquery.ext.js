var HRCommon_Base_Url = "http://hrc.oa.com/v1.1";
//by funnliny modify 'live'->'on' 20131031
// by yubai modify 1360 20140331

//#region 公共插件部分

   //#region 扩展jQuery的JSON功能 begin

jQuery.extend(
    {
        // 转换为json 字符串
        toJSON: function (object) {
            var type = typeof object;
            if ('object' == type) {
                if (Array == object.constructor)
                    type = 'array';
                else if (RegExp == object.constructor)
                    type = 'regexp';
                else
                    type = 'object';
            }
            switch (type) {
                case 'undefined':
                case 'unknown':
                    return;
                    break;
                case 'function':
                case 'boolean':
                case 'regexp':
                    return object.toString();
                    break;
                case 'number':
                    return isFinite(object) ? object.toString() : 'null';
                    break;
                case 'string':
                    return '"' + object.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g,
                    function () {
                        var a = arguments[0];
                        return (a == '\n') ? '\\n' :
                            (a == '\r') ? '\\r' :
                                (a == '\t') ? '\\t' : ""
                    }) + '"';
                    break;
                case 'object':
                    if (object === null) return 'null';
                    var results = [];
                    for (var property in object) {
                        var value = jQuery.toJSON(object[property]);
                        if (value !== undefined)
                            results.push(jQuery.toJSON(property) + ':' + value);
                    }
                    return '{' + results.join(',') + '}';
                    break;
                case 'array':
                    var results = [];
                    for (var i = 0; i < object.length; i++) {
                        var value = jQuery.toJSON(object[i]);
                        if (value !== undefined) results.push(value);
                    }
                    return '[' + results.join(',') + ']';
                    break;
            }
        }
    });
jQuery.extend({
        //转换为json 对象
        evalJSON: function (strJson) {
            return eval("(" + strJson + ")");
        }
    });

   //#endregion 扩展jQuery的JSON功能 end

    if (jQuery.colorbox) {}
    else
        {
        //#region ColorBox    插件 开始

        // ColorBox v1.3.16 - a full featured, light-weight, customizable lightbox based on jQuery 1.3+
        // Copyright (c) 2011 Jack Moore - jack@colorpowered.com
        // Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
        (function($, document, window) {
            var
                // ColorBox Default Settings.	
                // See http://colorpowered.com/colorbox for details.
                defaults = {
                    transition: "elastic",
                    speed: 300,
                    width: false,
                    initialWidth: "600",
                    innerWidth: false,
                    maxWidth: false,
                    height: false,
                    initialHeight: "450",
                    innerHeight: false,
                    maxHeight: false,
                    scalePhotos: true,
                    scrolling: true,
                    inline: false,
                    html: false,
                    iframe: false,
                    fastIframe: true,
                    photo: false,
                    href: false,
                    title: false,
                    rel: false,
                    opacity: 0.9,
                    preloading: true,
                    current: "image {current} of {total}",
                    previous: "previous",
                    next: "next",
                    close: "close",
                    open: false,
                    returnFocus: true,
                    loop: true,
                    slideshow: false,
                    slideshowAuto: true,
                    slideshowSpeed: 2500,
                    slideshowStart: "start slideshow",
                    slideshowStop: "stop slideshow",
                    onOpen: false,
                    onLoad: false,
                    onComplete: false,
                    onCleanup: false,
                    onClosed: false,
                    overlayClose: true,
                    escKey: true,
                    arrowKey: true
                },

            // Abstracting the HTML and event identifiers for easy rebranding
                colorbox = 'colorbox',
                prefix = 'cbox',

            // Events	
                event_open = prefix + '_open',
                event_load = prefix + '_load',
                event_complete = prefix + '_complete',
                event_cleanup = prefix + '_cleanup',
                event_closed = prefix + '_closed',
                event_purge = prefix + '_purge',

            // Special Handling for IE
                isIE = $.browser.msie && !$.support.opacity, // feature detection alone gave a false positive on at least one phone browser and on some development versions of Chrome.
                isIE6 = isIE && $.browser.version < 7,
                event_ie6 = prefix + '_IE6',

            // Cached jQuery Object Variables
                $overlay,
                $box,
                $wrap,
                $content,
                $topBorder,
                $leftBorder,
                $rightBorder,
                $bottomBorder,
                $related,
                $window,
                $loaded,
                $loadingBay,
                $loadingOverlay,
                $title,
                $current,
                $slideshow,
                $next,
                $prev,
                $close,
                $groupControls,

            // Variables for cached values or use across multiple functions
                settings = { },
                interfaceHeight,
                interfaceWidth,
                loadedHeight,
                loadedWidth,
                element,
                index,
                photo,
                open,
                active,
                closing = false,

                publicMethod,
                boxElement = prefix + 'Element';

            // ****************
            // HELPER FUNCTIONS
            // ****************

            // jQuery object generator to reduce code size
            function $div(id, cssText) {
                var div = document.createElement('div');
                div.id = id ? prefix + id : false;
                div.style.cssText = cssText || false;
                return $(div);
            }

            // Convert % values to pixels
            function setSize(size, dimension) {
                dimension = dimension === 'x' ? $window.width() : $window.height();
                return (typeof size === 'string') ? Math.round(( /%/ .test(size) ? (dimension / 100) * parseInt(size, 10) : parseInt(size, 10))) : size;
            }

            // Checks an href to see if it is a photo.
            // There is a force photo option (photo: true) for hrefs that cannot be matched by this regex.
            function isImage(url) {
                return settings.photo || /\.(gif|png|jpg|jpeg|bmp)(?:\?([^#]*))?(?:#(\.*))?$/i .test(url);
            }

            // Assigns function results to their respective settings.  This allows functions to be used as values.
            function process(settings) {
                for (var i in settings) {
                    if ($.isFunction(settings[i]) && i.substring(0, 2) !== 'on') { // checks to make sure the function isn't one of the callbacks, they will be handled at the appropriate time.
                        settings[i] = settings[i].call(element);
                    }
                }
                settings.rel = settings.rel || element.rel || 'nofollow';
                settings.href = $.trim(settings.href || $(element).attr('href'));
                settings.title = settings.title || element.title;
            }

            function trigger(event, callback) {
                if (callback) {
                    callback.call(element);
                }
                $.event.trigger(event);
            }

            // Slideshow functionality
            function slideshow() {
                var
                    timeOut,
                    className = prefix + "Slideshow_",
                    click = "click." + prefix,
                    start,
                    stop,
                    clear;

                if (settings.slideshow && $related[1]) {
                    start = function() {
                        $slideshow
                            .text(settings.slideshowStop)
                            .unbind(click)
                            .bind(event_complete, function() {
                                if (index < $related.length - 1 || settings.loop) {
                                    timeOut = setTimeout(publicMethod.next, settings.slideshowSpeed);
                                }
                            })
                            .bind(event_load, function() {
                                clearTimeout(timeOut);
                            })
                            .one(click + ' ' + event_cleanup, stop);
                        $box.removeClass(className + "off").addClass(className + "on");
                        timeOut = setTimeout(publicMethod.next, settings.slideshowSpeed);
                    };

                    stop = function() {
                        clearTimeout(timeOut);
                        $slideshow
                            .text(settings.slideshowStart)
                            .unbind([event_complete, event_load, event_cleanup, click].join(' '))
                            .one(click, start);
                        $box.removeClass(className + "on").addClass(className + "off");
                    };

                    if (settings.slideshowAuto) {
                        start();
                    } else {
                        stop();
                    }
                }
            }

            function launch(elem) {
                if (!closing) {

                    element = elem;

                    process($.extend(settings, $.data(element, colorbox)));

                    $related = $(element);

                    index = 0;

                    if (settings.rel !== 'nofollow') {
                        $related = $('.' + boxElement).filter(function() {
                            var relRelated = $.data(this, colorbox).rel || this.rel;
                            return (relRelated === settings.rel);
                        });
                        index = $related.index(element);

                        // Check direct calls to ColorBox.
                        if (index === -1) {
                            $related = $related.add(element);
                            index = $related.length - 1;
                        }
                    }

                    if (!open) {
                        open = active = true; // Prevents the page-change action from queuing up if the visitor holds down the left or right keys.

                        $box.show();

                        if (settings.returnFocus) {
                            try {
                                element.blur();
                                $(element).one(event_closed, function() {
                                    try {
                                        this.focus();
                                    } catch(e) {
                                        // do nothing
                                    }
                                });
                            } catch(e) {
                                // do nothing
                            }
                        }

                        // +settings.opacity avoids a problem in IE when using non-zero-prefixed-string-values, like '.5'
                        $overlay.css({ "opacity": +settings.opacity, "cursor": settings.overlayClose ? "pointer" : "auto" }).show();

                        // Opens inital empty ColorBox prior to content being loaded. 
                        settings.w = setSize(settings.initialWidth, 'x');
                        settings.h = setSize(settings.initialHeight, 'y');
                        publicMethod.position(0);

                        if (isIE6) {
                            $window.bind('resize.' + event_ie6 + ' scroll.' + event_ie6, function() {
                                // $overlay.css({ width: $window.width(), height: $window.height(), top: $window.scrollTop(), left: $window.scrollLeft() });
                                $overlay.css({ width: $window.width(), height: $window.height(), top: document.body.scrollTop + document.documentElement.scrollTop, left: $window.scrollLeft() });
                            }).trigger('resize.' + event_ie6);
                        }

                        trigger(event_open, settings.onOpen);

                        $groupControls.add($title).hide();

                        $close.html(settings.close).show();
                    }

                    publicMethod.load(true);
                }
            }

            // ****************
            // PUBLIC FUNCTIONS
            // Usage format: $.fn.colorbox.close();
            // Usage from within an iframe: parent.$.fn.colorbox.close();
            // ****************

            publicMethod = $.fn[colorbox] = $[colorbox] = function(options, callback) {
                var $this = this, autoOpen;

                if (!$this[0] && $this.selector) { // if a selector was given and it didn't match any elements, go ahead and exit.
                    return $this;
                }

                options = options || { };

                if (callback) {
                    options.onComplete = callback;
                }

                if (!$this[0] || $this.selector === undefined) { // detects $.colorbox() and $.fn.colorbox()
                    $this = $('<a/>');
                    options.open = true; // assume an immediate open
                }

                $this.each(function() {
                    $.data(this, colorbox, $.extend({ }, $.data(this, colorbox) || defaults, options));
                    $(this).addClass(boxElement);
                });

                autoOpen = options.open;

                if ($.isFunction(autoOpen)) {
                    autoOpen = autoOpen.call($this);
                }

                if (autoOpen) {
                    launch($this[0]);
                }

                return $this;
            };

            // Initialize ColorBox: store common calculations, preload the interface graphics, append the html.
            // This preps colorbox for a speedy open when clicked, and lightens the burdon on the browser by only
            // having to run once, instead of each time colorbox is opened.
            publicMethod.init = function() {
                // Create & Append jQuery Objects
                $window = $(window);
                $box = $div().attr({ id: colorbox, 'class': isIE ? prefix + (isIE6 ? 'IE6' : 'IE') : '' });
                $overlay = $div("Overlay", isIE6 ? 'position:absolute' : '').hide();

                $wrap = $div("Wrapper");
                $content = $div("Content").append(
                    $loaded = $div("LoadedContent", 'width:0; height:0; overflow:hidden'),
                    $loadingOverlay = $div("LoadingOverlay").add($div("LoadingGraphic")),
                    $title = $div("Title"),
                    $current = $div("Current"),
                    $next = $div("Next"),
                    $prev = $div("Previous"),
                    $slideshow = $div("Slideshow").bind(event_open, slideshow),
                    $close = $div("Close")
		);
                $wrap.append(// The 3x3 Grid that makes up ColorBox
                    $div().append(
                        $div("TopLeft"),
                        $topBorder = $div("TopCenter"),
                        $div("TopRight")
			),
                    $div(false, 'clear:left').append(
                        $leftBorder = $div("MiddleLeft"),
                        $content,
                        $rightBorder = $div("MiddleRight")
			),
                    $div(false, 'clear:left').append(
                        $div("BottomLeft"),
                        $bottomBorder = $div("BottomCenter"),
                        $div("BottomRight")
			)
		).children().children().css({ 'float': 'left' });

                $loadingBay = $div(false, 'position:absolute; width:9999px; visibility:hidden; display:none');

                $('body').prepend($overlay, $box.append($wrap, $loadingBay));

                $content.children()
                    .hover(function() {
                        $(this).addClass('hover');
                    }, function() {
                        $(this).removeClass('hover');
                    }).addClass('hover');

                // Cache values needed for size calculations
                interfaceHeight = $topBorder.height() + $bottomBorder.height() + $content.outerHeight(true) - $content.height(); //Subtraction needed for IE6
                interfaceWidth = $leftBorder.width() + $rightBorder.width() + $content.outerWidth(true) - $content.width();
                loadedHeight = $loaded.outerHeight(true);
                loadedWidth = $loaded.outerWidth(true);

                // Setting padding to remove the need to do size conversions during the animation step.
                $box.css({ "padding-bottom": interfaceHeight, "padding-right": interfaceWidth }).hide();

                // Setup button events.
                $next.click(function() {
                    publicMethod.next();
                });
                $prev.click(function() {
                    publicMethod.prev();
                });
                $close.click(function() {
                    publicMethod.close();
                });

                $groupControls = $next.add($prev).add($current).add($slideshow);

                // Adding the 'hover' class allowed the browser to load the hover-state
                // background graphics.  The class can now can be removed.
                $content.children().removeClass('hover');

                $('.' + boxElement).on('click', function(e) {
                    // checks to see if it was a non-left mouse-click and for clicks modified with ctrl, shift, or alt.
                    if (!((e.button !== 0 && typeof e.button !== 'undefined') || e.ctrlKey || e.shiftKey || e.altKey)) {
                        e.preventDefault();
                        launch(this);
                    }
                });

                $overlay.click(function() {
                    if (settings.overlayClose) {
                        publicMethod.close();
                    }
                });

                // Set Navigation Key Bindings
                $(document).bind("keydown", function(e) {
                    if (open && settings.escKey && e.keyCode === 27) {
                        e.preventDefault();
                        publicMethod.close();
                    }
                    if (open && settings.arrowKey && !active && $related[1]) {
                        if (e.keyCode === 37 && (index || settings.loop)) {
                            e.preventDefault();
                            $prev.click();
                        } else if (e.keyCode === 39 && (index < $related.length - 1 || settings.loop)) {
                            e.preventDefault();
                            $next.click();
                        }
                    }
                });
            };

            publicMethod.remove = function() {
                $box.add($overlay).remove();
                $('.' + boxElement).die('click').removeData(colorbox).removeClass(boxElement);
            };

            publicMethod.position = function(speed, loadedCallback) {
                var clientheight = document.compatMode == 'BackCompat' ? document.body.clientHeight : document.documentElement.clientHeight;
                var
                    animate_speed,
                // keeps the top and left positions within the browser's viewport. document.body.scrollTop || document.documentElement.scrollTop+
                    posTop = Math.max(clientheight - settings.h - loadedHeight - interfaceHeight, 0) / 2 + $window.scrollTop(),
                    posLeft = Math.max($window.width() - settings.w - loadedWidth - interfaceWidth, 0) / 2 + $window.scrollLeft();

                // setting the speed to 0 to reduce the delay between same-sized content.
                animate_speed = ($box.width() === settings.w + loadedWidth && $box.height() === settings.h + loadedHeight) ? 0 : speed;

                // this gives the wrapper plenty of breathing room so it's floated contents can move around smoothly,
                // but it has to be shrank down around the size of div#colorbox when it's done.  If not,
                // it can invoke an obscure IE bug when using iframes.
                $wrap[0].style.width = $wrap[0].style.height = "9999px";

                function modalDimensions(that) {
                    // loading overlay height has to be explicitly set for IE6.
                    $topBorder[0].style.width = $bottomBorder[0].style.width = $content[0].style.width = that.style.width;
                    $loadingOverlay[0].style.height = $loadingOverlay[1].style.height = $content[0].style.height = $leftBorder[0].style.height = $rightBorder[0].style.height = that.style.height;
                }
                //hongwei modify
                $box.dequeue().animate({ width: settings.w + loadedWidth, height: settings.h + loadedHeight + (document.compatMode == 'BackCompat' ? 25 : 0), top: posTop, left: posLeft }, {
                    duration: animate_speed,
                    complete: function() {
                        modalDimensions(this);

                        active = false;

                        // shrink the wrapper down to exactly the size of colorbox to avoid a bug in IE's iframe implementation.
                        $wrap[0].style.width = (settings.w + loadedWidth + interfaceWidth) + "px";
                        $wrap[0].style.height = (settings.h + loadedHeight + interfaceHeight) + "px";
                        if (loadedCallback) {
                            loadedCallback();
                        }
                    },
                    step: function() {
                        modalDimensions(this);
                    }
                });
            };

            publicMethod.resize = function(options) {
                if (open) {
                    options = options || { };

                    if (options.width) {
                        settings.w = setSize(options.width, 'x') - loadedWidth - interfaceWidth;
                    }
                    if (options.innerWidth) {
                        settings.w = setSize(options.innerWidth, 'x');
                    }
                    $loaded.css({ width: settings.w });

                    if (options.height) {
                        settings.h = setSize(options.height, 'y') - loadedHeight - interfaceHeight;
                    }
                    if (options.innerHeight) {
                        settings.h = setSize(options.innerHeight, 'y');
                    }
                    if (!options.innerHeight && !options.height) {
                        var $child = $loaded.wrapInner("<div style='overflow:auto'></div>").children(); // temporary wrapper to get an accurate estimate of just how high the total content should be.
                        settings.h = $child.height();
                        $child.replaceWith($child.children()); // ditch the temporary wrapper div used in height calculation
                    }
                    $loaded.css({ height: settings.h });

                    publicMethod.position(settings.transition === "none" ? 0 : settings.speed);
                }
            };

            publicMethod.prep = function(object) {
                if (!open) {
                    return;
                }

                var speed = settings.transition === "none" ? 0 : settings.speed;

                $window.unbind('resize.' + prefix);
                $loaded.remove();
                $loaded = $div('LoadedContent').html(object);

                function getWidth() {
                    settings.w = settings.w || $loaded.width();
                    settings.w = settings.mw && settings.mw < settings.w ? settings.mw : settings.w;
                    return settings.w;
                }
                function getHeight() {
                    settings.h = settings.h || $loaded.height();
                    settings.h = settings.mh && settings.mh < settings.h ? settings.mh : settings.h;
                    return settings.h;
                }

                $loaded.hide()
                    .appendTo($loadingBay.show())// content has to be appended to the DOM for accurate size calculations.
                    .css({ width: getWidth(), overflow: settings.scrolling ? 'auto' : 'hidden' })
                    .css({ height: getHeight() })// sets the height independently from the width in case the new width influences the value of height.
                    .prependTo($content);

                $loadingBay.hide();

                // floating the IMG removes the bottom line-height and fixed a problem where IE miscalculates the width of the parent element as 100% of the document width.
                //$(photo).css({'float': 'none', marginLeft: 'auto', marginRight: 'auto'});

                $(photo).css({ 'float': 'none' });

                // Hides SELECT elements in IE6 because they would otherwise sit on top of the overlay.
                if (isIE6) {
                    $('select').not($box.find('select')).filter(function() {
                        return this.style.visibility !== 'hidden';
                    }).css({ 'visibility': 'hidden' }).one(event_cleanup, function() {
                        this.style.visibility = 'inherit';
                    });
                }

                function setPosition(s) {
                    publicMethod.position(s, function() {
                        var prev, prevSrc, next, nextSrc, total = $related.length, iframe, complete;

                        if (!open) {
                            return;
                        }

                        complete = function() {
                            $loadingOverlay.hide();
                            trigger(event_complete, settings.onComplete);
                        };

                        if (isIE) {
                            //This fadeIn helps the bicubic resampling to kick-in.
                            if (photo) {
                                $loaded.fadeIn(100);
                            }
                        }

                        $title.html(settings.title).add($loaded).show();

                        if (total > 1) { // handle grouping
                            if (typeof settings.current === "string") {
                                $current.html(settings.current.replace( /\{current\}/ , index + 1).replace( /\{total\}/ , total)).show();
                            }

                            $next[(settings.loop || index < total - 1) ? "show" : "hide"]().html(settings.next);
                            $prev[(settings.loop || index) ? "show" : "hide"]().html(settings.previous);

                            prev = index ? $related[index - 1] : $related[total - 1];
                            next = index < total - 1 ? $related[index + 1] : $related[0];

                            if (settings.slideshow) {
                                $slideshow.show();
                            }

                            // Preloads images within a rel group
                            if (settings.preloading) {
                                nextSrc = $.data(next, colorbox).href || next.href;
                                prevSrc = $.data(prev, colorbox).href || prev.href;

                                nextSrc = $.isFunction(nextSrc) ? nextSrc.call(next) : nextSrc;
                                prevSrc = $.isFunction(prevSrc) ? prevSrc.call(prev) : prevSrc;

                                if (isImage(nextSrc)) {
                                    $('<img/>')[0].src = nextSrc;
                                }

                                if (isImage(prevSrc)) {
                                    $('<img/>')[0].src = prevSrc;
                                }
                            }
                        } else {
                            $groupControls.hide();
                        }

                        if (settings.iframe) {
                            iframe = $('<iframe />').addClass(prefix + 'Iframe')[0];

                            if (settings.fastIframe) {
                                complete();
                            } else {
                                $(iframe).load(complete);
                            }
                            iframe.name = prefix + (+new Date());
                            iframe.src = settings.href;
                            iframe.setAttribute("frameborder", "0", 0);

                            if (!settings.scrolling) {
                                iframe.scrolling = "no";
                            }

                            if (isIE) {
                                iframe.allowTransparency = "true";
                            }

                            $(iframe).appendTo($loaded).one(event_purge, function() {
                                iframe.src = "//about:blank";
                            });
                        } else {
                            complete();
                        }

                        if (settings.transition === 'fade') {
                            $box.fadeTo(speed, 1, function() {
                                $box[0].style.filter = "";
                            });
                        } else {
                            $box[0].style.filter = "";
                        }

                        $window.bind('resize.' + prefix, function() {
                            publicMethod.position(0);
                        });
                    });
                }

                if (settings.transition === 'fade') {
                    $box.fadeTo(speed, 0, function() {
                        setPosition(0);
                    });
                } else {
                    setPosition(speed);
                }
            };

            publicMethod.load = function(launched) {
                var href, setResize, prep = publicMethod.prep;

                active = true;

                photo = false;

                element = $related[index];

                if (!launched) {
                    process($.extend(settings, $.data(element, colorbox)));
                }

                trigger(event_purge);

                trigger(event_load, settings.onLoad);

                settings.h = settings.height ?
                    setSize(settings.height, 'y') - loadedHeight - interfaceHeight :
                    settings.innerHeight && setSize(settings.innerHeight, 'y');

                settings.w = settings.width ?
                    setSize(settings.width, 'x') - loadedWidth - interfaceWidth :
                    settings.innerWidth && setSize(settings.innerWidth, 'x');

                // Sets the minimum dimensions for use in image scaling
                settings.mw = settings.w;
                settings.mh = settings.h;

                // Re-evaluate the minimum width and height based on maxWidth and maxHeight values.
                // If the width or height exceed the maxWidth or maxHeight, use the maximum values instead.
                if (settings.maxWidth) {
                    settings.mw = setSize(settings.maxWidth, 'x') - loadedWidth - interfaceWidth;
                    settings.mw = settings.w && settings.w < settings.mw ? settings.w : settings.mw;
                }
                if (settings.maxHeight) {
                    settings.mh = setSize(settings.maxHeight, 'y') - loadedHeight - interfaceHeight;
                    settings.mh = settings.h && settings.h < settings.mh ? settings.h : settings.mh;
                }

                href = settings.href;

                $loadingOverlay.show();

                if (settings.inline) {
                    // Inserts an empty placeholder where inline content is being pulled from.
                    // An event is bound to put inline content back when ColorBox closes or loads new content.
                    $div().hide().insertBefore($(href)[0]).one(event_purge, function() {
                        $(this).replaceWith($loaded.children());
                    });
                    prep($(href));
                } else if (settings.iframe) {
                    // IFrame element won't be added to the DOM until it is ready to be displayed,
                    // to avoid problems with DOM-ready JS that might be trying to run in that iframe.
                    prep(" ");
                } else if (settings.html) {
                    prep(settings.html);
                } else if (isImage(href)) {
                    $(photo = new Image())
                        .addClass(prefix + 'Photo')
                        .error(function() {
                            settings.title = false;
                            prep($div('Error').text('This image could not be loaded'));
                        })
                        .load(function() {
                            var percent;
                            photo.onload = null; //stops animated gifs from firing the onload repeatedly.

                            if (settings.scalePhotos) {
                                setResize = function() {
                                    photo.height -= photo.height * percent;
                                    photo.width -= photo.width * percent;
                                };
                                if (settings.mw && photo.width > settings.mw) {
                                    percent = (photo.width - settings.mw) / photo.width;
                                    setResize();
                                }
                                if (settings.mh && photo.height > settings.mh) {
                                    percent = (photo.height - settings.mh) / photo.height;
                                    setResize();
                                }
                            }

                            if (settings.h) {
                                photo.style.marginTop = Math.max(settings.h - photo.height, 0) / 2 + 'px';
                            }

                            if ($related[1] && (index < $related.length - 1 || settings.loop)) {
                                photo.style.cursor = 'pointer';
                                photo.onclick = function() {
                                    publicMethod.next();
                                };
                            }

                            if (isIE) {
                                photo.style.msInterpolationMode = 'bicubic';
                            }

                            setTimeout(function() { // A pause because Chrome will sometimes report a 0 by 0 size otherwise.
                                prep(photo);
                            }, 1);
                        });

                    setTimeout(function() { // A pause because Opera 10.6+ will sometimes not run the onload function otherwise.
                        photo.src = href;
                    }, 1);
                } else if (href) {
                    $loadingBay.load(href, function(data, status, xhr) {
                        prep(status === 'error' ? $div('Error').text('Request unsuccessful: ' + xhr.statusText) : $(this).contents());
                    });
                }
            };

            // Navigates to the next page/image in a set.
            publicMethod.next = function() {
                if (!active) {
                    index = index < $related.length - 1 ? index + 1 : 0;
                    publicMethod.load();
                }
            };

            publicMethod.prev = function() {
                if (!active) {
                    index = index ? index - 1 : $related.length - 1;
                    publicMethod.load();
                }
            };

            // Note: to use this within an iframe use the following format: parent.$.fn.colorbox.close();
            publicMethod.close = function() {
                if (open && !closing) {

                    closing = true;

                    open = false;

                    trigger(event_cleanup, settings.onCleanup);

                    $window.unbind('.' + prefix + ' .' + event_ie6);

                    $overlay.fadeTo(200, 0);

                    $box.stop().fadeTo(300, 0, function() {

                        $box.add($overlay).css({ 'opacity': 1, cursor: 'auto' }).hide();

                        //这里可能导致fiefxo下无法关闭。或长期不无法关闭。所以先注释
                        //使用iframe模式下
                        //trigger(event_purge);

                        $loaded.remove();

                        setTimeout(function() {
                            closing = false;
                            trigger(event_closed, settings.onClosed);
                        }, 1);
                    });
                }
            };

            // A method for fetching the current element ColorBox is referencing.
            // returns a jQuery object.
            publicMethod.element = function() {
                return $(element);
            };

            publicMethod.settings = defaults;

            // Initializes ColorBox when the DOM has loaded
            $(publicMethod.init);

        }(jQuery, document, this));


        //#endregion ColorBox 插件 结束
    }

   //#region Autocomplete 插件  开始
    
    /*
* Autocomplete - jQuery plugin 1.0.2
*
* Copyright (c) 2007 Dylan Verheul, Dan G. Switzer, Anjesh Tuladhar, J?rn Zaefferer
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
* Revision: jQueryID: jquery.autocomplete.js 5747 2008-06-25 18:30:55Z joern.zaefferer jQuery
* bestshuai 2009.8 : patch for chinese input and multiselect
* tim 2010.9 : patch support for textarea and auto adjust width
*/
(function (jQuery) {
    jQuery.fn.extend({
        endInsPoint: function () {
            var elem = this[0];
            if (elem && (elem.tagName == "TEXTAREA" || elem.type.toLowerCase() == "text")) {
                if (jQuery.browser.msie) {
                    var rng = elem.createTextRange();
                    rng.moveStart("character", elem.value.length);
                    rng.select();
                } else {
                    elem.selectionEnd = elem.value.length;
                    elem.selectionStart = elem.value.length;
                }
            }
        }
    });

    jQuery.fn.extend({
        autocomplete: function (urlOrData, options) {
            if (this.attr('isautocompleteinited') == 'true') return;
            this.attr('isautocompleteinited', 'true');
            var isUrl = typeof urlOrData == "string";
            options = jQuery.extend({}, jQuery.Autocompleter.defaults, {
                url: isUrl ? urlOrData : null,
                data: isUrl ? null : urlOrData,
                delay: isUrl ? jQuery.Autocompleter.defaults.delay : 10,
                max: options && !options.scroll ? 10 : 500
            }, options);

            // if highlight is set to false, replace it with a do-nothing function
            options.highlight = options.highlight || function (value) { return value; };

            // if the formatMatch option is not specified, then use formatItem for backwards compatibility
            options.formatMatch = options.formatMatch || options.formatItem;

            return this.each(function () {
                new jQuery.Autocompleter(this, options);
            });
        },
        result: function (handler) {
            return this.bind("result", handler);
        },
        search: function (handler) {
            return this.trigger("search", [handler]);
        },
        showList: function (q) {
            return this.trigger("showList", [q]);
        },
        flushCache: function () {
            return this.trigger("flushCache");
        },
        setOptions: function (options) {
            return this.trigger("setOptions", [options]);
        },
        unautocomplete: function () {
            return this.trigger("unautocomplete");
        },
        reloadUrl: function (url) {
            return this.trigger("reloadUrl", url);
        }
    });

    jQuery.Autocompleter = function (input, options) {

        var KEY = {
            UP: 38,
            DOWN: 40,
            DEL: 46,
            TAB: 9,
            RETURN: 13,
            ESC: 27,
            COMMA: 188,
            PAGEUP: 33,
            PAGEDOWN: 34,
            BACKSPACE: 8
        };



        // Create jQuery object for input element
        var jQueryinput = jQuery(input).attr("autocomplete", "off").addClass(options.inputClass);


        var timeout;
        var previousValue = "";
        var cache = jQuery.Autocompleter.Cache(options);
        var hasFocus = 0;
        var lastKeyPressCode;
        var config = {
            mouseDownOnSelect: false
        };

        var select = jQuery.Autocompleter.Select(options, input, selectCurrent, config);

        var blockSubmit;

        // prevent form submit in opera when selecting with return key
        jQuery.browser.opera && jQuery(input.form).bind("submit.autocomplete", function () {
            if (blockSubmit) {
                blockSubmit = false;
                return false;
            }
        });

        //定时检查内容 tim
        var checkTimer;
        //由于输入法的原因在输入文字后会无法响应keydown进件 tim
        checkTimer = setInterval(function () {
            //clearTimeout(jQueryinput.attr('keyupTimeout'));
            //jQueryinput.attr('keyupTimeout', setTimeout(onChange, options.delay));

            onChange(0, false);
            //document.title = new Date();
        }, 500);



        // only opera doesn't trigger keydown multiple times while pressed, others don't work with keypress at all
        jQueryinput.bind("text keydown.autocomplete", function (event) {
            // track last key pressed
            if (event.keyCode == 0 && event.charCode) {
                event.keyCode = event.charCode;
            }
            lastKeyPressCode = event.keyCode;
            // 强制处理分号，在firefox和ie下分别是59和186 PS: ms真讨厌，一个键还有几个码
            if (options.multiple && (event.keyCode == 59 || event.keyCode == 186)) {
                var val = jQueryinput.val();
                if (jQuery.trim(val) == '' || val.charAt(val.length - 1) == options.multipleSeparator) {
                    return false;
                }
                event.keyCode = KEY.RETURN;
            }
            switch (event.keyCode) {

                case KEY.UP:
                    event.preventDefault();
                    if (select.visible()) {
                        select.prev();
                    } else {
                        onChange(0, true);
                    }
                    break;

                case KEY.DOWN:
                    event.preventDefault();
                    if (select.visible()) {
                        select.next();
                    } else {
                        onChange(0, true);
                    }
                    break;

                case KEY.PAGEUP:
                    event.preventDefault();
                    if (select.visible()) {
                        select.pageUp();
                    } else {
                        onChange(0, true);
                    }
                    break;

                case KEY.PAGEDOWN:
                    event.preventDefault();
                    if (select.visible()) {
                        select.pageDown();
                    } else {
                        onChange(0, true);
                    }
                    break;

                // matches also semicolon                                                                                                                                                                                                                                                                                                                        
                case options.multiple && jQuery.trim(options.multipleSeparator) == "," && KEY.COMMA:
                case KEY.TAB:
                case KEY.RETURN:
                    if (selectCurrent()) {
                        // stop default to prevent a form submit, Opera needs special handling
                        event.preventDefault();
                        blockSubmit = true;
                        return false;
                    }
                    break;

                case KEY.ESC:
                    select.hide();
                    break;
                /*
                default:
                clearTimeout(timeout);
                timeout = setTimeout(onChange, options.delay);
                break;
                */ 
            }
        }).bind('text keyup.autocomplete', function (event) {//for firefox
            if (event.keyCode != KEY.RETURN && event.keyCode != 59 && event.keyCode != 186) {
                clearTimeout(jQueryinput.attr('keyupTimeout'));
                jQueryinput.attr('keyupTimeout', setTimeout(onChange, options.delay));
            }
        }).focus(function () {
            // track whether the field has focus, we shouldn't process any
            // results if the field no longer has focus
            hasFocus++;
        }).blur(function () {
            hasFocus = 0;
            if (!config.mouseDownOnSelect) {
                hideResults();
            }

        }).click(function () {
            // show select when clicking in a focused field
            if (hasFocus++ > 1 && !select.visible()) {
                onChange(0, true);
            }
        }).bind("search", function () {
            // TODO why not just specifying both arguments?
            var fn = (arguments.length > 1) ? arguments[1] : null;
            function findValueCallback(q, data) {
                var result;
                if (data && data.length) {
                    // 在这里添加一条特别规则
                    //当返回有值。而且只有一条的情况下。
                    //则认为选择正确而进行自动选择
                    if (data.length == 1) {
                        result = data[0];
                    }

                    //如果存在有id值则直接进行id值match
                    var reg = /(\(\d+\))/gi;
                    var idStr = '';
                    if (reg.test(q)) {
                        idStr = RegExp.$1;
                    }

                    for (var i = 0; i < data.length; i++) {
                        if (idStr != '') {
                            if (data[i].result.toLowerCase().indexOf(idStr) > -1) {
                                result = data[i];
                                break;
                            }
                        }

                        if (data[i].result.toLowerCase() == q.toLowerCase()) {
                            result = data[i];
                            break;
                        }
                    }


                }

                if (typeof fn == "function") fn(result);
                else jQueryinput.trigger("result", result && [result.data, result.value]);
            }
            jQuery.each(trimWords(jQueryinput.val()), function (i, value) {
                request(value, findValueCallback, findValueCallback);
            });
        }).bind("flushCache", function () {
            cache.flush();
        }).bind("setOptions", function () {
            jQuery.extend(options, arguments[1]);
            // if we've updated the data, repopulate
            if ("data" in arguments[1])
                cache.populate();
        }).bind("unautocomplete", function () {
            select.unbind();
            jQueryinput.unbind();
            jQueryinput.attr('isautocompleteinited', 'false');
            jQuery(input.form).unbind(".autocomplete");
            clearInterval(checkTimer);

        }).bind("showList", function () {
            showList(arguments[1]);
        }).bind("reloadUrl", function () {
            options.url = arguments[1];

            document.title = arguments[1];
        });


        function selectCurrent() {
            var selected = select.selected();
            if (!selected)
                return false;

            var v = selected.result;
            previousValue = v;

            if (options.multiple) {
                var text = jQuery.trim(jQueryinput.val());
                if (text.lastIndexOf(options.multipleSeparator) == (text.length - 1)) {
                    text += v;
                    jQueryinput.val(text);
                }
                var words = trimWords(jQueryinput.val());
                if (words.length > 1) {
                    var prewords = words.slice(0, words.length - 1);
                    var isfound = false;
                    for (var i = prewords.length - 1; i >= 0; i--) {
                        if (prewords[i] == v) {
                            isfound = true;
                            break;
                        }
                    }
                    if (isfound == false) {
                        v = prewords.join(options.multipleSeparator) + options.multipleSeparator + v;
                    }
                    else {
                        v = prewords.join(options.multipleSeparator);
                    }
                }
                v += options.multipleSeparator;
            }

            jQueryinput.val(v);
            hideResultsNow();
            jQueryinput.trigger("result", [selected.data, selected.value]);
            return true;
        }

        function showList(q) {
            //取消可能在途的blur的hideResults
            clearTimeout(timeout);
            if (select.visible()) {
                jQueryinput.blur();
            }
            else {
                jQueryinput.focus();
                request(q, receiveData, hideResultsNow);
            }
        }

        function onChange(crap, skipPrevCheck) {
            if (lastKeyPressCode == KEY.DEL) {
                select.hide();
                return;
            }

            var currentValue = jQueryinput.val();

            if (!skipPrevCheck && currentValue == previousValue)
                return;

            if (options.multiple && currentValue.charAt(currentValue.length - 1) == options.multipleSeparator) {
                select.hide();
                return;
            }

            previousValue = currentValue;
            currentValue = lastWord(currentValue);
            if (currentValue.length >= options.minChars) {
                jQueryinput.addClass(options.loadingClass);
                if (!options.matchCase)
                    currentValue = currentValue.toLowerCase();
                request(currentValue, receiveData, hideResultsNow);
            } else {
                stopLoading();
                select.hide();
            }
        };

        function trimWords(value) {
            if (!value) {
                return [""];
            }
            var words = value.split(options.multipleSeparator);
            var result = [];
            jQuery.each(words, function (i, value) {
                if (jQuery.trim(value))
                    result[i] = jQuery.trim(value);
            });
            return result;
        }

        function lastWord(value) {
            if (!options.multiple)
                return value;
            var words = trimWords(value);
            if (words.length > 0) {
                return words[words.length - 1];
            }
            else {
                return "";
            }
        }

        // fills in the input box w/the first match (assumed to be the best match)
        // q: the term entered
        // sValue: the first matching result
        function autoFill(q, sValue) {
            // autofill in the complete box w/the first match as long as the user hasn't entered in more data
            // if the last user key pressed was backspace, don't autofill
            if (options.autoFill && (lastWord(jQueryinput.val()).toLowerCase() == q.toLowerCase()) && lastKeyPressCode != KEY.BACKSPACE) {
                // fill in the value (keep the case the user has typed)
                jQueryinput.val(jQueryinput.val() + sValue.substring(lastWord(previousValue).length));
                // select the portion of the value not typed by the user (so the next character will erase)
                jQuery.Autocompleter.Selection(input, previousValue.length, previousValue.length + sValue.length);
            }
        };

        function hideResults() {
            clearTimeout(timeout);
            select.hide();
            timeout = setTimeout(hideResultsNow, 200);
        };

        function hideResultsNow() {
            var wasVisible = select.visible();
            select.hide();
            clearTimeout(timeout);
            stopLoading();
            if (options.mustMatch) {
                // call search and run callback
                jQueryinput.search(
				function (result) {
				    // if no value found, clear the input box
				    if (!result) {
				        if (options.multiple) {
				            //				            if ($.browser.msie) {
				            //				                var words = trimWords(jQueryinput.val()).slice(0, -1);
				            //				                jQueryinput.val(words.join(options.multipleSeparator) + (words.length ? options.multipleSeparator : ""));
				            //				            }

				            //此处需要修改  hongwei 2011.07.21
				        }
				        else {
				            //针对输入法会也现无法输入的情况。所以暂时屏蔽
				            //jQueryinput.val("");
				        }
				    }
				    else {
				        if (options.multiple) {
				            // if($.browser.msie){
				            // var words = trimWords(jQueryinput.val()).slice(0, -1);
				            // jQueryinput.val(words.join(options.multipleSeparator) + (words.length ? options.multipleSeparator : result.result));
				            // }
				        }
				        else
				            jQueryinput.val(result.result);
				    }
				}
			);
            }
            if (wasVisible)
            // position cursor at end of input field
                jQuery.Autocompleter.Selection(input, input.value.length, input.value.length);
        };

        function receiveData(q, data) {
            //设置默认焦点时需要用到  hongwei write
            if (document.activeElement && (document.activeElement.id == jQueryinput.attr("id"))) {
                if (hasFocus < 1) {
                    hasFocus = 1;
                }
            };

            if (data && data.length && hasFocus) {
                stopLoading();
                select.display(data, q);
                autoFill(q, data[0].value);
                select.show();
            } else {
                hideResultsNow();
            }
        };

        function request(term, success, failure) {
            if (!options.matchCase)
                term = term.toLowerCase();
            var data = cache.load(term);
            // recieve the cached data
            if (data && data.length) {
                success(term, data);
                // if an AJAX url has been supplied, try loading the data now
            } else if ((typeof options.url == "string") && (options.url.length > 0)) {

                var extraParams = {
                    timestamp: +new Date()
                };
                jQuery.each(options.extraParams, function (key, param) {
                    extraParams[key] = typeof param == "function" ? param() : param;
                });

                jQuery.ajax({
                    // try to leverage ajaxQueue plugin to abort previous requests
                    mode: "abort",
                    // limit abortion to this input
                    port: "autocomplete" + input.name,
                    dataType: options.dataType,
                    url: options.url,
                    data: jQuery.extend({
                        q: lastWord(term),
                        limit: options.max
                    }, extraParams),
                    success: function (data) {
                        var parsed = options.parse && options.parse(data) || parse(data);
                        parsed.reverse();
                        cache.add(term, parsed);
                        success(term, parsed);
                    }
                });
            } else {
                // if we have a failure, we need to empty the list -- this prevents the the [TAB] key from selecting the last successful match
                select.emptyList();
                failure(term);
            }
        };

        function parse(data) {
            var parsed = [];
            var rows = data.split("\n");
            for (var i = 0; i < rows.length; i++) {
                var row = jQuery.trim(rows[i]);
                if (row) {
                    row = row.split("|");
                    parsed[parsed.length] = {
                        data: row,
                        value: row[0],
                        result: options.formatResult && options.formatResult(row, row[0]) || row[0]
                    };
                }
            }
            return parsed;
        };

        function stopLoading() {
            jQueryinput.removeClass(options.loadingClass);
        };

    };

    jQuery.Autocompleter.defaults = {
        inputClass: "ac_input",
        resultsClass: "ac_results",
        loadingClass: "ac_loading",
        minChars: 1,
        delay: 400,
        matchCase: false,
        matchSubset: true,
        matchContains: false,
        cacheLength: 10,
        max: 200,
        mustMatch: false,
        extraParams: {},
        selectFirst: true,
        formatItem: function (row) { return row[0]; },
        formatMatch: null,
        autoFill: false,
        width: 0,
        multiple: false,
        multipleSeparator: ";",
        highlight: function (value, term) {
            return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
        },
        scroll: true,
        scrollHeight: 180
    };

    jQuery.Autocompleter.Cache = function (options) {

        var data = {};
        var length = 0;

        function matchSubset(s, sub) {
            if (!options.matchCase)
                s = s.toLowerCase();
            var i = s.indexOf(sub);
            if (i == -1) return false;
            return i == 0 || options.matchContains;
        };

        function add(q, value) {
            if (length > options.cacheLength) {
                flush();
            }
            if (!data[q]) {
                length++;
            }
            data[q] = value;
        }

        function populate() {
            if (!options.data) return false;
            // track the matches
            var stMatchSets = {},
			nullData = 0;

            // no url was specified, we need to adjust the cache length to make sure it fits the local data store
            if (!options.url) options.cacheLength = 1;

            // track all options for minChars = 0
            stMatchSets[""] = [];

            // loop through the array and create a lookup structure
            for (var i = 0, ol = options.data.length; i < ol; i++) {
                var rawValue = options.data[i];
                // if rawValue is a string, make an array otherwise just reference the array
                rawValue = (typeof rawValue == "string") ? [rawValue] : rawValue;

                var value = options.formatMatch(rawValue, i + 1, options.data.length);
                if (value === false)
                    continue;

                var firstChar = value.charAt(0).toLowerCase();
                // if no lookup array for this character exists, look it up now
                if (!stMatchSets[firstChar])
                    stMatchSets[firstChar] = [];

                // if the match is a string
                var row = {
                    value: value,
                    data: rawValue,
                    result: options.formatResult && options.formatResult(rawValue) || value
                };

                // push the current match into the set list
                stMatchSets[firstChar].push(row);

                // keep track of minChars zero items
                if (nullData++ < options.max) {
                    stMatchSets[""].push(row);
                }
            };

            // add the data items to the cache
            jQuery.each(stMatchSets, function (i, value) {
                // increase the cache size
                options.cacheLength++;
                // add to the cache
                add(i, value);
            });
        }

        // populate any existing data
        setTimeout(populate, 25);

        function flush() {
            data = {};
            length = 0;
        }

        return {
            flush: flush,
            add: add,
            populate: populate,
            load: function (q) {
                if (!options.cacheLength || !length)
                    return null;
                /* 
                * if dealing w/local data and matchContains than we must make sure
                * to loop through all the data collections looking for matches
                */
                if (!options.url && options.matchContains) {
                    // track all matches
                    var csub = [];
                    // loop through all the data grids for matches
                    for (var k in data) {
                        // don't search through the stMatchSets[""] (minChars: 0) cache
                        // this prevents duplicates
                        if (k.length > 0) {
                            var c = data[k];
                            jQuery.each(c, function (i, x) {
                                // if we've got a match, add it to the array
                                if (matchSubset(x.value, q)) {
                                    csub.unshift(x);
                                }
                            });
                        }
                    }
                    return csub;
                } else
                // if the exact item exists, use it
                    if (data[q]) {
                        return data[q];
                    } else
                        if (options.matchSubset) {
                            for (var i = q.length - 1; i >= options.minChars; i--) {
                                var c = data[q.substr(0, i)];
                                if (c) {
                                    var csub = [];
                                    jQuery.each(c, function (i, x) {
                                        if (matchSubset(x.value, q)) {
                                            csub.unshift(x);
                                        }
                                    });
                                    return csub;
                                }
                            }
                        }
                return null;
            }
        };
    };

    jQuery.Autocompleter.Select = function (options, input, select, config) {
        var CLASSES = {
            ACTIVE: "ac_over"
        };

        var listItems,
		active = -1,
		data,
		term = "",
		needsInit = true,
		element,
		list;

        // Create results
        function init() {
            if (!needsInit)
                return;
            element = jQuery("<div/>")
		.hide()
		.addClass(options.resultsClass)
		.css("position", "absolute")
		.appendTo(document.body);

            list = jQuery("<ul/>").appendTo(element).mouseover(function (event) {
                if (target(event).nodeName && target(event).nodeName.toUpperCase() == 'LI') {
                    active = jQuery("li", list).removeClass(CLASSES.ACTIVE).index(target(event));
                    jQuery(target(event)).addClass(CLASSES.ACTIVE);
                }
            }).click(function (event) {
                jQuery(target(event)).addClass(CLASSES.ACTIVE);
                select();
                // TODO provide option to avoid setting focus again after selection? useful for cleanup-on-focus
                //input.focus();
                return false;
            }).mousedown(function () {
                config.mouseDownOnSelect = true;
            }).mouseup(function () {
                config.mouseDownOnSelect = false;
            });

            if (options.width > 0)
                element.css("width", options.width);

            needsInit = false;
        }

        function target(event) {
            var element = event.target;
            while (element && element.tagName != "LI")
                element = element.parentNode;
            // more fun with IE, sometimes event.target is empty, just ignore it then
            if (!element)
                return [];
            return element;
        }

        function moveSelect(step) {
            listItems.slice(active, active + 1).removeClass(CLASSES.ACTIVE);
            movePosition(step);
            var activeItem = listItems.slice(active, active + 1).addClass(CLASSES.ACTIVE);
            if (options.scroll) {
                var offset = 0;
                listItems.slice(0, active).each(function () {
                    offset += this.offsetHeight;
                });
                if ((offset + activeItem[0].offsetHeight - list.scrollTop()) > list[0].clientHeight) {
                    list.scrollTop(offset + activeItem[0].offsetHeight - list.innerHeight());
                } else if (offset < list.scrollTop()) {
                    list.scrollTop(offset);
                }
            }
        };

        function movePosition(step) {
            active += step;
            if (active < 0) {
                active = listItems.size() - 1;
            } else if (active >= listItems.size()) {
                active = 0;
            }
        }

        function limitNumberOfItems(available) {
            return options.max && options.max < available
			? options.max
			: available;
        }

        function fillList() {
            list.empty();
            var max = limitNumberOfItems(data.length);
            for (var i = max - 1; i >= 0; i--) {
                if (!data[i])
                    continue;
                var formatted = options.formatItem(data[i].data, i + 1, max, data[i].value, term);
                if (formatted === false)
                    continue;
                var li = jQuery("<li/>").html(options.highlight(formatted, term)).addClass(i % 2 == 0 ? "ac_even" : "ac_odd").appendTo(list)[0];
                jQuery.data(li, "ac_data", data[i]);
            }
            listItems = list.find("li");
            if (options.selectFirst) {
                listItems.slice(0, 1).addClass(CLASSES.ACTIVE);
                active = 0;
            }
            // apply bgiframe if available
            if (jQuery.fn.bgiframe)
                list.bgiframe();
        }

        return {
            display: function (d, q) {
                init();
                data = d;
                term = q;
                fillList();
            },
            next: function () {
                moveSelect(1);
            },
            prev: function () {
                moveSelect(-1);
            },
            pageUp: function () {
                if (active != 0 && active - 8 < 0) {
                    moveSelect(-active);
                } else {
                    moveSelect(-8);
                }
            },
            pageDown: function () {
                if (active != listItems.size() - 1 && active + 8 > listItems.size()) {
                    moveSelect(listItems.size() - 1 - active);
                } else {
                    moveSelect(8);
                }
            },
            hide: function () {
                element && element.hide();
                listItems && listItems.removeClass(CLASSES.ACTIVE);
                active = -1;
            },
            visible: function () {
                return element && element.is(":visible");
            },
            current: function () {
                return this.visible() && (listItems.filter("." + CLASSES.ACTIVE)[0] || options.selectFirst && listItems[0]);
            },
            show: function () {
                var offset = jQuery(input).offset();

                var isInput = input.tagName == "INPUT";


                element.css({
                    width: "auto",
                    //fix:textarea height : timtian
                    top: offset.top + Math.min((isInput ? (input.offsetHeight) : ((jQuery(input).val().length * 7 / input.offsetWidth + 1) * 20)), input.offsetHeight),
                    //fix:object left pos :timtian
                    left: offset.left + Math.min((isInput ? (jQuery(input).val().length * 7) : ((jQuery(input).val().length * 7) % input.offsetWidth)), input.offsetWidth)
                }).show();


                var maxWidth = 0;
                element.each(function () {
                    maxWidth = Math.max(this.offsetWidth, maxWidth);
                });

                element.css("width", maxWidth);

                if (options.scroll) {
                    list.scrollTop(0);
                    if (listItems.length >= 9) {
                        list.css({
                            height: options.scrollHeight + 'px',
                            overflow: 'auto'
                        });
                    }
                    else {
                        list.css({
                            height: 'auto',
                            overflow: 'auto'
                        });
                    }

                    if (jQuery.browser.msie && typeof document.body.style.maxHeight === "undefined") {
                        var listHeight = 0;
                        listItems.each(function () {
                            listHeight += this.offsetHeight;
                        });
                        var scrollbarsVisible = listHeight > options.scrollHeight;
                        list.css('height', scrollbarsVisible ? options.scrollHeight : listHeight);
                        if (!scrollbarsVisible) {
                            // IE doesn't recalculate width when scrollbar disappears
                            listItems.width(list.width() - parseInt(listItems.css("padding-left")) - parseInt(listItems.css("padding-right")));
                        }
                    }

                }
            },
            selected: function () {
                var selected = listItems && listItems.filter("." + CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);
                return selected && selected.length && jQuery.data(selected[0], "ac_data");
            },
            emptyList: function () {
                list && list.empty();
            },
            unbind: function () {
                element && element.remove();
            }
        };
    };

    jQuery.Autocompleter.Selection = function (field, start, end) {
        if (field.createTextRange) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart("character", start);
            selRange.moveEnd("character", end);
            selRange.select();
        } else if (field.setSelectionRange) {
            field.setSelectionRange(start, end);
        } else {
            if (field.selectionStart) {
                field.selectionStart = start;
                field.selectionEnd = end;
            }
        }
        field.focus();
    };

})(jQuery);
    
   //#endregion Autocomplete 插件 结束


//#endregion

//#region 初始化控件

function getRootPath() {
    var strFullPath = top.window.document.location.href;
    var strPath = top.window.document.location.pathname;
    var pos = strFullPath.indexOf(strPath);
    var prePath = strFullPath.substring(0, pos);
    var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
    return (prePath + postPath);
}

function addLink(href) {
    var head = document.getElementsByTagName("head").item(0);
    var link = document.createElement("link");
    link.id = "oacommoncss";
    link.href = href;
    link.rel = "stylesheet";
    link.type = "text/css";
    head.appendChild(link);
}


var currentchooser = null;
var choosertimer = null;

//var postBackElementId = null;

function initOACommon() {

    if (typeof self.jQuery == "undefined") {
         alert("请检查页面\n"+top.location.href+"\njQuery没有正确引用（没有引用或引用多次）");
        return;
    }

    var head = self.document.getElementsByTagName("head").item(0);

    if (self.jQuery("#oacommoncss").size() == 0) {
        var link = window.document.createElement("link");
        link.id = "oacommoncss";
        link.href = HRCommon_Base_Url + "/resource/css/oacommon.css";
        link.rel = "stylesheet";
        link.type = "text/css";
        head.appendChild(link);
    }
    if (jQuery("#oacommoncss").size() == 0) {
        addLink(HRCommon_Base_Url + "/resource/css/oacommon.css");
    }

    if (window.jQuery("#oacommonsc").size() == 0) {
        var sc = window.document.createElement("script");
        sc.id = "oacommonsc";
//        sc.src = HRCommon_Base_Url + "/resource/script/jquery.ext.js";
        sc.type = "text/javascript";
        head.appendChild(sc);
    }

    if (jQuery(".generalchooser").size() > 0) {
        //动态加载JS
        if (window.jQuery("#jquery_simple_tree").size() == 0) {
            var sc = window.document.createElement("script");
            sc.id = "jquery_simple_tree";
            sc.src = HRCommon_Base_Url + "/resource/script/jquery.simple.tree.js";
            sc.type = "text/javascript";
            head.appendChild(sc);
        }
        //动态加载CSS
        if (window.jQuery("#oacommon_local").size() == 0) {
            var link = window.document.createElement("link");
            link.id = "oacommon_local";
            link.href = HRCommon_Base_Url + "/resource/css/oacommon_local.css";
            link.rel = "stylesheet";
            link.type = "text/css";
            head.appendChild(link);
        }
    }

    initChooser();
    try {
//        postBackElementId = null;
//        Sys.WebForms.PageRequestManager.getInstance().add_beginRequest(function (sender, args) {
//            postBackElementId = args.get_postBackElement().id;
//        });
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(EndRequestHandler);
    }
    catch(e) {
    }
}

function initChooser() {
    jQuery(".oc_common").each(function () {
        if (jQuery(this).hasClass("oc_userchooser") || jQuery(this).hasClass("oc_postchooser") || jQuery(this).hasClass("oc_deptchooser")) {
            if (jQuery(this).hasClass("oc_deptchooser")) {
                jQuery(this).deptChooser();
            }
            else if (jQuery(this).hasClass("oc_postchooser")) {
                jQuery(this).postChooser();
            } else if (jQuery(this).hasClass("oc_userchooser")) {
                jQuery(this).userChooser();
            }
            if (jQuery(this).attr("hideicon") != "true") {
                if (jQuery(this).next(".oc_choosericon").length < 1)
                    addChooserIcon(this);
            }
        }
    });
    jQuery(".generalchooser").each(function () {
        jQuery(this).generalchooser();
    });
}

function EndRequestHandler(sender, args) {
    var updatePanelClientIDs = sender._updatePanelClientIDs;
    if (updatePanelClientIDs.length <= 0) {
        return;
    }
    jQuery(".oc_common").each(function () {
        if (jQuery(this).hasClass("oc_userchooser") || jQuery(this).hasClass("oc_postchooser") || jQuery(this).hasClass("oc_deptchooser")) {
            for (var i = 0; i < updatePanelClientIDs.length; i++) {
                var customControl = jQuery("#" + updatePanelClientIDs[i]).find("#" + jQuery(this).attr("id"));
                //var postControl = jQuery("#" + updatePanelClientIDs[i]).find("#" + postBackElementId);
                if (customControl.length > 0) {
                    if (jQuery(this).hasClass("oc_deptchooser")) {
                        jQuery(this).deptChooser();
                    }
                    else if (jQuery(this).hasClass("oc_postchooser")) {
                        jQuery(this).postChooser();
                    } else if (jQuery(this).hasClass("oc_userchooser")) {
                        jQuery(this).userChooser();
                    }
                    if (jQuery(this).attr("hideicon") != "true") {
                        if (jQuery(this).next(".oc_choosericon").length < 1)
                            addChooserIcon(this);
                    }
                }
            }
        }
    });
    jQuery(".generalchooser").each(function () {
        for (var i = 0; i < updatePanelClientIDs.length; i++) {
            var customControl = jQuery("#" + updatePanelClientIDs[i]).find("#" + jQuery(this).attr("id"));
            //var postControl = jQuery("#" + updatePanelClientIDs[i]).find("#" + postBackElementId);
            if (customControl.length > 0) {
                jQuery(this).generalchooser();
            }
        }
    });
}

//添加指定图标icon
//不在code中添加主要为跨语言
function addChooserIcon(obj) {
    //添加图标
    jQuery(obj).after("<img class='oc_choosericon' src='" + HRCommon_Base_Url + "/resource/image/choose_icon.png' style='margin-bottom: -5px;' />");
    //添加图标点击事件
    jQuery(obj).next(".oc_choosericon").click(function () {
        top.jQuery.colorbox.close();
        var tb = jQuery(this).prev();

        var isable = tb.attr("disabled");
        if (isable == "disabled" || isable == true) {
            return;
        }

        var args = tb.attr("args");

        currentchooser = tb;
        window.name = '';

        if (typeof (args) == "undefined") {
            tb.get(0).onfocus();
            args = tb.attr("args");
        }

        var curl = "";
        if (tb.hasClass("oc_userchooser")) {
            curl = "staffui.aspx";
        }
        else if (tb.hasClass("oc_postchooser")) {
            curl = "postui.aspx";
        }
        else if (tb.hasClass("oc_deptchooser")) {
            curl = "deptui.aspx";
        }
        //            var ohost = top.window.location.protocol + "//" + top.window.location.host;
        //            if (top.window.location.port != "") {
        //                ohost += ":" + top.window.location.port;
        //            }
        var ohost = getRootPath();
        ohost += "/blank.htm";

        curl = HRCommon_Base_Url + "/pages/chooser/ui/" + curl + "?" + args + "&ohost=" + ohost + "#" + encodeURIComponent(tb.val());


        //对所有的icon进行注册事件
        top.jQuery.colorbox(
			{
			    iframe: true,
			    innerWidth: "600px",
			    innerHeight: "500px",
			    opacity: 0.5,
			    scrolling: false,
			    href: curl,
			    overlayClose: false,
			    onComplete: function () {
			        top.window.name = "";
			        choosertimer = setInterval(function () {
			            var ifm = top.jQuery("#cboxLoadedContent").find("iframe").get(0);
			            var resultname = '';

			            try {
			                resultname = ifm.contentWindow.name;
			            } catch (e) { }

			            if (resultname != '' && resultname.indexOf("OC:") > -1) {
			                top.window.name = resultname;
			                top.jQuery.colorbox.close();
			            }

			            if (top.window.name.indexOf("OC:") > -1) {
			                clearInterval(choosertimer);
			                var cv = top.window.name.replace(/\[/gi, "(").replace("OC:", "");
			                if (cv != "null")
			                    currentchooser.val(cv);
			                try {
			                    //call back
			                    if (typeof jQuery(currentchooser).attr("onchooser_change") == "string") {
			                        eval(jQuery(currentchooser).attr("onchooser_change"));
			                    }
			                } catch (e) { }
			                //hongwei 修改，弹出选择后
			                currentchooser[0].focus();
			                // currentchooser.get(0).onfocus();
			            }
			        }, 200);
			    }
			});
    });
}
//添加指定图标icon
//不在code中添加主要为跨语言
function addChooserIcon(obj) {
    //添加图标
    jQuery(obj).after("<img class='oc_choosericon' src='" + HRCommon_Base_Url + "/resource/image/choose_icon.png' style='margin-bottom: -5px;' />");
    //添加图标点击事件
    jQuery(obj).next(".oc_choosericon").click(function () {
        top.jQuery.colorbox.close();
        var tb = jQuery(this).prev();

        var isable = tb.attr("disabled");
        if (isable == "disabled" || isable == true) {
            return;
        }

        var args = tb.attr("args");

        currentchooser = tb;
        window.name = '';

        if (typeof (args) == "undefined") {
            tb.get(0).onfocus();
            args = tb.attr("args");
        }

        var curl = "";
        if (tb.hasClass("oc_userchooser")) {
            curl = "staffui.aspx";
        }
        else if (tb.hasClass("oc_postchooser")) {
            curl = "postui.aspx";
        }
        else if (tb.hasClass("oc_deptchooser")) {
            curl = "deptui.aspx";
        }
        //            var ohost = top.window.location.protocol + "//" + top.window.location.host;
        //            if (top.window.location.port != "") {
        //                ohost += ":" + top.window.location.port;
        //            }
        var ohost = getRootPath();
        ohost += "/blank.htm";

        curl = HRCommon_Base_Url + "/pages/chooser/ui/" + curl + "?" + args + "&ohost=" + ohost + "#" + encodeURIComponent(tb.val());


        //对所有的icon进行注册事件
        top.jQuery.colorbox(
			{
			    iframe: true,
			    innerWidth: "600px",
			    innerHeight: "500px",
			    opacity: 0.5,
			    scrolling: false,
			    href: curl,
			    overlayClose: false,
			    onComplete: function () {
			        top.window.name = "";
			        choosertimer = setInterval(function () {
			            var ifm = top.jQuery("#cboxLoadedContent").find("iframe").get(0);
			            var resultname = '';

			            try {
			                resultname = ifm.contentWindow.name;
			            } catch (e) { }

			            if (resultname != '' && resultname.indexOf("OC:") > -1) {
			                top.window.name = resultname;
			                top.jQuery.colorbox.close();
			            }

			            if (top.window.name.indexOf("OC:") > -1) {
			                clearInterval(choosertimer);
			                var cv = top.window.name.replace(/\[/gi, "(").replace("OC:", "");
			                if (cv != "null")
			                    currentchooser.val(cv);
			                try {
			                    //call back
			                    if (typeof jQuery(currentchooser).attr("onchooser_change") == "string") {
			                        eval(jQuery(currentchooser).attr("onchooser_change"));
			                    }
			                } catch (e) { }
			                //hongwei 修改，弹出选择后
			                currentchooser[0].focus();
			                // currentchooser.get(0).onfocus();
			            }
			        }, 200);
			    }
			});
    });
}


//#endregion

//#region 部门选择器 岗位选择器 人员选择器

(function(jQuery) {

    function checkData(url, param, target) {
        $.ajax({
            url: url,
            data: param,
            dataType: "jsonp",
            success: function(result) {
                var multiple = $(target).get(0).getAttribute('multiple');
                var varText = '';
                var data = null;
                if (multiple == null || multiple == 'true') {
                    data = result;
                    $(result).each(function(i, item) {
                        varText = varText + item.Name + ';';
                    });
                }
                else if (result.length > 0) {
                    data = [result[0]];
                    varText = result[0].Name;
                }
                $(target).val(varText);
                try {
                    //call back
                    if (typeof $(target).attr("onchooser_blur") == "string") {
                        eval($(target).attr("onchooser_blur"));
                    }
                } catch (e) { }
            }
        });
    }

    jQuery.fn.deptChooser = function(options) {

        //tim pathch:add exclude and include filter
        var multiple = '';
        if (this.get(0).getAttribute('multiple'))
            multiple = '' + this.get(0).getAttribute('multiple');
        var deptlevel = '-1';
        if (this.attr('deptlevel'))
            deptlevel = '' + this.attr('deptlevel');
        var depttypeid = '-1';
        if (this.attr('depttypeid'))
            depttypeid = '' + this.attr('depttypeid');
        var onlyassignedlevel = '';
        if (this.attr('onlyassignedlevel'))
            onlyassignedlevel = '' + this.attr('onlyassignedlevel');
        var isfulllocation = '0';
        if (this.attr('isfulllocation'))
            isfulllocation = '' + this.attr('isfulllocation');
        var deptblackliststring = '';
        if (this.attr('deptblackliststring'))
            deptblackliststring = '' + this.attr('deptblackliststring');
        var deptwhiteliststring = '';
        if (this.attr('deptwhiteliststring'))
            deptwhiteliststring = '' + this.attr('deptwhiteliststring');
        var isrealtimedata = '';
        if (this.attr('isrealtimedata'))
            isrealtimedata = '' + this.attr('isrealtimedata');
        var customurl = '';
        if (this.attr('customsourceurl') != undefined) 
            customurl = '' + this.attr('customsourceurl');

        multiple = multiple ? multiple.toLowerCase() : false;
        //当部门层级和部门类型ID都为-1时，onlyassignedlevel无效 20120227  hongwei
        if(deptlevel=="-1"&&depttypeid=="-1") {
            onlyassignedlevel = "0";
        }

        var args = "depttypeid=" + depttypeid +
            "&deptlevel=" + deptlevel +
                "&onlyassignedlevel=" + onlyassignedlevel +
                    "&isfulllocation=" + isfulllocation +
                        "&multiple=" + multiple +
                            "&deptblacklist=" + deptblackliststring +
                                "&deptwhitelist=" + deptwhiteliststring +
                                    "&isrealtimedata=" + isrealtimedata;

        this.attr("args", args);

        var sourceurl = customurl == '' ? (HRCommon_Base_Url + "/pages/chooser/data/dept.aspx") : customurl;
        if (sourceurl.indexOf('?') == -1)
            sourceurl += "?";

        if (options && options.reinit) {
            this.removeAttr("isautocompleteinited");
            //  this.unautocomplete();
            this.reloadUrl(sourceurl + args);
            return;
        }
        else {
            if (this.attr('deptchooserinited') == 'true') return;
        }

        this.attr('deptchooserinited', 'true');

        $(this).blur(function() {
            if (customurl != '')
                return;
            var thisId = $(this).attr("id");
            var thisText = $(this).val();
            var target = this;
            setTimeout(function() {
                if ($(".ac_results").css("display") != "block") {
                    if (document.activeElement.id != thisId) {
                        var param = { q: thisText, type: "check" }; //, isfulllocation: isfulllocation, isrealtimedata: isrealtimedata
                        checkData(sourceurl + args, param, target);
                    }
                }
            }, 100);
            //            $(this).val(thisText);
        });
         
        this.autocomplete(sourceurl + args,
        {
            max:30,
            scrollHeight:300,
            delay: 200,
            minChars: 1,
            matchSubset: 1,
            matchContains: 1,
            cacheLength: 10,
            multipleSeparator: ';',
            multiple: multiple == 'true',
            mustMatch: true,
            dataType: 'jsonp',
            parse: function(data) {
                var rows = new Array();
                for (var i = 0; i < data.length; i++) {
                    rows[i] = { data: data[i], value: data[i].ID.toString(), result: data[i].Name };
                }
                return rows;
            },
            formatItem: function(row, i, max, value, term) {
                return row.Name.replace(/(\(\d+?\))jQuery/gi, '<i>jQuery1</i>');
            }
        });
        this.result(function() {
            try {
                if (typeof $(this).attr("onchooser_change") == "string") {
                    eval($(this).attr("onchooser_change"));
                }
            } catch (e) { }
            if (multiple == 'true') {
                this.focus();
                jQuery(this).endInsPoint();
            }
          //  else { this.blur(); }
        });
        this.focus(function() { if (multiple == 'true') { jQuery(this).endInsPoint(); } else this.select(); });
    };


    jQuery.fn.postChooser = function(options) {

        var deptlevel = '-1';
        if (this.attr('deptlevel'))
            deptlevel = '' + this.attr('deptlevel');
        var depttypeid = '-1';
        if (this.attr('depttypeid'))
            depttypeid = '' + this.attr('depttypeid');
        var multiple =this.get(0).getAttribute('multiple');
        var deptblackliststring = '';
        if (this.attr('deptblackliststring'))
            deptblackliststring = +this.attr('deptblackliststring');
        var deptwhiteliststring = '';
        if (this.attr('deptwhiteliststring'))
            deptwhiteliststring = '' + this.attr('deptwhiteliststring');
        var postblackliststring = '';
        if (this.attr('postblackliststring'))
            postblackliststring = '' + this.attr('postblackliststring');
        var postwhiteliststring = '';
        if (this.attr('postwhiteliststring'))
            postwhiteliststring = '' + this.attr('postwhiteliststring');
        var isrealtimedata = '';
        if (this.attr('isrealtimedata'))
            isrealtimedata = '' + this.attr("isrealtimedata");

        multiple = multiple ? multiple.toLowerCase() : false;


        var customurl = '';
        if (typeof this.attr('customsourceurl') != 'undefined') {
            customurl = '' + this.attr('customsourceurl');
        }

        var args = "multiple=" + multiple +
            "&deptlevel=" + deptlevel +
                "&depttypeid=" + depttypeid +
                    "&deptblacklist=" + deptblackliststring +
                        "&deptwhitelist=" + deptwhiteliststring +
                            "&postblacklist=" + postblackliststring +
                                "&postwhitelist=" + postwhiteliststring +
                                    "&isrealtimedata=" + isrealtimedata;

        this.attr("args", args);

        var sourceurl = customurl == '' ? (HRCommon_Base_Url + "/pages/chooser/data/post.aspx") : customurl;
        if (sourceurl.indexOf('?') == -1)
            sourceurl += "?";

        if (typeof options != "undefined" && options.reinit) {
            this.removeAttr("isautocompleteinited");
            // this.unautocomplete();
            this.reloadUrl(sourceurl + args);
            return;
        }
        else {
            if (this.attr('postchooserinited') == 'true')
                return;
        }
        this.attr('postchooserinited', 'true');


        $(this).blur(function() {
            if (customurl != '')
                return;
            var thisId = $(this).attr("id");
            var thisText = $(this).val();
            var target = this;
            setTimeout(function() {
                if ($(".ac_results").css("display") != "block") {
                    if (document.activeElement.id != thisId) {
                        var param = { q: thisText, type: "check"};
                        checkData(sourceurl + args, param, target);
                    }
                }
            }, 100);
            $(this).val(thisText);
        });

        this.autocomplete(sourceurl + args,
        {
            max:30,
            scrollHeight:300,
            delay: 200,
            minChars: 1,
            matchSubset: 1,
            matchContains: 1,
            cacheLength: 10,
            multipleSeparator: ';',
            multiple: multiple == 'true',
            mustMatch: true,
            dataType: 'jsonp',
            parse: function(data) {
                var rows = new Array();
                for (var i = 0; i < data.length; i++) {
                    rows[i] = { data: data[i], value: data[i].ID.toString(), result: data[i].Name };
                }
                return rows;
            },
            formatItem: function(row, i, max, value, term) {
                return row.Name.replace(/(\(\d+?\))jQuery/gi, '<i>jQuery1</i>');
            }
        });
        this.result(function() {
            try {
                if (typeof $(this).attr("onchooser_change") == "string") {
                    eval($(this).attr("onchooser_change"));
                }
            } catch (e) { }
            if (multiple == 'true') {
                this.focus(); jQuery(this).endInsPoint();
            } 
//            else {  this.blur(); };
        });
        this.focus(function() { if (multiple == 'true') { jQuery(this).endInsPoint(); } else this.select(); });
    };

    jQuery.fn.userChooser = function(options) {

        var deptlevel = '-1';
        if(this.attr('deptlevel'))
            deptlevel= ''+this.attr('deptlevel');
        var depttypeid = '-1';
        if (this.attr('depttypeid'))
            depttypeid = '' + this.attr('depttypeid');
        var multiple = '';
        if (this.get(0).getAttribute('multiple'))
            multiple = '' + this.get(0).getAttribute('multiple');
        var includeDimission = '';
        if (this.attr('includedimission'))
            includeDimission = '' + this.attr('includedimission');
        var containsstatuslist = '';
        if (this.attr('containsstatuslist'))
        containsstatuslist = '' + this.attr('containsstatuslist');
        var deptblackliststring = '';
        if (this.attr('deptblackliststring'))
        deptblackliststring = '' + this.attr('deptblackliststring');
        var deptwhiteliststring = '';
        if (this.attr('deptwhiteliststring'))
        deptwhiteliststring = '' + this.attr('deptwhiteliststring');
        var userblackliststring = '';
        if (this.attr('userblackliststring'))
        userblackliststring = '' + this.attr('userblackliststring');
        var userwhiteliststring = '';
        if (this.attr('userwhiteliststring'))
        userwhiteliststring = '' + this.attr('userwhiteliststring');
        var workplaceids = '';
        if(this.attr('workplaceids'))
            workplaceids = '' + this.attr('workplaceids');
        var customurl = '';
        if (this.attr('customsourceurl') != undefined) 
            customurl = '' + this.attr('customsourceurl');
        var includeuserlist = '';
        if(this.attr('includeuserlist')) 
            includeuserlist = '' + this.attr('includeuserlist');
        var expression = '';
        if(this.attr('expression')) 
            expression = '' + this.attr('expression');

        multiple = multiple ? multiple.toLowerCase() : false;
        includeDimission = includeDimission ? includeDimission.toLowerCase() : false;

        var args =
				"includeDimission=" + includeDimission +
    				"&containsstatuslist=" + encodeURIComponent(containsstatuslist) +
        				"&deptlevel=" + deptlevel +
            				"&depttypeid=" + depttypeid +
                				"&multiple=" + multiple +
                    				"&deptblacklist=" + deptblackliststring +
                        				"&deptwhitelist=" + deptwhiteliststring +
                            				"&userblacklist=" + userblackliststring +
                                				"&userwhitelist=" + userwhiteliststring +
                                    				"&workplaceids=" + workplaceids +
                                        				"&includeuserlist=" + includeuserlist +
                                            				"&expression=" + encodeURIComponent(expression);

        this.attr("args", args);
        var sourceurl = customurl == '' ? (HRCommon_Base_Url + "/pages/chooser/data/staff.aspx") : customurl;

        if (sourceurl.indexOf('?') == -1)
            sourceurl += "?";

        if (options && options.reinit) {
            this.removeAttr("isautocompleteinited");
            //this.unautocomplete();
            this.reloadUrl(sourceurl + args);
            return;
        }
        else {
            if (this.attr('userchooserinited') == 'true') return;
        }

        this.attr('userchooserinited', 'true');

        $(this).blur(function() {
            if (customurl != '')
                return;
            var thisId = $(this).attr("id");
            var thisText = $(this).val();
            var target = this;
            setTimeout(function() {
                if ($(".ac_results").css("display") != "block") {
                    if (document.activeElement.id != thisId) {
                        var param = { q: thisText, type: "check"};
                        checkData(sourceurl + args, param, target);
                    }
                }
            }, 100);
            $(this).val(thisText);
        });

        this.autocomplete(sourceurl + args,
        {
            max:30,
            scrollHeight:300,
            delay: 200,
            minChars: 1,
            matchSubset: 1,
            matchContains: 1,
            cacheLength: 10,
            multipleSeparator: ';',
            multiple: multiple == 'true',
            mustMatch: true,
            dataType: 'jsonp',
            parse: function(data) {
                var rows = new Array();
                for (var i = 0; i < data.length; i++) {
                    rows[i] = { data: data[i], value: data[i].ID.toString(), result: data[i].Name };
                }
                return rows;
            },
            formatItem: function(row, i, max, value, term) {
                return row.Name;
            }  
        });
        this.result(function() {

            try {
                if (typeof $(this).attr("onchooser_change") == "string") {
                    eval($(this).attr("onchooser_change"));
                }
            } catch (e) { }

            if (multiple == 'true') {
                this.focus();
                jQuery(this).endInsPoint();
            }
//            else this.blur();
        });
        this.focus(function() { if (multiple == 'true') { jQuery(this).endInsPoint(); } else this.select(); });
    };




    jQuery.fn.getValSelected = function() {
        var data = this.data('data');
        var text_prop = this.data('text_prop');
        var val_prop = this.data('val_prop');
        function findval(text) {
            for (var i = 0; i < data.length; i++) {
                if (jQuery(data[i]).attr(text_prop) == text) {
                    return jQuery(data[i]).attr(val_prop);
                }
            }
            return null;
        }
        var val = this.val();
        var txtsels = val.split(';');
        var valsels = [];
        for (var i = 0; i < txtsels.length; i++) {
            if (txtsels[i] == '') continue;
            var tmp = findval(txtsels[i]);
            if (tmp == null) continue;
            valsels[valsels.length] = tmp;
        }
        return valsels.join(';');
    };
    jQuery.fn.dataChooser = function(data, text_prop, val_prop, onselectchange, mustmatch) {
        if (mustmatch == null)
            mustmatch = true;
        if (!text_prop)
            text_prop = 'Value';
        if (!val_prop)
            val_prop = 'Key';
        var multiple = '' + this.attr('multiple');
        multiple = multiple ? multiple.toLowerCase() : false;
        this.unautocomplete();
        this.autocomplete(data, {
            delay: 100,
            minChars: 1,
            matchSubset: 1,
            matchContains: 1,
            cacheLength: 10,
            multipleSeparator: ';',
            multiple: multiple == 'true',
            mustMatch: mustmatch,
            dataType: 'json',
            parse: function(data) {
                return data;
            },
            formatItem: function(row, i, max, value, term) {
                return jQuery(row).attr(text_prop);
            },
            scroll: true
        });
        this.data('data', data);
        this.data('text_prop', text_prop);
        this.data('val_prop', val_prop);
        this.result(function() {
            if (multiple == 'true') {
                this.focus();
                jQuery(this).endInsPoint();
            } else
                this.blur();
            if (onselectchange)
                onselectchange();
        });
        this.focus(function() {
            var oThis = jQuery(this);
            if (multiple == 'true') {
                setTimeout(function() {
                    oThis.endInsPoint();
                }, 50);
            } else
                this.select();
        });
        return this;
    };
})(jQuery);

//#endregion

//#region 通用智能选择器

(function ($) {
    $.fn.generalchooser = function (options, param) {
        var target = null;
        if (typeof options == 'string') {
            return $.fn.generalchooser.methods[options](this, param);
        }
        var opts = $.extend({}, $.fn.generalchooser.defaults, options);
        return this.each(function (i) {
            if (options == null) {
                if ($(this).attr("hideicon") != "true") {
                    if ($(this).find(".oc_choosericon").length < 1)
                        addIcon(this);
                }
                target = $(this);
                bindData($(this));
            }
            var textBoxId = $(this).attr("id") + "_TextBox";
            var valueBoxId = $(this).attr("id") + "_ValueBox";
            var control = $(this);
            $("#" + textBoxId).blur(function () {
                var thisId = $(this).attr("id");
                setTimeout(function () {
                    if ($(".ac_results").css("display") != "block") {
                        if (document.activeElement.id != thisId) {
                           SyncData(control);
                            target = control;
                            var data = eval($("#" + valueBoxId).val());
                            try {
                                //call back
                                if (typeof $(control).attr("onchooser_blur") == "string"&&$(control).attr("onchooser_blur")!="") {
                                    eval($(control).attr("onchooser_blur"));
                                }
                            } catch(e) { }
                        }
                    }
                }, 100);
            });
            $("#" + valueBoxId).change(function() {
                alert($(this).val());
            });
            
            //#region onChange 事件 待完成
            
//            if ($.browser.msie) {
//                $("#" + valueBoxId).unbind("propertychange").bind("propertychange", function (e) {
//                    alert("IE浏览器");
//                    if (opts.onChange) {
//                        var data = getData(control);
//                        opts.onChange.call(control, data);
//                    }
//                });
//            }
//            else {
//                document.getElementById(valueBoxId).addEventListener("input", function () {
//                    alert("非IE浏览器");
//                    if (opts.onChange) {
//                        var data = getData(control);
//                        opts.onChange.call(control, data);
//                    }
//                }, false);
//            }
            
            //#endregion
            
        });
    };

    $.fn.generalchooser.methods = {
        getData: function (jq) {
            return getData(jq[0]);
        }
    };

    $.fn.generalchooser.defaults = {
        onChange: function (data) { }
    };


    function souceClick(target) {
        var sl = top.document.getElementById("sourceList");
        var dl = top.document.getElementById("destList");
        var multiple = '' + $(target).get(0).getAttribute('multiple') == "true";
        if (!multiple && sl.selectedIndex > -1) {
            top.$("#destList").html("");
        }
        for (var i = 0; i < sl.options.length; i++) {
            if (sl.options[i].selected == true) {
                jsAddItemToSelect(dl, sl.options[i].text, sl.options[i].value, "");
            }
        }
    }


    function destClick(target) {
        jsRemoveSelectedItemFromSelect(top.document.getElementById("destList"));
    }

    /**
    * 获取控件中选择的所有数据
    **/
    function getData(target) {
        var valueBoxId = $(target).attr("id") + "_ValueBox";
        var data = [];
        var valueText = $("#" + valueBoxId).val();
        if (valueText != null && valueText != "") {
            data = eval(valueText);
        }
        return data;
    }

    function bindData(target) {
        var data = eval($(target).attr("id") + "_data");
        var textBoxId = $(target).attr("id") + "_TextBox";
      var multiple = '' + $(target).get(0).getAttribute('multiple') == "true";

        var textfield = $(target).attr("textfield");
        if (textfield == "") {
            alert("请设置控件" + $(target).attr("id") + "的DataTextField属性");
            return;
        }
        var valuefield = $(target).attr("valuefield");
        if (valuefield == "") {
            alert("请设置控件" + $(target).attr("id") + "的DataValueField属性");
            return;
        }
        var tipfield = $(target).attr("tipfield");
        if (tipfield == "") {
            tipfield = textfield;
            $(target).attr("tipfield", tipfield);
        }
        var tipfields = tipfield.split(',');
        var validdata = [];
        if($(target).attr("onlyselectleaf")=="true") {
            for (var i = 0; i < data.length; i++)
            {
                if (data[i].isleaf != "0") {
                    validdata.push(data[i]);
                }
            }
        }
        else {
            validdata = data;
        }

        $("#" + textBoxId).autocomplete(validdata, {
            max:30,
            scrollHeight:300,
            delay: 200,
            minChars: 1,
            matchSubset: 1,
            matchContains: 1,
            cacheLength: 10,
            multipleSeparator: ';',
            mustMatch: true,
            multiple: multiple,
            formatItem: function (row, i, max) {
                var result = eval("row." + textfield);
                for (var i = 0; i < tipfields.length; i++) {
                    if (tipfields[i] != textfield) {
                        result += "  -  " + eval("row." + tipfields[i]);
                    }
                }
                return result;
            },
            formatMatch: function (row, i, max) {
                var result = eval("row." + textfield);
                return result;
            },
            formatResult: function (row) {
                var result = eval("row." + textfield);
                return result;
            }
        }).result(function (event, row, formatted) {
            SyncData(target);
               if (multiple == 'true') {
                this.focus();
                jQuery(this).endInsPoint();
            }
        });
        this.focus(function() { if (multiple==true) { jQuery(this).endInsPoint(); } else this.select(); });
    }

    //同步TextBox和ValueBox中的数据
    function SyncData(target) {
        var data = eval($(target).attr("id") + "_data");
        var textBoxId = $(target).attr("id") + "_TextBox";
        var valueBoxId = $(target).attr("id") + "_ValueBox";
        var multiple = '' + $(target).get(0).getAttribute('multiple') == "true";

        var textfield = $(target).attr("textfield");
        var valuefield = $(target).attr("valuefield");
        var extendfields = $(target).attr("extendfield").split(',');

        var arrText = $("#" + textBoxId).val().split(';');
        var textdata = [];
        var valuedata = [];
        for (var i = 0; i < arrText.length; i++) {
            if (!multiple && textdata.length > 0) {
                break;
            }
            if (arrText[i] == "" || jQuery.inArray(arrText[i], textdata) >= 0) {
                continue;
            }
            for (var j = 0; j < data.length; j++) {
                var row = data[j];
                var text = eval("row." + textfield);
                var value = eval("row." + valuefield);
                if (arrText[i] == text) {
                    var item = {};
                    item.Text = text;
                    item.Value = value;
                    item.Extend = [];
                    for (var m = 0; m < extendfields.length; m++) {
                        if (extendfields[m] == "") {
                            continue;
                        }
                        item.Extend[m] = eval("row." + extendfields[m]);
                    }
                    textdata.push(arrText[i]);
                    valuedata.push(item);
                }
            }
        }
        $("#" + textBoxId).val(textdata.join(";") + ";");
        if($("#" + textBoxId).val()==";") {
            $("#" + textBoxId).val("");
        }
        $("#" + valueBoxId).val(jQuery.toJSON(valuedata));
    }

    function loadItem(control, items, isAll) {
        //显示Loading
        //设置有setTmieout是因为IE太2,在paint的时候会卡住。效果很差
        //而使用colorbox又会造成抖动．
        //只好使用普通方法
        $('#divloadingcontainer').show();

        setTimeout(function () {
            var len = items.length <= maxSize ? items.length : maxSize;
            var start = isAll ? maxSize : 0;
            if (isAll) {
                len = items.length;
            }

            //如果加载的内容少于最大显示值。则不需要添加后面内容
            if (isAll && items.length < maxSize) {

            }
            else {
                var html = "";
                for (var i = start; i < len; i++) {
                    html += "<option title=\"" + items[i].Name + "\" value=\"" + items[i].ID + "\">" + items[i].Name + "</option>";
                    //html += "<option fullname='" + items[i].Code + "' title='" + items[i].Name + "' value=" + items[i].ID + ">" + items[i].Name + "</option>";
                }

                if (isAll)
                    $(control).append(html);
                else
                    $(control).html(html);
            }
            $('#divloadingcontainer').hide();
        }, 200);
    }

    var maxSize = 200;

    //添加指定图标icon
    //不在code中添加主要为跨语言
    function addIcon(target) {
        var textBoxId = $(target).attr("id") + "_TextBox";
        var data = eval($(target).attr("id") + "_data");
        var textfield = $(target).attr("textfield");
        var valuefield = $(target).attr("valuefield");
        var treefield = $(target).attr("treefield");
        var rootvalue = $(target).attr("rootvalue");
        var multiple = '' + $(target).get(0).getAttribute('multiple') == "true";
        
        var obj = $("#" + textBoxId);
        //添加图标
        $(obj).after("<img class='oc_choosericon' src='" + HRCommon_Base_Url + "/resource/image/choose_icon.png' style='margin-bottom: -5px;' />");
        //添加图标点击事件
        var icon = $(obj).next(".oc_choosericon");
 
        $(obj).next(".oc_choosericon").click(function () {
            target = $(this).parent();
            multiple = '' + $(target).get(0).getAttribute('multiple') == "true";
            
            if (top.$("#divGeneralChooser").length > 0) {
                top.$("#divGeneralChooser").remove();
            }
            var title = $(target).attr("title");
            var treeContent = initTree(target);
            var selectContent = initSelect(target);
            top.$("body").append(creatPopDiv("divGeneralChooser", title, treeContent, selectContent));


            top.$.colorbox.close();
            top.$.colorbox({ inline: true, href: ".panel_shadow", innerWidth: "600px",innerHeight: "500px",scrolling: false, opacity: 0.5, overlayClose: false });
            simpleTreeCollection = top.$('.simpleTree').simpleTree(
                {
                    autoclose: true,
                    drag: false,
                    afterDblClick: function (node) {
                        var nodeid = $(node).attr("id");
//                        var fullname = $(node).attr("fullname");
                        var name = $(node).text();
                        //var isleaf = $(node).attr("isleaf") + "";
                        var isdoc = $(node).hasClass("doc") || $(node).hasClass("doc-last");
                        if (!isdoc) return;

                        if (!multiple) $('#destList').html('');

                        var dl = top.document.getElementById("destList");
                        jsAddItemToSelect(dl, name, nodeid, "");
                    },
                    afterClick: function (node) {
                        var nodeid = $(node).attr("id"); //当前节点ID
                        var isleaf = $(node).attr("isleaf") + ""; //当前节点是否是叶子

                        var isdoc = $(node).hasClass("doc") || $(node).hasClass("doc-last");
                        if (isdoc) return;
                        if (isleaf == "0")  {
                            var items = [];
                            if ($(node).children("ul:first").children("li").length > 0) {
                                $(node).children("ul:first").children("li").each(function (i) {
                                    if ($(this).attr("id")) {
                                        var item = {};
                                        item.Name = $(this).text();
                                        item.ID = $(this).attr("id");
                                        items.push(item);
                                    }
                                });
                            }
                            else {
                                var myBuilder = new StringBuilder();
                                for (var i = 0; i < data.length; i++) {
                                    var row = data[i];
                                    var text = eval("row." + textfield);
                                    var value = eval("row." + valuefield);
                                    var parent = eval("row." + treefield);
                                    if (parent == nodeid) {
                                        if (row.isleaf == "0") {
                                            myBuilder.append("<li id=\"" + value + "\" isleaf=\"0\"><span>" + text + "</span><ul></ul></li>");
                                        }
                                        else {
                                            myBuilder.append("<li id=\"" + value + "\" isleaf=\"1\"><span>" + text + "</span></li>");
                                        }
                                        var item = {};
                                        item.Name = text;
                                        item.ID = value;
                                        items.push(item);
                                    }
                                }
                                var nodestext = myBuilder.toString();
                                $(node).children("ul:first").append(nodestext);
                                simpleTreeCollection.get(0).init(node);
                            }
                             if($(target).attr("onlyselectleaf")!="true") {
                                 loadItem(top.$("#sourceList"), items, false);
                             }
                        }
                    }
                });
            if (multiple) {
                top.$("#sourceList").attr("multiple", "multiple");
                top.$("#destList").attr("multiple", "multiple");
            }
            top.$("#sourceList").dblclick(function () {
                souceClick(target);
            });
            top.$("#destList").dblclick(function () {
                destClick(target);
            });
            top.$("#btnSource").click(function () {
                souceClick(target);
            });
            top.$("#btnDest").click(function () {
                destClick(target);
            });
            top.$("#btnSubmit").click(function () {
                backValue(target,true);
            });
        });
    }

    function StringBuilder() {
        this._strs = new Array;
    }
    StringBuilder.prototype.append = function (str) {
        this._strs.push(str);
    };
    StringBuilder.prototype.toString = function () {
        return this._strs.join("");
    };


    function initTree(target) {
        var textfield = $(target).attr("textfield");
        var valuefield = $(target).attr("valuefield");
        var treefield = $(target).attr("treefield");
        var rootvalue = $(target).attr("rootvalue");

        var data = eval($(target).attr("id") + "_data");
        var myBuilder = new StringBuilder();

        var rootindex = -1;

        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            var text = eval("row." + textfield);
            var value = eval("row." + valuefield);

            if (value == rootvalue) {
                rootindex = i;
            }

            if (treefield == "") {
                myBuilder.append("<li id=\"" + value + "\" isleaf=\"1\"><span>" + text + "</span></li>");
            }
            else {
                var parent = eval("row." + treefield);
                if (parent == rootvalue) {
                    if (row.isleaf == "0") {
                        myBuilder.append("<li id=\"" + value + "\" isleaf=\"0\"><span>" + text + "</span><ul></ul></li>");
                    }
                    else {
                        myBuilder.append("<li id=\"" + value + "\" isleaf=\"1\"><span>" + text + "</span></li>");
                    }
                }
            }
        }
        var treeContent = "";
        if (rootindex == -1) {
            treeContent += "<li class=\"root\"  id=\"" + rootvalue + "\"><span>数据列表</span>";
        }
        else {
            var rootrow = data[rootindex];
            var roottext = eval("rootrow." + textfield);
            treeContent += "<li class=\"root\" id=\"" + rootvalue + "\"><span>" + roottext + "</span>";
        }

        treeContent += "<ul>";
        treeContent += myBuilder.toString();
        treeContent += "</ul>";
        treeContent += "</li>";
        return treeContent;
    }
    function initSelect(target) {
        var valueBoxId = $(target).attr("id") + "_ValueBox";
        var selectvalue = $("#" + valueBoxId).val();
        if (selectvalue == "") {
            return "";
        }
        else {
            var data = eval(selectvalue);
            var myBuilder = new StringBuilder();
            for (var i = 0; i < data.length; i++) {
                myBuilder.append("<option  title=\"" + data[i].Text + "\" value=\"" + data[i].Value + "\">" + data[i].Text + "</option>");
            }
            return myBuilder.toString();
        }
    }



    function creatPopDiv(id, title, treeContent, selectContent) {
        var divBuilder = new StringBuilder();
        divBuilder.append("<div id=\"" + id + "\" style=\"display: none\">");
        divBuilder.append("     <div class=\"panel_shadow\" style=\"height: 500px\">");
        divBuilder.append("            <table cellspacing=\"0\" cellpadding=\"0\" style=\"background: white;\">");
        divBuilder.append("                <tbody>");
        divBuilder.append("                    <tr>");
        divBuilder.append("                        <td class=\"container_titlebar\">");
        divBuilder.append("                            <div style=\"cursor: default; float: right; width: 40px; border: none;\">");
        divBuilder.append("                                <div onmouseout=\"this.className=\'container_close\';\" onmouseover=\"this.className=\'container_close_mover\';\"");
        divBuilder.append("                                    class=\"container_close\">");
        divBuilder.append("                                    <img src=\""+HRCommon_Base_Url+"/resource/image/ico_closetip.gif\" width=\"12\" height=\"12\" onclick=\"$.colorbox.close();\"");
        divBuilder.append("                                        alt=\"关闭\" /></div>");
        divBuilder.append("                            </div>");
        divBuilder.append("                            <div class=\"container_title\">" + title + "</div>");
        divBuilder.append("                        </td>");
        divBuilder.append("                    </tr>");
        divBuilder.append("                    <tr>");
        divBuilder.append("                        <td valign=\"top\" style=\"border: medium none; visibility: visible;\">");
        divBuilder.append("                            <div class=\"maincontainer\">");
        divBuilder.append("                                <div id=\"deptcontainer\" class=\"deptcontainer\" style=\"height: 420px\">");
        divBuilder.append("                                    <ul class=\"simpleTree\">");
        divBuilder.append(treeContent);
        divBuilder.append("                                    </ul>");
        divBuilder.append("                                </div>");
        divBuilder.append("                                <div class=\"choosercontainer\">");
        divBuilder.append("                                    <div class=\"chooser_left_container\">");
        divBuilder.append("                                        <select id=\"sourceList\" size=\"25\" style=\"height: 420px\">");
        divBuilder.append("                                        </select>");
        divBuilder.append("                                        <a id=\"aShowAll\" href=\"javascript:void(0)\" onclick=\"showAll();\" style=\"visibility: hidden;");
        divBuilder.append("                                            text-align: right; display: block;\">查看全部</a>");
        divBuilder.append("                                    </div>");
        divBuilder.append("                                    <div class=\"chooser_middle_container\">");
        divBuilder.append("                                        <input type=\"button\" class=\"bttn\" id=\"btnSource\" value=\"&gt;&gt;\" /><br />");
        divBuilder.append("                                        <input type=\"button\" class=\"bttn\" id=\"btnDest\" value=\"&lt;&lt;\" />");
        divBuilder.append("                                    </div>");
        divBuilder.append("                                    <div class=\"chooser_right_container\">");
        divBuilder.append("                                        <select id=\"destList\" size=\"25\" style=\"height: 420px\">");
        divBuilder.append(selectContent);
        divBuilder.append("                                        </select>");
        divBuilder.append("                                    </div>");
        divBuilder.append("                                </div>");
        divBuilder.append("                            </div>");
        divBuilder.append("                        </td>");
        divBuilder.append("                    </tr>");
        divBuilder.append("                    <tr>");
        divBuilder.append("                        <td>");
        divBuilder.append("                            <div class=\"container_bottom\">");
        divBuilder.append("                                <div style=\"float: right; padding-top: 4px; padding-right: 10px\">");
        divBuilder.append("                                    <input type=\"button\" value=\"确认\" id=\"btnSubmit\" class=\"container_btn\" />&nbsp;&nbsp;");
        divBuilder.append("                                    <input type=\"button\" value=\"关闭\" onclick=\"$.colorbox.close();\" class=\"container_btn\" />");
        divBuilder.append("                                </div>");
        divBuilder.append("                            </div>");
        divBuilder.append("                        </td>");
        divBuilder.append("                    </tr>");
        divBuilder.append("                </tbody>");
        divBuilder.append("            </table>");
        divBuilder.append("        </div>");
        divBuilder.append("        <div id=\"divloadingcontainer\">Loading..</div>");
        divBuilder.append("   </div>");
        return divBuilder.toString();
    }

    // 1.判断select选项中 是否存在Value="paraValue"的Item        
    function jsSelectIsExitItem(objSelect, objItemValue) {
        var isExit = false;
        for (var i = 0; i < objSelect.options.length; i++) {
            if (objSelect.options[i].value == objItemValue) {
                isExit = true;
                break;
            }
        }
        return isExit;
    }

    // 2.向select选项中 加入一个Item        
    function jsAddItemToSelect(objSelect, objItemText, objItemValue, objItemFullname) {
        //判断是否存在
        if (jsSelectIsExitItem(objSelect, objItemValue)) {
            return;
        } else {
            var varItem = new Option(objItemText, objItemValue);
            //varItem.fullname = objItemFullname;
            varItem.setAttribute("title", objItemText);
            //            varItem.setAttribute("fullname", objItemFullname);
            objSelect.options.add(varItem);
        }
    }

    // 4.删除select中选中的项    
    function jsRemoveSelectedItemFromSelect(objSelect) {
        var length = objSelect.options.length - 1;
        for (var i = length; i >= 0; i--) {
            if (objSelect.options[i].selected == true) {
                objSelect.options[i] = null;
            }
        }
    }

    function backValue(target,isconfirm) {
        if (isconfirm) {
            var cv = "";
            var dl = top.document.getElementById("destList");
            for (var i = 0; i < dl.options.length; i++) {
                cv += dl.options[i].text + ";";
            }
            var textBoxId = $(target).attr("id") + "_TextBox";
            $("#" + textBoxId).val(cv);
            SyncData(target);
        }
        top.$.colorbox.close();
    }

})(jQuery);

//#endregion
