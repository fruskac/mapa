!function(e,t,n){"use strict";function r(e){var t=null;if("VIDEO"===e.tagName)t=e;else{var n=e.getElementsByTagName("video");n[0]&&(t=n[0])}return t}function l(e){var t=r(e);if(t&&t.webkitEnterFullscreen){try{t.readyState<t.HAVE_METADATA?(t.addEventListener("loadedmetadata",function e(){t.removeEventListener("loadedmetadata",e,!1),t.webkitEnterFullscreen(),u=!!t.getAttribute("controls")},!1),t.load()):(t.webkitEnterFullscreen(),u=!!t.getAttribute("controls")),h=t}catch(t){return v("not_supported",e)}return!0}return v(void 0===a.request?"not_supported":"not_enabled",e)}function i(){g.element||(b(),s())}function o(){n&&"webkitfullscreenchange"===a.change&&window.addEventListener("resize",i,!1)}function s(){n&&"webkitfullscreenchange"===a.change&&window.removeEventListener("resize",i,!1)}var c=/i(Pad|Phone|Pod)/.test(navigator.userAgent)&&parseInt(navigator.userAgent.replace(/^.*OS (\d+)_(\d+).*$/,"$1.$2"),10)>=7,a=function(){var e=t.createElement("video"),n={request:["requestFullscreen","webkitRequestFullscreen","webkitRequestFullScreen","mozRequestFullScreen","msRequestFullscreen"],exit:["exitFullscreen","webkitCancelFullScreen","webkitExitFullscreen","mozCancelFullScreen","msExitFullscreen"],enabled:["fullscreenEnabled","webkitFullscreenEnabled","mozFullScreenEnabled","msFullscreenEnabled"],element:["fullscreenElement","webkitFullscreenElement","webkitCurrentFullScreenElement","mozFullScreenElement","msFullscreenElement"],change:["fullscreenchange","webkitfullscreenchange","mozfullscreenchange","MSFullscreenChange"],error:["fullscreenerror","webkitfullscreenerror","mozfullscreenerror","MSFullscreenError"]},r={};for(var l in n)for(var i=0,o=n[l].length;o>i;i++)if(n[l][i]in e||n[l][i]in t||"on"+n[l][i].toLowerCase()in t){r[l]=n[l][i];break}return r}(),h=null,u=null,f=function(){},d=[],m=!1;navigator.userAgent.indexOf("Android")>-1&&navigator.userAgent.indexOf("Chrome")>-1&&(m=parseInt(navigator.userAgent.replace(/^.*Chrome\/(\d+).*$/,"$1"),10)||!0);var p=function(e){var t=d[d.length-1];t&&(e!==t.element&&e!==h||!t.hasEntered)&&("VIDEO"===e.tagName&&(h=e),1===d.length&&g.onenter(g.element),t.enter.call(t.element,e||t.element),t.hasEntered=!0)},b=function(){!h||u||c||(h.setAttribute("controls","controls"),h.removeAttribute("controls")),h=null,u=null;var e=d.pop();e&&(e.exit.call(e.element),g.element||(d.forEach(function(e){e.exit.call(e.element)}),d=[],g.onexit()))},v=function(e,t){if(d.length>0){var n=d.pop();t=t||n.element,n.error.call(t,e),g.onerror(t,e)}},g={request:function(e,r,i,o){if(e=e||t.body,d.push({element:e,enter:r||f,exit:i||f,error:o||f}),void 0===a.request)return void l(e);if(n&&t[a.enabled]===!1)return void l(e);if(m!==!1&&32>m)return void l(e);if(n&&void 0===a.enabled)return a.enabled="webkitFullscreenEnabled",e[a.request](),void setTimeout(function(){t[a.element]?t[a.enabled]=!0:(t[a.enabled]=!1,l(e))},250);try{e[a.request](),setTimeout(function(){t[a.element]||v(n?"not_enabled":"not_allowed",e)},100)}catch(t){v("not_enabled",e)}},exit:function(){s(),t[a.exit]()},toggle:function(e,t,n,r){g.element?g.exit():g.request(e,t,n,r)},videoEnabled:function(e){if(g.enabled)return!0;e=e||t.body;var n=r(e);return!(!n||void 0===n.webkitSupportsFullscreen)&&(n.readyState<n.HAVE_METADATA?"maybe":n.webkitSupportsFullscreen)},onenter:f,onexit:f,onchange:f,onerror:f};try{Object.defineProperties(g,{element:{enumerable:!0,get:function(){return h&&h.webkitDisplayingFullscreen?h:t[a.element]||null}},enabled:{enumerable:!0,get:function(){return"webkitCancelFullScreen"===a.exit&&!n||!(m!==!1&&32>m)&&(t[a.enabled]||!1)}}}),a.change&&t.addEventListener(a.change,function(e){if(g.onchange(g.element),g.element){var t=d[d.length-2];t&&t.element===g.element?b():(p(g.element),o())}else b()},!1),t.addEventListener("webkitbeginfullscreen",function(e){var t=!0;if(d.length>0)for(var n=0,l=d.length;l>n;n++){var i=r(d[n].element);if(i===e.srcElement){t=!1;break}}t&&d.push({element:e.srcElement,enter:f,exit:f,error:f}),g.onchange(e.srcElement),p(e.srcElement)},!0),t.addEventListener("webkitendfullscreen",function(e){g.onchange(e.srcElement),b(e.srcElement)},!0),a.error&&t.addEventListener(a.error,function(e){v("not_allowed")},!1)}catch(e){g.element=null,g.enabled=!1}"function"==typeof define&&define.amd?define(function(){return g}):"undefined"!=typeof module&&module.exports?module.exports=g:e.BigScreen=g}(this,document,self!==top),!function(e){"object"==typeof module&&"object"==typeof module.exports?e(require("jquery"),window,document):e(window.jQuery,window,document)}(function(e,t,n,r){function l(){var t=e('<div class="scrollbar-width-tester" style="width:50px;height:50px;overflow-y:scroll;top:-200px;left:-200px;"><div style="height:100px;"></div>'),n=0,r=0;return e("body").append(t),n=e(t).innerWidth(),r=e("div",t).innerWidth(),t.remove(),n-r}function i(t,n){this.el=t,this.$el=e(t),this.$track,this.$scrollbar,this.dragOffset,this.flashTimeout,this.$contentEl=this.$el,this.$scrollContentEl=this.$el,this.scrollDirection="vert",this.scrollOffsetAttr="scrollTop",this.sizeAttr="height",this.scrollSizeAttr="scrollHeight",this.offsetAttr="top",this.options=e.extend({},i.DEFAULTS,n),this.theme=this.options.css,this.init()}var o,s="WebkitAppearance"in n.documentElement.style;i.DEFAULTS={wrapContent:!0,autoHide:!0,css:{container:"simplebar",content:"simplebar-content",scrollContent:"simplebar-scroll-content",scrollbar:"simplebar-scrollbar",scrollbarTrack:"simplebar-track"}},i.prototype.init=function(){return"undefined"==typeof o&&(o=l()),0===o?void this.$el.css("overflow","auto"):(("horizontal"===this.$el.data("simplebar-direction")||this.$el.hasClass(this.theme.container+" horizontal"))&&(this.scrollDirection="horiz",this.scrollOffsetAttr="scrollLeft",this.sizeAttr="width",this.scrollSizeAttr="scrollWidth",this.offsetAttr="left"),this.options.wrapContent&&this.$el.wrapInner('<div class="'+this.theme.scrollContent+'"><div class="'+this.theme.content+'"></div></div>'),this.$contentEl=this.$el.find("."+this.theme.content),this.$el.prepend('<div class="'+this.theme.scrollbarTrack+'"><div class="'+this.theme.scrollbar+'"></div></div>'),this.$track=this.$el.find("."+this.theme.scrollbarTrack),this.$scrollbar=this.$el.find("."+this.theme.scrollbar),this.$scrollContentEl=this.$el.find("."+this.theme.scrollContent),this.resizeScrollContent(),this.options.autoHide&&this.$el.on("mouseenter",e.proxy(this.flashScrollbar,this)),this.$scrollbar.on("mousedown",e.proxy(this.startDrag,this)),this.$scrollContentEl.on("scroll",e.proxy(this.startScroll,this)),this.resizeScrollbar(),void(this.options.autoHide||this.showScrollbar()))},i.prototype.startDrag=function(t){t.preventDefault();var r=t.pageY;"horiz"===this.scrollDirection&&(r=t.pageX),this.dragOffset=r-this.$scrollbar.offset()[this.offsetAttr],e(n).on("mousemove",e.proxy(this.drag,this)),e(n).on("mouseup",e.proxy(this.endDrag,this))},i.prototype.drag=function(e){e.preventDefault();var t=e.pageY,n=null,r=null,l=null;"horiz"===this.scrollDirection&&(t=e.pageX),n=t-this.$track.offset()[this.offsetAttr]-this.dragOffset,r=n/this.$track[this.sizeAttr](),l=r*this.$contentEl[0][this.scrollSizeAttr],this.$scrollContentEl[this.scrollOffsetAttr](l)},i.prototype.endDrag=function(){e(n).off("mousemove",this.drag),e(n).off("mouseup",this.endDrag)},i.prototype.resizeScrollbar=function(){if(0!==o){var e=this.$contentEl[0][this.scrollSizeAttr],t=this.$scrollContentEl[this.scrollOffsetAttr](),n=this.$track[this.sizeAttr](),r=n/e,l=Math.round(r*t)+2,i=Math.floor(r*(n-2))-2;e>n?("vert"===this.scrollDirection?this.$scrollbar.css({top:l,height:i}):this.$scrollbar.css({left:l,width:i}),this.$track.show()):this.$track.hide()}},i.prototype.startScroll=function(e){this.$el.trigger(e),this.flashScrollbar()},i.prototype.flashScrollbar=function(){this.resizeScrollbar(),this.showScrollbar()},i.prototype.showScrollbar=function(){this.$scrollbar.addClass("visible"),this.options.autoHide&&("number"==typeof this.flashTimeout&&t.clearTimeout(this.flashTimeout),this.flashTimeout=t.setTimeout(e.proxy(this.hideScrollbar,this),1e3))},i.prototype.hideScrollbar=function(){this.$scrollbar.removeClass("visible"),"number"==typeof this.flashTimeout&&t.clearTimeout(this.flashTimeout)},i.prototype.resizeScrollContent=function(){s||("vert"===this.scrollDirection?(this.$scrollContentEl.width(this.$el.width()+o),this.$scrollContentEl.height(this.$el.height())):(this.$scrollContentEl.width(this.$el.width()),this.$scrollContentEl.height(this.$el.height()+o)))},i.prototype.recalculate=function(){this.resizeScrollContent(),this.resizeScrollbar()},i.prototype.getScrollElement=function(){return this.$scrollContentEl},i.prototype.getContentElement=function(){return this.$contentEl},e(t).on("load",function(){e("[data-simplebar-direction]").each(function(){e(this).simplebar()})});var c=e.fn.simplebar;e.fn.simplebar=function(t){var n,l=arguments;return"undefined"==typeof t||"object"==typeof t?this.each(function(){e.data(this,"simplebar")||e.data(this,"simplebar",new i(this,t))}):"string"==typeof t?(this.each(function(){var r=e.data(this,"simplebar");r instanceof i&&"function"==typeof r[t]&&(n=r[t].apply(r,Array.prototype.slice.call(l,1))),"destroy"===t&&e.data(this,"simplebar",null)}),n!==r?n:this):void 0},e.fn.simplebar.Constructor=i,e.fn.simplebar.noConflict=function(){return e.fn.simplebar=c,this}});