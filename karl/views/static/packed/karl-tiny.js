
(function($){

//
// wiring of tinyMCE editors
//

$(document).ready(function() {

    // See if the wiki plugin needs to be enabled.
    var widget_data = window.karl_client_data && karl_client_data.text || {};
    var plugins = 'paste,embedmedia,spellchecker';
    if (widget_data.enable_wiki_plugin) {
        plugins += ',wicked';
        // Imagedrawer is default enabled on wiki pages.
        // Disabled everywhere else. XXX TODO
        plugins += ',imagedrawer';
    }
     
    // Url that contains the context prefix 
    var here_url = $('#karl-here-url')[0].content;
    // the root url of the tinymce tree
    var tinymce_url = $('#karl-static-url')[0].content + '/tinymce/3.3.8';

    // initialize the editor widget(s)
    $('.mceEditor').tinysafe({
        // All css and js is loaded statically, in our setup.
        // The followings make sure that tinymce does not interfere.
        load_js: false,
        load_editor_css: false,
        script_url: tinymce_url,
        //
        theme: 'advanced',
        skin: 'karl',
        mode: 'specific_textareas',
        height: '400',
        width: '550',
        convert_urls : false,
        gecko_spellcheck : true,
        submit_patch: false,
        entity_encoding: "numeric",
        add_form_submit_trigger: false,
        add_unload_trigger: false,
        strict_loading_mode: true,
        paste_create_paragraphs : false,
        paste_create_linebreaks : false,
        paste_use_dialog : false,
        paste_auto_cleanup_on_paste : true,
        paste_convert_middot_lists : true,
        paste_unindented_list_class : "unindentedList",
        paste_convert_headers_to_strong : true,
        theme_advanced_toolbar_location: 'top',
        theme_advanced_buttons1: 'formatselect, bold, italic, bullist, numlist, link, code, removeformat, justifycenter, justifyleft,justifyright, justifyfull, indent, outdent, image, embedmedia, addwickedlink, delwickedlink, spellchecker',
        theme_advanced_buttons2: '',
        theme_advanced_buttons3: '',
        plugins: plugins,
        extended_valid_elements: "object[classid|codebase|width|height],param[name|value],embed[quality|type|pluginspage|width|height|src|wmode|swliveconnect|allowscriptaccess|allowfullscreen|seamlesstabbing|name|base|flashvars|flashVars|bgcolor],script[src]",
        relative_urls : false,
        forced_root_block : 'p',
        spellchecker_rpc_url: "/tinymce_spellcheck",
        spellchecker_languages : "+English=en",
        // options for imagedrawer
        imagedrawer_dialog_url: here_url + 'drawer_dialog_view.html',
        imagedrawer_upload_url: here_url + 'drawer_upload_view.html',
        imagedrawer_data_url: here_url + 'drawer_data_view.html'
    });  

});

})(jQuery);
/**
 * jquery.tinysafe.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 *
 * Copyright 2010, Balazs Ree <ree@greenfinity.hu>
 * Released under LGPL License.
 *
 * Tested with tinymce 3.3.8.
 *
 ***************************************************************
 *
 *      "Too much magic is bad for the stomach" 
 *                -- unknown programmer.
 *
 * This is a modified version of jquery.tinymce.js.
 * The original version is monkeypatching various jQuery
 * internals and introduces some features new to
 * jQuery, in order to support better access to the dom 
 * of the tinymce widget from jQuery. They are not
 * needed for tinymce itself to work, which is why this
 * plugin is optional even if one uses the jquery edition
 * of tinymce.
 *
 * Patched internals:
 *
 *     text, html, val, append, prepend, remove, replaceWith,
 *     replaceAll, empty, attr
 *
 * This version is created because some people believe that
 * monkeypatching jQuery is unnecessary, intrusive and 
 * potentially dangerous.
 * Also, without the existance of a full regression test suite
 * we have no guarantee to avoid breaking jQuery or any other
 * code that uses jQuery, in a subtle way.
 *
 * This version makes available all features that the original
 * plugin provides, but in a safe way. No monkeypatch to
 * jQuery is introduced, instead the patched version of
 * an internal X is made available under the name tiny_X.
 *
 *
 * Example
 * -------
 *
 * If you want
 *
 *      $(...).attr('value')
 *
 * to have the capability to return the editor's 
 * current content, you use
 *
 *      $(...).tiny_attr('value')
 *
 * instead. 'tiny_attr' will possess the tinymce magic,
 * while 'attr' will continue to work as everyone
 * in the greater universe excepts it to work.
 *
 * For more examples, and to learn what magic is exactly
 * involved, please refer to the original 
 * documentation of the jquery.tinymce plugin,
 * as-provided by the upstream developers.
 *
 *
 * Usage
 * -----
 *
 * The plugin's name is changed from tinymce to:
 *
 *     $(...).tinysafe({
 *         // options here
 *     });
 *
 * This results in initializing the editor widget on
 * the selected elements.
 *
 * Unlike in the original code, the tiny_X functions
 * are always available, even if tinysafe itself
 * is not called.
 * 
 * The :tinymce pseudo selector is provided without
 * a change from the original version.
 *
 *
 ***************************************************************
 * 
 * Prevent loading javascript and css
 *
 *      aka "Please let me specify what I want to load in my page :)"
 *
 * In some use cases, we want to be able to load all js and css 
 * statically from the html, in order to support concatenated resources,
 * faster pageload, better debuggability. However in this case,
 * tinymce must not load its own resources. By default, this
 * is not supported. This becomes possible with this plugin.
 *
 * The option 'load_js', if set to false, will prevent tinymce
 * from dynamically loading any of its plugin and theme javascript. 
 * This is handy if you have a single concatenated resource
 * which you have already included statically from the html.
 * This would be similar to using a 'compressor' view, but
 * the concatenated script does not need to be called *gzip.js,
 * and it does not actually need to be in the tinymce tree.
 *
 * Preventing dynamic loading of css is also supported. 
 * The option 'load_editor_css', if set to false, will prevent tinymce
 * from dynamically loading any of its ui css. This will
 * ovverride any value of the option 'editor_css'.
 *
 *
 * Notes:
 *
 * - if you do want tinymce to load a single css or a set of css,
 *   leave 'load_editor_css' to true, and specify 'editor_css'
 *   as described in the tinymce documentation.
 *
 * - 'load_editor_css' has no effect to the loading of content
 *   css resources inside the content iframe, which still will 
 *   be loaded by tinymce in each case. If you do want tinymce 
 *   to load a single css or a set of css inside the content 
 *   iframe, use 'content_css' as described in the 
 *   tinymce documentation.
 *
 * - Naturally, if you are setting 'load_js' or 'load_editor_css'
 *   fo false, you become responsible to make sure that
 *   your resources include all necessary theme and plugin
 *   js and css needed by tinymce to work.
 *
 *
 * An example to prevent loading any js and editor css (but still
 * let tinymce load the content css inside the content iframe:
 *
 *     $(...).tinysafe({
 *         // All css and js is loaded statically, in our setup.
 *         load_editor_css: false,
 *         load_js: false,
 *
 *         // url won't be loaded either, but it is
 *         // needed for locating the tinymce tree path.
 *         script_url: 'http://the/real/tinymce',  
 *
 *         // more options here
 *     });
 * 
 *
 *
 *
 *
 ***************************************************************
 */
 
(function($) {
    var undefined,
        lazyLoading,
        delayedInits = [],
        win = window;

    $.fn.tinysafe = function(settings) {
        var self = this, url, ed, base, pos, lang, query = "", suffix = "";

        // No match then just ignore the call
        if (!self.length)
            return self;

        // Get editor instance
        if (!settings)
            return tinyMCE.get(self[0].id);

        function init() {
            var editors = [], initCount = 0;

            // XXX patch is always applied now.
            //if (applyPatch) {
            //    applyPatch();
            //    applyPatch = null;
            //}

            // Create an editor instance for each matched node
            self.each(function(i, node) {
                var ed, id = node.id, oninit = settings.oninit;

                // Generate unique id for target element if needed
                if (!id)
                    node.id = id = tinymce.DOM.uniqueId();

                // Create editor instance and render it
                ed = new tinymce.Editor(id, settings);
                editors.push(ed);

                // Add onInit event listener if the oninit setting is defined
                // this logic will fire the oninit callback ones each
                // matched editor instance is initialized
                if (oninit) {
                    ed.onInit.add(function() {
                        var scope, func = oninit;

                        // Fire the oninit event ones each editor instance is initialized
                        if (++initCount == editors.length) {
                            if (tinymce.is(func, "string")) {
                                scope = (func.indexOf(".") === -1) ? null : tinymce.resolve(func.replace(/\.\w+$/, ""));
                                func = tinymce.resolve(func);
                            }

                            // Call the oninit function with the object
                            func.apply(scope || tinymce, editors);
                        }
                    });
                }
            });

            // Render the editor instances in a separate loop since we
            // need to have the full editors array used in the onInit calls
            $.each(editors, function(i, ed) {
                ed.render();
            });
        }

        // XXX support inhibition of javascript and css loading
        var url = settings.script_url;
        if (settings.load_js === false) {
            if (url.charAt(url.length - 1) != '/') {
                // pad out the directory if needed
                url += '/'; 
            }
            // pretend we are a compressor
            url += 'gzip'; 
        }
        if (settings.load_editor_css === false) {
            // There is no easy way to talk tinymce off
            // from loading the editor_css. Unfortunately, the themes
            // will still load either the editor_css parameter, or
            // preload their own css if editor_css is false.
            // (or do whatever they like, since this is done from
            // the theme's code.)
            // The only sensible trick is to set editor_css to
            // something that we already have: this way no loading
            // will happen, and no 404 either.
            var found;
            $('link').each(function() {
                var link = $(this);
                if (link.attr('rel') == 'stylesheet' && 
                        (! link.attr('type') || link.attr('type') == 'text/css') &&
                        link.attr('href') &&
                        (! link.attr('media') || link.attr('media') == 'screen')) {
                    // use the first good one we find.
                    found = link.attr('href');
                    return false;
                }
            });
            if (! found) {
                // Blast. This should not really happen
                found = 'MISS';
            }
            // set the editor_css
            settings.editor_css = found;
        }

        // Load TinyMCE on demand, if we need to
        if ((settings.load_js === false) ||
           (!win["tinymce"] && !lazyLoading && url)) {
            lazyLoading = 1;
            base = url.substring(0, url.lastIndexOf("/"));

            // Check if it's a dev/src version they want to load then
            // make sure that all plugins, themes etc are loaded in source mode aswell
            if (/_(src|dev)\.js/g.test(url))
                suffix = "_src";

            // Parse out query part, this will be appended to all scripts, css etc to clear browser cache
            pos = url.lastIndexOf("?");
            if (pos != -1)
                query = url.substring(pos + 1);

            // Setup tinyMCEPreInit object this will later be used by the TinyMCE
            // core script to locate other resources like CSS files, dialogs etc
            // You can also predefined a tinyMCEPreInit object and then it will use that instead
            win.tinyMCEPreInit = win.tinyMCEPreInit || {
                base : base,
                suffix : suffix,
                query : query
            };

            // url contains gzip then we assume it's a compressor
            if (url.indexOf('gzip') != -1) {
                lang = settings.language || "en";
                url = url + (/\?/.test(url) ? '&' : '?') + "js=true&core=true&suffix=" + escape(suffix) + "&themes=" + escape(settings.theme) + "&plugins=" + escape(settings.plugins) + "&languages=" + lang;

                // Check if compressor script is already loaded otherwise setup a basic one
                if (!win["tinyMCE_GZ"]) {
                    tinyMCE_GZ = {
                        start : function() {
                            tinymce.suffix = suffix;

                            function load(url) {
                                tinymce.ScriptLoader.markDone(tinyMCE.baseURI.toAbsolute(url));
                            }

                            // Add core languages
                            load("langs/" + lang + ".js");

                            // Add themes with languages
                            load("themes/" + settings.theme + "/editor_template" + suffix + ".js");
                            load("themes/" + settings.theme + "/langs/" + lang + ".js");

                            // Add plugins with languages
                            $.each(settings.plugins.split(","), function(i, name) {
                                if (name) {
                                    load("plugins/" + name + "/editor_plugin" + suffix + ".js");
                                    load("plugins/" + name + "/langs/" + lang + ".js");
                                }
                            });
                        },

                        end : function() {
                        }
                    }
                }
            }

            if (settings.load_js === false) {
                // XXX Set the base url. The tinymce _init
                // is doing this when the script is loaded. Depending on
                // script order, this may be critical.
                // Without this, tinymce won't recognize itself as
                // tinymce, and nothing at all would happen.
                tinymce.baseURL = new tinymce.util.URI(tinymce.documentBaseURL)
                    .toAbsolute(tinyMCEPreInit.base);
                if (tinymce.baseURL.charAt(tinymce.baseURL.length - 1) == '/') {
                    // very important: lack of this leads to double-load and silent errors
                    tinymce.baseURL = tinymce.baseURL.substr(0, tinymce.baseURL.length - 1);
                }
                tinymce.baseURI = new tinymce.util.URI(tinymce.baseURL);
                tinymce.dom.Event.domLoaded = 1;
                // XXX mark all scripts loaded, and init
                tinyMCE_GZ.start();
                // Execute callback after mainscript has been loaded and before the initialization occurs
                if (settings.script_loaded) {
                    settings.script_loaded();
                }
                init();
            }
            // Load the script cached and execute the inits once it's done
            (settings.load_js !== false) && $.ajax({
                type : "GET",
                url : url,
                dataType : "script",
                cache : true,
                success : function() {
                    tinymce.dom.Event.domLoaded = 1;
                    lazyLoading = 2;

                    // Execute callback after mainscript has been loaded and before the initialization occurs
                    if (settings.script_loaded)
                        settings.script_loaded();

                    init();

                    $.each(delayedInits, function(i, init) {
                        init();
                    });
                }
            });
        } else {
            // Delay the init call until tinymce is loaded
            if (lazyLoading === 1)
                delayedInits.push(init);
            else
                init();
        }

        return self;
    };

    // Add :tinymce psuedo selector this will select elements that has been converted into editor instances
    // it's now possible to use things like $('*:tinymce') to get all TinyMCE bound elements.
    $.extend($.expr[":"], {
        tinymce : function(e) {
            return e.id && !!tinyMCE.get(e.id);
        }
    });

    // This function patches internal jQuery functions so that if
    // you for example remove an div element containing an editor it's
    // automatically destroyed by the TinyMCE API
    function applyPatch() {
        // Removes any child editor instances by looking for editor wrapper elements
        function removeEditors(name) {
            // If the function is remove
            if (name === "remove") {
                this.each(function(i, node) {
                    var ed = tinyMCEInstance(node);

                    if (ed)
                        ed.remove();
                });
            }

            this.find("span.mceEditor,div.mceEditor").each(function(i, node) {
                var ed = tinyMCE.get(node.id.replace(/_parent$/, ""));

                if (ed)
                    ed.remove();
            });
        }

        // Loads or saves contents from/to textarea if the value
        // argument is defined it will set the TinyMCE internal contents
        function loadOrSave(value) {
            var self = this, ed;

            // Handle set value
            if (value !== undefined) {
                removeEditors.call(self);

                // Saves the contents before get/set value of textarea/div
                self.each(function(i, node) {
                    var ed;

                    if (ed = tinyMCE.get(node.id))
                        ed.setContent(value);
                });
            } else if (self.length > 0) {
                // Handle get value
                if (ed = tinyMCE.get(self[0].id))
                    return ed.getContent();
            }
        }

        // Returns tinymce instance for the specified element or null if it wasn't found
        function tinyMCEInstance(element) {
            var ed = null;

            (element) && (element.id) && (win["tinymce"]) && (ed = tinyMCE.get(element.id));

            return ed;
        }

        // Checks if the specified set contains tinymce instances
        function containsTinyMCE(matchedSet) {
            return !!((matchedSet) && (matchedSet.length) && (win["tinymce"]) && (matchedSet.is(":tinymce")));
        }

        // Patch various jQuery functions
        var jQueryFn = {};

        // Patch some setter/getter functions these will
        // now be able to set/get the contents of editor instances for
        // example $('#editorid').html('Content'); will update the TinyMCE iframe instance
        $.each(["text", "html", "val"], function(i, name) {
            var origFn = jQueryFn[name] = $.fn[name],
                textProc = (name === "text");

             $.fn['tiny_' + name] = function(value) {
                var self = this;

                if (!containsTinyMCE(self))
                    return origFn.apply(self, arguments);

                if (value !== undefined) {
                    loadOrSave.call(self.filter(":tinymce"), value);
                    origFn.apply(self.not(":tinymce"), arguments);

                    return self; // return original set for chaining
                } else {
                    var ret = "";
                    var args = arguments;
                    
                    (textProc ? self : self.eq(0)).each(function(i, node) {
                        var ed = tinyMCEInstance(node);

                        ret += ed ? (textProc ? ed.getContent().replace(/<(?:"[^"]*"|'[^']*'|[^'">])*>/g, "") : ed.getContent()) : origFn.apply($(node), args);
                    });

                    return ret;
                }
             };
        });

        // Makes it possible to use $('#id').append("content"); to append contents to the TinyMCE editor iframe
        $.each(["append", "prepend"], function(i, name) {
            var origFn = jQueryFn[name] = $.fn[name],
                prepend = (name === "prepend");

             $.fn['tiny_' + name] = function(value) {
                var self = this;

                if (!containsTinyMCE(self))
                    return origFn.apply(self, arguments);

                if (value !== undefined) {
                    self.filter(":tinymce").each(function(i, node) {
                        var ed = tinyMCEInstance(node);

                        ed && ed.setContent(prepend ? value + ed.getContent() : ed.getContent() + value);
                    });

                    origFn.apply(self.not(":tinymce"), arguments);

                    return self; // return original set for chaining
                }
             };
        });

        // Makes sure that the editor instance gets properly destroyed when the parent element is removed
        $.each(["remove", "replaceWith", "replaceAll", "empty"], function(i, name) {
            var origFn = jQueryFn[name] = $.fn[name];

            $.fn['tiny_' + name] = function() {
                removeEditors.call(this, name);

                return origFn.apply(this, arguments);
            };
        });

        jQueryFn.attr = $.fn.attr;

        // Makes sure that $('#tinymce_id').attr('value') gets the editors current HTML contents
        $.fn.tiny_attr = function(name, value, type) {
            var self = this;

            if ((!name) || (name !== "value") || (!containsTinyMCE(self)))
                return jQueryFn.attr.call(self, name, value, type);

            if (value !== undefined) {
                loadOrSave.call(self.filter(":tinymce"), value);
                jQueryFn.attr.call(self.not(":tinymce"), name, value, type);

                return self; // return original set for chaining
            } else {
                var node = self[0], ed = tinyMCEInstance(node);

                return ed ? ed.getContent() : jQueryFn.attr.call($(node), name, value, type);
            }
        };
    }


    // XXX Apply the patch, when the code is loaded.
    if (applyPatch) {
        applyPatch();
        applyPatch = null;
    }

})(jQuery);
(function(c){var a=/^\s*|\s*$/g,d;var b={majorVersion:"3",minorVersion:"3.8",releaseDate:"2010-06-30",_init:function(){var r=this,o=document,m=navigator,f=m.userAgent,l,e,k,j,h,q;r.isOpera=c.opera&&opera.buildNumber;r.isWebKit=/WebKit/.test(f);r.isIE=!r.isWebKit&&!r.isOpera&&(/MSIE/gi).test(f)&&(/Explorer/gi).test(m.appName);r.isIE6=r.isIE&&/MSIE [56]/.test(f);r.isGecko=!r.isWebKit&&/Gecko/.test(f);r.isMac=f.indexOf("Mac")!=-1;r.isAir=/adobeair/i.test(f);r.isIDevice=/(iPad|iPhone)/.test(f);if(c.tinyMCEPreInit){r.suffix=tinyMCEPreInit.suffix;r.baseURL=tinyMCEPreInit.base;r.query=tinyMCEPreInit.query;return}r.suffix="";e=o.getElementsByTagName("base");for(l=0;l<e.length;l++){if(q=e[l].href){if(/^https?:\/\/[^\/]+$/.test(q)){q+="/"}j=q?q.match(/.*\//)[0]:""}}function g(i){if(i.src&&/tiny_mce(|_gzip|_jquery|_prototype)(_dev|_src)?.js/.test(i.src)){if(/_(src|dev)\.js/g.test(i.src)){r.suffix="_src"}if((h=i.src.indexOf("?"))!=-1){r.query=i.src.substring(h+1)}r.baseURL=i.src.substring(0,i.src.lastIndexOf("/"));if(j&&r.baseURL.indexOf("://")==-1&&r.baseURL.indexOf("/")!==0){r.baseURL=j+r.baseURL}return r.baseURL}return null}e=o.getElementsByTagName("script");for(l=0;l<e.length;l++){if(g(e[l])){return}}k=o.getElementsByTagName("head")[0];if(k){e=k.getElementsByTagName("script");for(l=0;l<e.length;l++){if(g(e[l])){return}}}return},is:function(f,e){if(!e){return f!==d}if(e=="array"&&(f.hasOwnProperty&&f instanceof Array)){return true}return typeof(f)==e},each:function(h,e,g){var i,f;if(!h){return 0}g=g||h;if(h.length!==d){for(i=0,f=h.length;i<f;i++){if(e.call(g,h[i],i,h)===false){return 0}}}else{for(i in h){if(h.hasOwnProperty(i)){if(e.call(g,h[i],i,h)===false){return 0}}}}return 1},trim:function(e){return(e?""+e:"").replace(a,"")},create:function(m,e){var l=this,f,h,i,j,g,k=0;m=/^((static) )?([\w.]+)(:([\w.]+))?/.exec(m);i=m[3].match(/(^|\.)(\w+)$/i)[2];h=l.createNS(m[3].replace(/\.\w+$/,""));if(h[i]){return}if(m[2]=="static"){h[i]=e;if(this.onCreate){this.onCreate(m[2],m[3],h[i])}return}if(!e[i]){e[i]=function(){};k=1}h[i]=e[i];l.extend(h[i].prototype,e);if(m[5]){f=l.resolve(m[5]).prototype;j=m[5].match(/\.(\w+)$/i)[1];g=h[i];if(k){h[i]=function(){return f[j].apply(this,arguments)}}else{h[i]=function(){this.parent=f[j];return g.apply(this,arguments)}}h[i].prototype[i]=h[i];l.each(f,function(o,p){h[i].prototype[p]=f[p]});l.each(e,function(o,p){if(f[p]){h[i].prototype[p]=function(){this.parent=f[p];return o.apply(this,arguments)}}else{if(p!=i){h[i].prototype[p]=o}}})}l.each(e["static"],function(o,p){h[i][p]=o});if(this.onCreate){this.onCreate(m[2],m[3],h[i].prototype)}},walk:function(h,g,i,e){e=e||this;if(h){if(i){h=h[i]}b.each(h,function(j,f){if(g.call(e,j,f,i)===false){return false}b.walk(j,g,i,e)})}},createNS:function(h,g){var f,e;g=g||c;h=h.split(".");for(f=0;f<h.length;f++){e=h[f];if(!g[e]){g[e]={}}g=g[e]}return g},resolve:function(h,g){var f,e;g=g||c;h=h.split(".");for(f=0,e=h.length;f<e;f++){g=g[h[f]];if(!g){break}}return g},addUnload:function(i,h){var g=this;i={func:i,scope:h||this};if(!g.unloads){function e(){var f=g.unloads,k,l;if(f){for(l in f){k=f[l];if(k&&k.func){k.func.call(k.scope,1)}}if(c.detachEvent){c.detachEvent("onbeforeunload",j);c.detachEvent("onunload",e)}else{if(c.removeEventListener){c.removeEventListener("unload",e,false)}}g.unloads=k=f=w=e=0;if(c.CollectGarbage){CollectGarbage()}}}function j(){var k=document;if(k.readyState=="interactive"){function f(){k.detachEvent("onstop",f);if(e){e()}k=0}if(k){k.attachEvent("onstop",f)}c.setTimeout(function(){if(k){k.detachEvent("onstop",f)}},0)}}if(c.attachEvent){c.attachEvent("onunload",e);c.attachEvent("onbeforeunload",j)}else{if(c.addEventListener){c.addEventListener("unload",e,false)}}g.unloads=[i]}else{g.unloads.push(i)}return i},removeUnload:function(h){var e=this.unloads,g=null;b.each(e,function(j,f){if(j&&j.func==h){e.splice(f,1);g=h;return false}});return g},explode:function(e,f){return e?b.map(e.split(f||","),b.trim):e},_addVer:function(f){var e;if(!this.query){return f}e=(f.indexOf("?")==-1?"?":"&")+this.query;if(f.indexOf("#")==-1){return f+e}return f.replace("#",e+"#")}};b._init();c.tinymce=c.tinyMCE=b})(window);(function(e,d){var c=d.is,b=/^(href|src|style)$/i,f;if(!e){return alert("Load jQuery first!")}d.$=e;d.adapter={patchEditor:function(j){var i=e.fn;function h(n,o){var m=this;if(o){m.removeAttr("_mce_style")}return i.css.apply(m,arguments)}function g(n,o){var m=this;if(b.test(n)){if(o!==f){m.each(function(p,q){j.dom.setAttrib(q,n,o)});return m}else{return m.attr("_mce_"+n)}}return i.attr.apply(m,arguments)}function k(m){return function(n){if(n){n=j.dom.processHTML(n)}return m.call(this,n)}}function l(m){if(m.css!==h){m.css=h;m.attr=g;m.html=k(i.html);m.append=k(i.append);m.prepend=k(i.prepend);m.after=k(i.after);m.before=k(i.before);m.replaceWith=k(i.replaceWith);m.tinymce=j;m.pushStack=function(){return l(i.pushStack.apply(this,arguments))}}return m}j.$=function(m,n){var o=j.getDoc();return l(e(m||o,o||n))}}};d.extend=e.extend;d.extend(d,{map:e.map,grep:function(g,h){return e.grep(g,h||function(){return 1})},inArray:function(g,h){return e.inArray(h,g||[])}});var a={"tinymce.dom.DOMUtils":{select:function(i,h){var g=this;return e.find(i,g.get(h)||g.get(g.settings.root_element)||g.doc,[])},is:function(h,g){return e(this.get(h)).is(g)}}};d.onCreate=function(g,i,h){d.extend(h,a[i])}})(window.jQuery,tinymce);tinymce.create("tinymce.util.Dispatcher",{scope:null,listeners:null,Dispatcher:function(a){this.scope=a||this;this.listeners=[]},add:function(a,b){this.listeners.push({cb:a,scope:b||this.scope});return a},addToTop:function(a,b){this.listeners.unshift({cb:a,scope:b||this.scope});return a},remove:function(a){var b=this.listeners,c=null;tinymce.each(b,function(e,d){if(a==e.cb){c=a;b.splice(d,1);return false}});return c},dispatch:function(){var f,d=arguments,e,b=this.listeners,g;for(e=0;e<b.length;e++){g=b[e];f=g.cb.apply(g.scope,d);if(f===false){break}}return f}});(function(){var a=tinymce.each;tinymce.create("tinymce.util.URI",{URI:function(e,g){var f=this,h,d,c;e=tinymce.trim(e);g=f.settings=g||{};if(/^(mailto|tel|news|javascript|about|data):/i.test(e)||/^\s*#/.test(e)){f.source=e;return}if(e.indexOf("/")===0&&e.indexOf("//")!==0){e=(g.base_uri?g.base_uri.protocol||"http":"http")+"://mce_host"+e}if(!/^\w*:?\/\//.test(e)){e=(g.base_uri.protocol||"http")+"://mce_host"+f.toAbsPath(g.base_uri.path,e)}e=e.replace(/@@/g,"(mce_at)");e=/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(e);a(["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],function(b,j){var k=e[j];if(k){k=k.replace(/\(mce_at\)/g,"@@")}f[b]=k});if(c=g.base_uri){if(!f.protocol){f.protocol=c.protocol}if(!f.userInfo){f.userInfo=c.userInfo}if(!f.port&&f.host=="mce_host"){f.port=c.port}if(!f.host||f.host=="mce_host"){f.host=c.host}f.source=""}},setPath:function(c){var b=this;c=/^(.*?)\/?(\w+)?$/.exec(c);b.path=c[0];b.directory=c[1];b.file=c[2];b.source="";b.getURI()},toRelative:function(b){var c=this,d;if(b==="./"){return b}b=new tinymce.util.URI(b,{base_uri:c});if((b.host!="mce_host"&&c.host!=b.host&&b.host)||c.port!=b.port||c.protocol!=b.protocol){return b.getURI()}d=c.toRelPath(c.path,b.path);if(b.query){d+="?"+b.query}if(b.anchor){d+="#"+b.anchor}return d},toAbsolute:function(b,c){var b=new tinymce.util.URI(b,{base_uri:this});return b.getURI(this.host==b.host&&this.protocol==b.protocol?c:0)},toRelPath:function(g,h){var c,f=0,d="",e,b;g=g.substring(0,g.lastIndexOf("/"));g=g.split("/");c=h.split("/");if(g.length>=c.length){for(e=0,b=g.length;e<b;e++){if(e>=c.length||g[e]!=c[e]){f=e+1;break}}}if(g.length<c.length){for(e=0,b=c.length;e<b;e++){if(e>=g.length||g[e]!=c[e]){f=e+1;break}}}if(f==1){return h}for(e=0,b=g.length-(f-1);e<b;e++){d+="../"}for(e=f-1,b=c.length;e<b;e++){if(e!=f-1){d+="/"+c[e]}else{d+=c[e]}}return d},toAbsPath:function(e,f){var c,b=0,h=[],d,g;d=/\/$/.test(f)?"/":"";e=e.split("/");f=f.split("/");a(e,function(i){if(i){h.push(i)}});e=h;for(c=f.length-1,h=[];c>=0;c--){if(f[c].length==0||f[c]=="."){continue}if(f[c]==".."){b++;continue}if(b>0){b--;continue}h.push(f[c])}c=e.length-b;if(c<=0){g=h.reverse().join("/")}else{g=e.slice(0,c).join("/")+"/"+h.reverse().join("/")}if(g.indexOf("/")!==0){g="/"+g}if(d&&g.lastIndexOf("/")!==g.length-1){g+=d}return g},getURI:function(d){var c,b=this;if(!b.source||d){c="";if(!d){if(b.protocol){c+=b.protocol+"://"}if(b.userInfo){c+=b.userInfo+"@"}if(b.host){c+=b.host}if(b.port){c+=":"+b.port}}if(b.path){c+=b.path}if(b.query){c+="?"+b.query}if(b.anchor){c+="#"+b.anchor}b.source=c}return b.source}})})();(function(){var a=tinymce.each;tinymce.create("static tinymce.util.Cookie",{getHash:function(d){var b=this.get(d),c;if(b){a(b.split("&"),function(e){e=e.split("=");c=c||{};c[unescape(e[0])]=unescape(e[1])})}return c},setHash:function(j,b,g,f,i,c){var h="";a(b,function(e,d){h+=(!h?"":"&")+escape(d)+"="+escape(e)});this.set(j,h,g,f,i,c)},get:function(i){var h=document.cookie,g,f=i+"=",d;if(!h){return}d=h.indexOf("; "+f);if(d==-1){d=h.indexOf(f);if(d!=0){return null}}else{d+=2}g=h.indexOf(";",d);if(g==-1){g=h.length}return unescape(h.substring(d+f.length,g))},set:function(i,b,g,f,h,c){document.cookie=i+"="+escape(b)+((g)?"; expires="+g.toGMTString():"")+((f)?"; path="+escape(f):"")+((h)?"; domain="+h:"")+((c)?"; secure":"")},remove:function(e,b){var c=new Date();c.setTime(c.getTime()-1000);this.set(e,"",c,b,c)}})})();tinymce.create("static tinymce.util.JSON",{serialize:function(e){var c,a,d=tinymce.util.JSON.serialize,b;if(e==null){return"null"}b=typeof e;if(b=="string"){a="\bb\tt\nn\ff\rr\"\"''\\\\";return'"'+e.replace(/([\u0080-\uFFFF\x00-\x1f\"])/g,function(g,f){c=a.indexOf(f);if(c+1){return"\\"+a.charAt(c+1)}g=f.charCodeAt().toString(16);return"\\u"+"0000".substring(g.length)+g})+'"'}if(b=="object"){if(e.hasOwnProperty&&e instanceof Array){for(c=0,a="[";c<e.length;c++){a+=(c>0?",":"")+d(e[c])}return a+"]"}a="{";for(c in e){a+=typeof e[c]!="function"?(a.length>1?',"':'"')+c+'":'+d(e[c]):""}return a+"}"}return""+e},parse:function(s){try{return eval("("+s+")")}catch(ex){}}});tinymce.create("static tinymce.util.XHR",{send:function(g){var a,e,b=window,h=0;g.scope=g.scope||this;g.success_scope=g.success_scope||g.scope;g.error_scope=g.error_scope||g.scope;g.async=g.async===false?false:true;g.data=g.data||"";function d(i){a=0;try{a=new ActiveXObject(i)}catch(c){}return a}a=b.XMLHttpRequest?new XMLHttpRequest():d("Microsoft.XMLHTTP")||d("Msxml2.XMLHTTP");if(a){if(a.overrideMimeType){a.overrideMimeType(g.content_type)}a.open(g.type||(g.data?"POST":"GET"),g.url,g.async);if(g.content_type){a.setRequestHeader("Content-Type",g.content_type)}a.setRequestHeader("X-Requested-With","XMLHttpRequest");a.send(g.data);function f(){if(!g.async||a.readyState==4||h++>10000){if(g.success&&h<10000&&a.status==200){g.success.call(g.success_scope,""+a.responseText,a,g)}else{if(g.error){g.error.call(g.error_scope,h>10000?"TIMED_OUT":"GENERAL",a,g)}}a=null}else{b.setTimeout(f,10)}}if(!g.async){return f()}e=b.setTimeout(f,10)}}});(function(){var c=tinymce.extend,b=tinymce.util.JSON,a=tinymce.util.XHR;tinymce.create("tinymce.util.JSONRequest",{JSONRequest:function(d){this.settings=c({},d);this.count=0},send:function(f){var e=f.error,d=f.success;f=c(this.settings,f);f.success=function(h,g){h=b.parse(h);if(typeof(h)=="undefined"){h={error:"JSON Parse error."}}if(h.error){e.call(f.error_scope||f.scope,h.error,g)}else{d.call(f.success_scope||f.scope,h.result)}};f.error=function(h,g){e.call(f.error_scope||f.scope,h,g)};f.data=b.serialize({id:f.id||"c"+(this.count++),method:f.method,params:f.params});f.content_type="application/json";a.send(f)},"static":{sendRPC:function(d){return new tinymce.util.JSONRequest().send(d)}}})}());(function(m){var k=m.each,j=m.is,i=m.isWebKit,d=m.isIE,a=/^(H[1-6R]|P|DIV|ADDRESS|PRE|FORM|T(ABLE|BODY|HEAD|FOOT|H|R|D)|LI|OL|UL|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|DIR|FIELDSET|NOSCRIPT|MENU|ISINDEX|SAMP)$/,e=g("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected"),f=g("src,href,style,coords,shape"),c={"&":"&amp;",'"':"&quot;","<":"&lt;",">":"&gt;"},n=/[<>&\"]/g,b=/^([a-z0-9],?)+$/i,h=/<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)(\s*\/?)>/g,l=/(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;function g(q){var p={},o;q=q.split(",");for(o=q.length;o>=0;o--){p[q[o]]=1}return p}m.create("tinymce.dom.DOMUtils",{doc:null,root:null,files:null,pixelStyles:/^(top|left|bottom|right|width|height|borderWidth)$/,props:{"for":"htmlFor","class":"className",className:"className",checked:"checked",disabled:"disabled",maxlength:"maxLength",readonly:"readOnly",selected:"selected",value:"value",id:"id",name:"name",type:"type"},DOMUtils:function(u,q){var p=this,o;p.doc=u;p.win=window;p.files={};p.cssFlicker=false;p.counter=0;p.boxModel=!m.isIE||u.compatMode=="CSS1Compat";p.stdMode=u.documentMode===8;p.settings=q=m.extend({keep_values:false,hex_colors:1,process_html:1},q);if(m.isIE6){try{u.execCommand("BackgroundImageCache",false,true)}catch(r){p.cssFlicker=true}}if(q.valid_styles){p._styles={};k(q.valid_styles,function(t,s){p._styles[s]=m.explode(t)})}m.addUnload(p.destroy,p)},getRoot:function(){var o=this,p=o.settings;return(p&&o.get(p.root_element))||o.doc.body},getViewPort:function(p){var q,o;p=!p?this.win:p;q=p.document;o=this.boxModel?q.documentElement:q.body;return{x:p.pageXOffset||o.scrollLeft,y:p.pageYOffset||o.scrollTop,w:p.innerWidth||o.clientWidth,h:p.innerHeight||o.clientHeight}},getRect:function(s){var r,o=this,q;s=o.get(s);r=o.getPos(s);q=o.getSize(s);return{x:r.x,y:r.y,w:q.w,h:q.h}},getSize:function(r){var p=this,o,q;r=p.get(r);o=p.getStyle(r,"width");q=p.getStyle(r,"height");if(o.indexOf("px")===-1){o=0}if(q.indexOf("px")===-1){q=0}return{w:parseInt(o)||r.offsetWidth||r.clientWidth,h:parseInt(q)||r.offsetHeight||r.clientHeight}},getParent:function(q,p,o){return this.getParents(q,p,o,false)},getParents:function(z,v,s,y){var q=this,p,u=q.settings,x=[];z=q.get(z);y=y===undefined;if(u.strict_root){s=s||q.getRoot()}if(j(v,"string")){p=v;if(v==="*"){v=function(o){return o.nodeType==1}}else{v=function(o){return q.is(o,p)}}}while(z){if(z==s||!z.nodeType||z.nodeType===9){break}if(!v||v(z)){if(y){x.push(z)}else{return z}}z=z.parentNode}return y?x:null},get:function(o){var p;if(o&&this.doc&&typeof(o)=="string"){p=o;o=this.doc.getElementById(o);if(o&&o.id!==p){return this.doc.getElementsByName(p)[1]}}return o},getNext:function(p,o){return this._findSib(p,o,"nextSibling")},getPrev:function(p,o){return this._findSib(p,o,"previousSibling")},add:function(s,v,o,r,u){var q=this;return this.run(s,function(y){var x,t;x=j(v,"string")?q.doc.createElement(v):v;q.setAttribs(x,o);if(r){if(r.nodeType){x.appendChild(r)}else{q.setHTML(x,r)}}return !u?y.appendChild(x):x})},create:function(q,o,p){return this.add(this.doc.createElement(q),q,o,p,1)},createHTML:function(v,p,s){var u="",r=this,q;u+="<"+v;for(q in p){if(p.hasOwnProperty(q)){u+=" "+q+'="'+r.encode(p[q])+'"'}}if(m.is(s)){return u+">"+s+"</"+v+">"}return u+" />"},remove:function(o,p){return this.run(o,function(r){var q,s;q=r.parentNode;if(!q){return null}if(p){while(s=r.firstChild){if(!m.isIE||s.nodeType!==3||s.nodeValue){q.insertBefore(s,r)}else{r.removeChild(s)}}}return q.removeChild(r)})},setStyle:function(r,o,p){var q=this;return q.run(r,function(v){var u,t;u=v.style;o=o.replace(/-(\D)/g,function(x,s){return s.toUpperCase()});if(q.pixelStyles.test(o)&&(m.is(p,"number")||/^[\-0-9\.]+$/.test(p))){p+="px"}switch(o){case"opacity":if(d){u.filter=p===""?"":"alpha(opacity="+(p*100)+")";if(!r.currentStyle||!r.currentStyle.hasLayout){u.display="inline-block"}}u[o]=u["-moz-opacity"]=u["-khtml-opacity"]=p||"";break;case"float":d?u.styleFloat=p:u.cssFloat=p;break;default:u[o]=p||""}if(q.settings.update_styles){q.setAttrib(v,"_mce_style")}})},getStyle:function(r,o,q){r=this.get(r);if(!r){return false}if(this.doc.defaultView&&q){o=o.replace(/[A-Z]/g,function(s){return"-"+s});try{return this.doc.defaultView.getComputedStyle(r,null).getPropertyValue(o)}catch(p){return null}}o=o.replace(/-(\D)/g,function(t,s){return s.toUpperCase()});if(o=="float"){o=d?"styleFloat":"cssFloat"}if(r.currentStyle&&q){return r.currentStyle[o]}return r.style[o]},setStyles:function(u,v){var q=this,r=q.settings,p;p=r.update_styles;r.update_styles=0;k(v,function(o,s){q.setStyle(u,s,o)});r.update_styles=p;if(r.update_styles){q.setAttrib(u,r.cssText)}},setAttrib:function(q,r,o){var p=this;if(!q||!r){return}if(p.settings.strict){r=r.toLowerCase()}return this.run(q,function(u){var t=p.settings;switch(r){case"style":if(!j(o,"string")){k(o,function(s,x){p.setStyle(u,x,s)});return}if(t.keep_values){if(o&&!p._isRes(o)){u.setAttribute("_mce_style",o,2)}else{u.removeAttribute("_mce_style",2)}}u.style.cssText=o;break;case"class":u.className=o||"";break;case"src":case"href":if(t.keep_values){if(t.url_converter){o=t.url_converter.call(t.url_converter_scope||p,o,r,u)}p.setAttrib(u,"_mce_"+r,o,2)}break;case"shape":u.setAttribute("_mce_style",o);break}if(j(o)&&o!==null&&o.length!==0){u.setAttribute(r,""+o,2)}else{u.removeAttribute(r,2)}})},setAttribs:function(q,r){var p=this;return this.run(q,function(o){k(r,function(s,t){p.setAttrib(o,t,s)})})},getAttrib:function(r,s,q){var o,p=this;r=p.get(r);if(!r||r.nodeType!==1){return false}if(!j(q)){q=""}if(/^(src|href|style|coords|shape)$/.test(s)){o=r.getAttribute("_mce_"+s);if(o){return o}}if(d&&p.props[s]){o=r[p.props[s]];o=o&&o.nodeValue?o.nodeValue:o}if(!o){o=r.getAttribute(s,2)}if(/^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noshade|nowrap|readonly|selected)$/.test(s)){if(r[p.props[s]]===true&&o===""){return s}return o?s:""}if(r.nodeName==="FORM"&&r.getAttributeNode(s)){return r.getAttributeNode(s).nodeValue}if(s==="style"){o=o||r.style.cssText;if(o){o=p.serializeStyle(p.parseStyle(o),r.nodeName);if(p.settings.keep_values&&!p._isRes(o)){r.setAttribute("_mce_style",o)}}}if(i&&s==="class"&&o){o=o.replace(/(apple|webkit)\-[a-z\-]+/gi,"")}if(d){switch(s){case"rowspan":case"colspan":if(o===1){o=""}break;case"size":if(o==="+0"||o===20||o===0){o=""}break;case"width":case"height":case"vspace":case"checked":case"disabled":case"readonly":if(o===0){o=""}break;case"hspace":if(o===-1){o=""}break;case"maxlength":case"tabindex":if(o===32768||o===2147483647||o==="32768"){o=""}break;case"multiple":case"compact":case"noshade":case"nowrap":if(o===65535){return s}return q;case"shape":o=o.toLowerCase();break;default:if(s.indexOf("on")===0&&o){o=(""+o).replace(/^function\s+\w+\(\)\s+\{\s+(.*)\s+\}$/,"$1")}}}return(o!==undefined&&o!==null&&o!=="")?""+o:q},getPos:function(A,s){var p=this,o=0,z=0,u,v=p.doc,q;A=p.get(A);s=s||v.body;if(A){if(d&&!p.stdMode){A=A.getBoundingClientRect();u=p.boxModel?v.documentElement:v.body;o=p.getStyle(p.select("html")[0],"borderWidth");o=(o=="medium"||p.boxModel&&!p.isIE6)&&2||o;return{x:A.left+u.scrollLeft-o,y:A.top+u.scrollTop-o}}q=A;while(q&&q!=s&&q.nodeType){o+=q.offsetLeft||0;z+=q.offsetTop||0;q=q.offsetParent}q=A.parentNode;while(q&&q!=s&&q.nodeType){o-=q.scrollLeft||0;z-=q.scrollTop||0;q=q.parentNode}}return{x:o,y:z}},parseStyle:function(r){var u=this,v=u.settings,x={};if(!r){return x}function p(D,A,C){var z,B,o,y;z=x[D+"-top"+A];if(!z){return}B=x[D+"-right"+A];if(z!=B){return}o=x[D+"-bottom"+A];if(B!=o){return}y=x[D+"-left"+A];if(o!=y){return}x[C]=y;delete x[D+"-top"+A];delete x[D+"-right"+A];delete x[D+"-bottom"+A];delete x[D+"-left"+A]}function q(y,s,o,A){var z;z=x[s];if(!z){return}z=x[o];if(!z){return}z=x[A];if(!z){return}x[y]=x[s]+" "+x[o]+" "+x[A];delete x[s];delete x[o];delete x[A]}r=r.replace(/&(#?[a-z0-9]+);/g,"&$1_MCE_SEMI_");k(r.split(";"),function(s){var o,t=[];if(s){s=s.replace(/_MCE_SEMI_/g,";");s=s.replace(/url\([^\)]+\)/g,function(y){t.push(y);return"url("+t.length+")"});s=s.split(":");o=m.trim(s[1]);o=o.replace(/url\(([^\)]+)\)/g,function(z,y){return t[parseInt(y)-1]});o=o.replace(/rgb\([^\)]+\)/g,function(y){return u.toHex(y)});if(v.url_converter){o=o.replace(/url\([\'\"]?([^\)\'\"]+)[\'\"]?\)/g,function(y,z){return"url("+v.url_converter.call(v.url_converter_scope||u,u.decode(z),"style",null)+")"})}x[m.trim(s[0]).toLowerCase()]=o}});p("border","","border");p("border","-width","border-width");p("border","-color","border-color");p("border","-style","border-style");p("padding","","padding");p("margin","","margin");q("border","border-width","border-style","border-color");if(d){if(x.border=="medium none"){x.border=""}}return x},serializeStyle:function(v,p){var q=this,r="";function u(s,o){if(o&&s){if(o.indexOf("-")===0){return}switch(o){case"font-weight":if(s==700){s="bold"}break;case"color":case"background-color":s=s.toLowerCase();break}r+=(r?" ":"")+o+": "+s+";"}}if(p&&q._styles){k(q._styles["*"],function(o){u(v[o],o)});k(q._styles[p.toLowerCase()],function(o){u(v[o],o)})}else{k(v,u)}return r},loadCSS:function(o){var q=this,r=q.doc,p;if(!o){o=""}p=q.select("head")[0];k(o.split(","),function(s){var t;if(q.files[s]){return}q.files[s]=true;t=q.create("link",{rel:"stylesheet",href:m._addVer(s)});if(d&&r.documentMode){t.onload=function(){r.recalc();t.onload=null}}p.appendChild(t)})},addClass:function(o,p){return this.run(o,function(q){var r;if(!p){return 0}if(this.hasClass(q,p)){return q.className}r=this.removeClass(q,p);return q.className=(r!=""?(r+" "):"")+p})},removeClass:function(q,r){var o=this,p;return o.run(q,function(t){var s;if(o.hasClass(t,r)){if(!p){p=new RegExp("(^|\\s+)"+r+"(\\s+|$)","g")}s=t.className.replace(p," ");s=m.trim(s!=" "?s:"");t.className=s;if(!s){t.removeAttribute("class");t.removeAttribute("className")}return s}return t.className})},hasClass:function(p,o){p=this.get(p);if(!p||!o){return false}return(" "+p.className+" ").indexOf(" "+o+" ")!==-1},show:function(o){return this.setStyle(o,"display","block")},hide:function(o){return this.setStyle(o,"display","none")},isHidden:function(o){o=this.get(o);return !o||o.style.display=="none"||this.getStyle(o,"display")=="none"},uniqueId:function(o){return(!o?"mce_":o)+(this.counter++)},setHTML:function(q,p){var o=this;return this.run(q,function(v){var r,t,s,z,u,r;p=o.processHTML(p);if(d){function y(){while(v.firstChild){v.firstChild.removeNode()}try{v.innerHTML="<br />"+p;v.removeChild(v.firstChild)}catch(x){r=o.create("div");r.innerHTML="<br />"+p;k(r.childNodes,function(B,A){if(A){v.appendChild(B)}})}}if(o.settings.fix_ie_paragraphs){p=p.replace(/<p><\/p>|<p([^>]+)><\/p>|<p[^\/+]\/>/gi,'<p$1 _mce_keep="true">&nbsp;</p>')}y();if(o.settings.fix_ie_paragraphs){s=v.getElementsByTagName("p");for(t=s.length-1,r=0;t>=0;t--){z=s[t];if(!z.hasChildNodes()){if(!z._mce_keep){r=1;break}z.removeAttribute("_mce_keep")}}}if(r){p=p.replace(/<p ([^>]+)>|<p>/ig,'<div $1 _mce_tmp="1">');p=p.replace(/<\/p>/gi,"</div>");y();if(o.settings.fix_ie_paragraphs){s=v.getElementsByTagName("DIV");for(t=s.length-1;t>=0;t--){z=s[t];if(z._mce_tmp){u=o.doc.createElement("p");z.cloneNode(false).outerHTML.replace(/([a-z0-9\-_]+)=/gi,function(A,x){var B;if(x!=="_mce_tmp"){B=z.getAttribute(x);if(!B&&x==="class"){B=z.className}u.setAttribute(x,B)}});for(r=0;r<z.childNodes.length;r++){u.appendChild(z.childNodes[r].cloneNode(true))}z.swapNode(u)}}}}}else{v.innerHTML=p}return p})},processHTML:function(r){var p=this,q=p.settings,v=[];if(!q.process_html){return r}if(d){r=r.replace(/&apos;/g,"&#39;");r=r.replace(/\s+(disabled|checked|readonly|selected)\s*=\s*[\"\']?(false|0)[\"\']?/gi,"")}r=r.replace(/<a( )([^>]+)\/>|<a\/>/gi,"<a$1$2></a>");if(q.keep_values){if(/<script|noscript|style/i.test(r)){function o(t){t=t.replace(/(<!--\[CDATA\[|\]\]-->)/g,"\n");t=t.replace(/^[\r\n]*|[\r\n]*$/g,"");t=t.replace(/^\s*(\/\/\s*<!--|\/\/\s*<!\[CDATA\[|<!--|<!\[CDATA\[)[\r\n]*/g,"");t=t.replace(/\s*(\/\/\s*\]\]>|\/\/\s*-->|\]\]>|-->|\]\]-->)\s*$/g,"");return t}r=r.replace(/<script([^>]+|)>([\s\S]*?)<\/script>/gi,function(s,x,t){if(!x){x=' type="text/javascript"'}x=x.replace(/src=\"([^\"]+)\"?/i,function(y,z){if(q.url_converter){z=p.encode(q.url_converter.call(q.url_converter_scope||p,p.decode(z),"src","script"))}return'_mce_src="'+z+'"'});if(m.trim(t)){v.push(o(t));t="<!--\nMCE_SCRIPT:"+(v.length-1)+"\n// -->"}return"<mce:script"+x+">"+t+"</mce:script>"});r=r.replace(/<style([^>]+|)>([\s\S]*?)<\/style>/gi,function(s,x,t){if(t){v.push(o(t));t="<!--\nMCE_SCRIPT:"+(v.length-1)+"\n-->"}return"<mce:style"+x+">"+t+"</mce:style><style "+x+' _mce_bogus="1">'+t+"</style>"});r=r.replace(/<noscript([^>]+|)>([\s\S]*?)<\/noscript>/g,function(s,x,t){return"<mce:noscript"+x+"><!--"+p.encode(t).replace(/--/g,"&#45;&#45;")+"--></mce:noscript>"})}r=r.replace(/<!\[CDATA\[([\s\S]+)\]\]>/g,"<!--[CDATA[$1]]-->");function u(s){return s.replace(h,function(y,z,x,t){return"<"+z+x.replace(l,function(B,A,E,D,C){var F;A=A.toLowerCase();E=E||D||C||"";if(e[A]){if(E==="false"||E==="0"){return}return A+'="'+A+'"'}if(f[A]&&x.indexOf("_mce_"+A)==-1){F=p.decode(E);if(q.url_converter&&(A=="src"||A=="href")){F=q.url_converter.call(q.url_converter_scope||p,F,A,z)}if(A=="style"){F=p.serializeStyle(p.parseStyle(F),A)}return A+'="'+E+'" _mce_'+A+'="'+p.encode(F)+'"'}return B})+t+">"})}r=u(r);r=r.replace(/MCE_SCRIPT:([0-9]+)/g,function(t,s){return v[s]})}return r},getOuterHTML:function(o){var p;o=this.get(o);if(!o){return null}if(o.outerHTML!==undefined){return o.outerHTML}p=(o.ownerDocument||this.doc).createElement("body");p.appendChild(o.cloneNode(true));return p.innerHTML},setOuterHTML:function(r,p,s){var o=this;function q(u,t,x){var y,v;v=x.createElement("body");v.innerHTML=t;y=v.lastChild;while(y){o.insertAfter(y.cloneNode(true),u);y=y.previousSibling}o.remove(u)}return this.run(r,function(u){u=o.get(u);if(u.nodeType==1){s=s||u.ownerDocument||o.doc;if(d){try{if(d&&u.nodeType==1){u.outerHTML=p}else{q(u,p,s)}}catch(t){q(u,p,s)}}else{q(u,p,s)}}})},decode:function(p){var q,r,o;if(/&[\w#]+;/.test(p)){q=this.doc.createElement("div");q.innerHTML=p;r=q.firstChild;o="";if(r){do{o+=r.nodeValue}while(r=r.nextSibling)}return o||p}return p},encode:function(o){return(""+o).replace(n,function(p){return c[p]})},insertAfter:function(o,p){p=this.get(p);return this.run(o,function(r){var q,s;q=p.parentNode;s=p.nextSibling;if(s){q.insertBefore(r,s)}else{q.appendChild(r)}return r})},isBlock:function(o){if(o.nodeType&&o.nodeType!==1){return false}o=o.nodeName||o;return a.test(o)},replace:function(s,r,p){var q=this;if(j(r,"array")){s=s.cloneNode(true)}return q.run(r,function(t){if(p){k(m.grep(t.childNodes),function(o){s.appendChild(o)})}return t.parentNode.replaceChild(s,t)})},rename:function(r,o){var q=this,p;if(r.nodeName!=o.toUpperCase()){p=q.create(o);k(q.getAttribs(r),function(s){q.setAttrib(p,s.nodeName,q.getAttrib(r,s.nodeName))});q.replace(p,r,1)}return p||r},findCommonAncestor:function(q,o){var r=q,p;while(r){p=o;while(p&&r!=p){p=p.parentNode}if(r==p){break}r=r.parentNode}if(!r&&q.ownerDocument){return q.ownerDocument.documentElement}return r},toHex:function(o){var q=/^\s*rgb\s*?\(\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?\)\s*$/i.exec(o);function p(r){r=parseInt(r).toString(16);return r.length>1?r:"0"+r}if(q){o="#"+p(q[1])+p(q[2])+p(q[3]);return o}return o},getClasses:function(){var s=this,o=[],r,u={},v=s.settings.class_filter,q;if(s.classes){return s.classes}function x(t){k(t.imports,function(y){x(y)});k(t.cssRules||t.rules,function(y){switch(y.type||1){case 1:if(y.selectorText){k(y.selectorText.split(","),function(z){z=z.replace(/^\s*|\s*$|^\s\./g,"");if(/\.mce/.test(z)||!/\.[\w\-]+$/.test(z)){return}q=z;z=z.replace(/.*\.([a-z0-9_\-]+).*/i,"$1");if(v&&!(z=v(z,q))){return}if(!u[z]){o.push({"class":z});u[z]=1}})}break;case 3:x(y.styleSheet);break}})}try{k(s.doc.styleSheets,x)}catch(p){}if(o.length>0){s.classes=o}return o},run:function(u,r,q){var p=this,v;if(p.doc&&typeof(u)==="string"){u=p.get(u)}if(!u){return false}q=q||this;if(!u.nodeType&&(u.length||u.length===0)){v=[];k(u,function(s,o){if(s){if(typeof(s)=="string"){s=p.doc.getElementById(s)}v.push(r.call(q,s,o))}});return v}return r.call(q,u)},getAttribs:function(q){var p;q=this.get(q);if(!q){return[]}if(d){p=[];if(q.nodeName=="OBJECT"){return q.attributes}if(q.nodeName==="OPTION"&&this.getAttrib(q,"selected")){p.push({specified:1,nodeName:"selected"})}q.cloneNode(false).outerHTML.replace(/<\/?[\w:\-]+ ?|=[\"][^\"]+\"|=\'[^\']+\'|=[\w\-]+|>/gi,"").replace(/[\w:\-]+/gi,function(o){p.push({specified:1,nodeName:o})});return p}return q.attributes},destroy:function(p){var o=this;if(o.events){o.events.destroy()}o.win=o.doc=o.root=o.events=null;if(!p){m.removeUnload(o.destroy)}},createRng:function(){var o=this.doc;return o.createRange?o.createRange():new m.dom.Range(this)},nodeIndex:function(s,t){var o=0,q,r,p;if(s){for(q=s.nodeType,s=s.previousSibling,r=s;s;s=s.previousSibling){p=s.nodeType;if(t&&p==3){if(p==q||!s.nodeValue.length){continue}}o++;q=p}}return o},split:function(u,s,y){var z=this,o=z.createRng(),v,q,x;function p(A){var t,r=A.childNodes;if(A.nodeType==1&&A.getAttribute("_mce_type")=="bookmark"){return}for(t=r.length-1;t>=0;t--){p(r[t])}if(A.nodeType!=9){if(A.nodeType==3&&A.nodeValue.length>0){return}if(A.nodeType==1){r=A.childNodes;if(r.length==1&&r[0]&&r[0].nodeType==1&&r[0].getAttribute("_mce_type")=="bookmark"){A.parentNode.insertBefore(r[0],A)}if(r.length||/^(br|hr|input|img)$/i.test(A.nodeName)){return}}z.remove(A)}return A}if(u&&s){o.setStart(u.parentNode,z.nodeIndex(u));o.setEnd(s.parentNode,z.nodeIndex(s));v=o.extractContents();o=z.createRng();o.setStart(s.parentNode,z.nodeIndex(s)+1);o.setEnd(u.parentNode,z.nodeIndex(u)+1);q=o.extractContents();x=u.parentNode;x.insertBefore(p(v),u);if(y){x.replaceChild(y,s)}else{x.insertBefore(s,u)}x.insertBefore(p(q),u);z.remove(u);return y||s}},bind:function(s,o,r,q){var p=this;if(!p.events){p.events=new m.dom.EventUtils()}return p.events.add(s,o,r,q||this)},unbind:function(r,o,q){var p=this;if(!p.events){p.events=new m.dom.EventUtils()}return p.events.remove(r,o,q)},_findSib:function(r,o,p){var q=this,s=o;if(r){if(j(s,"string")){s=function(t){return q.is(t,o)}}for(r=r[p];r;r=r[p]){if(s(r)){return r}}}return null},_isRes:function(o){return/^(top|left|bottom|right|width|height)/i.test(o)||/;\s*(top|left|bottom|right|width|height)/i.test(o)}});m.DOM=new m.dom.DOMUtils(document,{process_html:0})})(tinymce);(function(a){function b(c){var N=this,e=c.doc,S=0,E=1,j=2,D=true,R=false,U="startOffset",h="startContainer",P="endContainer",z="endOffset",k=tinymce.extend,n=c.nodeIndex;k(N,{startContainer:e,startOffset:0,endContainer:e,endOffset:0,collapsed:D,commonAncestorContainer:e,START_TO_START:0,START_TO_END:1,END_TO_END:2,END_TO_START:3,setStart:q,setEnd:s,setStartBefore:g,setStartAfter:I,setEndBefore:J,setEndAfter:u,collapse:A,selectNode:x,selectNodeContents:F,compareBoundaryPoints:v,deleteContents:p,extractContents:H,cloneContents:d,insertNode:C,surroundContents:M,cloneRange:K});function q(V,t){B(D,V,t)}function s(V,t){B(R,V,t)}function g(t){q(t.parentNode,n(t))}function I(t){q(t.parentNode,n(t)+1)}function J(t){s(t.parentNode,n(t))}function u(t){s(t.parentNode,n(t)+1)}function A(t){if(t){N[P]=N[h];N[z]=N[U]}else{N[h]=N[P];N[U]=N[z]}N.collapsed=D}function x(t){g(t);u(t)}function F(t){q(t,0);s(t,t.nodeType===1?t.childNodes.length:t.nodeValue.length)}function v(W,X){var Z=N[h],Y=N[U],V=N[P],t=N[z];if(W===0){return G(Z,Y,Z,Y)}if(W===1){return G(Z,Y,V,t)}if(W===2){return G(V,t,V,t)}if(W===3){return G(V,t,Z,Y)}}function p(){m(j)}function H(){return m(S)}function d(){return m(E)}function C(Y){var V=this[h],t=this[U],X,W;if((V.nodeType===3||V.nodeType===4)&&V.nodeValue){if(!t){V.parentNode.insertBefore(Y,V)}else{if(t>=V.nodeValue.length){c.insertAfter(Y,V)}else{X=V.splitText(t);V.parentNode.insertBefore(Y,X)}}}else{if(V.childNodes.length>0){W=V.childNodes[t]}if(W){V.insertBefore(Y,W)}else{V.appendChild(Y)}}}function M(V){var t=N.extractContents();N.insertNode(V);V.appendChild(t);N.selectNode(V)}function K(){return k(new b(c),{startContainer:N[h],startOffset:N[U],endContainer:N[P],endOffset:N[z],collapsed:N.collapsed,commonAncestorContainer:N.commonAncestorContainer})}function O(t,V){var W;if(t.nodeType==3){return t}if(V<0){return t}W=t.firstChild;while(W&&V>0){--V;W=W.nextSibling}if(W){return W}return t}function l(){return(N[h]==N[P]&&N[U]==N[z])}function G(X,Z,V,Y){var aa,W,t,ab,ad,ac;if(X==V){if(Z==Y){return 0}if(Z<Y){return -1}return 1}aa=V;while(aa&&aa.parentNode!=X){aa=aa.parentNode}if(aa){W=0;t=X.firstChild;while(t!=aa&&W<Z){W++;t=t.nextSibling}if(Z<=W){return -1}return 1}aa=X;while(aa&&aa.parentNode!=V){aa=aa.parentNode}if(aa){W=0;t=V.firstChild;while(t!=aa&&W<Y){W++;t=t.nextSibling}if(W<Y){return -1}return 1}ab=c.findCommonAncestor(X,V);ad=X;while(ad&&ad.parentNode!=ab){ad=ad.parentNode}if(!ad){ad=ab}ac=V;while(ac&&ac.parentNode!=ab){ac=ac.parentNode}if(!ac){ac=ab}if(ad==ac){return 0}t=ab.firstChild;while(t){if(t==ad){return -1}if(t==ac){return 1}t=t.nextSibling}}function B(V,Y,X){var t,W;if(V){N[h]=Y;N[U]=X}else{N[P]=Y;N[z]=X}t=N[P];while(t.parentNode){t=t.parentNode}W=N[h];while(W.parentNode){W=W.parentNode}if(W==t){if(G(N[h],N[U],N[P],N[z])>0){N.collapse(V)}}else{N.collapse(V)}N.collapsed=l();N.commonAncestorContainer=c.findCommonAncestor(N[h],N[P])}function m(ab){var aa,X=0,ad=0,V,Z,W,Y,t,ac;if(N[h]==N[P]){return f(ab)}for(aa=N[P],V=aa.parentNode;V;aa=V,V=V.parentNode){if(V==N[h]){return r(aa,ab)}++X}for(aa=N[h],V=aa.parentNode;V;aa=V,V=V.parentNode){if(V==N[P]){return T(aa,ab)}++ad}Z=ad-X;W=N[h];while(Z>0){W=W.parentNode;Z--}Y=N[P];while(Z<0){Y=Y.parentNode;Z++}for(t=W.parentNode,ac=Y.parentNode;t!=ac;t=t.parentNode,ac=ac.parentNode){W=t;Y=ac}return o(W,Y,ab)}function f(Z){var ab,Y,X,aa,t,W,V;if(Z!=j){ab=e.createDocumentFragment()}if(N[U]==N[z]){return ab}if(N[h].nodeType==3){Y=N[h].nodeValue;X=Y.substring(N[U],N[z]);if(Z!=E){N[h].deleteData(N[U],N[z]-N[U]);N.collapse(D)}if(Z==j){return}ab.appendChild(e.createTextNode(X));return ab}aa=O(N[h],N[U]);t=N[z]-N[U];while(t>0){W=aa.nextSibling;V=y(aa,Z);if(ab){ab.appendChild(V)}--t;aa=W}if(Z!=E){N.collapse(D)}return ab}function r(ab,Y){var aa,Z,V,t,X,W;if(Y!=j){aa=e.createDocumentFragment()}Z=i(ab,Y);if(aa){aa.appendChild(Z)}V=n(ab);t=V-N[U];if(t<=0){if(Y!=E){N.setEndBefore(ab);N.collapse(R)}return aa}Z=ab.previousSibling;while(t>0){X=Z.previousSibling;W=y(Z,Y);if(aa){aa.insertBefore(W,aa.firstChild)}--t;Z=X}if(Y!=E){N.setEndBefore(ab);N.collapse(R)}return aa}function T(Z,Y){var ab,V,aa,t,X,W;if(Y!=j){ab=e.createDocumentFragment()}aa=Q(Z,Y);if(ab){ab.appendChild(aa)}V=n(Z);++V;t=N[z]-V;aa=Z.nextSibling;while(t>0){X=aa.nextSibling;W=y(aa,Y);if(ab){ab.appendChild(W)}--t;aa=X}if(Y!=E){N.setStartAfter(Z);N.collapse(D)}return ab}function o(Z,t,ac){var W,ae,Y,aa,ab,V,ad,X;if(ac!=j){ae=e.createDocumentFragment()}W=Q(Z,ac);if(ae){ae.appendChild(W)}Y=Z.parentNode;aa=n(Z);ab=n(t);++aa;V=ab-aa;ad=Z.nextSibling;while(V>0){X=ad.nextSibling;W=y(ad,ac);if(ae){ae.appendChild(W)}ad=X;--V}W=i(t,ac);if(ae){ae.appendChild(W)}if(ac!=E){N.setStartAfter(Z);N.collapse(D)}return ae}function i(aa,ab){var W=O(N[P],N[z]-1),ac,Z,Y,t,V,X=W!=N[P];if(W==aa){return L(W,X,R,ab)}ac=W.parentNode;Z=L(ac,R,R,ab);while(ac){while(W){Y=W.previousSibling;t=L(W,X,R,ab);if(ab!=j){Z.insertBefore(t,Z.firstChild)}X=D;W=Y}if(ac==aa){return Z}W=ac.previousSibling;ac=ac.parentNode;V=L(ac,R,R,ab);if(ab!=j){V.appendChild(Z)}Z=V}}function Q(aa,ab){var X=O(N[h],N[U]),Y=X!=N[h],ac,Z,W,t,V;if(X==aa){return L(X,Y,D,ab)}ac=X.parentNode;Z=L(ac,R,D,ab);while(ac){while(X){W=X.nextSibling;t=L(X,Y,D,ab);if(ab!=j){Z.appendChild(t)}Y=D;X=W}if(ac==aa){return Z}X=ac.nextSibling;ac=ac.parentNode;V=L(ac,R,D,ab);if(ab!=j){V.appendChild(Z)}Z=V}}function L(t,Y,ab,ac){var X,W,Z,V,aa;if(Y){return y(t,ac)}if(t.nodeType==3){X=t.nodeValue;if(ab){V=N[U];W=X.substring(V);Z=X.substring(0,V)}else{V=N[z];W=X.substring(0,V);Z=X.substring(V)}if(ac!=E){t.nodeValue=Z}if(ac==j){return}aa=t.cloneNode(R);aa.nodeValue=W;return aa}if(ac==j){return}return t.cloneNode(R)}function y(V,t){if(t!=j){return t==E?V.cloneNode(D):V}V.parentNode.removeChild(V)}}a.Range=b})(tinymce.dom);(function(){function a(g){var i=this,j="\uFEFF",e,h,d=g.dom,c=true,f=false;function b(){var n=g.getRng(),k=d.createRng(),m,o;m=n.item?n.item(0):n.parentElement();if(m.ownerDocument!=d.doc){return k}if(n.item||!m.hasChildNodes()){k.setStart(m.parentNode,d.nodeIndex(m));k.setEnd(k.startContainer,k.startOffset+1);return k}o=g.isCollapsed();function l(s){var u,q,t,p,A=0,x,y,z,r,v;r=n.duplicate();r.collapse(s);u=d.create("a");z=r.parentElement();if(!z.hasChildNodes()){k[s?"setStart":"setEnd"](z,0);return}z.appendChild(u);r.moveToElementText(u);v=n.compareEndPoints(s?"StartToStart":"EndToEnd",r);if(v>0){k[s?"setStartAfter":"setEndAfter"](z);d.remove(u);return}p=tinymce.grep(z.childNodes);x=p.length-1;while(A<=x){y=Math.floor((A+x)/2);z.insertBefore(u,p[y]);r.moveToElementText(u);v=n.compareEndPoints(s?"StartToStart":"EndToEnd",r);if(v>0){A=y+1}else{if(v<0){x=y-1}else{found=true;break}}}q=v>0||y==0?u.nextSibling:u.previousSibling;if(q.nodeType==1){d.remove(u);t=d.nodeIndex(q);q=q.parentNode;if(!s||y>0){t++}}else{if(v>0||y==0){r.setEndPoint(s?"StartToStart":"EndToEnd",n);t=r.text.length}else{r.setEndPoint(s?"StartToStart":"EndToEnd",n);t=q.nodeValue.length-r.text.length}d.remove(u)}k[s?"setStart":"setEnd"](q,t)}l(true);if(!o){l()}return k}this.addRange=function(k){var p,n,m,r,u,s,t=g.dom.doc,o=t.body;function l(B){var x,A,v,z,y;v=d.create("a");x=B?m:u;A=B?r:s;z=p.duplicate();if(x==t){x=o;A=0}if(x.nodeType==3){x.parentNode.insertBefore(v,x);z.moveToElementText(v);z.moveStart("character",A);d.remove(v);p.setEndPoint(B?"StartToStart":"EndToEnd",z)}else{y=x.childNodes;if(y.length){if(A>=y.length){d.insertAfter(v,y[y.length-1])}else{x.insertBefore(v,y[A])}z.moveToElementText(v)}else{v=t.createTextNode(j);x.appendChild(v);z.moveToElementText(v.parentNode);z.collapse(c)}p.setEndPoint(B?"StartToStart":"EndToEnd",z);d.remove(v)}}this.destroy();m=k.startContainer;r=k.startOffset;u=k.endContainer;s=k.endOffset;p=o.createTextRange();if(m==u&&m.nodeType==1&&r==s-1){if(r==s-1){try{n=o.createControlRange();n.addElement(m.childNodes[r]);n.select();n.scrollIntoView();return}catch(q){}}}l(true);l();p.select();p.scrollIntoView()};this.getRangeAt=function(){if(!e||!tinymce.dom.RangeUtils.compareRanges(h,g.getRng())){e=b();h=g.getRng()}try{e.startContainer.nextSibling}catch(k){e=b();h=null}return e};this.destroy=function(){h=e=null};if(g.dom.boxModel){(function(){var q=d.doc,l=q.body,n,o;q.documentElement.unselectable=c;function p(r,u){var s=l.createTextRange();try{s.moveToPoint(r,u)}catch(t){s=null}return s}function m(s){var r;if(s.button){r=p(s.x,s.y);if(r){if(r.compareEndPoints("StartToStart",o)>0){r.setEndPoint("StartToStart",o)}else{r.setEndPoint("EndToEnd",o)}r.select()}}else{k()}}function k(){d.unbind(q,"mouseup",k);d.unbind(q,"mousemove",m);n=0}d.bind(q,"mousedown",function(r){if(r.target.nodeName==="HTML"){if(n){k()}n=1;o=p(r.x,r.y);if(o){d.bind(q,"mouseup",k);d.bind(q,"mousemove",m);o.select()}}})})()}}tinymce.dom.TridentSelection=a})();(function(d){var f=d.each,c=d.DOM,b=d.isIE,e=d.isWebKit,a;d.create("tinymce.dom.EventUtils",{EventUtils:function(){this.inits=[];this.events=[]},add:function(m,p,l,j){var g,h=this,i=h.events,k;if(p instanceof Array){k=[];f(p,function(o){k.push(h.add(m,o,l,j))});return k}if(m&&m.hasOwnProperty&&m instanceof Array){k=[];f(m,function(n){n=c.get(n);k.push(h.add(n,p,l,j))});return k}m=c.get(m);if(!m){return}g=function(n){if(h.disabled){return}n=n||window.event;if(n&&b){if(!n.target){n.target=n.srcElement}d.extend(n,h._stoppers)}if(!j){return l(n)}return l.call(j,n)};if(p=="unload"){d.unloads.unshift({func:g});return g}if(p=="init"){if(h.domLoaded){g()}else{h.inits.push(g)}return g}i.push({obj:m,name:p,func:l,cfunc:g,scope:j});h._add(m,p,g);return l},remove:function(l,m,k){var h=this,g=h.events,i=false,j;if(l&&l.hasOwnProperty&&l instanceof Array){j=[];f(l,function(n){n=c.get(n);j.push(h.remove(n,m,k))});return j}l=c.get(l);f(g,function(o,n){if(o.obj==l&&o.name==m&&(!k||(o.func==k||o.cfunc==k))){g.splice(n,1);h._remove(l,m,o.cfunc);i=true;return false}});return i},clear:function(l){var j=this,g=j.events,h,k;if(l){l=c.get(l);for(h=g.length-1;h>=0;h--){k=g[h];if(k.obj===l){j._remove(k.obj,k.name,k.cfunc);k.obj=k.cfunc=null;g.splice(h,1)}}}},cancel:function(g){if(!g){return false}this.stop(g);return this.prevent(g)},stop:function(g){if(g.stopPropagation){g.stopPropagation()}else{g.cancelBubble=true}return false},prevent:function(g){if(g.preventDefault){g.preventDefault()}else{g.returnValue=false}return false},destroy:function(){var g=this;f(g.events,function(j,h){g._remove(j.obj,j.name,j.cfunc);j.obj=j.cfunc=null});g.events=[];g=null},_add:function(h,i,g){if(h.attachEvent){h.attachEvent("on"+i,g)}else{if(h.addEventListener){h.addEventListener(i,g,false)}else{h["on"+i]=g}}},_remove:function(i,j,h){if(i){try{if(i.detachEvent){i.detachEvent("on"+j,h)}else{if(i.removeEventListener){i.removeEventListener(j,h,false)}else{i["on"+j]=null}}}catch(g){}}},_pageInit:function(h){var g=this;if(g.domLoaded){return}g.domLoaded=true;f(g.inits,function(i){i()});g.inits=[]},_wait:function(i){var g=this,h=i.document;if(i.tinyMCE_GZ&&tinyMCE_GZ.loaded){g.domLoaded=1;return}if(h.attachEvent){h.attachEvent("onreadystatechange",function(){if(h.readyState==="complete"){h.detachEvent("onreadystatechange",arguments.callee);g._pageInit(i)}});if(h.documentElement.doScroll&&i==i.top){(function(){if(g.domLoaded){return}try{h.documentElement.doScroll("left")}catch(j){setTimeout(arguments.callee,0);return}g._pageInit(i)})()}}else{if(h.addEventListener){g._add(i,"DOMContentLoaded",function(){g._pageInit(i)})}}g._add(i,"load",function(){g._pageInit(i)})},_stoppers:{preventDefault:function(){this.returnValue=false},stopPropagation:function(){this.cancelBubble=true}}});a=d.dom.Event=new d.dom.EventUtils();a._wait(window);d.addUnload(function(){a.destroy()})})(tinymce);(function(a){a.dom.Element=function(f,d){var b=this,e,c;b.settings=d=d||{};b.id=f;b.dom=e=d.dom||a.DOM;if(!a.isIE){c=e.get(b.id)}a.each(("getPos,getRect,getParent,add,setStyle,getStyle,setStyles,setAttrib,setAttribs,getAttrib,addClass,removeClass,hasClass,getOuterHTML,setOuterHTML,remove,show,hide,isHidden,setHTML,get").split(/,/),function(g){b[g]=function(){var h=[f],j;for(j=0;j<arguments.length;j++){h.push(arguments[j])}h=e[g].apply(e,h);b.update(g);return h}});a.extend(b,{on:function(i,h,g){return a.dom.Event.add(b.id,i,h,g)},getXY:function(){return{x:parseInt(b.getStyle("left")),y:parseInt(b.getStyle("top"))}},getSize:function(){var g=e.get(b.id);return{w:parseInt(b.getStyle("width")||g.clientWidth),h:parseInt(b.getStyle("height")||g.clientHeight)}},moveTo:function(g,h){b.setStyles({left:g,top:h})},moveBy:function(g,i){var h=b.getXY();b.moveTo(h.x+g,h.y+i)},resizeTo:function(g,i){b.setStyles({width:g,height:i})},resizeBy:function(g,j){var i=b.getSize();b.resizeTo(i.w+g,i.h+j)},update:function(h){var g;if(a.isIE6&&d.blocker){h=h||"";if(h.indexOf("get")===0||h.indexOf("has")===0||h.indexOf("is")===0){return}if(h=="remove"){e.remove(b.blocker);return}if(!b.blocker){b.blocker=e.uniqueId();g=e.add(d.container||e.getRoot(),"iframe",{id:b.blocker,style:"position:absolute;",frameBorder:0,src:'javascript:""'});e.setStyle(g,"opacity",0)}else{g=e.get(b.blocker)}e.setStyles(g,{left:b.getStyle("left",1),top:b.getStyle("top",1),width:b.getStyle("width",1),height:b.getStyle("height",1),display:b.getStyle("display",1),zIndex:parseInt(b.getStyle("zIndex",1)||0)-1})}}})}})(tinymce);(function(c){function e(f){return f.replace(/[\n\r]+/g,"")}var b=c.is,a=c.isIE,d=c.each;c.create("tinymce.dom.Selection",{Selection:function(i,h,g){var f=this;f.dom=i;f.win=h;f.serializer=g;d(["onBeforeSetContent","onBeforeGetContent","onSetContent","onGetContent"],function(j){f[j]=new c.util.Dispatcher(f)});if(!f.win.getSelection){f.tridentSel=new c.dom.TridentSelection(f)}c.addUnload(f.destroy,f)},getContent:function(g){var f=this,h=f.getRng(),l=f.dom.create("body"),j=f.getSel(),i,k,m;g=g||{};i=k="";g.get=true;g.format=g.format||"html";f.onBeforeGetContent.dispatch(f,g);if(g.format=="text"){return f.isCollapsed()?"":(h.text||(j.toString?j.toString():""))}if(h.cloneContents){m=h.cloneContents();if(m){l.appendChild(m)}}else{if(b(h.item)||b(h.htmlText)){l.innerHTML=h.item?h.item(0).outerHTML:h.htmlText}else{l.innerHTML=h.toString()}}if(/^\s/.test(l.innerHTML)){i=" "}if(/\s+$/.test(l.innerHTML)){k=" "}g.getInner=true;g.content=f.isCollapsed()?"":i+f.serializer.serialize(l,g)+k;f.onGetContent.dispatch(f,g);return g.content},setContent:function(i,g){var f=this,j=f.getRng(),l,k=f.win.document;g=g||{format:"html"};g.set=true;i=g.content=f.dom.processHTML(i);f.onBeforeSetContent.dispatch(f,g);i=g.content;if(j.insertNode){i+='<span id="__caret">_</span>';if(j.startContainer==k&&j.endContainer==k){k.body.innerHTML=i}else{j.deleteContents();if(k.body.childNodes.length==0){k.body.innerHTML=i}else{j.insertNode(j.createContextualFragment(i))}}l=f.dom.get("__caret");j=k.createRange();j.setStartBefore(l);j.setEndBefore(l);f.setRng(j);f.dom.remove("__caret")}else{if(j.item){k.execCommand("Delete",false,null);j=f.getRng()}j.pasteHTML(i)}f.onSetContent.dispatch(f,g)},getStart:function(){var g=this.getRng(),h,f,j,i;if(g.duplicate||g.item){if(g.item){return g.item(0)}j=g.duplicate();j.collapse(1);h=j.parentElement();f=i=g.parentElement();while(i=i.parentNode){if(i==h){h=f;break}}if(h&&h.nodeName=="BODY"){return h.firstChild||h}return h}else{h=g.startContainer;if(h.nodeType==1&&h.hasChildNodes()){h=h.childNodes[Math.min(h.childNodes.length-1,g.startOffset)]}if(h&&h.nodeType==3){return h.parentNode}return h}},getEnd:function(){var g=this,h=g.getRng(),i,f;if(h.duplicate||h.item){if(h.item){return h.item(0)}h=h.duplicate();h.collapse(0);i=h.parentElement();if(i&&i.nodeName=="BODY"){return i.lastChild||i}return i}else{i=h.endContainer;f=h.endOffset;if(i.nodeType==1&&i.hasChildNodes()){i=i.childNodes[f>0?f-1:f]}if(i&&i.nodeType==3){return i.parentNode}return i}},getBookmark:function(q,r){var u=this,m=u.dom,g,j,i,n,h,o,p,l="\uFEFF",s;function f(v,x){var t=0;d(m.select(v),function(z,y){if(z==x){t=y}});return t}if(q==2){function k(){var v=u.getRng(true),t=m.getRoot(),x={};function y(B,G){var A=B[G?"startContainer":"endContainer"],F=B[G?"startOffset":"endOffset"],z=[],C,E,D=0;if(A.nodeType==3){if(r){for(C=A.previousSibling;C&&C.nodeType==3;C=C.previousSibling){F+=C.nodeValue.length}}z.push(F)}else{E=A.childNodes;if(F>=E.length&&E.length){D=1;F=Math.max(0,E.length-1)}z.push(u.dom.nodeIndex(E[F],r)+D)}for(;A&&A!=t;A=A.parentNode){z.push(u.dom.nodeIndex(A,r))}return z}x.start=y(v,true);if(!u.isCollapsed()){x.end=y(v)}return x}return k()}if(q){return{rng:u.getRng()}}g=u.getRng();i=m.uniqueId();n=tinyMCE.activeEditor.selection.isCollapsed();s="overflow:hidden;line-height:0px";if(g.duplicate||g.item){if(!g.item){j=g.duplicate();g.collapse();g.pasteHTML('<span _mce_type="bookmark" id="'+i+'_start" style="'+s+'">'+l+"</span>");if(!n){j.collapse(false);j.pasteHTML('<span _mce_type="bookmark" id="'+i+'_end" style="'+s+'">'+l+"</span>")}}else{o=g.item(0);h=o.nodeName;return{name:h,index:f(h,o)}}}else{o=u.getNode();h=o.nodeName;if(h=="IMG"){return{name:h,index:f(h,o)}}j=g.cloneRange();if(!n){j.collapse(false);j.insertNode(m.create("span",{_mce_type:"bookmark",id:i+"_end",style:s},l))}g.collapse(true);g.insertNode(m.create("span",{_mce_type:"bookmark",id:i+"_start",style:s},l))}u.moveToBookmark({id:i,keep:1});return{id:i}},moveToBookmark:function(n){var r=this,l=r.dom,i,h,f,q,j,s,o,p;if(r.tridentSel){r.tridentSel.destroy()}if(n){if(n.start){f=l.createRng();q=l.getRoot();function g(z){var t=n[z?"start":"end"],v,x,y,u;if(t){for(x=q,v=t.length-1;v>=1;v--){u=x.childNodes;if(u.length){x=u[t[v]]}}if(z){f.setStart(x,t[0])}else{f.setEnd(x,t[0])}}}g(true);g();r.setRng(f)}else{if(n.id){function k(A){var u=l.get(n.id+"_"+A),z,t,x,y,v=n.keep;if(u){z=u.parentNode;if(A=="start"){if(!v){t=l.nodeIndex(u)}else{z=u.firstChild;t=1}j=s=z;o=p=t}else{if(!v){t=l.nodeIndex(u)}else{z=u.firstChild;t=1}s=z;p=t}if(!v){y=u.previousSibling;x=u.nextSibling;d(c.grep(u.childNodes),function(B){if(B.nodeType==3){B.nodeValue=B.nodeValue.replace(/\uFEFF/g,"")}});while(u=l.get(n.id+"_"+A)){l.remove(u,1)}if(y&&x&&y.nodeType==x.nodeType&&y.nodeType==3){t=y.nodeValue.length;y.appendData(x.nodeValue);l.remove(x);if(A=="start"){j=s=y;o=p=t}else{s=y;p=t}}}}}function m(t){if(!a&&l.isBlock(t)&&!t.innerHTML){t.innerHTML='<br _mce_bogus="1" />'}return t}k("start");k("end");f=l.createRng();f.setStart(m(j),o);f.setEnd(m(s),p);r.setRng(f)}else{if(n.name){r.select(l.select(n.name)[n.index])}else{if(n.rng){r.setRng(n.rng)}}}}}},select:function(k,j){var i=this,l=i.dom,g=l.createRng(),f;f=l.nodeIndex(k);g.setStart(k.parentNode,f);g.setEnd(k.parentNode,f+1);if(j){function h(m,o){var n=new c.dom.TreeWalker(m,m);do{if(m.nodeType==3&&c.trim(m.nodeValue).length!=0){if(o){g.setStart(m,0)}else{g.setEnd(m,m.nodeValue.length)}return}if(m.nodeName=="BR"){if(o){g.setStartBefore(m)}else{g.setEndBefore(m)}return}}while(m=(o?n.next():n.prev()))}h(k,1);h(k)}i.setRng(g);return k},isCollapsed:function(){var f=this,h=f.getRng(),g=f.getSel();if(!h||h.item){return false}if(h.compareEndPoints){return h.compareEndPoints("StartToEnd",h)===0}return !g||h.collapsed},collapse:function(f){var g=this,h=g.getRng(),i;if(h.item){i=h.item(0);h=this.win.document.body.createTextRange();h.moveToElementText(i)}h.collapse(!!f);g.setRng(h)},getSel:function(){var g=this,f=this.win;return f.getSelection?f.getSelection():f.document.selection},getRng:function(j){var g=this,h,i;if(j&&g.tridentSel){return g.tridentSel.getRangeAt(0)}try{if(h=g.getSel()){i=h.rangeCount>0?h.getRangeAt(0):(h.createRange?h.createRange():g.win.document.createRange())}}catch(f){}if(!i){i=g.win.document.createRange?g.win.document.createRange():g.win.document.body.createTextRange()}if(g.selectedRange&&g.explicitRange){if(i.compareBoundaryPoints(i.START_TO_START,g.selectedRange)===0&&i.compareBoundaryPoints(i.END_TO_END,g.selectedRange)===0){i=g.explicitRange}else{g.selectedRange=null;g.explicitRange=null}}return i},setRng:function(i){var h,g=this;if(!g.tridentSel){h=g.getSel();if(h){g.explicitRange=i;h.removeAllRanges();h.addRange(i);g.selectedRange=h.getRangeAt(0)}}else{if(i.cloneRange){g.tridentSel.addRange(i);return}try{i.select()}catch(f){}}},setNode:function(g){var f=this;f.setContent(f.dom.getOuterHTML(g));return g},getNode:function(){var g=this,f=g.getRng(),h=g.getSel(),i;if(f.setStart){if(!f){return g.dom.getRoot()}i=f.commonAncestorContainer;if(!f.collapsed){if(f.startContainer==f.endContainer){if(f.startOffset-f.endOffset<2){if(f.startContainer.hasChildNodes()){i=f.startContainer.childNodes[f.startOffset]}}}if(c.isWebKit&&h.anchorNode&&h.anchorNode.nodeType==1){return h.anchorNode.childNodes[h.anchorOffset]}}if(i&&i.nodeType==3){return i.parentNode}return i}return f.item?f.item(0):f.parentElement()},getSelectedBlocks:function(g,f){var i=this,j=i.dom,m,h,l,k=[];m=j.getParent(g||i.getStart(),j.isBlock);h=j.getParent(f||i.getEnd(),j.isBlock);if(m){k.push(m)}if(m&&h&&m!=h){l=m;while((l=l.nextSibling)&&l!=h){if(j.isBlock(l)){k.push(l)}}}if(h&&m!=h){k.push(h)}return k},destroy:function(g){var f=this;f.win=null;if(f.tridentSel){f.tridentSel.destroy()}if(!g){c.removeUnload(f.destroy)}}})})(tinymce);(function(a){a.create("tinymce.dom.XMLWriter",{node:null,XMLWriter:function(c){function b(){var e=document.implementation;if(!e||!e.createDocument){try{return new ActiveXObject("MSXML2.DOMDocument")}catch(d){}try{return new ActiveXObject("Microsoft.XmlDom")}catch(d){}}else{return e.createDocument("","",null)}}this.doc=b();this.valid=a.isOpera||a.isWebKit;this.reset()},reset:function(){var b=this,c=b.doc;if(c.firstChild){c.removeChild(c.firstChild)}b.node=c.appendChild(c.createElement("html"))},writeStartElement:function(c){var b=this;b.node=b.node.appendChild(b.doc.createElement(c))},writeAttribute:function(c,b){if(this.valid){b=b.replace(/>/g,"%MCGT%")}this.node.setAttribute(c,b)},writeEndElement:function(){this.node=this.node.parentNode},writeFullEndElement:function(){var b=this,c=b.node;c.appendChild(b.doc.createTextNode(""));b.node=c.parentNode},writeText:function(b){if(this.valid){b=b.replace(/>/g,"%MCGT%")}this.node.appendChild(this.doc.createTextNode(b))},writeCDATA:function(b){this.node.appendChild(this.doc.createCDATASection(b))},writeComment:function(b){if(a.isIE){b=b.replace(/^\-|\-$/g," ")}this.node.appendChild(this.doc.createComment(b.replace(/\-\-/g," ")))},getContent:function(){var b;b=this.doc.xml||new XMLSerializer().serializeToString(this.doc);b=b.replace(/<\?[^?]+\?>|<html>|<\/html>|<html\/>|<!DOCTYPE[^>]+>/g,"");b=b.replace(/ ?\/>/g," />");if(this.valid){b=b.replace(/\%MCGT%/g,"&gt;")}return b}})})(tinymce);(function(a){a.create("tinymce.dom.StringWriter",{str:null,tags:null,count:0,settings:null,indent:null,StringWriter:function(b){this.settings=a.extend({indent_char:" ",indentation:0},b);this.reset()},reset:function(){this.indent="";this.str="";this.tags=[];this.count=0},writeStartElement:function(b){this._writeAttributesEnd();this.writeRaw("<"+b);this.tags.push(b);this.inAttr=true;this.count++;this.elementCount=this.count},writeAttribute:function(d,b){var c=this;c.writeRaw(" "+c.encode(d)+'="'+c.encode(b)+'"')},writeEndElement:function(){var b;if(this.tags.length>0){b=this.tags.pop();if(this._writeAttributesEnd(1)){this.writeRaw("</"+b+">")}if(this.settings.indentation>0){this.writeRaw("\n")}}},writeFullEndElement:function(){if(this.tags.length>0){this._writeAttributesEnd();this.writeRaw("</"+this.tags.pop()+">");if(this.settings.indentation>0){this.writeRaw("\n")}}},writeText:function(b){this._writeAttributesEnd();this.writeRaw(this.encode(b));this.count++},writeCDATA:function(b){this._writeAttributesEnd();this.writeRaw("<![CDATA["+b+"]]>");this.count++},writeComment:function(b){this._writeAttributesEnd();this.writeRaw("<!-- "+b+"-->");this.count++},writeRaw:function(b){this.str+=b},encode:function(b){return b.replace(/[<>&"]/g,function(c){switch(c){case"<":return"&lt;";case">":return"&gt;";case"&":return"&amp;";case'"':return"&quot;"}return c})},getContent:function(){return this.str},_writeAttributesEnd:function(b){if(!this.inAttr){return}this.inAttr=false;if(b&&this.elementCount==this.count){this.writeRaw(" />");return false}this.writeRaw(">");return true}})})(tinymce);(function(e){var g=e.extend,f=e.each,b=e.util.Dispatcher,d=e.isIE,a=e.isGecko;function c(h){return h.replace(/([?+*])/g,".$1")}e.create("tinymce.dom.Serializer",{Serializer:function(j){var i=this;i.key=0;i.onPreProcess=new b(i);i.onPostProcess=new b(i);try{i.writer=new e.dom.XMLWriter()}catch(h){i.writer=new e.dom.StringWriter()}i.settings=j=g({dom:e.DOM,valid_nodes:0,node_filter:0,attr_filter:0,invalid_attrs:/^(_mce_|_moz_|sizset|sizcache)/,closed:/^(br|hr|input|meta|img|link|param|area)$/,entity_encoding:"named",entities:"160,nbsp,161,iexcl,162,cent,163,pound,164,curren,165,yen,166,brvbar,167,sect,168,uml,169,copy,170,ordf,171,laquo,172,not,173,shy,174,reg,175,macr,176,deg,177,plusmn,178,sup2,179,sup3,180,acute,181,micro,182,para,183,middot,184,cedil,185,sup1,186,ordm,187,raquo,188,frac14,189,frac12,190,frac34,191,iquest,192,Agrave,193,Aacute,194,Acirc,195,Atilde,196,Auml,197,Aring,198,AElig,199,Ccedil,200,Egrave,201,Eacute,202,Ecirc,203,Euml,204,Igrave,205,Iacute,206,Icirc,207,Iuml,208,ETH,209,Ntilde,210,Ograve,211,Oacute,212,Ocirc,213,Otilde,214,Ouml,215,times,216,Oslash,217,Ugrave,218,Uacute,219,Ucirc,220,Uuml,221,Yacute,222,THORN,223,szlig,224,agrave,225,aacute,226,acirc,227,atilde,228,auml,229,aring,230,aelig,231,ccedil,232,egrave,233,eacute,234,ecirc,235,euml,236,igrave,237,iacute,238,icirc,239,iuml,240,eth,241,ntilde,242,ograve,243,oacute,244,ocirc,245,otilde,246,ouml,247,divide,248,oslash,249,ugrave,250,uacute,251,ucirc,252,uuml,253,yacute,254,thorn,255,yuml,402,fnof,913,Alpha,914,Beta,915,Gamma,916,Delta,917,Epsilon,918,Zeta,919,Eta,920,Theta,921,Iota,922,Kappa,923,Lambda,924,Mu,925,Nu,926,Xi,927,Omicron,928,Pi,929,Rho,931,Sigma,932,Tau,933,Upsilon,934,Phi,935,Chi,936,Psi,937,Omega,945,alpha,946,beta,947,gamma,948,delta,949,epsilon,950,zeta,951,eta,952,theta,953,iota,954,kappa,955,lambda,956,mu,957,nu,958,xi,959,omicron,960,pi,961,rho,962,sigmaf,963,sigma,964,tau,965,upsilon,966,phi,967,chi,968,psi,969,omega,977,thetasym,978,upsih,982,piv,8226,bull,8230,hellip,8242,prime,8243,Prime,8254,oline,8260,frasl,8472,weierp,8465,image,8476,real,8482,trade,8501,alefsym,8592,larr,8593,uarr,8594,rarr,8595,darr,8596,harr,8629,crarr,8656,lArr,8657,uArr,8658,rArr,8659,dArr,8660,hArr,8704,forall,8706,part,8707,exist,8709,empty,8711,nabla,8712,isin,8713,notin,8715,ni,8719,prod,8721,sum,8722,minus,8727,lowast,8730,radic,8733,prop,8734,infin,8736,ang,8743,and,8744,or,8745,cap,8746,cup,8747,int,8756,there4,8764,sim,8773,cong,8776,asymp,8800,ne,8801,equiv,8804,le,8805,ge,8834,sub,8835,sup,8836,nsub,8838,sube,8839,supe,8853,oplus,8855,otimes,8869,perp,8901,sdot,8968,lceil,8969,rceil,8970,lfloor,8971,rfloor,9001,lang,9002,rang,9674,loz,9824,spades,9827,clubs,9829,hearts,9830,diams,338,OElig,339,oelig,352,Scaron,353,scaron,376,Yuml,710,circ,732,tilde,8194,ensp,8195,emsp,8201,thinsp,8204,zwnj,8205,zwj,8206,lrm,8207,rlm,8211,ndash,8212,mdash,8216,lsquo,8217,rsquo,8218,sbquo,8220,ldquo,8221,rdquo,8222,bdquo,8224,dagger,8225,Dagger,8240,permil,8249,lsaquo,8250,rsaquo,8364,euro",valid_elements:"*[*]",extended_valid_elements:0,invalid_elements:0,fix_table_elements:1,fix_list_elements:true,fix_content_duplication:true,convert_fonts_to_spans:false,font_size_classes:0,apply_source_formatting:0,indent_mode:"simple",indent_char:"\t",indent_levels:1,remove_linebreaks:1,remove_redundant_brs:1,element_format:"xhtml"},j);i.dom=j.dom;i.schema=j.schema;if(j.entity_encoding=="named"&&!j.entities){j.entity_encoding="raw"}if(j.remove_redundant_brs){i.onPostProcess.add(function(k,l){l.content=l.content.replace(/(<br \/>\s*)+<\/(p|h[1-6]|div|li)>/gi,function(n,m,o){if(/^<br \/>\s*<\//.test(n)){return"</"+o+">"}return n})})}if(j.element_format=="html"){i.onPostProcess.add(function(k,l){l.content=l.content.replace(/<([^>]+) \/>/g,"<$1>")})}if(j.fix_list_elements){i.onPreProcess.add(function(v,s){var l,z,y=["ol","ul"],u,t,q,k=/^(OL|UL)$/,A;function m(r,x){var o=x.split(","),p;while((r=r.previousSibling)!=null){for(p=0;p<o.length;p++){if(r.nodeName==o[p]){return r}}}return null}for(z=0;z<y.length;z++){l=i.dom.select(y[z],s.node);for(u=0;u<l.length;u++){t=l[u];q=t.parentNode;if(k.test(q.nodeName)){A=m(t,"LI");if(!A){A=i.dom.create("li");A.innerHTML="&nbsp;";A.appendChild(t);q.insertBefore(A,q.firstChild)}else{A.appendChild(t)}}}}})}if(j.fix_table_elements){i.onPreProcess.add(function(k,l){if(!e.isOpera||opera.buildNumber()>=1767){f(i.dom.select("p table",l.node).reverse(),function(p){var o=i.dom.getParent(p.parentNode,"table,p");if(o.nodeName!="TABLE"){try{i.dom.split(o,p)}catch(m){}}})}})}},setEntities:function(o){var n=this,j,m,h={},k;if(n.entityLookup){return}j=o.split(",");for(m=0;m<j.length;m+=2){k=j[m];if(k==34||k==38||k==60||k==62){continue}h[String.fromCharCode(j[m])]=j[m+1];k=parseInt(j[m]).toString(16)}n.entityLookup=h},setRules:function(i){var h=this;h._setup();h.rules={};h.wildRules=[];h.validElements={};return h.addRules(i)},addRules:function(i){var h=this,j;if(!i){return}h._setup();f(i.split(","),function(m){var q=m.split(/\[|\]/),l=q[0].split("/"),r,k,o,n=[];if(j){k=e.extend([],j.attribs)}if(q.length>1){f(q[1].split("|"),function(u){var p={},t;k=k||[];u=u.replace(/::/g,"~");u=/^([!\-])?([\w*.?~_\-]+|)([=:<])?(.+)?$/.exec(u);u[2]=u[2].replace(/~/g,":");if(u[1]=="!"){r=r||[];r.push(u[2])}if(u[1]=="-"){for(t=0;t<k.length;t++){if(k[t].name==u[2]){k.splice(t,1);return}}}switch(u[3]){case"=":p.defaultVal=u[4]||"";break;case":":p.forcedVal=u[4];break;case"<":p.validVals=u[4].split("?");break}if(/[*.?]/.test(u[2])){o=o||[];p.nameRE=new RegExp("^"+c(u[2])+"$");o.push(p)}else{p.name=u[2];k.push(p)}n.push(u[2])})}f(l,function(v,u){var y=v.charAt(0),t=1,p={};if(j){if(j.noEmpty){p.noEmpty=j.noEmpty}if(j.fullEnd){p.fullEnd=j.fullEnd}if(j.padd){p.padd=j.padd}}switch(y){case"-":p.noEmpty=true;break;case"+":p.fullEnd=true;break;case"#":p.padd=true;break;default:t=0}l[u]=v=v.substring(t);h.validElements[v]=1;if(/[*.?]/.test(l[0])){p.nameRE=new RegExp("^"+c(l[0])+"$");h.wildRules=h.wildRules||{};h.wildRules.push(p)}else{p.name=l[0];if(l[0]=="@"){j=p}h.rules[v]=p}p.attribs=k;if(r){p.requiredAttribs=r}if(o){v="";f(n,function(s){if(v){v+="|"}v+="("+c(s)+")"});p.validAttribsRE=new RegExp("^"+v.toLowerCase()+"$");p.wildAttribs=o}})});i="";f(h.validElements,function(m,l){if(i){i+="|"}if(l!="@"){i+=l}});h.validElementsRE=new RegExp("^("+c(i.toLowerCase())+")$")},findRule:function(m){var j=this,l=j.rules,h,k;j._setup();k=l[m];if(k){return k}l=j.wildRules;for(h=0;h<l.length;h++){if(l[h].nameRE.test(m)){return l[h]}}return null},findAttribRule:function(h,l){var j,k=h.wildAttribs;for(j=0;j<k.length;j++){if(k[j].nameRE.test(l)){return k[j]}}return null},serialize:function(r,q){var m,k=this,p,i,j,l;k._setup();q=q||{};q.format=q.format||"html";k.processObj=q;if(d){l=[];f(r.getElementsByTagName("option"),function(o){var h=k.dom.getAttrib(o,"selected");l.push(h?h:null)})}r=r.cloneNode(true);if(d){f(r.getElementsByTagName("option"),function(o,h){k.dom.setAttrib(o,"selected",l[h])})}j=r.ownerDocument.implementation;if(j.createHTMLDocument&&(e.isOpera&&opera.buildNumber()>=1767)){p=j.createHTMLDocument("");f(r.nodeName=="BODY"?r.childNodes:[r],function(h){p.body.appendChild(p.importNode(h,true))});if(r.nodeName!="BODY"){r=p.body.firstChild}else{r=p.body}i=k.dom.doc;k.dom.doc=p}k.key=""+(parseInt(k.key)+1);if(!q.no_events){q.node=r;k.onPreProcess.dispatch(k,q)}k.writer.reset();k._info=q;k._serializeNode(r,q.getInner);q.content=k.writer.getContent();if(i){k.dom.doc=i}if(!q.no_events){k.onPostProcess.dispatch(k,q)}k._postProcess(q);q.node=null;return e.trim(q.content)},_postProcess:function(n){var i=this,k=i.settings,j=n.content,m=[],l;if(n.format=="html"){l=i._protect({content:j,patterns:[{pattern:/(<script[^>]*>)(.*?)(<\/script>)/g},{pattern:/(<noscript[^>]*>)(.*?)(<\/noscript>)/g},{pattern:/(<style[^>]*>)(.*?)(<\/style>)/g},{pattern:/(<pre[^>]*>)(.*?)(<\/pre>)/g,encode:1},{pattern:/(<!--\[CDATA\[)(.*?)(\]\]-->)/g}]});j=l.content;if(k.entity_encoding!=="raw"){j=i._encode(j)}if(!n.set){j=j.replace(/<p>\s+<\/p>|<p([^>]+)>\s+<\/p>/g,k.entity_encoding=="numeric"?"<p$1>&#160;</p>":"<p$1>&nbsp;</p>");if(k.remove_linebreaks){j=j.replace(/\r?\n|\r/g," ");j=j.replace(/(<[^>]+>)\s+/g,"$1 ");j=j.replace(/\s+(<\/[^>]+>)/g," $1");j=j.replace(/<(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object) ([^>]+)>\s+/g,"<$1 $2>");j=j.replace(/<(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object)>\s+/g,"<$1>");j=j.replace(/\s+<\/(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object)>/g,"</$1>")}if(k.apply_source_formatting&&k.indent_mode=="simple"){j=j.replace(/<(\/?)(ul|hr|table|meta|link|tbody|tr|object|body|head|html|map)(|[^>]+)>\s*/g,"\n<$1$2$3>\n");j=j.replace(/\s*<(p|h[1-6]|blockquote|div|title|style|pre|script|td|li|area)(|[^>]+)>/g,"\n<$1$2>");j=j.replace(/<\/(p|h[1-6]|blockquote|div|title|style|pre|script|td|li)>\s*/g,"</$1>\n");j=j.replace(/\n\n/g,"\n")}}j=i._unprotect(j,l);j=j.replace(/<!--\[CDATA\[([\s\S]+)\]\]-->/g,"<![CDATA[$1]]>");if(k.entity_encoding=="raw"){j=j.replace(/<p>&nbsp;<\/p>|<p([^>]+)>&nbsp;<\/p>/g,"<p$1>\u00a0</p>")}j=j.replace(/<noscript([^>]+|)>([\s\S]*?)<\/noscript>/g,function(h,p,o){return"<noscript"+p+">"+i.dom.decode(o.replace(/<!--|-->/g,""))+"</noscript>"})}n.content=j},_serializeNode:function(E,J){var A=this,B=A.settings,y=A.writer,q,j,u,G,F,I,C,h,z,k,r,D,p,m,H,o,x;if(!B.node_filter||B.node_filter(E)){switch(E.nodeType){case 1:if(E.hasAttribute?E.hasAttribute("_mce_bogus"):E.getAttribute("_mce_bogus")){return}p=H=false;q=E.hasChildNodes();k=E.getAttribute("_mce_name")||E.nodeName.toLowerCase();o=E.getAttribute("_mce_type");if(o){if(!A._info.cleanup){p=true;return}else{H=1}}if(d){x=E.scopeName;if(x&&x!=="HTML"&&x!=="html"){k=x+":"+k}}if(k.indexOf("mce:")===0){k=k.substring(4)}if(!H){if(!A.validElementsRE||!A.validElementsRE.test(k)||(A.invalidElementsRE&&A.invalidElementsRE.test(k))||J){p=true;break}}if(d){if(B.fix_content_duplication){if(E._mce_serialized==A.key){return}E._mce_serialized=A.key}if(k.charAt(0)=="/"){k=k.substring(1)}}else{if(a){if(E.nodeName==="BR"&&E.getAttribute("type")=="_moz"){return}}}if(B.validate_children){if(A.elementName&&!A.schema.isValid(A.elementName,k)){p=true;break}A.elementName=k}r=A.findRule(k);if(!r){p=true;break}k=r.name||k;m=B.closed.test(k);if((!q&&r.noEmpty)||(d&&!k)){p=true;break}if(r.requiredAttribs){I=r.requiredAttribs;for(G=I.length-1;G>=0;G--){if(this.dom.getAttrib(E,I[G])!==""){break}}if(G==-1){p=true;break}}y.writeStartElement(k);if(r.attribs){for(G=0,C=r.attribs,F=C.length;G<F;G++){I=C[G];z=A._getAttrib(E,I);if(z!==null){y.writeAttribute(I.name,z)}}}if(r.validAttribsRE){C=A.dom.getAttribs(E);for(G=C.length-1;G>-1;G--){h=C[G];if(h.specified){I=h.nodeName.toLowerCase();if(B.invalid_attrs.test(I)||!r.validAttribsRE.test(I)){continue}D=A.findAttribRule(r,I);z=A._getAttrib(E,D,I);if(z!==null){y.writeAttribute(I,z)}}}}if(o&&H){y.writeAttribute("_mce_type",o)}if(k==="script"&&e.trim(E.innerHTML)){y.writeText("// ");y.writeCDATA(E.innerHTML.replace(/<!--|-->|<\[CDATA\[|\]\]>/g,""));q=false;break}if(r.padd){if(q&&(u=E.firstChild)&&u.nodeType===1&&E.childNodes.length===1){if(u.hasAttribute?u.hasAttribute("_mce_bogus"):u.getAttribute("_mce_bogus")){y.writeText("\u00a0")}}else{if(!q){y.writeText("\u00a0")}}}break;case 3:if(B.validate_children&&A.elementName&&!A.schema.isValid(A.elementName,"#text")){return}return y.writeText(E.nodeValue);case 4:return y.writeCDATA(E.nodeValue);case 8:return y.writeComment(E.nodeValue)}}else{if(E.nodeType==1){q=E.hasChildNodes()}}if(q&&!m){u=E.firstChild;while(u){A._serializeNode(u);A.elementName=k;u=u.nextSibling}}if(!p){if(!m){y.writeFullEndElement()}else{y.writeEndElement()}}},_protect:function(j){var i=this;j.items=j.items||[];function h(l){return l.replace(/[\r\n\\]/g,function(m){if(m==="\n"){return"\\n"}else{if(m==="\\"){return"\\\\"}}return"\\r"})}function k(l){return l.replace(/\\[\\rn]/g,function(m){if(m==="\\n"){return"\n"}else{if(m==="\\\\"){return"\\"}}return"\r"})}f(j.patterns,function(l){j.content=k(h(j.content).replace(l.pattern,function(n,o,m,p){m=k(m);if(l.encode){m=i._encode(m)}j.items.push(m);return o+"<!--mce:"+(j.items.length-1)+"-->"+p}))});return j},_unprotect:function(i,j){i=i.replace(/\<!--mce:([0-9]+)--\>/g,function(k,h){return j.items[parseInt(h)]});j.items=[];return i},_encode:function(m){var j=this,k=j.settings,i;if(k.entity_encoding!=="raw"){if(k.entity_encoding.indexOf("named")!=-1){j.setEntities(k.entities);i=j.entityLookup;m=m.replace(/[\u007E-\uFFFF]/g,function(h){var l;if(l=i[h]){h="&"+l+";"}return h})}if(k.entity_encoding.indexOf("numeric")!=-1){m=m.replace(/[\u007E-\uFFFF]/g,function(h){return"&#"+h.charCodeAt(0)+";"})}}return m},_setup:function(){var h=this,i=this.settings;if(h.done){return}h.done=1;h.setRules(i.valid_elements);h.addRules(i.extended_valid_elements);if(i.invalid_elements){h.invalidElementsRE=new RegExp("^("+c(i.invalid_elements.replace(/,/g,"|").toLowerCase())+")$")}if(i.attrib_value_filter){h.attribValueFilter=i.attribValueFilter}},_getAttrib:function(m,j,h){var l,k;h=h||j.name;if(j.forcedVal&&(k=j.forcedVal)){if(k==="{$uid}"){return this.dom.uniqueId()}return k}k=this.dom.getAttrib(m,h);switch(h){case"rowspan":case"colspan":if(k=="1"){k=""}break}if(this.attribValueFilter){k=this.attribValueFilter(h,k,m)}if(j.validVals){for(l=j.validVals.length-1;l>=0;l--){if(k==j.validVals[l]){break}}if(l==-1){return null}}if(k===""&&typeof(j.defaultVal)!="undefined"){k=j.defaultVal;if(k==="{$uid}"){return this.dom.uniqueId()}return k}else{if(h=="class"&&this.processObj.get){k=k.replace(/\s?mceItem\w+\s?/g,"")}}if(k===""){return null}return k}})})(tinymce);(function(a){a.dom.ScriptLoader=function(h){var c=0,k=1,i=2,l={},j=[],f={},d=[],g=0,e;function b(m,u){var v=this,q=a.DOM,s,o,r,n;function p(){q.remove(n);if(s){s.onreadystatechange=s.onload=s=null}u()}n=q.uniqueId();if(a.isIE6){o=new a.util.URI(m);r=location;if(o.host==r.hostname&&o.port==r.port&&(o.protocol+":")==r.protocol){a.util.XHR.send({url:a._addVer(o.getURI()),success:function(x){var t=q.create("script",{type:"text/javascript"});t.text=x;document.getElementsByTagName("head")[0].appendChild(t);q.remove(t);p()}});return}}s=q.create("script",{id:n,type:"text/javascript",src:a._addVer(m)});s.onload=p;s.onreadystatechange=function(){var t=s.readyState;if(t=="complete"||t=="loaded"){p()}};(document.getElementsByTagName("head")[0]||document.body).appendChild(s)}this.isDone=function(m){return l[m]==i};this.markDone=function(m){l[m]=i};this.add=this.load=function(m,q,n){var o,p=l[m];if(p==e){j.push(m);l[m]=c}if(q){if(!f[m]){f[m]=[]}f[m].push({func:q,scope:n||this})}};this.loadQueue=function(n,m){this.loadScripts(j,n,m)};this.loadScripts=function(m,q,p){var o;function n(r){a.each(f[r],function(s){s.func.call(s.scope)});f[r]=e}d.push({func:q,scope:p||this});o=function(){var r=a.grep(m);m.length=0;a.each(r,function(s){if(l[s]==i){n(s);return}if(l[s]!=k){l[s]=k;g++;b(s,function(){l[s]=i;g--;n(s);o()})}});if(!g){a.each(d,function(s){s.func.call(s.scope)});d.length=0}};o()}};a.ScriptLoader=new a.dom.ScriptLoader()})(tinymce);tinymce.dom.TreeWalker=function(a,c){var b=a;function d(i,f,e,j){var h,g;if(i){if(!j&&i[f]){return i[f]}if(i!=c){h=i[e];if(h){return h}for(g=i.parentNode;g&&g!=c;g=g.parentNode){h=g[e];if(h){return h}}}}}this.current=function(){return b};this.next=function(e){return(b=d(b,"firstChild","nextSibling",e))};this.prev=function(e){return(b=d(b,"lastChild","lastSibling",e))}};(function(){var a={};function b(f,e){var d;function c(g){return g.replace(/[A-Z]+/g,function(h){return c(f[h])})}for(d in f){if(f.hasOwnProperty(d)){f[d]=c(f[d])}}c(e).replace(/#/g,"#text").replace(/(\w+)\[([^\]]+)\]/g,function(l,g,j){var h,k={};j=j.split(/\|/);for(h=j.length-1;h>=0;h--){k[j[h]]=1}a[g]=k})}b({Z:"#|H|K|N|O|P",Y:"#|X|form|R|Q",X:"p|T|div|U|W|isindex|fieldset|table",W:"pre|hr|blockquote|address|center|noframes",U:"ul|ol|dl|menu|dir",ZC:"#|p|Y|div|U|W|table|br|span|bdo|object|applet|img|map|K|N|Q",T:"h1|h2|h3|h4|h5|h6",ZB:"#|X|S|Q",S:"R|P",ZA:"#|a|G|J|M|O|P",R:"#|a|H|K|N|O",Q:"noscript|P",P:"ins|del|script",O:"input|select|textarea|label|button",N:"M|L",M:"em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym",L:"sub|sup",K:"J|I",J:"tt|i|b|u|s|strike",I:"big|small|font|basefont",H:"G|F",G:"br|span|bdo",F:"object|applet|img|map|iframe"},"script[]style[]object[#|param|X|form|a|H|K|N|O|Q]param[]p[S]a[Z]br[]span[S]bdo[S]applet[#|param|X|form|a|H|K|N|O|Q]h1[S]img[]map[X|form|Q|area]h2[S]iframe[#|X|form|a|H|K|N|O|Q]h3[S]tt[S]i[S]b[S]u[S]s[S]strike[S]big[S]small[S]font[S]basefont[]em[S]strong[S]dfn[S]code[S]q[S]samp[S]kbd[S]var[S]cite[S]abbr[S]acronym[S]sub[S]sup[S]input[]select[optgroup|option]optgroup[option]option[]textarea[]label[S]button[#|p|T|div|U|W|table|G|object|applet|img|map|K|N|Q]h4[S]ins[#|X|form|a|H|K|N|O|Q]h5[S]del[#|X|form|a|H|K|N|O|Q]h6[S]div[#|X|form|a|H|K|N|O|Q]ul[li]li[#|X|form|a|H|K|N|O|Q]ol[li]dl[dt|dd]dt[S]dd[#|X|form|a|H|K|N|O|Q]menu[li]dir[li]pre[ZA]hr[]blockquote[#|X|form|a|H|K|N|O|Q]address[S|p]center[#|X|form|a|H|K|N|O|Q]noframes[#|X|form|a|H|K|N|O|Q]isindex[]fieldset[#|legend|X|form|a|H|K|N|O|Q]legend[S]table[caption|col|colgroup|thead|tfoot|tbody|tr]caption[S]col[]colgroup[col]thead[tr]tr[th|td]th[#|X|form|a|H|K|N|O|Q]form[#|X|a|H|K|N|O|Q]noscript[#|X|form|a|H|K|N|O|Q]td[#|X|form|a|H|K|N|O|Q]tfoot[tr]tbody[tr]area[]base[]body[#|X|form|a|H|K|N|O|Q]");tinymce.dom.Schema=function(){var c=this,d=a;c.isValid=function(f,e){var g=d[f];return !!(g&&(!e||g[e]))}}})();(function(a){a.dom.RangeUtils=function(c){var b="\uFEFF";this.walk=function(d,r){var h=d.startContainer,k=d.startOffset,s=d.endContainer,l=d.endOffset,i,f,n,g,q,p,e;e=c.select("td.mceSelected,th.mceSelected");if(e.length>0){a.each(e,function(t){r([t])});return}function o(v,u,t){var x=[];for(;v&&v!=t;v=v[u]){x.push(v)}return x}function m(u,t){do{if(u.parentNode==t){return u}u=u.parentNode}while(u)}function j(v,u,x){var t=x?"nextSibling":"previousSibling";for(g=v,q=g.parentNode;g&&g!=u;g=q){q=g.parentNode;p=o(g==v?g:g[t],t);if(p.length){if(!x){p.reverse()}r(p)}}}if(h.nodeType==1&&h.hasChildNodes()){h=h.childNodes[k]}if(s.nodeType==1&&s.hasChildNodes()){s=s.childNodes[Math.min(k==l?l:l-1,s.childNodes.length-1)]}i=c.findCommonAncestor(h,s);if(h==s){return r([h])}for(g=h;g;g=g.parentNode){if(g==s){return j(h,i,true)}if(g==i){break}}for(g=s;g;g=g.parentNode){if(g==h){return j(s,i)}if(g==i){break}}f=m(h,i)||h;n=m(s,i)||s;j(h,f,true);p=o(f==h?f:f.nextSibling,"nextSibling",n==s?n.nextSibling:n);if(p.length){r(p)}j(s,n)}};a.dom.RangeUtils.compareRanges=function(c,b){if(c&&b){if(c.item||c.duplicate){if(c.item&&b.item&&c.item(0)===b.item(0)){return true}if(c.isEqual&&b.isEqual&&b.isEqual(c)){return true}}else{return c.startContainer==b.startContainer&&c.startOffset==b.startOffset}}return false}})(tinymce);(function(c){var b=c.DOM,a=c.is;c.create("tinymce.ui.Control",{Control:function(e,d){this.id=e;this.settings=d=d||{};this.rendered=false;this.onRender=new c.util.Dispatcher(this);this.classPrefix="";this.scope=d.scope||this;this.disabled=0;this.active=0},setDisabled:function(d){var f;if(d!=this.disabled){f=b.get(this.id);if(f&&this.settings.unavailable_prefix){if(d){this.prevTitle=f.title;f.title=this.settings.unavailable_prefix+": "+f.title}else{f.title=this.prevTitle}}this.setState("Disabled",d);this.setState("Enabled",!d);this.disabled=d}},isDisabled:function(){return this.disabled},setActive:function(d){if(d!=this.active){this.setState("Active",d);this.active=d}},isActive:function(){return this.active},setState:function(f,d){var e=b.get(this.id);f=this.classPrefix+f;if(d){b.addClass(e,f)}else{b.removeClass(e,f)}},isRendered:function(){return this.rendered},renderHTML:function(){},renderTo:function(d){b.setHTML(d,this.renderHTML())},postRender:function(){var e=this,d;if(a(e.disabled)){d=e.disabled;e.disabled=-1;e.setDisabled(d)}if(a(e.active)){d=e.active;e.active=-1;e.setActive(d)}},remove:function(){b.remove(this.id);this.destroy()},destroy:function(){c.dom.Event.clear(this.id)}})})(tinymce);tinymce.create("tinymce.ui.Container:tinymce.ui.Control",{Container:function(b,a){this.parent(b,a);this.controls=[];this.lookup={}},add:function(a){this.lookup[a.id]=a;this.controls.push(a);return a},get:function(a){return this.lookup[a]}});tinymce.create("tinymce.ui.Separator:tinymce.ui.Control",{Separator:function(b,a){this.parent(b,a);this.classPrefix="mceSeparator"},renderHTML:function(){return tinymce.DOM.createHTML("span",{"class":this.classPrefix})}});(function(d){var c=d.is,b=d.DOM,e=d.each,a=d.walk;d.create("tinymce.ui.MenuItem:tinymce.ui.Control",{MenuItem:function(g,f){this.parent(g,f);this.classPrefix="mceMenuItem"},setSelected:function(f){this.setState("Selected",f);this.selected=f},isSelected:function(){return this.selected},postRender:function(){var f=this;f.parent();if(c(f.selected)){f.setSelected(f.selected)}}})})(tinymce);(function(d){var c=d.is,b=d.DOM,e=d.each,a=d.walk;d.create("tinymce.ui.Menu:tinymce.ui.MenuItem",{Menu:function(h,g){var f=this;f.parent(h,g);f.items={};f.collapsed=false;f.menuCount=0;f.onAddItem=new d.util.Dispatcher(this)},expand:function(g){var f=this;if(g){a(f,function(h){if(h.expand){h.expand()}},"items",f)}f.collapsed=false},collapse:function(g){var f=this;if(g){a(f,function(h){if(h.collapse){h.collapse()}},"items",f)}f.collapsed=true},isCollapsed:function(){return this.collapsed},add:function(f){if(!f.settings){f=new d.ui.MenuItem(f.id||b.uniqueId(),f)}this.onAddItem.dispatch(this,f);return this.items[f.id]=f},addSeparator:function(){return this.add({separator:true})},addMenu:function(f){if(!f.collapse){f=this.createMenu(f)}this.menuCount++;return this.add(f)},hasMenus:function(){return this.menuCount!==0},remove:function(f){delete this.items[f.id]},removeAll:function(){var f=this;a(f,function(g){if(g.removeAll){g.removeAll()}else{g.remove()}g.destroy()},"items",f);f.items={}},createMenu:function(g){var f=new d.ui.Menu(g.id||b.uniqueId(),g);f.onAddItem.add(this.onAddItem.dispatch,this.onAddItem);return f}})})(tinymce);(function(e){var d=e.is,c=e.DOM,f=e.each,a=e.dom.Event,b=e.dom.Element;e.create("tinymce.ui.DropMenu:tinymce.ui.Menu",{DropMenu:function(h,g){g=g||{};g.container=g.container||c.doc.body;g.offset_x=g.offset_x||0;g.offset_y=g.offset_y||0;g.vp_offset_x=g.vp_offset_x||0;g.vp_offset_y=g.vp_offset_y||0;if(d(g.icons)&&!g.icons){g["class"]+=" mceNoIcons"}this.parent(h,g);this.onShowMenu=new e.util.Dispatcher(this);this.onHideMenu=new e.util.Dispatcher(this);this.classPrefix="mceMenu"},createMenu:function(j){var h=this,i=h.settings,g;j.container=j.container||i.container;j.parent=h;j.constrain=j.constrain||i.constrain;j["class"]=j["class"]||i["class"];j.vp_offset_x=j.vp_offset_x||i.vp_offset_x;j.vp_offset_y=j.vp_offset_y||i.vp_offset_y;g=new e.ui.DropMenu(j.id||c.uniqueId(),j);g.onAddItem.add(h.onAddItem.dispatch,h.onAddItem);return g},update:function(){var i=this,j=i.settings,g=c.get("menu_"+i.id+"_tbl"),l=c.get("menu_"+i.id+"_co"),h,k;h=j.max_width?Math.min(g.clientWidth,j.max_width):g.clientWidth;k=j.max_height?Math.min(g.clientHeight,j.max_height):g.clientHeight;if(!c.boxModel){i.element.setStyles({width:h+2,height:k+2})}else{i.element.setStyles({width:h,height:k})}if(j.max_width){c.setStyle(l,"width",h)}if(j.max_height){c.setStyle(l,"height",k);if(g.clientHeight<j.max_height){c.setStyle(l,"overflow","hidden")}}},showMenu:function(p,n,r){var z=this,A=z.settings,o,g=c.getViewPort(),u,l,v,q,i=2,k,j,m=z.classPrefix;z.collapse(1);if(z.isMenuVisible){return}if(!z.rendered){o=c.add(z.settings.container,z.renderNode());f(z.items,function(h){h.postRender()});z.element=new b("menu_"+z.id,{blocker:1,container:A.container})}else{o=c.get("menu_"+z.id)}if(!e.isOpera){c.setStyles(o,{left:-65535,top:-65535})}c.show(o);z.update();p+=A.offset_x||0;n+=A.offset_y||0;g.w-=4;g.h-=4;if(A.constrain){u=o.clientWidth-i;l=o.clientHeight-i;v=g.x+g.w;q=g.y+g.h;if((p+A.vp_offset_x+u)>v){p=r?r-u:Math.max(0,(v-A.vp_offset_x)-u)}if((n+A.vp_offset_y+l)>q){n=Math.max(0,(q-A.vp_offset_y)-l)}}c.setStyles(o,{left:p,top:n});z.element.update();z.isMenuVisible=1;z.mouseClickFunc=a.add(o,"click",function(s){var h;s=s.target;if(s&&(s=c.getParent(s,"tr"))&&!c.hasClass(s,m+"ItemSub")){h=z.items[s.id];if(h.isDisabled()){return}k=z;while(k){if(k.hideMenu){k.hideMenu()}k=k.settings.parent}if(h.settings.onclick){h.settings.onclick(s)}return a.cancel(s)}});if(z.hasMenus()){z.mouseOverFunc=a.add(o,"mouseover",function(x){var h,t,s;x=x.target;if(x&&(x=c.getParent(x,"tr"))){h=z.items[x.id];if(z.lastMenu){z.lastMenu.collapse(1)}if(h.isDisabled()){return}if(x&&c.hasClass(x,m+"ItemSub")){t=c.getRect(x);h.showMenu((t.x+t.w-i),t.y-i,t.x);z.lastMenu=h;c.addClass(c.get(h.id).firstChild,m+"ItemActive")}}})}z.onShowMenu.dispatch(z);if(A.keyboard_focus){a.add(o,"keydown",z._keyHandler,z);c.select("a","menu_"+z.id)[0].focus();z._focusIdx=0}},hideMenu:function(j){var g=this,i=c.get("menu_"+g.id),h;if(!g.isMenuVisible){return}a.remove(i,"mouseover",g.mouseOverFunc);a.remove(i,"click",g.mouseClickFunc);a.remove(i,"keydown",g._keyHandler);c.hide(i);g.isMenuVisible=0;if(!j){g.collapse(1)}if(g.element){g.element.hide()}if(h=c.get(g.id)){c.removeClass(h.firstChild,g.classPrefix+"ItemActive")}g.onHideMenu.dispatch(g)},add:function(i){var g=this,h;i=g.parent(i);if(g.isRendered&&(h=c.get("menu_"+g.id))){g._add(c.select("tbody",h)[0],i)}return i},collapse:function(g){this.parent(g);this.hideMenu(1)},remove:function(g){c.remove(g.id);this.destroy();return this.parent(g)},destroy:function(){var g=this,h=c.get("menu_"+g.id);a.remove(h,"mouseover",g.mouseOverFunc);a.remove(h,"click",g.mouseClickFunc);if(g.element){g.element.remove()}c.remove(h)},renderNode:function(){var i=this,j=i.settings,l,h,k,g;g=c.create("div",{id:"menu_"+i.id,"class":j["class"],style:"position:absolute;left:0;top:0;z-index:200000"});k=c.add(g,"div",{id:"menu_"+i.id+"_co","class":i.classPrefix+(j["class"]?" "+j["class"]:"")});i.element=new b("menu_"+i.id,{blocker:1,container:j.container});if(j.menu_line){c.add(k,"span",{"class":i.classPrefix+"Line"})}l=c.add(k,"table",{id:"menu_"+i.id+"_tbl",border:0,cellPadding:0,cellSpacing:0});h=c.add(l,"tbody");f(i.items,function(m){i._add(h,m)});i.rendered=true;return g},_keyHandler:function(j){var i=this,h=j.keyCode;function g(m){var k=i._focusIdx+m,l=c.select("a","menu_"+i.id)[k];if(l){i._focusIdx=k;l.focus()}}switch(h){case 38:g(-1);return;case 40:g(1);return;case 13:return;case 27:return this.hideMenu()}},_add:function(j,h){var i,q=h.settings,p,l,k,m=this.classPrefix,g;if(q.separator){l=c.add(j,"tr",{id:h.id,"class":m+"ItemSeparator"});c.add(l,"td",{"class":m+"ItemSeparator"});if(i=l.previousSibling){c.addClass(i,"mceLast")}return}i=l=c.add(j,"tr",{id:h.id,"class":m+"Item "+m+"ItemEnabled"});i=k=c.add(i,"td");i=p=c.add(i,"a",{href:"javascript:;",onclick:"return false;",onmousedown:"return false;"});c.addClass(k,q["class"]);g=c.add(i,"span",{"class":"mceIcon"+(q.icon?" mce_"+q.icon:"")});if(q.icon_src){c.add(g,"img",{src:q.icon_src})}i=c.add(i,q.element||"span",{"class":"mceText",title:h.settings.title},h.settings.title);if(h.settings.style){c.setAttrib(i,"style",h.settings.style)}if(j.childNodes.length==1){c.addClass(l,"mceFirst")}if((i=l.previousSibling)&&c.hasClass(i,m+"ItemSeparator")){c.addClass(l,"mceFirst")}if(h.collapse){c.addClass(l,m+"ItemSub")}if(i=l.previousSibling){c.removeClass(i,"mceLast")}c.addClass(l,"mceLast")}})})(tinymce);(function(b){var a=b.DOM;b.create("tinymce.ui.Button:tinymce.ui.Control",{Button:function(d,c){this.parent(d,c);this.classPrefix="mceButton"},renderHTML:function(){var f=this.classPrefix,e=this.settings,d,c;c=a.encode(e.label||"");d='<a id="'+this.id+'" href="javascript:;" class="'+f+" "+f+"Enabled "+e["class"]+(c?" "+f+"Labeled":"")+'" onmousedown="return false;" onclick="return false;" title="'+a.encode(e.title)+'">';if(e.image){d+='<img class="mceIcon" src="'+e.image+'" />'+c+"</a>"}else{d+='<span class="mceIcon '+e["class"]+'"></span>'+(c?'<span class="'+f+'Label">'+c+"</span>":"")+"</a>"}return d},postRender:function(){var c=this,d=c.settings;b.dom.Event.add(c.id,"click",function(f){if(!c.isDisabled()){return d.onclick.call(d.scope,f)}})}})})(tinymce);(function(d){var c=d.DOM,b=d.dom.Event,e=d.each,a=d.util.Dispatcher;d.create("tinymce.ui.ListBox:tinymce.ui.Control",{ListBox:function(h,g){var f=this;f.parent(h,g);f.items=[];f.onChange=new a(f);f.onPostRender=new a(f);f.onAdd=new a(f);f.onRenderMenu=new d.util.Dispatcher(this);f.classPrefix="mceListBox"},select:function(h){var g=this,j,i;if(h==undefined){return g.selectByIndex(-1)}if(h&&h.call){i=h}else{i=function(f){return f==h}}if(h!=g.selectedValue){e(g.items,function(k,f){if(i(k.value)){j=1;g.selectByIndex(f);return false}});if(!j){g.selectByIndex(-1)}}},selectByIndex:function(f){var g=this,h,i;if(f!=g.selectedIndex){h=c.get(g.id+"_text");i=g.items[f];if(i){g.selectedValue=i.value;g.selectedIndex=f;c.setHTML(h,c.encode(i.title));c.removeClass(h,"mceTitle")}else{c.setHTML(h,c.encode(g.settings.title));c.addClass(h,"mceTitle");g.selectedValue=g.selectedIndex=null}h=0}},add:function(i,f,h){var g=this;h=h||{};h=d.extend(h,{title:i,value:f});g.items.push(h);g.onAdd.dispatch(g,h)},getLength:function(){return this.items.length},renderHTML:function(){var i="",f=this,g=f.settings,j=f.classPrefix;i='<table id="'+f.id+'" cellpadding="0" cellspacing="0" class="'+j+" "+j+"Enabled"+(g["class"]?(" "+g["class"]):"")+'"><tbody><tr>';i+="<td>"+c.createHTML("a",{id:f.id+"_text",href:"javascript:;","class":"mceText",onclick:"return false;",onmousedown:"return false;"},c.encode(f.settings.title))+"</td>";i+="<td>"+c.createHTML("a",{id:f.id+"_open",tabindex:-1,href:"javascript:;","class":"mceOpen",onclick:"return false;",onmousedown:"return false;"},"<span></span>")+"</td>";i+="</tr></tbody></table>";return i},showMenu:function(){var g=this,j,i,h=c.get(this.id),f;if(g.isDisabled()||g.items.length==0){return}if(g.menu&&g.menu.isMenuVisible){return g.hideMenu()}if(!g.isMenuRendered){g.renderMenu();g.isMenuRendered=true}j=c.getPos(this.settings.menu_container);i=c.getPos(h);f=g.menu;f.settings.offset_x=i.x;f.settings.offset_y=i.y;f.settings.keyboard_focus=!d.isOpera;if(g.oldID){f.items[g.oldID].setSelected(0)}e(g.items,function(k){if(k.value===g.selectedValue){f.items[k.id].setSelected(1);g.oldID=k.id}});f.showMenu(0,h.clientHeight);b.add(c.doc,"mousedown",g.hideMenu,g);c.addClass(g.id,g.classPrefix+"Selected")},hideMenu:function(g){var f=this;if(f.menu&&f.menu.isMenuVisible){if(g&&g.type=="mousedown"&&(g.target.id==f.id+"_text"||g.target.id==f.id+"_open")){return}if(!g||!c.getParent(g.target,".mceMenu")){c.removeClass(f.id,f.classPrefix+"Selected");b.remove(c.doc,"mousedown",f.hideMenu,f);f.menu.hideMenu()}}},renderMenu:function(){var g=this,f;f=g.settings.control_manager.createDropMenu(g.id+"_menu",{menu_line:1,"class":g.classPrefix+"Menu mceNoIcons",max_width:150,max_height:150});f.onHideMenu.add(g.hideMenu,g);f.add({title:g.settings.title,"class":"mceMenuItemTitle",onclick:function(){if(g.settings.onselect("")!==false){g.select("")}}});e(g.items,function(h){if(h.value===undefined){f.add({title:h.title,"class":"mceMenuItemTitle",onclick:function(){if(g.settings.onselect("")!==false){g.select("")}}})}else{h.id=c.uniqueId();h.onclick=function(){if(g.settings.onselect(h.value)!==false){g.select(h.value)}};f.add(h)}});g.onRenderMenu.dispatch(g,f);g.menu=f},postRender:function(){var f=this,g=f.classPrefix;b.add(f.id,"click",f.showMenu,f);b.add(f.id+"_text","focus",function(){if(!f._focused){f.keyDownHandler=b.add(f.id+"_text","keydown",function(k){var h=-1,i,j=k.keyCode;e(f.items,function(l,m){if(f.selectedValue==l.value){h=m}});if(j==38){i=f.items[h-1]}else{if(j==40){i=f.items[h+1]}else{if(j==13){i=f.selectedValue;f.selectedValue=null;f.settings.onselect(i);return b.cancel(k)}}}if(i){f.hideMenu();f.select(i.value)}})}f._focused=1});b.add(f.id+"_text","blur",function(){b.remove(f.id+"_text","keydown",f.keyDownHandler);f._focused=0});if(d.isIE6||!c.boxModel){b.add(f.id,"mouseover",function(){if(!c.hasClass(f.id,g+"Disabled")){c.addClass(f.id,g+"Hover")}});b.add(f.id,"mouseout",function(){if(!c.hasClass(f.id,g+"Disabled")){c.removeClass(f.id,g+"Hover")}})}f.onPostRender.dispatch(f,c.get(f.id))},destroy:function(){this.parent();b.clear(this.id+"_text");b.clear(this.id+"_open")}})})(tinymce);(function(d){var c=d.DOM,b=d.dom.Event,e=d.each,a=d.util.Dispatcher;d.create("tinymce.ui.NativeListBox:tinymce.ui.ListBox",{NativeListBox:function(g,f){this.parent(g,f);this.classPrefix="mceNativeListBox"},setDisabled:function(f){c.get(this.id).disabled=f},isDisabled:function(){return c.get(this.id).disabled},select:function(h){var g=this,j,i;if(h==undefined){return g.selectByIndex(-1)}if(h&&h.call){i=h}else{i=function(f){return f==h}}if(h!=g.selectedValue){e(g.items,function(k,f){if(i(k.value)){j=1;g.selectByIndex(f);return false}});if(!j){g.selectByIndex(-1)}}},selectByIndex:function(f){c.get(this.id).selectedIndex=f+1;this.selectedValue=this.items[f]?this.items[f].value:null},add:function(j,g,f){var i,h=this;f=f||{};f.value=g;if(h.isRendered()){c.add(c.get(this.id),"option",f,j)}i={title:j,value:g,attribs:f};h.items.push(i);h.onAdd.dispatch(h,i)},getLength:function(){return this.items.length},renderHTML:function(){var g,f=this;g=c.createHTML("option",{value:""},"-- "+f.settings.title+" --");e(f.items,function(h){g+=c.createHTML("option",{value:h.value},h.title)});g=c.createHTML("select",{id:f.id,"class":"mceNativeListBox"},g);return g},postRender:function(){var g=this,h;g.rendered=true;function f(j){var i=g.items[j.target.selectedIndex-1];if(i&&(i=i.value)){g.onChange.dispatch(g,i);if(g.settings.onselect){g.settings.onselect(i)}}}b.add(g.id,"change",f);b.add(g.id,"keydown",function(j){var i;b.remove(g.id,"change",h);i=b.add(g.id,"blur",function(){b.add(g.id,"change",f);b.remove(g.id,"blur",i)});if(j.keyCode==13||j.keyCode==32){f(j);return b.cancel(j)}});g.onPostRender.dispatch(g,c.get(g.id))}})})(tinymce);(function(c){var b=c.DOM,a=c.dom.Event,d=c.each;c.create("tinymce.ui.MenuButton:tinymce.ui.Button",{MenuButton:function(f,e){this.parent(f,e);this.onRenderMenu=new c.util.Dispatcher(this);e.menu_container=e.menu_container||b.doc.body},showMenu:function(){var g=this,j,i,h=b.get(g.id),f;if(g.isDisabled()){return}if(!g.isMenuRendered){g.renderMenu();g.isMenuRendered=true}if(g.isMenuVisible){return g.hideMenu()}j=b.getPos(g.settings.menu_container);i=b.getPos(h);f=g.menu;f.settings.offset_x=i.x;f.settings.offset_y=i.y;f.settings.vp_offset_x=i.x;f.settings.vp_offset_y=i.y;f.settings.keyboard_focus=g._focused;f.showMenu(0,h.clientHeight);a.add(b.doc,"mousedown",g.hideMenu,g);g.setState("Selected",1);g.isMenuVisible=1},renderMenu:function(){var f=this,e;e=f.settings.control_manager.createDropMenu(f.id+"_menu",{menu_line:1,"class":this.classPrefix+"Menu",icons:f.settings.icons});e.onHideMenu.add(f.hideMenu,f);f.onRenderMenu.dispatch(f,e);f.menu=e},hideMenu:function(g){var f=this;if(g&&g.type=="mousedown"&&b.getParent(g.target,function(h){return h.id===f.id||h.id===f.id+"_open"})){return}if(!g||!b.getParent(g.target,".mceMenu")){f.setState("Selected",0);a.remove(b.doc,"mousedown",f.hideMenu,f);if(f.menu){f.menu.hideMenu()}}f.isMenuVisible=0},postRender:function(){var e=this,f=e.settings;a.add(e.id,"click",function(){if(!e.isDisabled()){if(f.onclick){f.onclick(e.value)}e.showMenu()}})}})})(tinymce);(function(c){var b=c.DOM,a=c.dom.Event,d=c.each;c.create("tinymce.ui.SplitButton:tinymce.ui.MenuButton",{SplitButton:function(f,e){this.parent(f,e);this.classPrefix="mceSplitButton"},renderHTML:function(){var i,f=this,g=f.settings,e;i="<tbody><tr>";if(g.image){e=b.createHTML("img ",{src:g.image,"class":"mceAction "+g["class"]})}else{e=b.createHTML("span",{"class":"mceAction "+g["class"]},"")}i+="<td>"+b.createHTML("a",{id:f.id+"_action",href:"javascript:;","class":"mceAction "+g["class"],onclick:"return false;",onmousedown:"return false;",title:g.title},e)+"</td>";e=b.createHTML("span",{"class":"mceOpen "+g["class"]});i+="<td>"+b.createHTML("a",{id:f.id+"_open",href:"javascript:;","class":"mceOpen "+g["class"],onclick:"return false;",onmousedown:"return false;",title:g.title},e)+"</td>";i+="</tr></tbody>";return b.createHTML("table",{id:f.id,"class":"mceSplitButton mceSplitButtonEnabled "+g["class"],cellpadding:"0",cellspacing:"0",onmousedown:"return false;",title:g.title},i)},postRender:function(){var e=this,f=e.settings;if(f.onclick){a.add(e.id+"_action","click",function(){if(!e.isDisabled()){f.onclick(e.value)}})}a.add(e.id+"_open","click",e.showMenu,e);a.add(e.id+"_open","focus",function(){e._focused=1});a.add(e.id+"_open","blur",function(){e._focused=0});if(c.isIE6||!b.boxModel){a.add(e.id,"mouseover",function(){if(!b.hasClass(e.id,"mceSplitButtonDisabled")){b.addClass(e.id,"mceSplitButtonHover")}});a.add(e.id,"mouseout",function(){if(!b.hasClass(e.id,"mceSplitButtonDisabled")){b.removeClass(e.id,"mceSplitButtonHover")}})}},destroy:function(){this.parent();a.clear(this.id+"_action");a.clear(this.id+"_open")}})})(tinymce);(function(d){var c=d.DOM,a=d.dom.Event,b=d.is,e=d.each;d.create("tinymce.ui.ColorSplitButton:tinymce.ui.SplitButton",{ColorSplitButton:function(h,g){var f=this;f.parent(h,g);f.settings=g=d.extend({colors:"000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,008000,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF",grid_width:8,default_color:"#888888"},f.settings);f.onShowMenu=new d.util.Dispatcher(f);f.onHideMenu=new d.util.Dispatcher(f);f.value=g.default_color},showMenu:function(){var f=this,g,j,i,h;if(f.isDisabled()){return}if(!f.isMenuRendered){f.renderMenu();f.isMenuRendered=true}if(f.isMenuVisible){return f.hideMenu()}i=c.get(f.id);c.show(f.id+"_menu");c.addClass(i,"mceSplitButtonSelected");h=c.getPos(i);c.setStyles(f.id+"_menu",{left:h.x,top:h.y+i.clientHeight,zIndex:200000});i=0;a.add(c.doc,"mousedown",f.hideMenu,f);f.onShowMenu.dispatch(f);if(f._focused){f._keyHandler=a.add(f.id+"_menu","keydown",function(k){if(k.keyCode==27){f.hideMenu()}});c.select("a",f.id+"_menu")[0].focus()}f.isMenuVisible=1},hideMenu:function(g){var f=this;if(g&&g.type=="mousedown"&&c.getParent(g.target,function(h){return h.id===f.id+"_open"})){return}if(!g||!c.getParent(g.target,".mceSplitButtonMenu")){c.removeClass(f.id,"mceSplitButtonSelected");a.remove(c.doc,"mousedown",f.hideMenu,f);a.remove(f.id+"_menu","keydown",f._keyHandler);c.hide(f.id+"_menu")}f.onHideMenu.dispatch(f);f.isMenuVisible=0},renderMenu:function(){var k=this,f,j=0,l=k.settings,p,h,o,g;g=c.add(l.menu_container,"div",{id:k.id+"_menu","class":l.menu_class+" "+l["class"],style:"position:absolute;left:0;top:-1000px;"});f=c.add(g,"div",{"class":l["class"]+" mceSplitButtonMenu"});c.add(f,"span",{"class":"mceMenuLine"});p=c.add(f,"table",{"class":"mceColorSplitMenu"});h=c.add(p,"tbody");j=0;e(b(l.colors,"array")?l.colors:l.colors.split(","),function(i){i=i.replace(/^#/,"");if(!j--){o=c.add(h,"tr");j=l.grid_width-1}p=c.add(o,"td");p=c.add(p,"a",{href:"javascript:;",style:{backgroundColor:"#"+i},_mce_color:"#"+i})});if(l.more_colors_func){p=c.add(h,"tr");p=c.add(p,"td",{colspan:l.grid_width,"class":"mceMoreColors"});p=c.add(p,"a",{id:k.id+"_more",href:"javascript:;",onclick:"return false;","class":"mceMoreColors"},l.more_colors_title);a.add(p,"click",function(i){l.more_colors_func.call(l.more_colors_scope||this);return a.cancel(i)})}c.addClass(f,"mceColorSplitMenu");a.add(k.id+"_menu","click",function(i){var m;i=i.target;if(i.nodeName=="A"&&(m=i.getAttribute("_mce_color"))){k.setColor(m)}return a.cancel(i)});return g},setColor:function(g){var f=this;c.setStyle(f.id+"_preview","backgroundColor",g);f.value=g;f.hideMenu();f.settings.onselect(g)},postRender:function(){var f=this,g=f.id;f.parent();c.add(g+"_action","div",{id:g+"_preview","class":"mceColorPreview"});c.setStyle(f.id+"_preview","backgroundColor",f.value)},destroy:function(){this.parent();a.clear(this.id+"_menu");a.clear(this.id+"_more");c.remove(this.id+"_menu")}})})(tinymce);tinymce.create("tinymce.ui.Toolbar:tinymce.ui.Container",{renderHTML:function(){var l=this,e="",g,j,b=tinymce.DOM,m=l.settings,d,a,f,k;k=l.controls;for(d=0;d<k.length;d++){j=k[d];a=k[d-1];f=k[d+1];if(d===0){g="mceToolbarStart";if(j.Button){g+=" mceToolbarStartButton"}else{if(j.SplitButton){g+=" mceToolbarStartSplitButton"}else{if(j.ListBox){g+=" mceToolbarStartListBox"}}}e+=b.createHTML("td",{"class":g},b.createHTML("span",null,"<!-- IE -->"))}if(a&&j.ListBox){if(a.Button||a.SplitButton){e+=b.createHTML("td",{"class":"mceToolbarEnd"},b.createHTML("span",null,"<!-- IE -->"))}}if(b.stdMode){e+='<td style="position: relative">'+j.renderHTML()+"</td>"}else{e+="<td>"+j.renderHTML()+"</td>"}if(f&&j.ListBox){if(f.Button||f.SplitButton){e+=b.createHTML("td",{"class":"mceToolbarStart"},b.createHTML("span",null,"<!-- IE -->"))}}}g="mceToolbarEnd";if(j.Button){g+=" mceToolbarEndButton"}else{if(j.SplitButton){g+=" mceToolbarEndSplitButton"}else{if(j.ListBox){g+=" mceToolbarEndListBox"}}}e+=b.createHTML("td",{"class":g},b.createHTML("span",null,"<!-- IE -->"));return b.createHTML("table",{id:l.id,"class":"mceToolbar"+(m["class"]?" "+m["class"]:""),cellpadding:"0",cellspacing:"0",align:l.settings.align||""},"<tbody><tr>"+e+"</tr></tbody>")}});(function(b){var a=b.util.Dispatcher,c=b.each;b.create("tinymce.AddOnManager",{items:[],urls:{},lookup:{},onAdd:new a(this),get:function(d){return this.lookup[d]},requireLangPack:function(e){var d=b.settings;if(d&&d.language){b.ScriptLoader.add(this.urls[e]+"/langs/"+d.language+".js")}},add:function(e,d){this.items.push(d);this.lookup[e]=d;this.onAdd.dispatch(this,e,d);return d},load:function(h,e,d,g){var f=this;if(f.urls[h]){return}if(e.indexOf("/")!=0&&e.indexOf("://")==-1){e=b.baseURL+"/"+e}f.urls[h]=e.substring(0,e.lastIndexOf("/"));b.ScriptLoader.add(e,d,g)}});b.PluginManager=new b.AddOnManager();b.ThemeManager=new b.AddOnManager()}(tinymce));(function(j){var g=j.each,d=j.extend,k=j.DOM,i=j.dom.Event,f=j.ThemeManager,b=j.PluginManager,e=j.explode,h=j.util.Dispatcher,a,c=0;j.documentBaseURL=window.location.href.replace(/[\?#].*$/,"").replace(/[\/\\][^\/]+$/,"");if(!/[\/\\]$/.test(j.documentBaseURL)){j.documentBaseURL+="/"}j.baseURL=new j.util.URI(j.documentBaseURL).toAbsolute(j.baseURL);j.baseURI=new j.util.URI(j.baseURL);j.onBeforeUnload=new h(j);i.add(window,"beforeunload",function(l){j.onBeforeUnload.dispatch(j,l)});j.onAddEditor=new h(j);j.onRemoveEditor=new h(j);j.EditorManager=d(j,{editors:[],i18n:{},activeEditor:null,init:function(q){var n=this,p,l=j.ScriptLoader,u,o=[],m;function r(x,y,t){var v=x[y];if(!v){return}if(j.is(v,"string")){t=v.replace(/\.\w+$/,"");t=t?j.resolve(t):0;v=j.resolve(v)}return v.apply(t||this,Array.prototype.slice.call(arguments,2))}q=d({theme:"simple",language:"en"},q);n.settings=q;i.add(document,"init",function(){var s,v;r(q,"onpageload");switch(q.mode){case"exact":s=q.elements||"";if(s.length>0){g(e(s),function(x){if(k.get(x)){m=new j.Editor(x,q);o.push(m);m.render(1)}else{g(document.forms,function(y){g(y.elements,function(z){if(z.name===x){x="mce_editor_"+c++;k.setAttrib(z,"id",x);m=new j.Editor(x,q);o.push(m);m.render(1)}})})}})}break;case"textareas":case"specific_textareas":function t(y,x){return x.constructor===RegExp?x.test(y.className):k.hasClass(y,x)}g(k.select("textarea"),function(x){if(q.editor_deselector&&t(x,q.editor_deselector)){return}if(!q.editor_selector||t(x,q.editor_selector)){u=k.get(x.name);if(!x.id&&!u){x.id=x.name}if(!x.id||n.get(x.id)){x.id=k.uniqueId()}m=new j.Editor(x.id,q);o.push(m);m.render(1)}});break}if(q.oninit){s=v=0;g(o,function(x){v++;if(!x.initialized){x.onInit.add(function(){s++;if(s==v){r(q,"oninit")}})}else{s++}if(s==v){r(q,"oninit")}})}})},get:function(l){if(l===a){return this.editors}return this.editors[l]},getInstanceById:function(l){return this.get(l)},add:function(m){var l=this,n=l.editors;n[m.id]=m;n.push(m);l._setActive(m);l.onAddEditor.dispatch(l,m);if(j.adapter){j.adapter.patchEditor(m)}return m},remove:function(n){var m=this,l,o=m.editors;if(!o[n.id]){return null}delete o[n.id];for(l=0;l<o.length;l++){if(o[l]==n){o.splice(l,1);break}}if(m.activeEditor==n){m._setActive(o[0])}n.destroy();m.onRemoveEditor.dispatch(m,n);return n},execCommand:function(r,p,o){var q=this,n=q.get(o),l;switch(r){case"mceFocus":n.focus();return true;case"mceAddEditor":case"mceAddControl":if(!q.get(o)){new j.Editor(o,q.settings).render()}return true;case"mceAddFrameControl":l=o.window;l.tinyMCE=tinyMCE;l.tinymce=j;j.DOM.doc=l.document;j.DOM.win=l;n=new j.Editor(o.element_id,o);n.render();if(j.isIE){function m(){n.destroy();l.detachEvent("onunload",m);l=l.tinyMCE=l.tinymce=null}l.attachEvent("onunload",m)}o.page_window=null;return true;case"mceRemoveEditor":case"mceRemoveControl":if(n){n.remove()}return true;case"mceToggleEditor":if(!n){q.execCommand("mceAddControl",0,o);return true}if(n.isHidden()){n.show()}else{n.hide()}return true}if(q.activeEditor){return q.activeEditor.execCommand(r,p,o)}return false},execInstanceCommand:function(p,o,n,m){var l=this.get(p);if(l){return l.execCommand(o,n,m)}return false},triggerSave:function(){g(this.editors,function(l){l.save()})},addI18n:function(n,q){var l,m=this.i18n;if(!j.is(n,"string")){g(n,function(r,p){g(r,function(t,s){g(t,function(v,u){if(s==="common"){m[p+"."+u]=v}else{m[p+"."+s+"."+u]=v}})})})}else{g(q,function(r,p){m[n+"."+p]=r})}},_setActive:function(l){this.selectedInstance=this.activeEditor=l}})})(tinymce);(function(m){var n=m.DOM,j=m.dom.Event,f=m.extend,k=m.util.Dispatcher,i=m.each,a=m.isGecko,b=m.isIE,e=m.isWebKit,d=m.is,h=m.ThemeManager,c=m.PluginManager,o=m.inArray,l=m.grep,g=m.explode;m.create("tinymce.Editor",{Editor:function(r,q){var p=this;p.id=p.editorId=r;p.execCommands={};p.queryStateCommands={};p.queryValueCommands={};p.isNotDirty=false;p.plugins={};i(["onPreInit","onBeforeRenderUI","onPostRender","onInit","onRemove","onActivate","onDeactivate","onClick","onEvent","onMouseUp","onMouseDown","onDblClick","onKeyDown","onKeyUp","onKeyPress","onContextMenu","onSubmit","onReset","onPaste","onPreProcess","onPostProcess","onBeforeSetContent","onBeforeGetContent","onSetContent","onGetContent","onLoadContent","onSaveContent","onNodeChange","onChange","onBeforeExecCommand","onExecCommand","onUndo","onRedo","onVisualAid","onSetProgressState"],function(s){p[s]=new k(p)});p.settings=q=f({id:r,language:"en",docs_language:"en",theme:"simple",skin:"default",delta_width:0,delta_height:0,popup_css:"",plugins:"",document_base_url:m.documentBaseURL,add_form_submit_trigger:1,submit_patch:1,add_unload_trigger:1,convert_urls:1,relative_urls:1,remove_script_host:1,table_inline_editing:0,object_resizing:1,cleanup:1,accessibility_focus:1,custom_shortcuts:1,custom_undo_redo_keyboard_shortcuts:1,custom_undo_redo_restore_selection:1,custom_undo_redo:1,doctype:m.isIE6?'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">':"<!DOCTYPE>",visual_table_class:"mceItemTable",visual:1,font_size_style_values:"xx-small,x-small,small,medium,large,x-large,xx-large",apply_source_formatting:1,directionality:"ltr",forced_root_block:"p",valid_elements:"@[id|class|style|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],a[rel|rev|charset|hreflang|tabindex|accesskey|type|name|href|target|title|class|onfocus|onblur],strong/b,em/i,strike,u,#p,-ol[type|compact],-ul[type|compact],-li,br,img[longdesc|usemap|src|border|alt=|title|hspace|vspace|width|height|align],-sub,-sup,-blockquote[cite],-table[border|cellspacing|cellpadding|width|frame|rules|height|align|summary|bgcolor|background|bordercolor],-tr[rowspan|width|height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope],#th[colspan|rowspan|width|height|align|valign|scope],caption,-div,-span,-code,-pre,address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],-font[face|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite],object[classid|width|height|codebase|*],param[name|value],embed[type|width|height|src|*],script[src|type],map[name],area[shape|coords|href|alt|target],bdo,button,col[align|char|charoff|span|valign|width],colgroup[align|char|charoff|span|valign|width],dfn,fieldset,form[action|accept|accept-charset|enctype|method],input[accept|alt|checked|disabled|maxlength|name|readonly|size|src|type|value|tabindex|accesskey],kbd,label[for],legend,noscript,optgroup[label|disabled],option[disabled|label|selected|value],q[cite],samp,select[disabled|multiple|name|size],small,textarea[cols|rows|disabled|name|readonly],tt,var,big",hidden_input:1,padd_empty_editor:1,render_ui:1,init_theme:1,force_p_newlines:1,indentation:"30px",keep_styles:1,fix_table_elements:1,inline_styles:1,convert_fonts_to_spans:true},q);p.documentBaseURI=new m.util.URI(q.document_base_url||m.documentBaseURL,{base_uri:tinyMCE.baseURI});p.baseURI=m.baseURI;p.execCallback("setup",p)},render:function(r){var u=this,v=u.settings,x=u.id,p=m.ScriptLoader;if(!j.domLoaded){j.add(document,"init",function(){u.render()});return}tinyMCE.settings=v;if(!u.getElement()){return}if(m.isIDevice){return}if(!/TEXTAREA|INPUT/i.test(u.getElement().nodeName)&&v.hidden_input&&n.getParent(x,"form")){n.insertAfter(n.create("input",{type:"hidden",name:x}),x)}if(m.WindowManager){u.windowManager=new m.WindowManager(u)}if(v.encoding=="xml"){u.onGetContent.add(function(s,t){if(t.save){t.content=n.encode(t.content)}})}if(v.add_form_submit_trigger){u.onSubmit.addToTop(function(){if(u.initialized){u.save();u.isNotDirty=1}})}if(v.add_unload_trigger){u._beforeUnload=tinyMCE.onBeforeUnload.add(function(){if(u.initialized&&!u.destroyed&&!u.isHidden()){u.save({format:"raw",no_events:true})}})}m.addUnload(u.destroy,u);if(v.submit_patch){u.onBeforeRenderUI.add(function(){var s=u.getElement().form;if(!s){return}if(s._mceOldSubmit){return}if(!s.submit.nodeType&&!s.submit.length){u.formElement=s;s._mceOldSubmit=s.submit;s.submit=function(){m.triggerSave();u.isNotDirty=1;return u.formElement._mceOldSubmit(u.formElement)}}s=null})}function q(){if(v.language){p.add(m.baseURL+"/langs/"+v.language+".js")}if(v.theme&&v.theme.charAt(0)!="-"&&!h.urls[v.theme]){h.load(v.theme,"themes/"+v.theme+"/editor_template"+m.suffix+".js")}i(g(v.plugins),function(s){if(s&&s.charAt(0)!="-"&&!c.urls[s]){if(s=="safari"){return}c.load(s,"plugins/"+s+"/editor_plugin"+m.suffix+".js")}});p.loadQueue(function(){if(!u.removed){u.init()}})}q()},init:function(){var r,E=this,F=E.settings,B,y,A=E.getElement(),q,p,C,x,z,D;m.add(E);if(F.theme){F.theme=F.theme.replace(/-/,"");q=h.get(F.theme);E.theme=new q();if(E.theme.init&&F.init_theme){E.theme.init(E,h.urls[F.theme]||m.documentBaseURL.replace(/\/$/,""))}}i(g(F.plugins.replace(/\-/g,"")),function(G){var H=c.get(G),t=c.urls[G]||m.documentBaseURL.replace(/\/$/,""),s;if(H){s=new H(E,t);E.plugins[G]=s;if(s.init){s.init(E,t)}}});if(F.popup_css!==false){if(F.popup_css){F.popup_css=E.documentBaseURI.toAbsolute(F.popup_css)}else{F.popup_css=E.baseURI.toAbsolute("themes/"+F.theme+"/skins/"+F.skin+"/dialog.css")}}if(F.popup_css_add){F.popup_css+=","+E.documentBaseURI.toAbsolute(F.popup_css_add)}E.controlManager=new m.ControlManager(E);if(F.custom_undo_redo){E.onBeforeExecCommand.add(function(t,G,u,H,s){if(G!="Undo"&&G!="Redo"&&G!="mceRepaint"&&(!s||!s.skip_undo)){if(!E.undoManager.hasUndo()){E.undoManager.add()}}});E.onExecCommand.add(function(t,G,u,H,s){if(G!="Undo"&&G!="Redo"&&G!="mceRepaint"&&(!s||!s.skip_undo)){E.undoManager.add()}})}E.onExecCommand.add(function(s,t){if(!/^(FontName|FontSize)$/.test(t)){E.nodeChanged()}});if(a){function v(s,t){if(!t||!t.initial){E.execCommand("mceRepaint")}}E.onUndo.add(v);E.onRedo.add(v);E.onSetContent.add(v)}E.onBeforeRenderUI.dispatch(E,E.controlManager);if(F.render_ui){B=F.width||A.style.width||A.offsetWidth;y=F.height||A.style.height||A.offsetHeight;E.orgDisplay=A.style.display;D=/^[0-9\.]+(|px)$/i;if(D.test(""+B)){B=Math.max(parseInt(B)+(q.deltaWidth||0),100)}if(D.test(""+y)){y=Math.max(parseInt(y)+(q.deltaHeight||0),100)}q=E.theme.renderUI({targetNode:A,width:B,height:y,deltaWidth:F.delta_width,deltaHeight:F.delta_height});E.editorContainer=q.editorContainer}if(document.domain&&location.hostname!=document.domain){m.relaxedDomain=document.domain}n.setStyles(q.sizeContainer||q.editorContainer,{width:B,height:y});y=(q.iframeHeight||y)+(typeof(y)=="number"?(q.deltaHeight||0):"");if(y<100){y=100}E.iframeHTML=F.doctype+'<html><head xmlns="http://www.w3.org/1999/xhtml">';if(F.document_base_url!=m.documentBaseURL){E.iframeHTML+='<base href="'+E.documentBaseURI.getURI()+'" />'}E.iframeHTML+='<meta http-equiv="X-UA-Compatible" content="IE=7" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';if(m.relaxedDomain){E.iframeHTML+='<script type="text/javascript">document.domain = "'+m.relaxedDomain+'";<\/script>'}x=F.body_id||"tinymce";if(x.indexOf("=")!=-1){x=E.getParam("body_id","","hash");x=x[E.id]||x}z=F.body_class||"";if(z.indexOf("=")!=-1){z=E.getParam("body_class","","hash");z=z[E.id]||""}E.iframeHTML+='</head><body id="'+x+'" class="mceContentBody '+z+'"></body></html>';if(m.relaxedDomain){if(b||(m.isOpera&&parseFloat(opera.version())>=9.5)){C='javascript:(function(){document.open();document.domain="'+document.domain+'";var ed = window.parent.tinyMCE.get("'+E.id+'");document.write(ed.iframeHTML);document.close();ed.setupIframe();})()'}else{if(m.isOpera){C='javascript:(function(){document.open();document.domain="'+document.domain+'";document.close();ed.setupIframe();})()'}}}r=n.add(q.iframeContainer,"iframe",{id:E.id+"_ifr",src:C||'javascript:""',frameBorder:"0",style:{width:"100%",height:y}});E.contentAreaContainer=q.iframeContainer;n.get(q.editorContainer).style.display=E.orgDisplay;n.get(E.id).style.display="none";if(!b||!m.relaxedDomain){E.setupIframe()}A=r=q=null},setupIframe:function(){var z=this,A=z.settings,r=n.get(z.id),u=z.getDoc(),q,x;if(!b||!m.relaxedDomain){u.open();u.write(z.iframeHTML);u.close()}if(!b){try{if(!A.readonly){u.designMode="On"}}catch(v){}}if(b){x=z.getBody();n.hide(x);if(!A.readonly){x.contentEditable=true}n.show(x)}z.dom=new m.dom.DOMUtils(z.getDoc(),{keep_values:true,url_converter:z.convertURL,url_converter_scope:z,hex_colors:A.force_hex_style_colors,class_filter:A.class_filter,update_styles:1,fix_ie_paragraphs:1,valid_styles:A.valid_styles});z.schema=new m.dom.Schema();z.serializer=new m.dom.Serializer(f(A,{valid_elements:A.verify_html===false?"*[*]":A.valid_elements,dom:z.dom,schema:z.schema}));z.selection=new m.dom.Selection(z.dom,z.getWin(),z.serializer);z.formatter=new m.Formatter(this);z.formatter.register({alignleft:[{selector:"p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",styles:{textAlign:"left"}},{selector:"img,table",styles:{"float":"left"}}],aligncenter:[{selector:"p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",styles:{textAlign:"center"}},{selector:"img",styles:{display:"block",marginLeft:"auto",marginRight:"auto"}},{selector:"table",styles:{marginLeft:"auto",marginRight:"auto"}}],alignright:[{selector:"p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",styles:{textAlign:"right"}},{selector:"img,table",styles:{"float":"right"}}],alignfull:[{selector:"p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",styles:{textAlign:"justify"}}],bold:[{inline:"strong"},{inline:"span",styles:{fontWeight:"bold"}},{inline:"b"}],italic:[{inline:"em"},{inline:"span",styles:{fontStyle:"italic"}},{inline:"i"}],underline:[{inline:"span",styles:{textDecoration:"underline"},exact:true},{inline:"u"}],strikethrough:[{inline:"span",styles:{textDecoration:"line-through"},exact:true},{inline:"u"}],forecolor:{inline:"span",styles:{color:"%value"}},hilitecolor:{inline:"span",styles:{backgroundColor:"%value"}},fontname:{inline:"span",styles:{fontFamily:"%value"}},fontsize:{inline:"span",styles:{fontSize:"%value"}},fontsize_class:{inline:"span",attributes:{"class":"%value"}},blockquote:{block:"blockquote",wrapper:1,remove:"all"},removeformat:[{selector:"b,strong,em,i,font,u,strike",remove:"all",split:true,expand:false,block_expand:true,deep:true},{selector:"span",attributes:["style","class"],remove:"empty",split:true,expand:false,deep:true},{selector:"*",attributes:["style","class"],split:false,expand:false,deep:true}]});i("p h1 h2 h3 h4 h5 h6 div address pre div code dt dd samp".split(/\s/),function(s){z.formatter.register(s,{block:s,remove:"all"})});z.formatter.register(z.settings.formats);z.undoManager=new m.UndoManager(z);z.undoManager.onAdd.add(function(t,s){if(!s.initial){return z.onChange.dispatch(z,s,t)}});z.undoManager.onUndo.add(function(t,s){return z.onUndo.dispatch(z,s,t)});z.undoManager.onRedo.add(function(t,s){return z.onRedo.dispatch(z,s,t)});z.forceBlocks=new m.ForceBlocks(z,{forced_root_block:A.forced_root_block});z.editorCommands=new m.EditorCommands(z);z.serializer.onPreProcess.add(function(s,t){return z.onPreProcess.dispatch(z,t,s)});z.serializer.onPostProcess.add(function(s,t){return z.onPostProcess.dispatch(z,t,s)});z.onPreInit.dispatch(z);if(!A.gecko_spellcheck){z.getBody().spellcheck=0}if(!A.readonly){z._addEvents()}z.controlManager.onPostRender.dispatch(z,z.controlManager);z.onPostRender.dispatch(z);if(A.directionality){z.getBody().dir=A.directionality}if(A.nowrap){z.getBody().style.whiteSpace="nowrap"}if(A.custom_elements){function y(s,t){i(g(A.custom_elements),function(B){var C;if(B.indexOf("~")===0){B=B.substring(1);C="span"}else{C="div"}t.content=t.content.replace(new RegExp("<("+B+")([^>]*)>","g"),"<"+C+' _mce_name="$1"$2>');t.content=t.content.replace(new RegExp("</("+B+")>","g"),"</"+C+">")})}z.onBeforeSetContent.add(y);z.onPostProcess.add(function(s,t){if(t.set){y(s,t)}})}if(A.handle_node_change_callback){z.onNodeChange.add(function(t,s,B){z.execCallback("handle_node_change_callback",z.id,B,-1,-1,true,z.selection.isCollapsed())})}if(A.save_callback){z.onSaveContent.add(function(s,B){var t=z.execCallback("save_callback",z.id,B.content,z.getBody());if(t){B.content=t}})}if(A.onchange_callback){z.onChange.add(function(t,s){z.execCallback("onchange_callback",z,s)})}if(A.convert_newlines_to_brs){z.onBeforeSetContent.add(function(s,t){if(t.initial){t.content=t.content.replace(/\r?\n/g,"<br />")}})}if(A.fix_nesting&&b){z.onBeforeSetContent.add(function(s,t){t.content=z._fixNesting(t.content)})}if(A.preformatted){z.onPostProcess.add(function(s,t){t.content=t.content.replace(/^\s*<pre.*?>/,"");t.content=t.content.replace(/<\/pre>\s*$/,"");if(t.set){t.content='<pre class="mceItemHidden">'+t.content+"</pre>"}})}if(A.verify_css_classes){z.serializer.attribValueFilter=function(D,B){var C,t;if(D=="class"){if(!z.classesRE){t=z.dom.getClasses();if(t.length>0){C="";i(t,function(s){C+=(C?"|":"")+s["class"]});z.classesRE=new RegExp("("+C+")","gi")}}return !z.classesRE||/(\bmceItem\w+\b|\bmceTemp\w+\b)/g.test(B)||z.classesRE.test(B)?B:""}return B}}if(A.cleanup_callback){z.onBeforeSetContent.add(function(s,t){t.content=z.execCallback("cleanup_callback","insert_to_editor",t.content,t)});z.onPreProcess.add(function(s,t){if(t.set){z.execCallback("cleanup_callback","insert_to_editor_dom",t.node,t)}if(t.get){z.execCallback("cleanup_callback","get_from_editor_dom",t.node,t)}});z.onPostProcess.add(function(s,t){if(t.set){t.content=z.execCallback("cleanup_callback","insert_to_editor",t.content,t)}if(t.get){t.content=z.execCallback("cleanup_callback","get_from_editor",t.content,t)}})}if(A.save_callback){z.onGetContent.add(function(s,t){if(t.save){t.content=z.execCallback("save_callback",z.id,t.content,z.getBody())}})}if(A.handle_event_callback){z.onEvent.add(function(s,t,B){if(z.execCallback("handle_event_callback",t,s,B)===false){j.cancel(t)}})}z.onSetContent.add(function(){z.addVisual(z.getBody())});if(A.padd_empty_editor){z.onPostProcess.add(function(s,t){t.content=t.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/,"")})}if(a){function p(s,t){i(s.dom.select("a"),function(C){var B=C.parentNode;if(s.dom.isBlock(B)&&B.lastChild===C){s.dom.add(B,"br",{_mce_bogus:1})}})}z.onExecCommand.add(function(s,t){if(t==="CreateLink"){p(s)}});z.onSetContent.add(z.selection.onSetContent.add(p));if(!A.readonly){try{u.designMode="Off";u.designMode="On"}catch(v){}}}setTimeout(function(){if(z.removed){return}z.load({initial:true,format:(A.cleanup_on_startup?"html":"raw")});z.startContent=z.getContent({format:"raw"});z.initialized=true;z.onInit.dispatch(z);z.execCallback("setupcontent_callback",z.id,z.getBody(),z.getDoc());z.execCallback("init_instance_callback",z);z.focus(true);z.nodeChanged({initial:1});if(A.content_css){m.each(g(A.content_css),function(s){z.dom.loadCSS(z.documentBaseURI.toAbsolute(s))})}if(A.auto_focus){setTimeout(function(){var s=m.get(A.auto_focus);s.selection.select(s.getBody(),1);s.selection.collapse(1);s.getWin().focus()},100)}},1);r=null},focus:function(s){var x,q=this,v=q.settings.content_editable,r,p,u=q.getDoc();if(!s){r=q.selection.getRng();if(r.item){p=r.item(0)}if(!v){q.getWin().focus()}if(p&&p.ownerDocument==u){r=u.body.createControlRange();r.addElement(p);r.select()}}if(m.activeEditor!=q){if((x=m.activeEditor)!=null){x.onDeactivate.dispatch(x,q)}q.onActivate.dispatch(q,x)}m._setActive(q)},execCallback:function(u){var p=this,r=p.settings[u],q;if(!r){return}if(p.callbackLookup&&(q=p.callbackLookup[u])){r=q.func;q=q.scope}if(d(r,"string")){q=r.replace(/\.\w+$/,"");q=q?m.resolve(q):0;r=m.resolve(r);p.callbackLookup=p.callbackLookup||{};p.callbackLookup[u]={func:r,scope:q}}return r.apply(q||p,Array.prototype.slice.call(arguments,1))},translate:function(p){var r=this.settings.language||"en",q=m.i18n;if(!p){return""}return q[r+"."+p]||p.replace(/{\#([^}]+)\}/g,function(t,s){return q[r+"."+s]||"{#"+s+"}"})},getLang:function(q,p){return m.i18n[(this.settings.language||"en")+"."+q]||(d(p)?p:"{#"+q+"}")},getParam:function(u,r,p){var s=m.trim,q=d(this.settings[u])?this.settings[u]:r,t;if(p==="hash"){t={};if(d(q,"string")){i(q.indexOf("=")>0?q.split(/[;,](?![^=;,]*(?:[;,]|$))/):q.split(","),function(x){x=x.split("=");if(x.length>1){t[s(x[0])]=s(x[1])}else{t[s(x[0])]=s(x)}})}else{t=q}return t}return q},nodeChanged:function(r){var p=this,q=p.selection,u=(b?q.getNode():q.getStart())||p.getBody();if(p.initialized){r=r||{};u=b&&u.ownerDocument!=p.getDoc()?p.getBody():u;r.parents=[];p.dom.getParent(u,function(s){if(s.nodeName=="BODY"){return true}r.parents.push(s)});p.onNodeChange.dispatch(p,r?r.controlManager||p.controlManager:p.controlManager,u,q.isCollapsed(),r)}},addButton:function(r,q){var p=this;p.buttons=p.buttons||{};p.buttons[r]=q},addCommand:function(r,q,p){this.execCommands[r]={func:q,scope:p||this}},addQueryStateHandler:function(r,q,p){this.queryStateCommands[r]={func:q,scope:p||this}},addQueryValueHandler:function(r,q,p){this.queryValueCommands[r]={func:q,scope:p||this}},addShortcut:function(r,u,p,s){var q=this,v;if(!q.settings.custom_shortcuts){return false}q.shortcuts=q.shortcuts||{};if(d(p,"string")){v=p;p=function(){q.execCommand(v,false,null)}}if(d(p,"object")){v=p;p=function(){q.execCommand(v[0],v[1],v[2])}}i(g(r),function(t){var x={func:p,scope:s||this,desc:u,alt:false,ctrl:false,shift:false};i(g(t,"+"),function(y){switch(y){case"alt":case"ctrl":case"shift":x[y]=true;break;default:x.charCode=y.charCodeAt(0);x.keyCode=y.toUpperCase().charCodeAt(0)}});q.shortcuts[(x.ctrl?"ctrl":"")+","+(x.alt?"alt":"")+","+(x.shift?"shift":"")+","+x.keyCode]=x});return true},execCommand:function(x,v,z,p){var r=this,u=0,y,q;if(!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint|SelectAll)$/.test(x)&&(!p||!p.skip_focus)){r.focus()}y={};r.onBeforeExecCommand.dispatch(r,x,v,z,y);if(y.terminate){return false}if(r.execCallback("execcommand_callback",r.id,r.selection.getNode(),x,v,z)){r.onExecCommand.dispatch(r,x,v,z,p);return true}if(y=r.execCommands[x]){q=y.func.call(y.scope,v,z);if(q!==true){r.onExecCommand.dispatch(r,x,v,z,p);return q}}i(r.plugins,function(s){if(s.execCommand&&s.execCommand(x,v,z)){r.onExecCommand.dispatch(r,x,v,z,p);u=1;return false}});if(u){return true}if(r.theme&&r.theme.execCommand&&r.theme.execCommand(x,v,z)){r.onExecCommand.dispatch(r,x,v,z,p);return true}if(m.GlobalCommands.execCommand(r,x,v,z)){r.onExecCommand.dispatch(r,x,v,z,p);return true}if(r.editorCommands.execCommand(x,v,z)){r.onExecCommand.dispatch(r,x,v,z,p);return true}r.getDoc().execCommand(x,v,z);r.onExecCommand.dispatch(r,x,v,z,p)},queryCommandState:function(u){var q=this,v,r;if(q._isHidden()){return}if(v=q.queryStateCommands[u]){r=v.func.call(v.scope);if(r!==true){return r}}v=q.editorCommands.queryCommandState(u);if(v!==-1){return v}try{return this.getDoc().queryCommandState(u)}catch(p){}},queryCommandValue:function(v){var q=this,u,r;if(q._isHidden()){return}if(u=q.queryValueCommands[v]){r=u.func.call(u.scope);if(r!==true){return r}}u=q.editorCommands.queryCommandValue(v);if(d(u)){return u}try{return this.getDoc().queryCommandValue(v)}catch(p){}},show:function(){var p=this;n.show(p.getContainer());n.hide(p.id);p.load()},hide:function(){var p=this,q=p.getDoc();if(b&&q){q.execCommand("SelectAll")}p.save();n.hide(p.getContainer());n.setStyle(p.id,"display",p.orgDisplay)},isHidden:function(){return !n.isHidden(this.id)},setProgressState:function(p,q,r){this.onSetProgressState.dispatch(this,p,q,r);return p},load:function(s){var p=this,r=p.getElement(),q;if(r){s=s||{};s.load=true;q=p.setContent(d(r.value)?r.value:r.innerHTML,s);s.element=r;if(!s.no_events){p.onLoadContent.dispatch(p,s)}s.element=r=null;return q}},save:function(u){var p=this,s=p.getElement(),q,r;if(!s||!p.initialized){return}u=u||{};u.save=true;if(!u.no_events){p.undoManager.typing=0;p.undoManager.add()}u.element=s;q=u.content=p.getContent(u);if(!u.no_events){p.onSaveContent.dispatch(p,u)}q=u.content;if(!/TEXTAREA|INPUT/i.test(s.nodeName)){s.innerHTML=q;if(r=n.getParent(p.id,"form")){i(r.elements,function(t){if(t.name==p.id){t.value=q;return false}})}}else{s.value=q}u.element=s=null;return q},setContent:function(q,r){var p=this;r=r||{};r.format=r.format||"html";r.set=true;r.content=q;if(!r.no_events){p.onBeforeSetContent.dispatch(p,r)}if(!m.isIE&&(q.length===0||/^\s+$/.test(q))){r.content=p.dom.setHTML(p.getBody(),'<br _mce_bogus="1" />');r.format="raw"}r.content=p.dom.setHTML(p.getBody(),m.trim(r.content));if(r.format!="raw"&&p.settings.cleanup){r.getInner=true;r.content=p.dom.setHTML(p.getBody(),p.serializer.serialize(p.getBody(),r))}if(!r.no_events){p.onSetContent.dispatch(p,r)}return r.content},getContent:function(r){var p=this,q;r=r||{};r.format=r.format||"html";r.get=true;if(!r.no_events){p.onBeforeGetContent.dispatch(p,r)}if(r.format!="raw"&&p.settings.cleanup){r.getInner=true;q=p.serializer.serialize(p.getBody(),r)}else{q=p.getBody().innerHTML}q=q.replace(/^\s*|\s*$/g,"");r.content=q;if(!r.no_events){p.onGetContent.dispatch(p,r)}return r.content},isDirty:function(){var p=this;return m.trim(p.startContent)!=m.trim(p.getContent({format:"raw",no_events:1}))&&!p.isNotDirty},getContainer:function(){var p=this;if(!p.container){p.container=n.get(p.editorContainer||p.id+"_parent")}return p.container},getContentAreaContainer:function(){return this.contentAreaContainer},getElement:function(){return n.get(this.settings.content_element||this.id)},getWin:function(){var p=this,q;if(!p.contentWindow){q=n.get(p.id+"_ifr");if(q){p.contentWindow=q.contentWindow}}return p.contentWindow},getDoc:function(){var q=this,p;if(!q.contentDocument){p=q.getWin();if(p){q.contentDocument=p.document}}return q.contentDocument},getBody:function(){return this.bodyElement||this.getDoc().body},convertURL:function(p,x,v){var q=this,r=q.settings;if(r.urlconverter_callback){return q.execCallback("urlconverter_callback",p,v,true,x)}if(!r.convert_urls||(v&&v.nodeName=="LINK")||p.indexOf("file:")===0){return p}if(r.relative_urls){return q.documentBaseURI.toRelative(p)}p=q.documentBaseURI.toAbsolute(p,r.remove_script_host);return p},addVisual:function(r){var p=this,q=p.settings;r=r||p.getBody();if(!d(p.hasVisual)){p.hasVisual=q.visual}i(p.dom.select("table,a",r),function(t){var s;switch(t.nodeName){case"TABLE":s=p.dom.getAttrib(t,"border");if(!s||s=="0"){if(p.hasVisual){p.dom.addClass(t,q.visual_table_class)}else{p.dom.removeClass(t,q.visual_table_class)}}return;case"A":s=p.dom.getAttrib(t,"name");if(s){if(p.hasVisual){p.dom.addClass(t,"mceItemAnchor")}else{p.dom.removeClass(t,"mceItemAnchor")}}return}});p.onVisualAid.dispatch(p,r,p.hasVisual)},remove:function(){var p=this,q=p.getContainer();p.removed=1;p.hide();p.execCallback("remove_instance_callback",p);p.onRemove.dispatch(p);p.onExecCommand.listeners=[];m.remove(p);n.remove(q)},destroy:function(q){var p=this;if(p.destroyed){return}if(!q){m.removeUnload(p.destroy);tinyMCE.onBeforeUnload.remove(p._beforeUnload);if(p.theme&&p.theme.destroy){p.theme.destroy()}p.controlManager.destroy();p.selection.destroy();p.dom.destroy();if(!p.settings.content_editable){j.clear(p.getWin());j.clear(p.getDoc())}j.clear(p.getBody());j.clear(p.formElement)}if(p.formElement){p.formElement.submit=p.formElement._mceOldSubmit;p.formElement._mceOldSubmit=null}p.contentAreaContainer=p.formElement=p.container=p.settings.content_element=p.bodyElement=p.contentDocument=p.contentWindow=null;if(p.selection){p.selection=p.selection.win=p.selection.dom=p.selection.dom.doc=null}p.destroyed=1},_addEvents:function(){var v=this,u,y=v.settings,x={mouseup:"onMouseUp",mousedown:"onMouseDown",click:"onClick",keyup:"onKeyUp",keydown:"onKeyDown",keypress:"onKeyPress",submit:"onSubmit",reset:"onReset",contextmenu:"onContextMenu",dblclick:"onDblClick",paste:"onPaste"};function r(t,A){var s=t.type;if(v.removed){return}if(v.onEvent.dispatch(v,t,A)!==false){v[x[t.fakeType||t.type]].dispatch(v,t,A)}}i(x,function(t,s){switch(s){case"contextmenu":if(m.isOpera){v.dom.bind(v.getBody(),"mousedown",function(A){if(A.ctrlKey){A.fakeType="contextmenu";r(A)}})}else{v.dom.bind(v.getBody(),s,r)}break;case"paste":v.dom.bind(v.getBody(),s,function(A){r(A)});break;case"submit":case"reset":v.dom.bind(v.getElement().form||n.getParent(v.id,"form"),s,r);break;default:v.dom.bind(y.content_editable?v.getBody():v.getDoc(),s,r)}});v.dom.bind(y.content_editable?v.getBody():(a?v.getDoc():v.getWin()),"focus",function(s){v.focus(true)});if(m.isGecko){v.dom.bind(v.getDoc(),"DOMNodeInserted",function(t){var s;t=t.target;if(t.nodeType===1&&t.nodeName==="IMG"&&(s=t.getAttribute("_mce_src"))){t.src=v.documentBaseURI.toAbsolute(s)}})}if(a){function p(){var B=this,D=B.getDoc(),C=B.settings;if(a&&!C.readonly){if(B._isHidden()){try{if(!C.content_editable){D.designMode="On"}}catch(A){}}try{D.execCommand("styleWithCSS",0,false)}catch(A){if(!B._isHidden()){try{D.execCommand("useCSS",0,true)}catch(A){}}}if(!C.table_inline_editing){try{D.execCommand("enableInlineTableEditing",false,false)}catch(A){}}if(!C.object_resizing){try{D.execCommand("enableObjectResizing",false,false)}catch(A){}}}}v.onBeforeExecCommand.add(p);v.onMouseDown.add(p)}if(m.isWebKit){v.onClick.add(function(s,t){t=t.target;if(t.nodeName=="IMG"||(t.nodeName=="A"&&v.dom.hasClass(t,"mceItemAnchor"))){v.selection.getSel().setBaseAndExtent(t,0,t,1)}})}v.onMouseUp.add(v.nodeChanged);v.onKeyUp.add(function(s,t){var A=t.keyCode;if((A>=33&&A<=36)||(A>=37&&A<=40)||A==13||A==45||A==46||A==8||(m.isMac&&(A==91||A==93))||t.ctrlKey){v.nodeChanged()}});v.onReset.add(function(){v.setContent(v.startContent,{format:"raw"})});if(y.custom_shortcuts){if(y.custom_undo_redo_keyboard_shortcuts){v.addShortcut("ctrl+z",v.getLang("undo_desc"),"Undo");v.addShortcut("ctrl+y",v.getLang("redo_desc"),"Redo")}v.addShortcut("ctrl+b",v.getLang("bold_desc"),"Bold");v.addShortcut("ctrl+i",v.getLang("italic_desc"),"Italic");v.addShortcut("ctrl+u",v.getLang("underline_desc"),"Underline");for(u=1;u<=6;u++){v.addShortcut("ctrl+"+u,"",["FormatBlock",false,"h"+u])}v.addShortcut("ctrl+7","",["FormatBlock",false,"<p>"]);v.addShortcut("ctrl+8","",["FormatBlock",false,"<div>"]);v.addShortcut("ctrl+9","",["FormatBlock",false,"<address>"]);function z(t){var s=null;if(!t.altKey&&!t.ctrlKey&&!t.metaKey){return s}i(v.shortcuts,function(A){if(m.isMac&&A.ctrl!=t.metaKey){return}else{if(!m.isMac&&A.ctrl!=t.ctrlKey){return}}if(A.alt!=t.altKey){return}if(A.shift!=t.shiftKey){return}if(t.keyCode==A.keyCode||(t.charCode&&t.charCode==A.charCode)){s=A;return false}});return s}v.onKeyUp.add(function(s,t){var A=z(t);if(A){return j.cancel(t)}});v.onKeyPress.add(function(s,t){var A=z(t);if(A){return j.cancel(t)}});v.onKeyDown.add(function(s,t){var A=z(t);if(A){A.func.call(A.scope);return j.cancel(t)}})}if(m.isIE){v.dom.bind(v.getDoc(),"controlselect",function(A){var t=v.resizeInfo,s;A=A.target;if(A.nodeName!=="IMG"){return}if(t){v.dom.unbind(t.node,t.ev,t.cb)}if(!v.dom.hasClass(A,"mceItemNoResize")){ev="resizeend";s=v.dom.bind(A,ev,function(C){var B;C=C.target;if(B=v.dom.getStyle(C,"width")){v.dom.setAttrib(C,"width",B.replace(/[^0-9%]+/g,""));v.dom.setStyle(C,"width","")}if(B=v.dom.getStyle(C,"height")){v.dom.setAttrib(C,"height",B.replace(/[^0-9%]+/g,""));v.dom.setStyle(C,"height","")}})}else{ev="resizestart";s=v.dom.bind(A,"resizestart",j.cancel,j)}t=v.resizeInfo={node:A,ev:ev,cb:s}});v.onKeyDown.add(function(s,t){switch(t.keyCode){case 8:if(v.selection.getRng().item){s.dom.remove(v.selection.getRng().item(0));return j.cancel(t)}}})}if(m.isOpera){v.onClick.add(function(s,t){j.prevent(t)})}if(y.custom_undo_redo){function q(){v.undoManager.typing=0;v.undoManager.add()}v.dom.bind(v.getDoc(),"focusout",function(s){if(!v.removed&&v.undoManager.typing){q()}});v.onKeyUp.add(function(s,t){if((t.keyCode>=33&&t.keyCode<=36)||(t.keyCode>=37&&t.keyCode<=40)||t.keyCode==13||t.keyCode==45||t.ctrlKey){q()}});v.onKeyDown.add(function(t,D){var s,C,B;if(b&&D.keyCode==46){s=v.selection.getRng();if(s.parentElement){C=s.parentElement();if(D.ctrlKey){s.moveEnd("word",1);s.select()}v.selection.getSel().clear();if(s.parentElement()==C){B=v.selection.getBookmark();try{C.innerHTML=C.innerHTML}catch(A){}v.selection.moveToBookmark(B)}D.preventDefault();return}}if((D.keyCode>=33&&D.keyCode<=36)||(D.keyCode>=37&&D.keyCode<=40)||D.keyCode==13||D.keyCode==45){if(v.undoManager.typing){q()}return}if(!v.undoManager.typing){v.undoManager.add();v.undoManager.typing=1}});v.onMouseDown.add(function(){if(v.undoManager.typing){q()}})}},_isHidden:function(){var p;if(!a){return 0}p=this.selection.getSel();return(!p||!p.rangeCount||p.rangeCount==0)},_fixNesting:function(q){var r=[],p;q=q.replace(/<(\/)?([^\s>]+)[^>]*?>/g,function(t,s,v){var u;if(s==="/"){if(!r.length){return""}if(v!==r[r.length-1].tag){for(p=r.length-1;p>=0;p--){if(r[p].tag===v){r[p].close=1;break}}return""}else{r.pop();if(r.length&&r[r.length-1].close){t=t+"</"+r[r.length-1].tag+">";r.pop()}}}else{if(/^(br|hr|input|meta|img|link|param)$/i.test(v)){return t}if(/\/>$/.test(t)){return t}r.push({tag:v})}return t});for(p=r.length-1;p>=0;p--){q+="</"+r[p].tag+">"}return q}})})(tinymce);(function(c){var d=c.each,e,a=true,b=false;c.EditorCommands=function(n){var l=n.dom,p=n.selection,j={state:{},exec:{},value:{}},k=n.settings,o;function q(y,x,v){var u;y=y.toLowerCase();if(u=j.exec[y]){u(y,x,v);return a}return b}function m(v){var u;v=v.toLowerCase();if(u=j.state[v]){return u(v)}return -1}function h(v){var u;v=v.toLowerCase();if(u=j.value[v]){return u(v)}return b}function t(u,v){v=v||"exec";d(u,function(y,x){d(x.toLowerCase().split(","),function(z){j[v][z]=y})})}c.extend(this,{execCommand:q,queryCommandState:m,queryCommandValue:h,addCommands:t});function f(x,v,u){if(v===e){v=b}if(u===e){u=null}return n.getDoc().execCommand(x,v,u)}function s(u){return n.formatter.match(u)}function r(u,v){n.formatter.toggle(u,v?{value:v}:e)}function i(u){o=p.getBookmark(u)}function g(){p.moveToBookmark(o)}t({"mceResetDesignMode,mceBeginUndoLevel":function(){},"mceEndUndoLevel,mceAddUndoLevel":function(){n.undoManager.add()},"Cut,Copy,Paste":function(y){var x=n.getDoc(),u;try{f(y)}catch(v){u=a}if(u||!x.queryCommandSupported(y)){if(c.isGecko){n.windowManager.confirm(n.getLang("clipboard_msg"),function(z){if(z){open("http://www.mozilla.org/editor/midasdemo/securityprefs.html","_blank")}})}else{n.windowManager.alert(n.getLang("clipboard_no_support"))}}},unlink:function(u){if(p.isCollapsed()){p.select(p.getNode())}f(u);p.collapse(b)},"JustifyLeft,JustifyCenter,JustifyRight,JustifyFull":function(u){var v=u.substring(7);d("left,center,right,full".split(","),function(x){if(v!=x){n.formatter.remove("align"+x)}});r("align"+v)},"InsertUnorderedList,InsertOrderedList":function(x){var u,v;f(x);u=l.getParent(p.getNode(),"ol,ul");if(u){v=u.parentNode;if(/^(H[1-6]|P|ADDRESS|PRE)$/.test(v.nodeName)){i();l.split(v,u);g()}}},"Bold,Italic,Underline,Strikethrough":function(u){r(u)},"ForeColor,HiliteColor,FontName":function(x,v,u){r(x,u)},FontSize:function(y,x,v){var u,z;if(v>=1&&v<=7){z=c.explode(k.font_size_style_values);u=c.explode(k.font_size_classes);if(u){v=u[v-1]||v}else{v=z[v-1]||v}}r(y,v)},RemoveFormat:function(u){n.formatter.remove(u)},mceBlockQuote:function(u){r("blockquote")},FormatBlock:function(x,v,u){return r(u||"p")},mceCleanup:function(){var u=p.getBookmark();n.setContent(n.getContent({cleanup:a}),{cleanup:a});p.moveToBookmark(u)},mceRemoveNode:function(y,x,v){var u=v||p.getNode();if(u!=n.getBody()){i();n.dom.remove(u,a);g()}},mceSelectNodeDepth:function(y,x,v){var u=0;l.getParent(p.getNode(),function(z){if(z.nodeType==1&&u++==v){p.select(z);return b}},n.getBody())},mceSelectNode:function(x,v,u){p.select(u)},mceInsertContent:function(x,v,u){p.setContent(u)},mceInsertRawHTML:function(x,v,u){p.setContent("tiny_mce_marker");n.setContent(n.getContent().replace(/tiny_mce_marker/g,u))},mceSetContent:function(x,v,u){n.setContent(u)},"Indent,Outdent":function(y){var v,u,x;v=k.indentation;u=/[a-z%]+$/i.exec(v);v=parseInt(v);if(!m("InsertUnorderedList")&&!m("InsertOrderedList")){d(p.getSelectedBlocks(),function(z){if(y=="outdent"){x=Math.max(0,parseInt(z.style.paddingLeft||0)-v);l.setStyle(z,"paddingLeft",x?x+u:"")}else{l.setStyle(z,"paddingLeft",(parseInt(z.style.paddingLeft||0)+v)+u)}})}else{f(y)}},mceRepaint:function(){var v;if(c.isGecko){try{i(a);if(p.getSel()){p.getSel().selectAllChildren(n.getBody())}p.collapse(a);g()}catch(u){}}},mceToggleFormat:function(x,v,u){n.formatter.toggle(u)},InsertHorizontalRule:function(){p.setContent("<hr />")},mceToggleVisualAid:function(){n.hasVisual=!n.hasVisual;n.addVisual()},mceReplaceContent:function(x,v,u){p.setContent(u.replace(/\{\$selection\}/g,p.getContent({format:"text"})))},mceInsertLink:function(y,x,v){var u=l.getParent(p.getNode(),"a");if(c.is(v,"string")){v={href:v}}if(!u){f("CreateLink",b,"javascript:mctmp(0);");d(l.select("a[href=javascript:mctmp(0);]"),function(z){l.setAttribs(z,v)})}else{if(v.href){l.setAttribs(u,v)}else{n.dom.remove(u,a)}}},selectAll:function(){var v=l.getRoot(),u=l.createRng();u.setStart(v,0);u.setEnd(v,v.childNodes.length);n.selection.setRng(u)}});t({"JustifyLeft,JustifyCenter,JustifyRight,JustifyFull":function(u){return s("align"+u.substring(7))},"Bold,Italic,Underline,Strikethrough":function(u){return s(u)},mceBlockQuote:function(){return s("blockquote")},Outdent:function(){var u;if(k.inline_styles){if((u=l.getParent(p.getStart(),l.isBlock))&&parseInt(u.style.paddingLeft)>0){return a}if((u=l.getParent(p.getEnd(),l.isBlock))&&parseInt(u.style.paddingLeft)>0){return a}}return m("InsertUnorderedList")||m("InsertOrderedList")||(!k.inline_styles&&!!l.getParent(p.getNode(),"BLOCKQUOTE"))},"InsertUnorderedList,InsertOrderedList":function(u){return l.getParent(p.getNode(),u=="insertunorderedlist"?"UL":"OL")}},"state");t({"FontSize,FontName":function(x){var v=0,u;if(u=l.getParent(p.getNode(),"span")){if(x=="fontsize"){v=u.style.fontSize}else{v=u.style.fontFamily.replace(/, /g,",").replace(/[\'\"]/g,"").toLowerCase()}}return v}},"value");if(k.custom_undo_redo){t({Undo:function(){n.undoManager.undo()},Redo:function(){n.undoManager.redo()}})}}})(tinymce);(function(b){var a=b.util.Dispatcher;b.UndoManager=function(e){var c,d=0,g=[];function f(){return b.trim(e.getContent({format:"raw",no_events:1}))}return c={typing:0,onAdd:new a(c),onUndo:new a(c),onRedo:new a(c),add:function(l){var h,j=e.settings,k;l=l||{};l.content=f();k=g[d];if(k&&k.content==l.content){if(d>0||g.length==1){return null}}if(j.custom_undo_redo_levels){if(g.length>j.custom_undo_redo_levels){for(h=0;h<g.length-1;h++){g[h]=g[h+1]}g.length--;d=g.length}}l.bookmark=e.selection.getBookmark(2,true);if(d<g.length-1){if(d==0){g=[]}else{g.length=d+1}}g.push(l);d=g.length-1;c.onAdd.dispatch(c,l);e.isNotDirty=0;return l},undo:function(){var j,h;if(c.typing){c.add();c.typing=0}if(d>0){j=g[--d];e.setContent(j.content,{format:"raw"});e.selection.moveToBookmark(j.bookmark);c.onUndo.dispatch(c,j)}return j},redo:function(){var h;if(d<g.length-1){h=g[++d];e.setContent(h.content,{format:"raw"});e.selection.moveToBookmark(h.bookmark);c.onRedo.dispatch(c,h)}return h},clear:function(){g=[];d=c.typing=0},hasUndo:function(){return d>0||c.typing},hasRedo:function(){return d<g.length-1}}}})(tinymce);(function(m){var k=m.dom.Event,c=m.isIE,a=m.isGecko,b=m.isOpera,j=m.each,i=m.extend,d=true,h=false;function l(p){var q,o,n;do{if(/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(p.nodeName)){if(q){o=p.cloneNode(false);o.appendChild(q);q=o}else{q=n=p.cloneNode(false)}q.removeAttribute("id")}}while(p=p.parentNode);if(q){return{wrapper:q,inner:n}}}function g(o,p){var n=p.ownerDocument.createRange();n.setStart(o.endContainer,o.endOffset);n.setEndAfter(p);return n.cloneContents().textContent.length==0}function f(o){o=o.innerHTML;o=o.replace(/<(img|hr|table|input|select|textarea)[ \>]/gi,"-");o=o.replace(/<[^>]+>/g,"");return o.replace(/[ \u00a0\t\r\n]+/g,"")==""}function e(p,r,n){var o,q;if(f(n)){o=r.getParent(n,"ul,ol");if(!r.getParent(o.parentNode,"ul,ol")){r.split(o,n);q=r.create("p",0,'<br _mce_bogus="1" />');r.replace(q,n);p.select(q,1)}return h}return d}m.create("tinymce.ForceBlocks",{ForceBlocks:function(o){var p=this,q=o.settings,r;p.editor=o;p.dom=o.dom;r=(q.forced_root_block||"p").toLowerCase();q.element=r.toUpperCase();o.onPreInit.add(p.setup,p);p.reOpera=new RegExp("(\\u00a0|&#160;|&nbsp;)</"+r+">","gi");p.rePadd=new RegExp("<p( )([^>]+)><\\/p>|<p( )([^>]+)\\/>|<p( )([^>]+)>\\s+<\\/p>|<p><\\/p>|<p\\/>|<p>\\s+<\\/p>".replace(/p/g,r),"gi");p.reNbsp2BR1=new RegExp("<p( )([^>]+)>[\\s\\u00a0]+<\\/p>|<p>[\\s\\u00a0]+<\\/p>".replace(/p/g,r),"gi");p.reNbsp2BR2=new RegExp("<%p()([^>]+)>(&nbsp;|&#160;)<\\/%p>|<%p>(&nbsp;|&#160;)<\\/%p>".replace(/%p/g,r),"gi");p.reBR2Nbsp=new RegExp("<p( )([^>]+)>\\s*<br \\/>\\s*<\\/p>|<p>\\s*<br \\/>\\s*<\\/p>".replace(/p/g,r),"gi");function n(s,t){if(b){t.content=t.content.replace(p.reOpera,"</"+r+">")}t.content=t.content.replace(p.rePadd,"<"+r+"$1$2$3$4$5$6>\u00a0</"+r+">");if(!c&&!b&&t.set){t.content=t.content.replace(p.reNbsp2BR1,"<"+r+"$1$2><br /></"+r+">");t.content=t.content.replace(p.reNbsp2BR2,"<"+r+"$1$2><br /></"+r+">")}else{t.content=t.content.replace(p.reBR2Nbsp,"<"+r+"$1$2>\u00a0</"+r+">")}}o.onBeforeSetContent.add(n);o.onPostProcess.add(n);if(q.forced_root_block){o.onInit.add(p.forceRoots,p);o.onSetContent.add(p.forceRoots,p);o.onBeforeGetContent.add(p.forceRoots,p)}},setup:function(){var o=this,n=o.editor,q=n.settings,u=n.dom,p=n.selection;if(q.forced_root_block){n.onBeforeExecCommand.add(o.forceRoots,o);n.onKeyUp.add(o.forceRoots,o);n.onPreProcess.add(o.forceRoots,o)}if(q.force_br_newlines){if(c){n.onKeyPress.add(function(s,t){var v;if(t.keyCode==13&&p.getNode().nodeName!="LI"){p.setContent('<br id="__" /> ',{format:"raw"});v=u.get("__");v.removeAttribute("id");p.select(v);p.collapse();return k.cancel(t)}})}}if(q.force_p_newlines){if(!c){n.onKeyPress.add(function(s,t){if(t.keyCode==13&&!t.shiftKey&&!o.insertPara(t)){k.cancel(t)}})}else{m.addUnload(function(){o._previousFormats=0});n.onKeyPress.add(function(s,t){o._previousFormats=0;if(t.keyCode==13&&!t.shiftKey&&s.selection.isCollapsed()&&q.keep_styles){o._previousFormats=l(s.selection.getStart())}});n.onKeyUp.add(function(v,z){if(z.keyCode==13&&!z.shiftKey){var y=v.selection.getStart(),t=o._previousFormats;if(!y.hasChildNodes()){y=u.getParent(y,u.isBlock);if(y){y.innerHTML="";if(o._previousFormats){y.appendChild(t.wrapper);t.inner.innerHTML="\uFEFF"}else{y.innerHTML="\uFEFF"}p.select(y,1);v.getDoc().execCommand("Delete",false,null);var A=p.getNode();var x;while(true){x=A.nextSibling;if(x){break}else{A=A.parentNode}}if(x&&x.nodeName=="P"&&x.innerHTML.length==0){x.innerHTML="&nbsp;";var s=u.createRng();s.setStart(x,1);s.setEnd(x,1);p.setRng(s);x.innerHTML=""}}}}})}if(a){n.onKeyDown.add(function(s,t){if((t.keyCode==8||t.keyCode==46)&&!t.shiftKey){o.backspaceDelete(t,t.keyCode==8)}})}}if(m.isWebKit){function r(t){var s=p.getRng(),v,z=u.create("div",null," "),y,x=u.getViewPort(t.getWin()).h;s.insertNode(v=u.create("br"));s.setStartAfter(v);s.setEndAfter(v);p.setRng(s);if(p.getSel().focusNode==v.previousSibling){p.select(u.insertAfter(u.doc.createTextNode("\u00a0"),v));p.collapse(d)}u.insertAfter(z,v);y=u.getPos(z).y;u.remove(z);if(y>x){t.getWin().scrollTo(0,y)}}n.onKeyPress.add(function(s,t){if(t.keyCode==13&&(t.shiftKey||(q.force_br_newlines&&!u.getParent(p.getNode(),"h1,h2,h3,h4,h5,h6,ol,ul")))){r(s);k.cancel(t)}})}n.onPreProcess.add(function(s,t){j(u.select("p,h1,h2,h3,h4,h5,h6,div",t.node),function(v){if(f(v)){j(u.select("span,em,strong,b,i",t.node),function(x){if(!x.hasChildNodes()){x.appendChild(s.getDoc().createTextNode("\u00a0"));return h}})}})});if(c){if(q.element!="P"){n.onKeyPress.add(function(s,t){o.lastElm=p.getNode().nodeName});n.onKeyUp.add(function(t,v){var y,x=p.getNode(),s=t.getBody();if(s.childNodes.length===1&&x.nodeName=="P"){x=u.rename(x,q.element);p.select(x);p.collapse();t.nodeChanged()}else{if(v.keyCode==13&&!v.shiftKey&&o.lastElm!="P"){y=u.getParent(x,"p");if(y){u.rename(y,q.element);t.nodeChanged()}}}})}}},find:function(v,q,r){var p=this.editor,o=p.getDoc().createTreeWalker(v,4,null,h),u=-1;while(v=o.nextNode()){u++;if(q==0&&v==r){return u}if(q==1&&u==r){return v}}return -1},forceRoots:function(x,I){var z=this,x=z.editor,M=x.getBody(),J=x.getDoc(),P=x.selection,A=P.getSel(),B=P.getRng(),N=-2,v,G,o,p,K=-16777215;var L,q,O,F,C,u=M.childNodes,E,D,y;for(E=u.length-1;E>=0;E--){L=u[E];if(L.nodeType===1&&L.getAttribute("_mce_type")){q=null;continue}if(L.nodeType===3||(!z.dom.isBlock(L)&&L.nodeType!==8&&!/^(script|mce:script|style|mce:style)$/i.test(L.nodeName))){if(!q){if(L.nodeType!=3||/[^\s]/g.test(L.nodeValue)){if(N==-2&&B){if(!c){if(B.startContainer.nodeType==1&&(D=B.startContainer.childNodes[B.startOffset])&&D.nodeType==1){y=D.getAttribute("id");D.setAttribute("id","__mce")}else{if(x.dom.getParent(B.startContainer,function(n){return n===M})){G=B.startOffset;o=B.endOffset;N=z.find(M,0,B.startContainer);v=z.find(M,0,B.endContainer)}}}else{if(B.item){p=J.body.createTextRange();p.moveToElementText(B.item(0));B=p}p=J.body.createTextRange();p.moveToElementText(M);p.collapse(1);O=p.move("character",K)*-1;p=B.duplicate();p.collapse(1);F=p.move("character",K)*-1;p=B.duplicate();p.collapse(0);C=(p.move("character",K)*-1)-F;N=F-O;v=C}}q=x.dom.create(x.settings.forced_root_block);L.parentNode.replaceChild(q,L);q.appendChild(L)}}else{if(q.hasChildNodes()){q.insertBefore(L,q.firstChild)}else{q.appendChild(L)}}}else{q=null}}if(N!=-2){if(!c){q=M.getElementsByTagName(x.settings.element)[0];B=J.createRange();if(N!=-1){B.setStart(z.find(M,1,N),G)}else{B.setStart(q,0)}if(v!=-1){B.setEnd(z.find(M,1,v),o)}else{B.setEnd(q,0)}if(A){A.removeAllRanges();A.addRange(B)}}else{try{B=A.createRange();B.moveToElementText(M);B.collapse(1);B.moveStart("character",N);B.moveEnd("character",v);B.select()}catch(H){}}}else{if(!c&&(D=x.dom.get("__mce"))){if(y){D.setAttribute("id",y)}else{D.removeAttribute("id")}B=J.createRange();B.setStartBefore(D);B.setEndBefore(D);P.setRng(B)}}},getParentBlock:function(p){var o=this.dom;return o.getParent(p,o.isBlock)},insertPara:function(S){var G=this,x=G.editor,O=x.dom,T=x.getDoc(),X=x.settings,H=x.selection.getSel(),I=H.getRangeAt(0),W=T.body;var L,M,J,Q,P,u,p,v,A,o,E,V,q,z,K,N=O.getViewPort(x.getWin()),D,F,C;L=T.createRange();L.setStart(H.anchorNode,H.anchorOffset);L.collapse(d);M=T.createRange();M.setStart(H.focusNode,H.focusOffset);M.collapse(d);J=L.compareBoundaryPoints(L.START_TO_END,M)<0;Q=J?H.anchorNode:H.focusNode;P=J?H.anchorOffset:H.focusOffset;u=J?H.focusNode:H.anchorNode;p=J?H.focusOffset:H.anchorOffset;if(Q===u&&/^(TD|TH)$/.test(Q.nodeName)){if(Q.firstChild.nodeName=="BR"){O.remove(Q.firstChild)}if(Q.childNodes.length==0){x.dom.add(Q,X.element,null,"<br />");V=x.dom.add(Q,X.element,null,"<br />")}else{K=Q.innerHTML;Q.innerHTML="";x.dom.add(Q,X.element,null,K);V=x.dom.add(Q,X.element,null,"<br />")}I=T.createRange();I.selectNodeContents(V);I.collapse(1);x.selection.setRng(I);return h}if(Q==W&&u==W&&W.firstChild&&x.dom.isBlock(W.firstChild)){Q=u=Q.firstChild;P=p=0;L=T.createRange();L.setStart(Q,0);M=T.createRange();M.setStart(u,0)}Q=Q.nodeName=="HTML"?T.body:Q;Q=Q.nodeName=="BODY"?Q.firstChild:Q;u=u.nodeName=="HTML"?T.body:u;u=u.nodeName=="BODY"?u.firstChild:u;v=G.getParentBlock(Q);A=G.getParentBlock(u);o=v?v.nodeName:X.element;if(K=G.dom.getParent(v,"li,pre")){if(K.nodeName=="LI"){return e(x.selection,G.dom,K)}return d}if(v&&(v.nodeName=="CAPTION"||/absolute|relative|fixed/gi.test(O.getStyle(v,"position",1)))){o=X.element;v=null}if(A&&(A.nodeName=="CAPTION"||/absolute|relative|fixed/gi.test(O.getStyle(v,"position",1)))){o=X.element;A=null}if(/(TD|TABLE|TH|CAPTION)/.test(o)||(v&&o=="DIV"&&/left|right/gi.test(O.getStyle(v,"float",1)))){o=X.element;v=A=null}E=(v&&v.nodeName==o)?v.cloneNode(0):x.dom.create(o);V=(A&&A.nodeName==o)?A.cloneNode(0):x.dom.create(o);V.removeAttribute("id");if(/^(H[1-6])$/.test(o)&&g(I,v)){V=x.dom.create(X.element)}K=q=Q;do{if(K==W||K.nodeType==9||G.dom.isBlock(K)||/(TD|TABLE|TH|CAPTION)/.test(K.nodeName)){break}q=K}while((K=K.previousSibling?K.previousSibling:K.parentNode));K=z=u;do{if(K==W||K.nodeType==9||G.dom.isBlock(K)||/(TD|TABLE|TH|CAPTION)/.test(K.nodeName)){break}z=K}while((K=K.nextSibling?K.nextSibling:K.parentNode));if(q.nodeName==o){L.setStart(q,0)}else{L.setStartBefore(q)}L.setEnd(Q,P);E.appendChild(L.cloneContents()||T.createTextNode(""));try{M.setEndAfter(z)}catch(R){}M.setStart(u,p);V.appendChild(M.cloneContents()||T.createTextNode(""));I=T.createRange();if(!q.previousSibling&&q.parentNode.nodeName==o){I.setStartBefore(q.parentNode)}else{if(L.startContainer.nodeName==o&&L.startOffset==0){I.setStartBefore(L.startContainer)}else{I.setStart(L.startContainer,L.startOffset)}}if(!z.nextSibling&&z.parentNode.nodeName==o){I.setEndAfter(z.parentNode)}else{I.setEnd(M.endContainer,M.endOffset)}I.deleteContents();if(b){x.getWin().scrollTo(0,N.y)}if(E.firstChild&&E.firstChild.nodeName==o){E.innerHTML=E.firstChild.innerHTML}if(V.firstChild&&V.firstChild.nodeName==o){V.innerHTML=V.firstChild.innerHTML}if(f(E)){E.innerHTML="<br />"}function U(y,s){var r=[],Z,Y,t;y.innerHTML="";if(X.keep_styles){Y=s;do{if(/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(Y.nodeName)){Z=Y.cloneNode(h);O.setAttrib(Z,"id","");r.push(Z)}}while(Y=Y.parentNode)}if(r.length>0){for(t=r.length-1,Z=y;t>=0;t--){Z=Z.appendChild(r[t])}r[0].innerHTML=b?"&nbsp;":"<br />";return r[0]}else{y.innerHTML=b?"&nbsp;":"<br />"}}if(f(V)){C=U(V,u)}if(b&&parseFloat(opera.version())<9.5){I.insertNode(E);I.insertNode(V)}else{I.insertNode(V);I.insertNode(E)}V.normalize();E.normalize();function B(r){return T.createTreeWalker(r,NodeFilter.SHOW_TEXT,null,h).nextNode()||r}I=T.createRange();I.selectNodeContents(a?B(C||V):C||V);I.collapse(1);H.removeAllRanges();H.addRange(I);D=x.dom.getPos(V).y;F=V.clientHeight;if(D<N.y||D+F>N.y+N.h){x.getWin().scrollTo(0,D<N.y?D:D-N.h+25)}return h},backspaceDelete:function(v,C){var D=this,u=D.editor,z=u.getBody(),s=u.dom,q,x=u.selection,p=x.getRng(),y=p.startContainer,q,A,B,o;if(!C&&p.collapsed&&y.nodeType==1&&p.startOffset==y.childNodes.length){o=new m.dom.TreeWalker(y.lastChild,y);for(q=y.lastChild;q;q=o.prev()){if(q.nodeType==3){p.setStart(q,q.nodeValue.length);p.collapse(true);x.setRng(p);return}}}if(y&&u.dom.isBlock(y)&&!/^(TD|TH)$/.test(y.nodeName)&&C){if(y.childNodes.length==0||(y.childNodes.length==1&&y.firstChild.nodeName=="BR")){q=y;while((q=q.previousSibling)&&!u.dom.isBlock(q)){}if(q){if(y!=z.firstChild){A=u.dom.doc.createTreeWalker(q,NodeFilter.SHOW_TEXT,null,h);while(B=A.nextNode()){q=B}p=u.getDoc().createRange();p.setStart(q,q.nodeValue?q.nodeValue.length:0);p.setEnd(q,q.nodeValue?q.nodeValue.length:0);x.setRng(p);u.dom.remove(y)}return k.cancel(v)}}}}})})(tinymce);(function(c){var b=c.DOM,a=c.dom.Event,d=c.each,e=c.extend;c.create("tinymce.ControlManager",{ControlManager:function(f,j){var h=this,g;j=j||{};h.editor=f;h.controls={};h.onAdd=new c.util.Dispatcher(h);h.onPostRender=new c.util.Dispatcher(h);h.prefix=j.prefix||f.id+"_";h._cls={};h.onPostRender.add(function(){d(h.controls,function(i){i.postRender()})})},get:function(f){return this.controls[this.prefix+f]||this.controls[f]},setActive:function(h,f){var g=null;if(g=this.get(h)){g.setActive(f)}return g},setDisabled:function(h,f){var g=null;if(g=this.get(h)){g.setDisabled(f)}return g},add:function(g){var f=this;if(g){f.controls[g.id]=g;f.onAdd.dispatch(g,f)}return g},createControl:function(i){var h,g=this,f=g.editor;d(f.plugins,function(j){if(j.createControl){h=j.createControl(i,g);if(h){return false}}});switch(i){case"|":case"separator":return g.createSeparator()}if(!h&&f.buttons&&(h=f.buttons[i])){return g.createButton(i,h)}return g.add(h)},createDropMenu:function(f,n,h){var m=this,i=m.editor,j,g,k,l;n=e({"class":"mceDropDown",constrain:i.settings.constrain_menus},n);n["class"]=n["class"]+" "+i.getParam("skin")+"Skin";if(k=i.getParam("skin_variant")){n["class"]+=" "+i.getParam("skin")+"Skin"+k.substring(0,1).toUpperCase()+k.substring(1)}f=m.prefix+f;l=h||m._cls.dropmenu||c.ui.DropMenu;j=m.controls[f]=new l(f,n);j.onAddItem.add(function(r,q){var p=q.settings;p.title=i.getLang(p.title,p.title);if(!p.onclick){p.onclick=function(o){if(p.cmd){i.execCommand(p.cmd,p.ui||false,p.value)}}}});i.onRemove.add(function(){j.destroy()});if(c.isIE){j.onShowMenu.add(function(){i.focus();g=i.selection.getBookmark(1)});j.onHideMenu.add(function(){if(g){i.selection.moveToBookmark(g);g=0}})}return m.add(j)},createListBox:function(m,i,l){var h=this,g=h.editor,j,k,f;if(h.get(m)){return null}i.title=g.translate(i.title);i.scope=i.scope||g;if(!i.onselect){i.onselect=function(n){g.execCommand(i.cmd,i.ui||false,n||i.value)}}i=e({title:i.title,"class":"mce_"+m,scope:i.scope,control_manager:h},i);m=h.prefix+m;if(g.settings.use_native_selects){k=new c.ui.NativeListBox(m,i)}else{f=l||h._cls.listbox||c.ui.ListBox;k=new f(m,i)}h.controls[m]=k;if(c.isWebKit){k.onPostRender.add(function(p,o){a.add(o,"mousedown",function(){g.bookmark=g.selection.getBookmark(1)});a.add(o,"focus",function(){g.selection.moveToBookmark(g.bookmark);g.bookmark=null})})}if(k.hideMenu){g.onMouseDown.add(k.hideMenu,k)}return h.add(k)},createButton:function(m,i,l){var h=this,g=h.editor,j,k,f;if(h.get(m)){return null}i.title=g.translate(i.title);i.label=g.translate(i.label);i.scope=i.scope||g;if(!i.onclick&&!i.menu_button){i.onclick=function(){g.execCommand(i.cmd,i.ui||false,i.value)}}i=e({title:i.title,"class":"mce_"+m,unavailable_prefix:g.getLang("unavailable",""),scope:i.scope,control_manager:h},i);m=h.prefix+m;if(i.menu_button){f=l||h._cls.menubutton||c.ui.MenuButton;k=new f(m,i);g.onMouseDown.add(k.hideMenu,k)}else{f=h._cls.button||c.ui.Button;k=new f(m,i)}return h.add(k)},createMenuButton:function(h,f,g){f=f||{};f.menu_button=1;return this.createButton(h,f,g)},createSplitButton:function(m,i,l){var h=this,g=h.editor,j,k,f;if(h.get(m)){return null}i.title=g.translate(i.title);i.scope=i.scope||g;if(!i.onclick){i.onclick=function(n){g.execCommand(i.cmd,i.ui||false,n||i.value)}}if(!i.onselect){i.onselect=function(n){g.execCommand(i.cmd,i.ui||false,n||i.value)}}i=e({title:i.title,"class":"mce_"+m,scope:i.scope,control_manager:h},i);m=h.prefix+m;f=l||h._cls.splitbutton||c.ui.SplitButton;k=h.add(new f(m,i));g.onMouseDown.add(k.hideMenu,k);return k},createColorSplitButton:function(f,n,h){var l=this,j=l.editor,i,k,m,g;if(l.get(f)){return null}n.title=j.translate(n.title);n.scope=n.scope||j;if(!n.onclick){n.onclick=function(o){if(c.isIE){g=j.selection.getBookmark(1)}j.execCommand(n.cmd,n.ui||false,o||n.value)}}if(!n.onselect){n.onselect=function(o){j.execCommand(n.cmd,n.ui||false,o||n.value)}}n=e({title:n.title,"class":"mce_"+f,menu_class:j.getParam("skin")+"Skin",scope:n.scope,more_colors_title:j.getLang("more_colors")},n);f=l.prefix+f;m=h||l._cls.colorsplitbutton||c.ui.ColorSplitButton;k=new m(f,n);j.onMouseDown.add(k.hideMenu,k);j.onRemove.add(function(){k.destroy()});if(c.isIE){k.onShowMenu.add(function(){j.focus();g=j.selection.getBookmark(1)});k.onHideMenu.add(function(){if(g){j.selection.moveToBookmark(g);g=0}})}return l.add(k)},createToolbar:function(k,h,j){var i,g=this,f;k=g.prefix+k;f=j||g._cls.toolbar||c.ui.Toolbar;i=new f(k,h);if(g.get(k)){return null}return g.add(i)},createSeparator:function(g){var f=g||this._cls.separator||c.ui.Separator;return new f()},setControlType:function(g,f){return this._cls[g.toLowerCase()]=f},destroy:function(){d(this.controls,function(f){f.destroy()});this.controls=null}})})(tinymce);(function(d){var a=d.util.Dispatcher,e=d.each,c=d.isIE,b=d.isOpera;d.create("tinymce.WindowManager",{WindowManager:function(f){var g=this;g.editor=f;g.onOpen=new a(g);g.onClose=new a(g);g.params={};g.features={}},open:function(z,h){var v=this,k="",n,m,i=v.editor.settings.dialog_type=="modal",q,o,j,g=d.DOM.getViewPort(),r;z=z||{};h=h||{};o=b?g.w:screen.width;j=b?g.h:screen.height;z.name=z.name||"mc_"+new Date().getTime();z.width=parseInt(z.width||320);z.height=parseInt(z.height||240);z.resizable=true;z.left=z.left||parseInt(o/2)-(z.width/2);z.top=z.top||parseInt(j/2)-(z.height/2);h.inline=false;h.mce_width=z.width;h.mce_height=z.height;h.mce_auto_focus=z.auto_focus;if(i){if(c){z.center=true;z.help=false;z.dialogWidth=z.width+"px";z.dialogHeight=z.height+"px";z.scroll=z.scrollbars||false}}e(z,function(p,f){if(d.is(p,"boolean")){p=p?"yes":"no"}if(!/^(name|url)$/.test(f)){if(c&&i){k+=(k?";":"")+f+":"+p}else{k+=(k?",":"")+f+"="+p}}});v.features=z;v.params=h;v.onOpen.dispatch(v,z,h);r=z.url||z.file;r=d._addVer(r);try{if(c&&i){q=1;window.showModalDialog(r,window,k)}else{q=window.open(r,z.name,k)}}catch(l){}if(!q){alert(v.editor.getLang("popup_blocked"))}},close:function(f){f.close();this.onClose.dispatch(this)},createInstance:function(i,h,g,m,l,k){var j=d.resolve(i);return new j(h,g,m,l,k)},confirm:function(h,f,i,g){g=g||window;f.call(i||this,g.confirm(this._decode(this.editor.getLang(h,h))))},alert:function(h,f,j,g){var i=this;g=g||window;g.alert(i._decode(i.editor.getLang(h,h)));if(f){f.call(j||i)}},resizeBy:function(f,g,h){h.resizeBy(f,g)},_decode:function(f){return d.DOM.decode(f).replace(/\\n/g,"\n")}})}(tinymce));(function(a){function b(){var d={},c={},e={};function f(j,i,h,g){if(typeof(i)=="string"){i=[i]}a.each(i,function(k){j[k.toLowerCase()]={func:h,scope:g}})}a.extend(this,{add:function(i,h,g){f(d,i,h,g)},addQueryStateHandler:function(i,h,g){f(c,i,h,g)},addQueryValueHandler:function(i,h,g){f(e,i,h,g)},execCommand:function(h,k,j,i,g){if(k=d[k.toLowerCase()]){if(k.func.call(h||k.scope,j,i,g)!==false){return true}}},queryCommandValue:function(){if(cmd=e[cmd.toLowerCase()]){return cmd.func.call(scope||cmd.scope,ui,value,args)}},queryCommandState:function(){if(cmd=c[cmd.toLowerCase()]){return cmd.func.call(scope||cmd.scope,ui,value,args)}}})}a.GlobalCommands=new b()})(tinymce);(function(a){a.Formatter=function(T){var K={},M=a.each,c=T.dom,p=T.selection,s=a.dom.TreeWalker,I=new a.dom.RangeUtils(c),d=T.schema.isValid,E=c.isBlock,k=T.settings.forced_root_block,r=c.nodeIndex,D="\uFEFF",e=/^(src|href|style)$/,Q=false,A=true,o,N={apply:[],remove:[]};function y(U){return U instanceof Array}function l(V,U){return c.getParents(V,U,c.getRoot())}function b(U){return U.nodeType===1&&(U.face==="mceinline"||U.style.fontFamily==="mceinline")}function P(U){return U?K[U]:K}function j(U,V){if(U){if(typeof(U)!=="string"){M(U,function(X,W){j(W,X)})}else{V=V.length?V:[V];M(V,function(W){if(W.deep===o){W.deep=!W.selector}if(W.split===o){W.split=!W.selector||W.inline}if(W.remove===o&&W.selector&&!W.inline){W.remove="none"}if(W.selector&&W.inline){W.mixed=true;W.block_expand=true}if(typeof(W.classes)==="string"){W.classes=W.classes.split(/\s+/)}});K[U]=V}}}function R(W,ac,Y){var Z=P(W),ad=Z[0],ab,V,aa;function X(ag){var af=ag.startContainer,aj=ag.startOffset,ai,ah;if(af.nodeType==1||af.nodeValue===""){af=af.nodeType==1?af.childNodes[aj]:af;if(af){ai=new s(af,af.parentNode);for(ah=ai.current();ah;ah=ai.next()){if(ah.nodeType==3&&!f(ah)){ag.setStart(ah,0);break}}}}return ag}function U(ag,af){af=af||ad;if(ag){M(af.styles,function(ai,ah){c.setStyle(ag,ah,q(ai,ac))});M(af.attributes,function(ai,ah){c.setAttrib(ag,ah,q(ai,ac))});M(af.classes,function(ah){ah=q(ah,ac);if(!c.hasClass(ag,ah)){c.addClass(ag,ah)}})}}function ae(ag){var af=[],ai,ah;ai=ad.inline||ad.block;ah=c.create(ai);U(ah);I.walk(ag,function(aj){var ak;function al(am){var ap=am.nodeName.toLowerCase(),ao=am.parentNode.nodeName.toLowerCase(),an;if(g(ap,"br")){ak=0;if(ad.block){c.remove(am)}return}if(ad.wrapper&&v(am,W,ac)){ak=0;return}if(ad.block&&!ad.wrapper&&F(ap)){am=c.rename(am,ai);U(am);af.push(am);ak=0;return}if(ad.selector){M(Z,function(aq){if(c.is(am,aq.selector)&&!b(am)){U(am,aq);an=true}});if(!ad.inline||an){ak=0;return}}if(d(ai,ap)&&d(ao,ai)){if(!ak){ak=ah.cloneNode(Q);am.parentNode.insertBefore(ak,am);af.push(ak)}ak.appendChild(am)}else{ak=0;M(a.grep(am.childNodes),al);ak=0}}M(aj,al)});M(af,function(al){var aj;function am(ao){var an=0;M(ao.childNodes,function(ap){if(!f(ap)&&!G(ap)){an++}});return an}function ak(an){var ap,ao;M(an.childNodes,function(aq){if(aq.nodeType==1&&!G(aq)&&!b(aq)){ap=aq;return Q}});if(ap&&h(ap,ad)){ao=ap.cloneNode(Q);U(ao);c.replace(ao,an,A);c.remove(ap,1)}return ao||an}aj=am(al);if(aj===0){c.remove(al,1);return}if(ad.inline||ad.wrapper){if(!ad.exact&&aj===1){al=ak(al)}M(Z,function(an){M(c.select(an.inline,al),function(ao){S(an,ac,ao,an.exact?ao:null)})});if(v(al.parentNode,W,ac)){c.remove(al,1);al=0;return A}if(ad.merge_with_parents){c.getParent(al.parentNode,function(an){if(v(an,W,ac)){c.remove(al,1);al=0;return A}})}if(al){al=t(B(al),al);al=t(al,B(al,A))}}})}if(ad){if(Y){V=c.createRng();V.setStartBefore(Y);V.setEndAfter(Y);ae(n(V,Z))}else{if(!p.isCollapsed()||!ad.inline){ab=p.getBookmark();ae(n(p.getRng(A),Z));p.moveToBookmark(ab);p.setRng(X(p.getRng(A)));T.nodeChanged()}else{O("apply",W,ac)}}}}function z(W,af,Z){var aa=P(W),ah=aa[0],ae,ad,V;function Y(ak){var aj=ak.startContainer,ap=ak.startOffset,ao,an,al,am;if(aj.nodeType==3&&ap>=aj.nodeValue.length-1){aj=aj.parentNode;ap=r(aj)+1}if(aj.nodeType==1){al=aj.childNodes;aj=al[Math.min(ap,al.length-1)];ao=new s(aj);if(ap>al.length-1){ao.next()}for(an=ao.current();an;an=ao.next()){if(an.nodeType==3&&!f(an)){am=c.create("a",null,D);an.parentNode.insertBefore(am,an);ak.setStart(an,0);p.setRng(ak);c.remove(am);return}}}}function X(am){var al,ak,aj;al=a.grep(am.childNodes);for(ak=0,aj=aa.length;ak<aj;ak++){if(S(aa[ak],af,am,am)){break}}if(ah.deep){for(ak=0,aj=al.length;ak<aj;ak++){X(al[ak])}}}function ab(aj){var ak;M(l(aj.parentNode).reverse(),function(al){var am;if(!ak&&al.id!="_start"&&al.id!="_end"){am=v(al,W,af);if(am&&am.split!==false){ak=al}}});return ak}function U(am,aj,ao,ar){var at,aq,ap,al,an,ak;if(am){ak=am.parentNode;for(at=aj.parentNode;at&&at!=ak;at=at.parentNode){aq=at.cloneNode(Q);for(an=0;an<aa.length;an++){if(S(aa[an],af,aq,aq)){aq=0;break}}if(aq){if(ap){aq.appendChild(ap)}if(!al){al=aq}ap=aq}}if(ar&&(!ah.mixed||!E(am))){aj=c.split(am,aj)}if(ap){ao.parentNode.insertBefore(ap,ao);al.appendChild(ao)}}return aj}function ag(aj){return U(ab(aj),aj,aj,true)}function ac(al){var ak=c.get(al?"_start":"_end"),aj=ak[al?"firstChild":"lastChild"];if(G(aj)){aj=aj[al?"firstChild":"lastChild"]}c.remove(ak,true);return aj}function ai(aj){var ak,al;aj=n(aj,aa,A);if(ah.split){ak=H(aj,A);al=H(aj);if(ak!=al){ak=L(ak,"span",{id:"_start",_mce_type:"bookmark"});al=L(al,"span",{id:"_end",_mce_type:"bookmark"});ag(ak);ag(al);ak=ac(A);al=ac()}else{ak=al=ag(ak)}aj.startContainer=ak.parentNode;aj.startOffset=r(ak);aj.endContainer=al.parentNode;aj.endOffset=r(al)+1}I.walk(aj,function(am){M(am,function(an){X(an)})})}if(Z){V=c.createRng();V.setStartBefore(Z);V.setEndAfter(Z);ai(V);return}if(!p.isCollapsed()||!ah.inline){ae=p.getBookmark();ai(p.getRng(A));p.moveToBookmark(ae);if(i(W,af,p.getStart())){Y(p.getRng(true))}T.nodeChanged()}else{O("remove",W,af)}}function C(U,W,V){if(i(U,W,V)){z(U,W,V)}else{R(U,W,V)}}function v(V,U,aa,Y){var W=P(U),ab,Z,X;function ac(ag,ai,aj){var af,ah,ad=ai[aj],ae;if(ad){if(ad.length===o){for(af in ad){if(ad.hasOwnProperty(af)){if(aj==="attributes"){ah=c.getAttrib(ag,af)}else{ah=J(ag,af)}if(Y&&!ah&&!ai.exact){return}if((!Y||ai.exact)&&!g(ah,q(ad[af],aa))){return}}}}else{for(ae=0;ae<ad.length;ae++){if(aj==="attributes"?c.getAttrib(ag,ad[ae]):J(ag,ad[ae])){return ai}}}}return ai}if(W&&V){for(Z=0;Z<W.length;Z++){ab=W[Z];if(h(V,ab)&&ac(V,ab,"attributes")&&ac(V,ab,"styles")){if(X=ab.classes){for(Z=0;Z<X.length;Z++){if(!c.hasClass(V,X[Z])){return}}}return ab}}}}function i(W,Z,Y){var V,X;function U(aa){aa=c.getParent(aa,function(ab){return !!v(ab,W,Z,true)});return v(aa,W,Z)}if(Y){return U(Y)}if(p.isCollapsed()){for(X=N.apply.length-1;X>=0;X--){if(N.apply[X].name==W){return true}}for(X=N.remove.length-1;X>=0;X--){if(N.remove[X].name==W){return false}}return U(p.getNode())}Y=p.getNode();if(U(Y)){return A}V=p.getStart();if(V!=Y){if(U(V)){return A}}return Q}function u(ab,aa){var Y,Z=[],X={},W,V,U;if(p.isCollapsed()){for(V=0;V<ab.length;V++){for(W=N.remove.length-1;W>=0;W--){U=ab[V];if(N.remove[W].name==U){X[U]=true;break}}}for(W=N.apply.length-1;W>=0;W--){for(V=0;V<ab.length;V++){U=ab[V];if(!X[U]&&N.apply[W].name==U){X[U]=true;Z.push(U)}}}}Y=p.getStart();c.getParent(Y,function(ae){var ad,ac;for(ad=0;ad<ab.length;ad++){ac=ab[ad];if(!X[ac]&&v(ae,ac,aa)){X[ac]=true;Z.push(ac)}}});return Z}function x(Y){var aa=P(Y),X,W,Z,V,U;if(aa){X=p.getStart();W=l(X);for(V=aa.length-1;V>=0;V--){U=aa[V].selector;if(!U){return A}for(Z=W.length-1;Z>=0;Z--){if(c.is(W[Z],U)){return A}}}}return Q}a.extend(this,{get:P,register:j,apply:R,remove:z,toggle:C,match:i,matchAll:u,matchNode:v,canApply:x});function h(U,V){if(g(U,V.inline)){return A}if(g(U,V.block)){return A}if(V.selector){return c.is(U,V.selector)}}function g(V,U){V=V||"";U=U||"";V=""+(V.nodeName||V);U=""+(U.nodeName||U);return V.toLowerCase()==U.toLowerCase()}function J(V,U){var W=c.getStyle(V,U);if(U=="color"||U=="backgroundColor"){W=c.toHex(W)}if(U=="fontWeight"&&W==700){W="bold"}return""+W}function q(U,V){if(typeof(U)!="string"){U=U(V)}else{if(V){U=U.replace(/%(\w+)/g,function(X,W){return V[W]||X})}}return U}function f(U){return U&&U.nodeType===3&&/^([\s\r\n]+|)$/.test(U.nodeValue)}function L(W,V,U){var X=c.create(V,U);W.parentNode.insertBefore(X,W);X.appendChild(W);return X}function n(U,ac,X){var W=U.startContainer,Z=U.startOffset,af=U.endContainer,aa=U.endOffset,ae,ab;function ad(ai,aj,ag,ah){var ak,al;ah=ah||c.getRoot();for(;;){ak=ai.parentNode;if(ak==ah||(!ac[0].block_expand&&E(ak))){return ai}for(ae=ak[aj];ae&&ae!=ai;ae=ae[ag]){if(ae.nodeType==1&&!G(ae)){return ai}if(ae.nodeType==3&&!f(ae)){return ai}}ai=ai.parentNode}return ai}if(W.nodeType==1&&W.hasChildNodes()){ab=W.childNodes.length-1;W=W.childNodes[Z>ab?ab:Z];if(W.nodeType==3){Z=0}}if(af.nodeType==1&&af.hasChildNodes()){ab=af.childNodes.length-1;af=af.childNodes[aa>ab?ab:aa-1];if(af.nodeType==3){aa=af.nodeValue.length}}if(G(W.parentNode)){W=W.parentNode}if(G(W)){W=W.nextSibling||W}if(G(af.parentNode)){af=af.parentNode}if(G(af)){af=af.previousSibling||af}if(ac[0].inline||ac[0].block_expand){W=ad(W,"firstChild","nextSibling");af=ad(af,"lastChild","previousSibling")}if(ac[0].selector&&ac[0].expand!==Q&&!ac[0].inline){function Y(ah,ag){var ai,aj,ak;if(ah.nodeType==3&&ah.nodeValue.length==0&&ah[ag]){ah=ah[ag]}ai=l(ah);for(aj=0;aj<ai.length;aj++){for(ak=0;ak<ac.length;ak++){if(c.is(ai[aj],ac[ak].selector)){return ai[aj]}}}return ah}W=Y(W,"previousSibling");af=Y(af,"nextSibling")}if(ac[0].block||ac[0].selector){function V(ah,ag,aj){var ai;if(!ac[0].wrapper){ai=c.getParent(ah,ac[0].block)}if(!ai){ai=c.getParent(ah.nodeType==3?ah.parentNode:ah,E)}if(ai&&ac[0].wrapper){ai=l(ai,"ul,ol").reverse()[0]||ai}if(!ai){ai=ah;while(ai[ag]&&!E(ai[ag])){ai=ai[ag];if(g(ai,"br")){break}}}return ai||ah}W=V(W,"previousSibling");af=V(af,"nextSibling");if(ac[0].block){if(!E(W)){W=ad(W,"firstChild","nextSibling")}if(!E(af)){af=ad(af,"lastChild","previousSibling")}}}if(W.nodeType==1){Z=r(W);W=W.parentNode}if(af.nodeType==1){aa=r(af)+1;af=af.parentNode}return{startContainer:W,startOffset:Z,endContainer:af,endOffset:aa}}function S(aa,Z,X,U){var W,V,Y;if(!h(X,aa)){return Q}if(aa.remove!="all"){M(aa.styles,function(ac,ab){ac=q(ac,Z);if(typeof(ab)==="number"){ab=ac;U=0}if(!U||g(J(U,ab),ac)){c.setStyle(X,ab,"")}Y=1});if(Y&&c.getAttrib(X,"style")==""){X.removeAttribute("style");X.removeAttribute("_mce_style")}M(aa.attributes,function(ad,ab){var ac;ad=q(ad,Z);if(typeof(ab)==="number"){ab=ad;U=0}if(!U||g(c.getAttrib(U,ab),ad)){if(ab=="class"){ad=c.getAttrib(X,ab);if(ad){ac="";M(ad.split(/\s+/),function(ae){if(/mce\w+/.test(ae)){ac+=(ac?" ":"")+ae}});if(ac){c.setAttrib(X,ab,ac);return}}}if(ab=="class"){X.removeAttribute("className")}if(e.test(ab)){X.removeAttribute("_mce_"+ab)}X.removeAttribute(ab)}});M(aa.classes,function(ab){ab=q(ab,Z);if(!U||c.hasClass(U,ab)){c.removeClass(X,ab)}});V=c.getAttribs(X);for(W=0;W<V.length;W++){if(V[W].nodeName.indexOf("_")!==0){return Q}}}if(aa.remove!="none"){m(X,aa);return A}}function m(W,X){var U=W.parentNode,V;if(X.block){if(!k){function Y(aa,Z,ab){aa=B(aa,Z,ab);return !aa||(aa.nodeName=="BR"||E(aa))}if(E(W)&&!E(U)){if(!Y(W,Q)&&!Y(W.firstChild,A,1)){W.insertBefore(c.create("br"),W.firstChild)}if(!Y(W,A)&&!Y(W.lastChild,Q,1)){W.appendChild(c.create("br"))}}}else{if(U==c.getRoot()){if(!X.list_block||!g(W,X.list_block)){M(a.grep(W.childNodes),function(Z){if(d(k,Z.nodeName.toLowerCase())){if(!V){V=L(Z,k)}else{V.appendChild(Z)}}else{V=0}})}}}}if(X.selector&&X.inline&&!g(X.inline,W)){return}c.remove(W,1)}function B(V,U,W){if(V){U=U?"nextSibling":"previousSibling";for(V=W?V:V[U];V;V=V[U]){if(V.nodeType==1||!f(V)){return V}}}}function G(U){return U&&U.nodeType==1&&U.getAttribute("_mce_type")=="bookmark"}function t(Y,X){var U,W,V;function aa(ad,ac){if(ad.nodeName!=ac.nodeName){return Q}function ab(af){var ag={};M(c.getAttribs(af),function(ah){var ai=ah.nodeName.toLowerCase();if(ai.indexOf("_")!==0&&ai!=="style"){ag[ai]=c.getAttrib(af,ai)}});return ag}function ae(ai,ah){var ag,af;for(af in ai){if(ai.hasOwnProperty(af)){ag=ah[af];if(ag===o){return Q}if(ai[af]!=ag){return Q}delete ah[af]}}for(af in ah){if(ah.hasOwnProperty(af)){return Q}}return A}if(!ae(ab(ad),ab(ac))){return Q}if(!ae(c.parseStyle(c.getAttrib(ad,"style")),c.parseStyle(c.getAttrib(ac,"style")))){return Q}return A}if(Y&&X){function Z(ac,ab){for(W=ac;W;W=W[ab]){if(W.nodeType==3&&!f(W)){return ac}if(W.nodeType==1&&!G(W)){return W}}return ac}Y=Z(Y,"previousSibling");X=Z(X,"nextSibling");if(aa(Y,X)){for(W=Y.nextSibling;W&&W!=X;){V=W;W=W.nextSibling;Y.appendChild(V)}c.remove(X);M(a.grep(X.childNodes),function(ab){Y.appendChild(ab)});return Y}}return X}function F(U){return/^(h[1-6]|p|div|pre|address|dl|dt|dd)$/.test(U)}function H(V,Y){var U,X,W;U=V[Y?"startContainer":"endContainer"];X=V[Y?"startOffset":"endOffset"];if(U.nodeType==1){W=U.childNodes.length-1;if(!Y&&X){X--}U=U.childNodes[X>W?W:X]}return U}function O(Z,V,Y){var W,U=N[Z],aa=N[Z=="apply"?"remove":"apply"];function ab(){return N.apply.length||N.remove.length}function X(){N.apply=[];N.remove=[]}function ac(ad){M(N.apply.reverse(),function(ae){R(ae.name,ae.vars,ad)});M(N.remove.reverse(),function(ae){z(ae.name,ae.vars,ad)});c.remove(ad,1);X()}for(W=U.length-1;W>=0;W--){if(U[W].name==V){return}}U.push({name:V,vars:Y});for(W=aa.length-1;W>=0;W--){if(aa[W].name==V){aa.splice(W,1)}}if(ab()){T.getDoc().execCommand("FontName",false,"mceinline");N.lastRng=p.getRng();M(c.select("font,span"),function(ae){var ad;if(b(ae)){ad=p.getBookmark();ac(ae);p.moveToBookmark(ad);T.nodeChanged()}});if(!N.isListening&&ab()){N.isListening=true;M("onKeyDown,onKeyUp,onKeyPress,onMouseUp".split(","),function(ad){T[ad].addToTop(function(ae,af){if(ab()&&!a.dom.RangeUtils.compareRanges(N.lastRng,p.getRng())){M(c.select("font,span"),function(ah){var ai,ag;if(b(ah)){ai=ah.firstChild;if(ai){ac(ah);ag=c.createRng();ag.setStart(ai,ai.nodeValue.length);ag.setEnd(ai,ai.nodeValue.length);p.setRng(ag);ae.nodeChanged()}else{c.remove(ah)}}});if(af.type=="keyup"||af.type=="mouseup"){X()}}})})}}}}})(tinymce);tinymce.onAddEditor.add(function(e,a){var d,h,g,c=a.settings;if(c.inline_styles){h=e.explode(c.font_size_style_values);function b(j,i){g.replace(g.create("span",{style:i}),j,1)}d={font:function(j,i){b(i,{backgroundColor:i.style.backgroundColor,color:i.color,fontFamily:i.face,fontSize:h[parseInt(i.size)-1]})},u:function(j,i){b(i,{textDecoration:"underline"})},strike:function(j,i){b(i,{textDecoration:"line-through"})}};function f(i,j){g=i.dom;if(c.convert_fonts_to_spans){e.each(g.select("font,u,strike",j.node),function(k){d[k.nodeName.toLowerCase()](a.dom,k)})}}a.onPreProcess.add(f);a.onInit.add(function(){a.selection.onSetContent.add(f)})}});tinyMCE.addI18n({en:{
common:{
edit_confirm:"Do you want to use the WYSIWYG mode for this textarea?",
apply:"Apply",
insert:"Insert",
update:"Update",
cancel:"Cancel",
close:"Close",
browse:"Browse",
class_name:"Class",
not_set:"-- Not set --",
clipboard_msg:"Copy/Cut/Paste is not available in Mozilla and Firefox.\nDo you want more information about this issue?",
clipboard_no_support:"Currently not supported by your browser, use keyboard shortcuts instead.",
popup_blocked:"Sorry, but we have noticed that your popup-blocker has disabled a window that provides application functionality. You will need to disable popup blocking on this site in order to fully utilize this tool.",
invalid_data:"Error: Invalid values entered, these are marked in red.",
more_colors:"More colors"
},
contextmenu:{
align:"Alignment",
left:"Left",
center:"Center",
right:"Right",
full:"Full"
},
insertdatetime:{
date_fmt:"%Y-%m-%d",
time_fmt:"%H:%M:%S",
insertdate_desc:"Insert date",
inserttime_desc:"Insert time",
months_long:"January,February,March,April,May,June,July,August,September,October,November,December",
months_short:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
day_long:"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
day_short:"Sun,Mon,Tue,Wed,Thu,Fri,Sat,Sun"
},
print:{
print_desc:"Print"
},
preview:{
preview_desc:"Preview"
},
directionality:{
ltr_desc:"Direction left to right",
rtl_desc:"Direction right to left"
},
layer:{
insertlayer_desc:"Insert new layer",
forward_desc:"Move forward",
backward_desc:"Move backward",
absolute_desc:"Toggle absolute positioning",
content:"New layer..."
},
save:{
save_desc:"Save",
cancel_desc:"Cancel all changes"
},
nonbreaking:{
nonbreaking_desc:"Insert non-breaking space character"
},
iespell:{
iespell_desc:"Run spell checking",
download:"ieSpell not detected. Do you want to install it now?"
},
advhr:{
advhr_desc:"Horizontal rule"
},
emotions:{
emotions_desc:"Emotions"
},
searchreplace:{
search_desc:"Find",
replace_desc:"Find/Replace"
},
advimage:{
image_desc:"Insert/edit image"
},
advlink:{
link_desc:"Insert/edit link"
},
xhtmlxtras:{
cite_desc:"Citation",
abbr_desc:"Abbreviation",
acronym_desc:"Acronym",
del_desc:"Deletion",
ins_desc:"Insertion",
attribs_desc:"Insert/Edit Attributes"
},
style:{
desc:"Edit CSS Style"
},
paste:{
paste_text_desc:"Paste as Plain Text",
paste_word_desc:"Paste from Word",
selectall_desc:"Select All",
plaintext_mode_sticky:"Paste is now in plain text mode. Click again to toggle back to regular paste mode. After you paste something you will be returned to regular paste mode.",
plaintext_mode:"Paste is now in plain text mode. Click again to toggle back to regular paste mode."
},
paste_dlg:{
text_title:"Use CTRL+V on your keyboard to paste the text into the window.",
text_linebreaks:"Keep linebreaks",
word_title:"Use CTRL+V on your keyboard to paste the text into the window."
},
table:{
desc:"Inserts a new table",
row_before_desc:"Insert row before",
row_after_desc:"Insert row after",
delete_row_desc:"Delete row",
col_before_desc:"Insert column before",
col_after_desc:"Insert column after",
delete_col_desc:"Remove column",
split_cells_desc:"Split merged table cells",
merge_cells_desc:"Merge table cells",
row_desc:"Table row properties",
cell_desc:"Table cell properties",
props_desc:"Table properties",
paste_row_before_desc:"Paste table row before",
paste_row_after_desc:"Paste table row after",
cut_row_desc:"Cut table row",
copy_row_desc:"Copy table row",
del:"Delete table",
row:"Row",
col:"Column",
cell:"Cell"
},
autosave:{
unload_msg:"The changes you made will be lost if you navigate away from this page.",
restore_content:"Restore auto-saved content.",
warning_message:"If you restore the saved content, you will lose all the content that is currently in the editor.\n\nAre you sure you want to restore the saved content?."
},
fullscreen:{
desc:"Toggle fullscreen mode"
},
media:{
desc:"Insert / edit embedded media",
edit:"Edit embedded media"
},
fullpage:{
desc:"Document properties"
},
template:{
desc:"Insert predefined template content"
},
visualchars:{
desc:"Visual control characters on/off."
},
spellchecker:{
desc:"Toggle spellchecker",
menu:"Spellchecker settings",
ignore_word:"Ignore word",
ignore_words:"Ignore all",
langs:"Languages",
wait:"Please wait...",
sug:"Suggestions",
no_sug:"No suggestions",
no_mpell:"No misspellings found."
},
pagebreak:{
desc:"Insert page break."
},
advlist:{
types:"Types",
def:"Default",
lower_alpha:"Lower alpha",
lower_greek:"Lower greek",
lower_roman:"Lower roman",
upper_alpha:"Upper alpha",
upper_roman:"Upper roman",
circle:"Circle",
disc:"Disc",
square:"Square"
}}});(function(e){var d=e.DOM,b=e.dom.Event,h=e.extend,f=e.each,a=e.util.Cookie,g,c=e.explode;e.ThemeManager.requireLangPack("advanced");e.create("tinymce.themes.AdvancedTheme",{sizes:[8,10,12,14,18,24,36],controls:{bold:["bold_desc","Bold"],italic:["italic_desc","Italic"],underline:["underline_desc","Underline"],strikethrough:["striketrough_desc","Strikethrough"],justifyleft:["justifyleft_desc","JustifyLeft"],justifycenter:["justifycenter_desc","JustifyCenter"],justifyright:["justifyright_desc","JustifyRight"],justifyfull:["justifyfull_desc","JustifyFull"],bullist:["bullist_desc","InsertUnorderedList"],numlist:["numlist_desc","InsertOrderedList"],outdent:["outdent_desc","Outdent"],indent:["indent_desc","Indent"],cut:["cut_desc","Cut"],copy:["copy_desc","Copy"],paste:["paste_desc","Paste"],undo:["undo_desc","Undo"],redo:["redo_desc","Redo"],link:["link_desc","mceLink"],unlink:["unlink_desc","unlink"],image:["image_desc","mceImage"],cleanup:["cleanup_desc","mceCleanup"],help:["help_desc","mceHelp"],code:["code_desc","mceCodeEditor"],hr:["hr_desc","InsertHorizontalRule"],removeformat:["removeformat_desc","RemoveFormat"],sub:["sub_desc","subscript"],sup:["sup_desc","superscript"],forecolor:["forecolor_desc","ForeColor"],forecolorpicker:["forecolor_desc","mceForeColor"],backcolor:["backcolor_desc","HiliteColor"],backcolorpicker:["backcolor_desc","mceBackColor"],charmap:["charmap_desc","mceCharMap"],visualaid:["visualaid_desc","mceToggleVisualAid"],anchor:["anchor_desc","mceInsertAnchor"],newdocument:["newdocument_desc","mceNewDocument"],blockquote:["blockquote_desc","mceBlockQuote"]},stateControls:["bold","italic","underline","strikethrough","bullist","numlist","justifyleft","justifycenter","justifyright","justifyfull","sub","sup","blockquote"],init:function(j,k){var l=this,m,i,n;l.editor=j;l.url=k;l.onResolveName=new e.util.Dispatcher(this);l.settings=m=h({theme_advanced_path:true,theme_advanced_toolbar_location:"bottom",theme_advanced_buttons1:"bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect",theme_advanced_buttons2:"bullist,numlist,|,outdent,indent,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code",theme_advanced_buttons3:"hr,removeformat,visualaid,|,sub,sup,|,charmap",theme_advanced_blockformats:"p,address,pre,h1,h2,h3,h4,h5,h6",theme_advanced_toolbar_align:"center",theme_advanced_fonts:"Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats",theme_advanced_more_colors:1,theme_advanced_row_height:23,theme_advanced_resize_horizontal:1,theme_advanced_resizing_use_cookie:1,theme_advanced_font_sizes:"1,2,3,4,5,6,7",readonly:j.settings.readonly},j.settings);if(!m.font_size_style_values){m.font_size_style_values="8pt,10pt,12pt,14pt,18pt,24pt,36pt"}if(e.is(m.theme_advanced_font_sizes,"string")){m.font_size_style_values=e.explode(m.font_size_style_values);m.font_size_classes=e.explode(m.font_size_classes||"");n={};j.settings.theme_advanced_font_sizes=m.theme_advanced_font_sizes;f(j.getParam("theme_advanced_font_sizes","","hash"),function(q,p){var o;if(p==q&&q>=1&&q<=7){p=q+" ("+l.sizes[q-1]+"pt)";o=m.font_size_classes[q-1];q=m.font_size_style_values[q-1]||(l.sizes[q-1]+"pt")}if(/^\s*\./.test(q)){o=q.replace(/\./g,"")}n[p]=o?{"class":o}:{fontSize:q}});m.theme_advanced_font_sizes=n}if((i=m.theme_advanced_path_location)&&i!="none"){m.theme_advanced_statusbar_location=m.theme_advanced_path_location}if(m.theme_advanced_statusbar_location=="none"){m.theme_advanced_statusbar_location=0}j.onInit.add(function(){if(!j.settings.readonly){j.onNodeChange.add(l._nodeChanged,l)}if(j.settings.content_css!==false){j.dom.loadCSS(j.baseURI.toAbsolute("themes/advanced/skins/"+j.settings.skin+"/content.css"))}});j.onSetProgressState.add(function(q,o,r){var s,t=q.id,p;if(o){l.progressTimer=setTimeout(function(){s=q.getContainer();s=s.insertBefore(d.create("DIV",{style:"position:relative"}),s.firstChild);p=d.get(q.id+"_tbl");d.add(s,"div",{id:t+"_blocker","class":"mceBlocker",style:{width:p.clientWidth+2,height:p.clientHeight+2}});d.add(s,"div",{id:t+"_progress","class":"mceProgress",style:{left:p.clientWidth/2,top:p.clientHeight/2}})},r||0)}else{d.remove(t+"_blocker");d.remove(t+"_progress");clearTimeout(l.progressTimer)}});d.loadCSS(m.editor_css?j.documentBaseURI.toAbsolute(m.editor_css):k+"/skins/"+j.settings.skin+"/ui.css");if(m.skin_variant){d.loadCSS(k+"/skins/"+j.settings.skin+"/ui_"+m.skin_variant+".css")}},createControl:function(l,i){var j,k;if(k=i.createControl(l)){return k}switch(l){case"styleselect":return this._createStyleSelect();case"formatselect":return this._createBlockFormats();case"fontselect":return this._createFontSelect();case"fontsizeselect":return this._createFontSizeSelect();case"forecolor":return this._createForeColorMenu();case"backcolor":return this._createBackColorMenu()}if((j=this.controls[l])){return i.createButton(l,{title:"advanced."+j[0],cmd:j[1],ui:j[2],value:j[3]})}},execCommand:function(k,j,l){var i=this["_"+k];if(i){i.call(this,j,l);return true}return false},_importClasses:function(k){var i=this.editor,j=i.controlManager.get("styleselect");if(j.getLength()==0){f(i.dom.getClasses(),function(n,l){var m="style_"+l;i.formatter.register(m,{inline:"span",attributes:{"class":n["class"]},selector:"*"});j.add(n["class"],m)})}},_createStyleSelect:function(m){var k=this,i=k.editor,j=i.controlManager,l;l=j.createListBox("styleselect",{title:"advanced.style_select",onselect:function(o){var p,n=[];f(l.items,function(q){n.push(q.value)});i.focus();i.undoManager.add();p=i.formatter.matchAll(n);if(!o||p[0]==o){i.formatter.remove(p[0])}else{i.formatter.apply(o)}i.undoManager.add();i.nodeChanged();return false}});i.onInit.add(function(){var o=0,n=i.getParam("style_formats");if(n){f(n,function(p){var q,r=0;f(p,function(){r++});if(r>1){q=p.name=p.name||"style_"+(o++);i.formatter.register(q,p);l.add(p.title,q)}else{l.add(p.title)}})}else{f(i.getParam("theme_advanced_styles","","hash"),function(r,q){var p;if(r){p="style_"+(o++);i.formatter.register(p,{inline:"span",classes:r,selector:"*"});l.add(k.editor.translate(q),p)}})}});if(l.getLength()==0){l.onPostRender.add(function(o,p){if(!l.NativeListBox){b.add(p.id+"_text","focus",k._importClasses,k);b.add(p.id+"_text","mousedown",k._importClasses,k);b.add(p.id+"_open","focus",k._importClasses,k);b.add(p.id+"_open","mousedown",k._importClasses,k)}else{b.add(p.id,"focus",k._importClasses,k)}})}return l},_createFontSelect:function(){var k,j=this,i=j.editor;k=i.controlManager.createListBox("fontselect",{title:"advanced.fontdefault",onselect:function(l){var m=k.items[k.selectedIndex];if(!l&&m){i.execCommand("FontName",false,m.value);return}i.execCommand("FontName",false,l);k.select(function(n){return l==n});return false}});if(k){f(i.getParam("theme_advanced_fonts",j.settings.theme_advanced_fonts,"hash"),function(m,l){k.add(i.translate(l),m,{style:m.indexOf("dings")==-1?"font-family:"+m:""})})}return k},_createFontSizeSelect:function(){var m=this,k=m.editor,n,l=0,j=[];n=k.controlManager.createListBox("fontsizeselect",{title:"advanced.font_size",onselect:function(i){var o=n.items[n.selectedIndex];if(!i&&o){o=o.value;if(o["class"]){k.formatter.toggle("fontsize_class",{value:o["class"]});k.undoManager.add();k.nodeChanged()}else{k.execCommand("FontSize",false,o.fontSize)}return}if(i["class"]){k.focus();k.undoManager.add();k.formatter.toggle("fontsize_class",{value:i["class"]});k.undoManager.add();k.nodeChanged()}else{k.execCommand("FontSize",false,i.fontSize)}n.select(function(p){return i==p});return false}});if(n){f(m.settings.theme_advanced_font_sizes,function(o,i){var p=o.fontSize;if(p>=1&&p<=7){p=m.sizes[parseInt(p)-1]+"pt"}n.add(i,o,{style:"font-size:"+p,"class":"mceFontSize"+(l++)+(" "+(o["class"]||""))})})}return n},_createBlockFormats:function(){var k,i={p:"advanced.paragraph",address:"advanced.address",pre:"advanced.pre",h1:"advanced.h1",h2:"advanced.h2",h3:"advanced.h3",h4:"advanced.h4",h5:"advanced.h5",h6:"advanced.h6",div:"advanced.div",blockquote:"advanced.blockquote",code:"advanced.code",dt:"advanced.dt",dd:"advanced.dd",samp:"advanced.samp"},j=this;k=j.editor.controlManager.createListBox("formatselect",{title:"advanced.block",cmd:"FormatBlock"});if(k){f(j.editor.getParam("theme_advanced_blockformats",j.settings.theme_advanced_blockformats,"hash"),function(m,l){k.add(j.editor.translate(l!=m?l:i[m]),m,{"class":"mce_formatPreview mce_"+m})})}return k},_createForeColorMenu:function(){var m,j=this,k=j.settings,l={},i;if(k.theme_advanced_more_colors){l.more_colors_func=function(){j._mceColorPicker(0,{color:m.value,func:function(n){m.setColor(n)}})}}if(i=k.theme_advanced_text_colors){l.colors=i}if(k.theme_advanced_default_foreground_color){l.default_color=k.theme_advanced_default_foreground_color}l.title="advanced.forecolor_desc";l.cmd="ForeColor";l.scope=this;m=j.editor.controlManager.createColorSplitButton("forecolor",l);return m},_createBackColorMenu:function(){var m,j=this,k=j.settings,l={},i;if(k.theme_advanced_more_colors){l.more_colors_func=function(){j._mceColorPicker(0,{color:m.value,func:function(n){m.setColor(n)}})}}if(i=k.theme_advanced_background_colors){l.colors=i}if(k.theme_advanced_default_background_color){l.default_color=k.theme_advanced_default_background_color}l.title="advanced.backcolor_desc";l.cmd="HiliteColor";l.scope=this;m=j.editor.controlManager.createColorSplitButton("backcolor",l);return m},renderUI:function(k){var m,l,q,v=this,r=v.editor,w=v.settings,u,j,i;m=j=d.create("span",{id:r.id+"_parent","class":"mceEditor "+r.settings.skin+"Skin"+(w.skin_variant?" "+r.settings.skin+"Skin"+v._ufirst(w.skin_variant):"")});if(!d.boxModel){m=d.add(m,"div",{"class":"mceOldBoxModel"})}m=u=d.add(m,"table",{id:r.id+"_tbl","class":"mceLayout",cellSpacing:0,cellPadding:0});m=q=d.add(m,"tbody");switch((w.theme_advanced_layout_manager||"").toLowerCase()){case"rowlayout":l=v._rowLayout(w,q,k);break;case"customlayout":l=r.execCallback("theme_advanced_custom_layout",w,q,k,j);break;default:l=v._simpleLayout(w,q,k,j)}m=k.targetNode;i=d.stdMode?u.getElementsByTagName("tr"):u.rows;d.addClass(i[0],"mceFirst");d.addClass(i[i.length-1],"mceLast");f(d.select("tr",q),function(o){d.addClass(o.firstChild,"mceFirst");d.addClass(o.childNodes[o.childNodes.length-1],"mceLast")});if(d.get(w.theme_advanced_toolbar_container)){d.get(w.theme_advanced_toolbar_container).appendChild(j)}else{d.insertAfter(j,m)}b.add(r.id+"_path_row","click",function(n){n=n.target;if(n.nodeName=="A"){v._sel(n.className.replace(/^.*mcePath_([0-9]+).*$/,"$1"));return b.cancel(n)}});if(!r.getParam("accessibility_focus")){b.add(d.add(j,"a",{href:"#"},"<!-- IE -->"),"focus",function(){tinyMCE.get(r.id).focus()})}if(w.theme_advanced_toolbar_location=="external"){k.deltaHeight=0}v.deltaHeight=k.deltaHeight;k.targetNode=null;return{iframeContainer:l,editorContainer:r.id+"_parent",sizeContainer:u,deltaHeight:k.deltaHeight}},getInfo:function(){return{longname:"Advanced theme",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",version:e.majorVersion+"."+e.minorVersion}},resizeBy:function(i,j){var k=d.get(this.editor.id+"_tbl");this.resizeTo(k.clientWidth+i,k.clientHeight+j)},resizeTo:function(i,l){var j=this.editor,k=this.settings,m=d.get(j.id+"_tbl"),n=d.get(j.id+"_ifr");i=Math.max(k.theme_advanced_resizing_min_width||100,i);l=Math.max(k.theme_advanced_resizing_min_height||100,l);i=Math.min(k.theme_advanced_resizing_max_width||65535,i);l=Math.min(k.theme_advanced_resizing_max_height||65535,l);d.setStyle(m,"height","");d.setStyle(n,"height",l);if(k.theme_advanced_resize_horizontal){d.setStyle(m,"width","");d.setStyle(n,"width",i);if(i<m.clientWidth){d.setStyle(n,"width",m.clientWidth)}}},destroy:function(){var i=this.editor.id;b.clear(i+"_resize");b.clear(i+"_path_row");b.clear(i+"_external_close")},_simpleLayout:function(y,r,k,i){var x=this,u=x.editor,v=y.theme_advanced_toolbar_location,m=y.theme_advanced_statusbar_location,l,j,q,w;if(y.readonly){l=d.add(r,"tr");l=j=d.add(l,"td",{"class":"mceIframeContainer"});return j}if(v=="top"){x._addToolbars(r,k)}if(v=="external"){l=w=d.create("div",{style:"position:relative"});l=d.add(l,"div",{id:u.id+"_external","class":"mceExternalToolbar"});d.add(l,"a",{id:u.id+"_external_close",href:"javascript:;","class":"mceExternalClose"});l=d.add(l,"table",{id:u.id+"_tblext",cellSpacing:0,cellPadding:0});q=d.add(l,"tbody");if(i.firstChild.className=="mceOldBoxModel"){i.firstChild.appendChild(w)}else{i.insertBefore(w,i.firstChild)}x._addToolbars(q,k);u.onMouseUp.add(function(){var o=d.get(u.id+"_external");d.show(o);d.hide(g);var n=b.add(u.id+"_external_close","click",function(){d.hide(u.id+"_external");b.remove(u.id+"_external_close","click",n)});d.show(o);d.setStyle(o,"top",0-d.getRect(u.id+"_tblext").h-1);d.hide(o);d.show(o);o.style.filter="";g=u.id+"_external";o=null})}if(m=="top"){x._addStatusBar(r,k)}if(!y.theme_advanced_toolbar_container){l=d.add(r,"tr");l=j=d.add(l,"td",{"class":"mceIframeContainer"})}if(v=="bottom"){x._addToolbars(r,k)}if(m=="bottom"){x._addStatusBar(r,k)}return j},_rowLayout:function(w,m,k){var v=this,p=v.editor,u,x,i=p.controlManager,l,j,r,q;u=w.theme_advanced_containers_default_class||"";x=w.theme_advanced_containers_default_align||"center";f(c(w.theme_advanced_containers||""),function(s,o){var n=w["theme_advanced_container_"+s]||"";switch(n.toLowerCase()){case"mceeditor":l=d.add(m,"tr");l=j=d.add(l,"td",{"class":"mceIframeContainer"});break;case"mceelementpath":v._addStatusBar(m,k);break;default:q=(w["theme_advanced_container_"+s+"_align"]||x).toLowerCase();q="mce"+v._ufirst(q);l=d.add(d.add(m,"tr"),"td",{"class":"mceToolbar "+(w["theme_advanced_container_"+s+"_class"]||u)+" "+q||x});r=i.createToolbar("toolbar"+o);v._addControls(n,r);d.setHTML(l,r.renderHTML());k.deltaHeight-=w.theme_advanced_row_height}});return j},_addControls:function(j,i){var k=this,l=k.settings,m,n=k.editor.controlManager;if(l.theme_advanced_disable&&!k._disabled){m={};f(c(l.theme_advanced_disable),function(o){m[o]=1});k._disabled=m}else{m=k._disabled}f(c(j),function(p){var o;if(m&&m[p]){return}if(p=="tablecontrols"){f(["table","|","row_props","cell_props","|","row_before","row_after","delete_row","|","col_before","col_after","delete_col","|","split_cells","merge_cells"],function(q){q=k.createControl(q,n);if(q){i.add(q)}});return}o=k.createControl(p,n);if(o){i.add(o)}})},_addToolbars:function(w,k){var z=this,p,m,r=z.editor,A=z.settings,y,j=r.controlManager,u,l,q=[],x;x=A.theme_advanced_toolbar_align.toLowerCase();x="mce"+z._ufirst(x);l=d.add(d.add(w,"tr"),"td",{"class":"mceToolbar "+x});if(!r.getParam("accessibility_focus")){q.push(d.createHTML("a",{href:"#",onfocus:"tinyMCE.get('"+r.id+"').focus();"},"<!-- IE -->"))}q.push(d.createHTML("a",{href:"#",accesskey:"q",title:r.getLang("advanced.toolbar_focus")},"<!-- IE -->"));for(p=1;(y=A["theme_advanced_buttons"+p]);p++){m=j.createToolbar("toolbar"+p,{"class":"mceToolbarRow"+p});if(A["theme_advanced_buttons"+p+"_add"]){y+=","+A["theme_advanced_buttons"+p+"_add"]}if(A["theme_advanced_buttons"+p+"_add_before"]){y=A["theme_advanced_buttons"+p+"_add_before"]+","+y}z._addControls(y,m);q.push(m.renderHTML());k.deltaHeight-=A.theme_advanced_row_height}q.push(d.createHTML("a",{href:"#",accesskey:"z",title:r.getLang("advanced.toolbar_focus"),onfocus:"tinyMCE.getInstanceById('"+r.id+"').focus();"},"<!-- IE -->"));d.setHTML(l,q.join(""))},_addStatusBar:function(m,j){var k,v=this,p=v.editor,w=v.settings,i,q,u,l;k=d.add(m,"tr");k=l=d.add(k,"td",{"class":"mceStatusbar"});k=d.add(k,"div",{id:p.id+"_path_row"},w.theme_advanced_path?p.translate("advanced.path")+": ":"&#160;");d.add(k,"a",{href:"#",accesskey:"x"});if(w.theme_advanced_resizing){d.add(l,"a",{id:p.id+"_resize",href:"javascript:;",onclick:"return false;","class":"mceResize"});if(w.theme_advanced_resizing_use_cookie){p.onPostRender.add(function(){var n=a.getHash("TinyMCE_"+p.id+"_size"),r=d.get(p.id+"_tbl");if(!n){return}v.resizeTo(n.cw,n.ch)})}p.onPostRender.add(function(){b.add(p.id+"_resize","mousedown",function(D){var t,r,s,o,C,z,A,F,n,E,x;function y(G){n=A+(G.screenX-C);E=F+(G.screenY-z);v.resizeTo(n,E)}function B(G){b.remove(d.doc,"mousemove",t);b.remove(p.getDoc(),"mousemove",r);b.remove(d.doc,"mouseup",s);b.remove(p.getDoc(),"mouseup",o);if(w.theme_advanced_resizing_use_cookie){a.setHash("TinyMCE_"+p.id+"_size",{cw:n,ch:E})}}D.preventDefault();C=D.screenX;z=D.screenY;x=d.get(v.editor.id+"_ifr");A=n=x.clientWidth;F=E=x.clientHeight;t=b.add(d.doc,"mousemove",y);r=b.add(p.getDoc(),"mousemove",y);s=b.add(d.doc,"mouseup",B);o=b.add(p.getDoc(),"mouseup",B)})})}j.deltaHeight-=21;k=m=null},_nodeChanged:function(r,z,l,x,j){var C=this,i,y=0,B,u,D=C.settings,A,k,w,m,q;e.each(C.stateControls,function(n){z.setActive(n,r.queryCommandState(C.controls[n][1]))});function o(p){var s,n=j.parents,t=p;if(typeof(p)=="string"){t=function(v){return v.nodeName==p}}for(s=0;s<n.length;s++){if(t(n[s])){return n[s]}}}z.setActive("visualaid",r.hasVisual);z.setDisabled("undo",!r.undoManager.hasUndo()&&!r.typing);z.setDisabled("redo",!r.undoManager.hasRedo());z.setDisabled("outdent",!r.queryCommandState("Outdent"));i=o("A");if(u=z.get("link")){if(!i||!i.name){u.setDisabled(!i&&x);u.setActive(!!i)}}if(u=z.get("unlink")){u.setDisabled(!i&&x);u.setActive(!!i&&!i.name)}if(u=z.get("anchor")){u.setActive(!!i&&i.name)}i=o("IMG");if(u=z.get("image")){u.setActive(!!i&&l.className.indexOf("mceItem")==-1)}if(u=z.get("styleselect")){C._importClasses();m=[];f(u.items,function(n){m.push(n.value)});q=r.formatter.matchAll(m);u.select(q[0])}if(u=z.get("formatselect")){i=o(d.isBlock);if(i){u.select(i.nodeName.toLowerCase())}}o(function(p){if(p.nodeName==="SPAN"){if(!A&&p.className){A=p.className}if(!k&&p.style.fontSize){k=p.style.fontSize}if(!w&&p.style.fontFamily){w=p.style.fontFamily.replace(/[\"\']+/g,"").replace(/^([^,]+).*/,"$1").toLowerCase()}}return false});if(u=z.get("fontselect")){u.select(function(n){return n.replace(/^([^,]+).*/,"$1").toLowerCase()==w})}if(u=z.get("fontsizeselect")){if(D.theme_advanced_runtime_fontsize&&!k&&!A){k=r.dom.getStyle(l,"fontSize",true)}u.select(function(n){if(n.fontSize&&n.fontSize===k){return true}if(n["class"]&&n["class"]===A){return true}})}if(D.theme_advanced_path&&D.theme_advanced_statusbar_location){i=d.get(r.id+"_path")||d.add(r.id+"_path_row","span",{id:r.id+"_path"});d.setHTML(i,"");o(function(E){var p=E.nodeName.toLowerCase(),s,v,t="";if(E.nodeType!=1||E.nodeName==="BR"||(d.hasClass(E,"mceItemHidden")||d.hasClass(E,"mceItemRemoved"))){return}if(B=d.getAttrib(E,"mce_name")){p=B}if(e.isIE&&E.scopeName!=="HTML"){p=E.scopeName+":"+p}p=p.replace(/mce\:/g,"");switch(p){case"b":p="strong";break;case"i":p="em";break;case"img":if(B=d.getAttrib(E,"src")){t+="src: "+B+" "}break;case"a":if(B=d.getAttrib(E,"name")){t+="name: "+B+" ";p+="#"+B}if(B=d.getAttrib(E,"href")){t+="href: "+B+" "}break;case"font":if(B=d.getAttrib(E,"face")){t+="font: "+B+" "}if(B=d.getAttrib(E,"size")){t+="size: "+B+" "}if(B=d.getAttrib(E,"color")){t+="color: "+B+" "}break;case"span":if(B=d.getAttrib(E,"style")){t+="style: "+B+" "}break}if(B=d.getAttrib(E,"id")){t+="id: "+B+" "}if(B=E.className){B=B.replace(/\b\s*(webkit|mce|Apple-)\w+\s*\b/g,"");if(B){t+="class: "+B+" ";if(d.isBlock(E)||p=="img"||p=="span"){p+="."+B}}}p=p.replace(/(html:)/g,"");p={name:p,node:E,title:t};C.onResolveName.dispatch(C,p);t=p.title;p=p.name;v=d.create("a",{href:"javascript:;",onmousedown:"return false;",title:t,"class":"mcePath_"+(y++)},p);if(i.hasChildNodes()){i.insertBefore(d.doc.createTextNode(" \u00bb "),i.firstChild);i.insertBefore(v,i.firstChild)}else{i.appendChild(v)}},r.getBody())}},_sel:function(i){this.editor.execCommand("mceSelectNodeDepth",false,i)},_mceInsertAnchor:function(k,j){var i=this.editor;i.windowManager.open({url:e.baseURL+"/themes/advanced/anchor.htm",width:320+parseInt(i.getLang("advanced.anchor_delta_width",0)),height:90+parseInt(i.getLang("advanced.anchor_delta_height",0)),inline:true},{theme_url:this.url})},_mceCharMap:function(){var i=this.editor;i.windowManager.open({url:e.baseURL+"/themes/advanced/charmap.htm",width:550+parseInt(i.getLang("advanced.charmap_delta_width",0)),height:250+parseInt(i.getLang("advanced.charmap_delta_height",0)),inline:true},{theme_url:this.url})},_mceHelp:function(){var i=this.editor;i.windowManager.open({url:e.baseURL+"/themes/advanced/about.htm",width:480,height:380,inline:true},{theme_url:this.url})},_mceColorPicker:function(k,j){var i=this.editor;j=j||{};i.windowManager.open({url:e.baseURL+"/themes/advanced/color_picker.htm",width:375+parseInt(i.getLang("advanced.colorpicker_delta_width",0)),height:250+parseInt(i.getLang("advanced.colorpicker_delta_height",0)),close_previous:false,inline:true},{input_color:j.color,func:j.func,theme_url:this.url})},_mceCodeEditor:function(j,k){var i=this.editor;i.windowManager.open({url:e.baseURL+"/themes/advanced/source_editor.htm",width:parseInt(i.getParam("theme_advanced_source_editor_width",720)),height:parseInt(i.getParam("theme_advanced_source_editor_height",580)),inline:true,resizable:true,maximizable:true},{theme_url:this.url})},_mceImage:function(j,k){var i=this.editor;if(i.dom.getAttrib(i.selection.getNode(),"class").indexOf("mceItem")!=-1){return}i.windowManager.open({url:e.baseURL+"/themes/advanced/image.htm",width:355+parseInt(i.getLang("advanced.image_delta_width",0)),height:275+parseInt(i.getLang("advanced.image_delta_height",0)),inline:true},{theme_url:this.url})},_mceLink:function(j,k){var i=this.editor;i.windowManager.open({url:e.baseURL+"/themes/advanced/link.htm",width:310+parseInt(i.getLang("advanced.link_delta_width",0)),height:200+parseInt(i.getLang("advanced.link_delta_height",0)),inline:true},{theme_url:this.url})},_mceNewDocument:function(){var i=this.editor;i.windowManager.confirm("advanced.newdocument",function(j){if(j){i.execCommand("mceSetContent",false,"")}})},_mceForeColor:function(){var i=this;this._mceColorPicker(0,{color:i.fgColor,func:function(j){i.fgColor=j;i.editor.execCommand("ForeColor",false,j)}})},_mceBackColor:function(){var i=this;this._mceColorPicker(0,{color:i.bgColor,func:function(j){i.bgColor=j;i.editor.execCommand("HiliteColor",false,j)}})},_ufirst:function(i){return i.substring(0,1).toUpperCase()+i.substring(1)}});e.ThemeManager.add("advanced",e.themes.AdvancedTheme)}(tinymce));tinyMCE.addI18n('en.advanced',{
style_select:"Styles",
font_size:"Font size",
fontdefault:"Font family",
block:"Format",
paragraph:"Paragraph",
div:"Div",
address:"Address",
pre:"Preformatted",
h1:"Heading 1",
h2:"Heading 2",
h3:"Heading 3",
h4:"Heading 4",
h5:"Heading 5",
h6:"Heading 6",
blockquote:"Blockquote",
code:"Code",
samp:"Code sample",
dt:"Definition term ",
dd:"Definition description",
bold_desc:"Bold (Ctrl+B)",
italic_desc:"Italic (Ctrl+I)",
underline_desc:"Underline (Ctrl+U)",
striketrough_desc:"Strikethrough",
justifyleft_desc:"Align left",
justifycenter_desc:"Align center",
justifyright_desc:"Align right",
justifyfull_desc:"Align full",
bullist_desc:"Unordered list",
numlist_desc:"Ordered list",
outdent_desc:"Outdent",
indent_desc:"Indent",
undo_desc:"Undo (Ctrl+Z)",
redo_desc:"Redo (Ctrl+Y)",
link_desc:"Insert/edit link",
unlink_desc:"Unlink",
image_desc:"Insert/edit image",
cleanup_desc:"Cleanup messy code",
code_desc:"Edit HTML Source",
sub_desc:"Subscript",
sup_desc:"Superscript",
hr_desc:"Insert horizontal ruler",
removeformat_desc:"Remove formatting",
custom1_desc:"Your custom description here",
forecolor_desc:"Select text color",
backcolor_desc:"Select background color",
charmap_desc:"Insert custom character",
visualaid_desc:"Toggle guidelines/invisible elements",
anchor_desc:"Insert/edit anchor",
cut_desc:"Cut",
copy_desc:"Copy",
paste_desc:"Paste",
image_props_desc:"Image properties",
newdocument_desc:"New document",
help_desc:"Help",
blockquote_desc:"Blockquote",
clipboard_msg:"Copy/Cut/Paste is not available in Mozilla and Firefox.\r\nDo you want more information about this issue?",
path:"Path",
newdocument:"Are you sure you want clear all contents?",
toolbar_focus:"Jump to tool buttons - Alt+Q, Jump to editor - Alt-Z, Jump to element path - Alt-X",
more_colors:"More colors"
});(function(){var c=tinymce.each,d=null,a={paste_auto_cleanup_on_paste:true,paste_block_drop:false,paste_retain_style_properties:"none",paste_strip_class_attributes:"mso",paste_remove_spans:false,paste_remove_styles:false,paste_remove_styles_if_webkit:true,paste_convert_middot_lists:true,paste_convert_headers_to_strong:false,paste_dialog_width:"450",paste_dialog_height:"400",paste_text_use_dialog:false,paste_text_sticky:false,paste_text_notifyalways:false,paste_text_linebreaktype:"p",paste_text_replacements:[[/\u2026/g,"..."],[/[\x93\x94\u201c\u201d]/g,'"'],[/[\x60\x91\x92\u2018\u2019]/g,"'"]]};function b(e,f){return e.getParam(f,a[f])}tinymce.create("tinymce.plugins.PastePlugin",{init:function(e,f){var g=this;g.editor=e;g.url=f;g.onPreProcess=new tinymce.util.Dispatcher(g);g.onPostProcess=new tinymce.util.Dispatcher(g);g.onPreProcess.add(g._preProcess);g.onPostProcess.add(g._postProcess);g.onPreProcess.add(function(j,k){e.execCallback("paste_preprocess",j,k)});g.onPostProcess.add(function(j,k){e.execCallback("paste_postprocess",j,k)});e.pasteAsPlainText=false;function i(l,j){var k=e.dom;g.onPreProcess.dispatch(g,l);l.node=k.create("div",0,l.content);g.onPostProcess.dispatch(g,l);l.content=e.serializer.serialize(l.node,{getInner:1});if((!j)&&(e.pasteAsPlainText)){g._insertPlainText(e,k,l.content);if(!b(e,"paste_text_sticky")){e.pasteAsPlainText=false;e.controlManager.setActive("pastetext",false)}}else{if(/<(p|h[1-6]|ul|ol)/.test(l.content)){g._insertBlockContent(e,k,l.content)}else{g._insert(l.content)}}}e.addCommand("mceInsertClipboardContent",function(j,k){i(k,true)});if(!b(e,"paste_text_use_dialog")){e.addCommand("mcePasteText",function(k,j){var l=tinymce.util.Cookie;e.pasteAsPlainText=!e.pasteAsPlainText;e.controlManager.setActive("pastetext",e.pasteAsPlainText);if((e.pasteAsPlainText)&&(!l.get("tinymcePasteText"))){if(b(e,"paste_text_sticky")){e.windowManager.alert(e.translate("paste.plaintext_mode_sticky"))}else{e.windowManager.alert(e.translate("paste.plaintext_mode_sticky"))}if(!b(e,"paste_text_notifyalways")){l.set("tinymcePasteText","1",new Date(new Date().getFullYear()+1,12,31))}}})}e.addButton("pastetext",{title:"paste.paste_text_desc",cmd:"mcePasteText"});e.addButton("selectall",{title:"paste.selectall_desc",cmd:"selectall"});function h(s){var m,q,k,l=e.selection,p=e.dom,r=e.getBody(),j;if(e.pasteAsPlainText&&(s.clipboardData||p.doc.dataTransfer)){s.preventDefault();i({content:(s.clipboardData||p.doc.dataTransfer).getData("Text")},true);return}if(p.get("_mcePaste")){return}m=p.add(r,"div",{id:"_mcePaste","class":"mcePaste"},'\uFEFF<br _mce_bogus="1">');if(r!=e.getDoc().body){j=p.getPos(e.selection.getStart(),r).y}else{j=r.scrollTop}p.setStyles(m,{position:"absolute",left:-10000,top:j,width:1,height:1,overflow:"hidden"});if(tinymce.isIE){k=p.doc.body.createTextRange();k.moveToElementText(m);k.execCommand("Paste");p.remove(m);if(m.innerHTML==="\uFEFF"){e.execCommand("mcePasteWord");s.preventDefault();return}i({content:m.innerHTML});return tinymce.dom.Event.cancel(s)}else{function o(n){n.preventDefault()}p.bind(e.getDoc(),"mousedown",o);p.bind(e.getDoc(),"keydown",o);q=e.selection.getRng();m=m.firstChild;k=e.getDoc().createRange();k.setStart(m,0);k.setEnd(m,1);l.setRng(k);window.setTimeout(function(){var t="",n=p.select("div.mcePaste");c(n,function(v){var u=v.firstChild;if(u&&u.nodeName=="DIV"&&u.style.marginTop&&u.style.backgroundColor){p.remove(u,1)}c(p.select("div.mcePaste",v),function(w){p.remove(w,1)});c(p.select("span.Apple-style-span",v),function(w){p.remove(w,1)});c(p.select("br[_mce_bogus]",v),function(w){p.remove(w)});t+=v.innerHTML});c(n,function(u){p.remove(u)});if(q){l.setRng(q)}i({content:t});p.unbind(e.getDoc(),"mousedown",o);p.unbind(e.getDoc(),"keydown",o)},0)}}if(b(e,"paste_auto_cleanup_on_paste")){if(tinymce.isOpera||/Firefox\/2/.test(navigator.userAgent)){e.onKeyDown.add(function(j,k){if(((tinymce.isMac?k.metaKey:k.ctrlKey)&&k.keyCode==86)||(k.shiftKey&&k.keyCode==45)){h(k)}})}else{e.onPaste.addToTop(function(j,k){return h(k)})}}if(b(e,"paste_block_drop")){e.onInit.add(function(){e.dom.bind(e.getBody(),["dragend","dragover","draggesture","dragdrop","drop","drag"],function(j){j.preventDefault();j.stopPropagation();return false})})}g._legacySupport()},getInfo:function(){return{longname:"Paste text/word",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",infourl:"http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/paste",version:tinymce.majorVersion+"."+tinymce.minorVersion}},_preProcess:function(i,f){var l=this.editor,k=f.content,q=tinymce.grep,p=tinymce.explode,g=tinymce.trim,m,j;function e(h){c(h,function(o){if(o.constructor==RegExp){k=k.replace(o,"")}else{k=k.replace(o[0],o[1])}})}if(/class="?Mso|style="[^"]*\bmso-|w:WordDocument/i.test(k)||f.wordContent){f.wordContent=true;e([/^\s*(&nbsp;)+/gi,/(&nbsp;|<br[^>]*>)+\s*$/gi]);if(b(l,"paste_convert_headers_to_strong")){k=k.replace(/<p [^>]*class="?MsoHeading"?[^>]*>(.*?)<\/p>/gi,"<p><strong>$1</strong></p>")}if(b(l,"paste_convert_middot_lists")){e([[/<!--\[if !supportLists\]-->/gi,"$&__MCE_ITEM__"],[/(<span[^>]+(?:mso-list:|:\s*symbol)[^>]+>)/gi,"$1__MCE_ITEM__"]])}e([/<!--[\s\S]+?-->/gi,/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,[/<(\/?)s>/gi,"<$1strike>"],[/&nbsp;/gi,"\u00a0"]]);do{m=k.length;k=k.replace(/(<[a-z][^>]*\s)(?:id|name|language|type|on\w+|\w+:\w+)=(?:"[^"]*"|\w+)\s?/gi,"$1")}while(m!=k.length);if(b(l,"paste_retain_style_properties").replace(/^none$/i,"").length==0){k=k.replace(/<\/?span[^>]*>/gi,"")}else{e([[/<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi,function(o,h){return(h.length>0)?h.replace(/./," ").slice(Math.floor(h.length/2)).split("").join("\u00a0"):""}],[/(<[a-z][^>]*)\sstyle="([^"]*)"/gi,function(u,h,t){var v=[],o=0,r=p(g(t).replace(/&quot;/gi,"'"),";");c(r,function(s){var w,y,z=p(s,":");function x(A){return A+((A!=="0")&&(/\d$/.test(A)))?"px":""}if(z.length==2){w=z[0].toLowerCase();y=z[1].toLowerCase();switch(w){case"mso-padding-alt":case"mso-padding-top-alt":case"mso-padding-right-alt":case"mso-padding-bottom-alt":case"mso-padding-left-alt":case"mso-margin-alt":case"mso-margin-top-alt":case"mso-margin-right-alt":case"mso-margin-bottom-alt":case"mso-margin-left-alt":case"mso-table-layout-alt":case"mso-height":case"mso-width":case"mso-vertical-align-alt":v[o++]=w.replace(/^mso-|-alt$/g,"")+":"+x(y);return;case"horiz-align":v[o++]="text-align:"+y;return;case"vert-align":v[o++]="vertical-align:"+y;return;case"font-color":case"mso-foreground":v[o++]="color:"+y;return;case"mso-background":case"mso-highlight":v[o++]="background:"+y;return;case"mso-default-height":v[o++]="min-height:"+x(y);return;case"mso-default-width":v[o++]="min-width:"+x(y);return;case"mso-padding-between-alt":v[o++]="border-collapse:separate;border-spacing:"+x(y);return;case"text-line-through":if((y=="single")||(y=="double")){v[o++]="text-decoration:line-through"}return;case"mso-zero-height":if(y=="yes"){v[o++]="display:none"}return}if(/^(mso|column|font-emph|lang|layout|line-break|list-image|nav|panose|punct|row|ruby|sep|size|src|tab-|table-border|text-(?!align|decor|indent|trans)|top-bar|version|vnd|word-break)/.test(w)){return}v[o++]=w+":"+z[1]}});if(o>0){return h+' style="'+v.join(";")+'"'}else{return h}}]])}}if(b(l,"paste_convert_headers_to_strong")){e([[/<h[1-6][^>]*>/gi,"<p><strong>"],[/<\/h[1-6][^>]*>/gi,"</strong></p>"]])}j=b(l,"paste_strip_class_attributes");if(j!=="none"){function n(r,o){if(j==="all"){return""}var h=q(p(o.replace(/^(["'])(.*)\1$/,"$2")," "),function(s){return(/^(?!mso)/i.test(s))});return h.length?' class="'+h.join(" ")+'"':""}k=k.replace(/ class="([^"]+)"/gi,n);k=k.replace(/ class=(\w+)/gi,n)}if(b(l,"paste_remove_spans")){k=k.replace(/<\/?span[^>]*>/gi,"")}f.content=k},_postProcess:function(h,j){var g=this,f=g.editor,i=f.dom,e;if(j.wordContent){c(i.select("a",j.node),function(k){if(!k.href||k.href.indexOf("#_Toc")!=-1){i.remove(k,1)}});if(b(f,"paste_convert_middot_lists")){g._convertLists(h,j)}e=b(f,"paste_retain_style_properties");if((tinymce.is(e,"string"))&&(e!=="all")&&(e!=="*")){e=tinymce.explode(e.replace(/^none$/i,""));c(i.select("*",j.node),function(n){var o={},l=0,m,p,k;if(e){for(m=0;m<e.length;m++){p=e[m];k=i.getStyle(n,p);if(k){o[p]=k;l++}}}i.setAttrib(n,"style","");if(e&&l>0){i.setStyles(n,o)}else{if(n.nodeName=="SPAN"&&!n.className){i.remove(n,true)}}})}}if(b(f,"paste_remove_styles")||(b(f,"paste_remove_styles_if_webkit")&&tinymce.isWebKit)){c(i.select("*[style]",j.node),function(k){k.removeAttribute("style");k.removeAttribute("_mce_style")})}else{if(tinymce.isWebKit){c(i.select("*",j.node),function(k){k.removeAttribute("_mce_style")})}}},_convertLists:function(h,f){var j=h.editor.dom,i,m,e=-1,g,n=[],l,k;c(j.select("p",f.node),function(u){var r,v="",t,s,o,q;for(r=u.firstChild;r&&r.nodeType==3;r=r.nextSibling){v+=r.nodeValue}v=u.innerHTML.replace(/<\/?\w+[^>]*>/gi,"").replace(/&nbsp;/g,"\u00a0");if(/^(__MCE_ITEM__)+[\u2022\u00b7\u00a7\u00d8o]\s*\u00a0*/.test(v)){t="ul"}if(/^__MCE_ITEM__\s*\w+\.\s*\u00a0{2,}/.test(v)){t="ol"}if(t){g=parseFloat(u.style.marginLeft||0);if(g>e){n.push(g)}if(!i||t!=l){i=j.create(t);j.insertAfter(i,u)}else{if(g>e){i=m.appendChild(j.create(t))}else{if(g<e){o=tinymce.inArray(n,g);q=j.getParents(i.parentNode,t);i=q[q.length-1-o]||i}}}c(j.select("span",u),function(w){var p=w.innerHTML.replace(/<\/?\w+[^>]*>/gi,"");if(t=="ul"&&/^[\u2022\u00b7\u00a7\u00d8o]/.test(p)){j.remove(w)}else{if(/^[\s\S]*\w+\.(&nbsp;|\u00a0)*\s*/.test(p)){j.remove(w)}}});s=u.innerHTML;if(t=="ul"){s=u.innerHTML.replace(/__MCE_ITEM__/g,"").replace(/^[\u2022\u00b7\u00a7\u00d8o]\s*(&nbsp;|\u00a0)+\s*/,"")}else{s=u.innerHTML.replace(/__MCE_ITEM__/g,"").replace(/^\s*\w+\.(&nbsp;|\u00a0)+\s*/,"")}m=i.appendChild(j.create("li",0,s));j.remove(u);e=g;l=t}else{i=e=0}});k=f.node.innerHTML;if(k.indexOf("__MCE_ITEM__")!=-1){f.node.innerHTML=k.replace(/__MCE_ITEM__/g,"")}},_insertBlockContent:function(l,h,m){var f,j,g=l.selection,q,n,e,o,i,k="mce_marker";function p(t){var s;if(tinymce.isIE){s=l.getDoc().body.createTextRange();s.moveToElementText(t);s.collapse(false);s.select()}else{g.select(t,1);g.collapse(false)}}this._insert('<span id="'+k+'"></span>',1);j=h.get(k);f=h.getParent(j,"p,h1,h2,h3,h4,h5,h6,ul,ol,th,td");if(f&&!/TD|TH/.test(f.nodeName)){j=h.split(f,j);c(h.create("div",0,m).childNodes,function(r){q=j.parentNode.insertBefore(r.cloneNode(true),j)});p(q)}else{h.setOuterHTML(j,m);g.select(l.getBody(),1);g.collapse(0)}while(n=h.get(k)){h.remove(n)}n=g.getStart();e=h.getViewPort(l.getWin());o=l.dom.getPos(n).y;i=n.clientHeight;if(o<e.y||o+i>e.y+e.h){l.getDoc().body.scrollTop=o<e.y?o:o-e.h+25}},_insert:function(g,e){var f=this.editor,i=f.selection.getRng();if(!f.selection.isCollapsed()&&i.startContainer!=i.endContainer){f.getDoc().execCommand("Delete",false,null)}f.execCommand(tinymce.isGecko?"insertHTML":"mceInsertContent",false,g,{skip_undo:e})},_insertPlainText:function(j,x,v){var t,u,l,k,r,e,p,f,n=j.getWin(),z=j.getDoc(),s=j.selection,m=tinymce.is,y=tinymce.inArray,g=b(j,"paste_text_linebreaktype"),o=b(j,"paste_text_replacements");function q(h){c(h,function(i){if(i.constructor==RegExp){v=v.replace(i,"")}else{v=v.replace(i[0],i[1])}})}if((typeof(v)==="string")&&(v.length>0)){if(!d){d=("34,quot,38,amp,39,apos,60,lt,62,gt,"+j.serializer.settings.entities).split(",")}if(/<(?:p|br|h[1-6]|ul|ol|dl|table|t[rdh]|div|blockquote|fieldset|pre|address|center)[^>]*>/i.test(v)){q([/[\n\r]+/g])}else{q([/\r+/g])}q([[/<\/(?:p|h[1-6]|ul|ol|dl|table|div|blockquote|fieldset|pre|address|center)>/gi,"\n\n"],[/<br[^>]*>|<\/tr>/gi,"\n"],[/<\/t[dh]>\s*<t[dh][^>]*>/gi,"\t"],/<[a-z!\/?][^>]*>/gi,[/&nbsp;/gi," "],[/&(#\d+|[a-z0-9]{1,10});/gi,function(i,h){if(h.charAt(0)==="#"){return String.fromCharCode(h.slice(1))}else{return((i=y(d,h))>0)?String.fromCharCode(d[i-1]):" "}}],[/(?:(?!\n)\s)*(\n+)(?:(?!\n)\s)*/gi,"$1"],[/\n{3,}/g,"\n\n"],/^\s+|\s+$/g]);v=x.encode(v);if(!s.isCollapsed()){z.execCommand("Delete",false,null)}if(m(o,"array")||(m(o,"array"))){q(o)}else{if(m(o,"string")){q(new RegExp(o,"gi"))}}if(g=="none"){q([[/\n+/g," "]])}else{if(g=="br"){q([[/\n/g,"<br />"]])}else{q([/^\s+|\s+$/g,[/\n\n/g,"</p><p>"],[/\n/g,"<br />"]])}}if((l=v.indexOf("</p><p>"))!=-1){k=v.lastIndexOf("</p><p>");r=s.getNode();e=[];do{if(r.nodeType==1){if(r.nodeName=="TD"||r.nodeName=="BODY"){break}e[e.length]=r}}while(r=r.parentNode);if(e.length>0){p=v.substring(0,l);f="";for(t=0,u=e.length;t<u;t++){p+="</"+e[t].nodeName.toLowerCase()+">";f+="<"+e[e.length-t-1].nodeName.toLowerCase()+">"}if(l==k){v=p+f+v.substring(l+7)}else{v=p+v.substring(l+4,k+4)+f+v.substring(k+7)}}}j.execCommand("mceInsertRawHTML",false,v+'<span id="_plain_text_marker">&nbsp;</span>');window.setTimeout(function(){var h=x.get("_plain_text_marker"),B,i,A,w;s.select(h,false);z.execCommand("Delete",false,null);h=null;B=s.getStart();i=x.getViewPort(n);A=x.getPos(B).y;w=B.clientHeight;if((A<i.y)||(A+w>i.y+i.h)){z.body.scrollTop=A<i.y?A:A-i.h+25}},0)}},_legacySupport:function(){var f=this,e=f.editor;e.addCommand("mcePasteWord",function(){e.windowManager.open({file:f.url+"/pasteword.htm",width:parseInt(b(e,"paste_dialog_width")),height:parseInt(b(e,"paste_dialog_height")),inline:1})});if(b(e,"paste_text_use_dialog")){e.addCommand("mcePasteText",function(){e.windowManager.open({file:f.url+"/pastetext.htm",width:parseInt(b(e,"paste_dialog_width")),height:parseInt(b(e,"paste_dialog_height")),inline:1})})}e.addButton("pasteword",{title:"paste.paste_word_desc",cmd:"mcePasteWord"})}});tinymce.PluginManager.add("paste",tinymce.plugins.PastePlugin)})();
(function() {
    tinymce.create('tinymce.plugins.wicked', {

        init : function(ed, url) {
            var t = this;
            t.editor = ed;
            t.url = url;

            // Register commands
            ed.addCommand('isoAddWicked', t.isoAddWicked, t);
            ed.addCommand('isoDelWicked', t.isoDelWicked, t);

            // Register node change handler
            ed.onNodeChange.add(function(ed, cm, n, co) {
                    t.handleNodeChange(ed, cm, n, co);
                }); 

            // Register buttons
            ed.addButton('addwickedlink', {
                    title : 'wicked.addwicked_desc',
                    cmd : 'isoAddWicked',
                    image: t.url + '/images/addwicked.gif'});
            ed.addButton('delwickedlink', {
                    title : 'wicked.delwicked_desc',
                    cmd : 'isoDelWicked',
                    image: t.url + '/images/delwicked.gif'});

        },

        getInfo : function getInfo() {
            return {
                longname : 'Wicked plugin',
                author : 'Balazs Ree <ree@greenfinity.hu>',
                authorurl : '',
                infourl : '',
                version : "1.1"
                };
        },

        re_wikilink: /^\(\(.*?\)\)$/,

        //
        // Node change handler
        //

        handleNodeChange : function handleNodeChange(ed, cm, n, co) {
            var sel = ed.selection;
            // See if we have a selection.
            if (! sel.isCollapsed()) {
                // Check if the selection exactly contains
                // a wiki link (( ... ))
                var selectedText = sel.getContent();
                if (this.re_wikilink.test(selectedText)) {
                    // Selection is a wiki link.
                    // Disable add and enable del button.
                    cm.setDisabled('addwickedlink', true); 
                    cm.setDisabled('delwickedlink', false); 
                } else {
                    // Selection is not wiki link.
                    // Enable add and disable del button.
                    cm.setDisabled('addwickedlink', false); 
                    cm.setDisabled('delwickedlink', true); 
                }
            } else {
                // No selection. Disable both buttons.
                cm.setDisabled('addwickedlink', true); 
                cm.setDisabled('delwickedlink', true);
            }
            return true;
        },
       
        //
        // Commands
        //
        isoAddWicked: function isoAddWicked(cmd, ui, val) {
            var ed = this.editor;
            var sel = ed.selection;
            // See if we have a selection.
            if (! sel.isCollapsed()) {
                // Set new value for the selection.
                var selectedText = sel.getContent();
                sel.setContent('((' + selectedText + '))');
            }
        },

        isoDelWicked: function isoDelWicked(cmd, ui, val) {
            var ed = this.editor;
            var sel = ed.selection;
            // See if we have a selection.
            if (! sel.isCollapsed()) {
                // Check if the selection exactly contains
                // a wiki link (( ... ))
                var selectedText = sel.getContent();
                if (this.re_wikilink.test(selectedText)) {
                    // Set new value for the selection.
                    sel.setContent(selectedText.slice(2, -2));
                }
            }
        }

    });

    // Register plugin
    tinymce.PluginManager.add('wicked', tinymce.plugins.wicked);
    tinymce.PluginManager.requireLangPack('wicked');

})();
// UK lang variables
tinyMCE.addI18n('en.wicked',{
    addwicked_desc : 'Add Wiki link',
    delwicked_desc : 'Remove Wiki link'
});
/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 *
 * Changed: 2010 Balazs Ree <ree@greenfinity.hu>: fixed bug on IE
 *      caused saving fail, when getContent called while spellchecker active
 *      triggered by save during active=1
 */

(function() {
	var JSONRequest = tinymce.util.JSONRequest, each = tinymce.each, DOM = tinymce.DOM;

	tinymce.create('tinymce.plugins.SpellcheckerPlugin', {
		getInfo : function() {
			return {
				longname : 'Spellchecker',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/spellchecker',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		init : function(ed, url) {
			var t = this, cm;

			t.url = url;
			t.editor = ed;
			t.rpcUrl = ed.getParam("spellchecker_rpc_url", "{backend}");

			if (t.rpcUrl == '{backend}') {
				// Sniff if the browser supports native spellchecking (Don't know of a better way)
				if (tinymce.isIE)
					return;

				t.hasSupport = true;

				// Disable the context menu when spellchecking is active
				ed.onContextMenu.addToTop(function(ed, e) {
					if (t.active)
						return false;
				});
			}

			// Register commands
			ed.addCommand('mceSpellCheck', function() {
				if (t.rpcUrl == '{backend}') {
					// Enable/disable native spellchecker
					t.editor.getBody().spellcheck = t.active = !t.active;
					return;
				}

				if (!t.active) {
					ed.setProgressState(1);
					t._sendRPC('checkWords', [t.selectedLang, t._getWords()], function(r) {
						if (r.length > 0) {
							t.active = 1;
							t._markWords(r);
							ed.setProgressState(0);
							ed.nodeChanged();
						} else {
							ed.setProgressState(0);

							if (ed.getParam('spellchecker_report_no_misspellings', true))
								ed.windowManager.alert('spellchecker.no_mpell');
						}
					});
				} else
					t._done();
			});

			ed.onInit.add(function() {
				if (ed.settings.content_css !== false)
					ed.dom.loadCSS(url + '/css/content.css');
			});

			ed.onClick.add(t._showMenu, t);
			ed.onContextMenu.add(t._showMenu, t);

                        // XXX Balazs Ree <ree@greenfinity.hu>
                        // This is not needed
                        // since _done takes care of the same.
			//ed.onBeforeGetContent.add(function() {
			//	if (t.active)
			//		t._removeWords();
			//});

			ed.onNodeChange.add(function(ed, cm) {
				cm.setActive('spellchecker', t.active);
			});

			ed.onSetContent.add(function() {
				t._done();
			});

			ed.onBeforeGetContent.add(function() {
				t._done();
			});

			ed.onBeforeExecCommand.add(function(ed, cmd) {
				if (cmd == 'mceFullScreen')
					t._done();
			});

			// Find selected language
			t.languages = {};
			each(ed.getParam('spellchecker_languages', '+English=en,Danish=da,Dutch=nl,Finnish=fi,French=fr,German=de,Italian=it,Polish=pl,Portuguese=pt,Spanish=es,Swedish=sv', 'hash'), function(v, k) {
				if (k.indexOf('+') === 0) {
					k = k.substring(1);
					t.selectedLang = v;
				}

				t.languages[k] = v;
			});
		},

		createControl : function(n, cm) {
			var t = this, c, ed = t.editor;

			if (n == 'spellchecker') {
				// Use basic button if we use the native spellchecker
				if (t.rpcUrl == '{backend}') {
					// Create simple toggle button if we have native support
					if (t.hasSupport)
						c = cm.createButton(n, {title : 'spellchecker.desc', cmd : 'mceSpellCheck', scope : t});

					return c;
				}

				c = cm.createSplitButton(n, {title : 'spellchecker.desc', cmd : 'mceSpellCheck', scope : t});

				c.onRenderMenu.add(function(c, m) {
					m.add({title : 'spellchecker.langs', 'class' : 'mceMenuItemTitle'}).setDisabled(1);
					each(t.languages, function(v, k) {
						var o = {icon : 1}, mi;

						o.onclick = function() {
							mi.setSelected(1);
							t.selectedItem.setSelected(0);
							t.selectedItem = mi;
							t.selectedLang = v;
						};

						o.title = k;
						mi = m.add(o);
						mi.setSelected(v == t.selectedLang);

						if (v == t.selectedLang)
							t.selectedItem = mi;
					})
				});

				return c;
			}
		},

		// Internal functions

		_walk : function(n, f) {
			var d = this.editor.getDoc(), w;

			if (d.createTreeWalker) {
				w = d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false);

				while ((n = w.nextNode()) != null)
					f.call(this, n);
			} else
				tinymce.walk(n, f, 'childNodes');
		},

		_getSeparators : function() {
			var re = '', i, str = this.editor.getParam('spellchecker_word_separator_chars', '\\s!"#$%&()*+,-./:;<=>?@[\]^_{|}����������������\u201d\u201c');

			// Build word separator regexp
			for (i=0; i<str.length; i++)
				re += '\\' + str.charAt(i);

			return re;
		},

		_getWords : function() {
			var ed = this.editor, wl = [], tx = '', lo = {}, rawWords = [];

			// Get area text
			this._walk(ed.getBody(), function(n) {
				if (n.nodeType == 3)
					tx += n.nodeValue + ' ';
			});

			// split the text up into individual words
			if (ed.getParam('spellchecker_word_pattern')) {
				// look for words that match the pattern
				rawWords = tx.match('(' + ed.getParam('spellchecker_word_pattern') + ')', 'gi');
			} else {
				// Split words by separator
				tx = tx.replace(new RegExp('([0-9]|[' + this._getSeparators() + '])', 'g'), ' ');
				tx = tinymce.trim(tx.replace(/(\s+)/g, ' '));
				rawWords = tx.split(' ');
			}

			// Build word array and remove duplicates
			each(rawWords, function(v) {
				if (!lo[v]) {
					wl.push(v);
					lo[v] = 1;
				}
			});

			return wl;
		},

		_removeWords : function(w) {
			var ed = this.editor, dom = ed.dom, se = ed.selection;
                        
                        // XXX Balazs Ree <ree@greenfinity.hu>
                        // fix bug that happens when saving with spellchecker active.
                        // This solution is suggested at:
                        // http://tinymce.moxiecode.com/punbb/viewtopic.php?id=21936
                        // The bug is actually in tinymce code, getBookmark(). It
                        // will probably get fixed in some next version.
                        ed.focus();
                        
                        var b = se.getBookmark();

			each(dom.select('span').reverse(), function(n) {
				if (n && (dom.hasClass(n, 'mceItemHiddenSpellWord') || dom.hasClass(n, 'mceItemHidden'))) {
					if (!w || dom.decode(n.innerHTML) == w)
						dom.remove(n, 1);
				}
			});

			se.moveToBookmark(b);
		},

		_markWords : function(wl) {
			var r1, r2, r3, r4, r5, w = '', ed = this.editor, re = this._getSeparators(), dom = ed.dom, nl = [];
			var se = ed.selection, b = se.getBookmark();

			each(wl, function(v) {
				w += (w ? '|' : '') + v;
			});

			r1 = new RegExp('([' + re + '])(' + w + ')([' + re + '])', 'g');
			r2 = new RegExp('^(' + w + ')', 'g');
			r3 = new RegExp('(' + w + ')([' + re + ']?)$', 'g');
			r4 = new RegExp('^(' + w + ')([' + re + ']?)$', 'g');
			r5 = new RegExp('(' + w + ')([' + re + '])', 'g');

			// Collect all text nodes
			this._walk(this.editor.getBody(), function(n) {
				if (n.nodeType == 3) {
					nl.push(n);
				}
			});

			// Wrap incorrect words in spans
			each(nl, function(n) {
				var v;

				if (n.nodeType == 3) {
					v = n.nodeValue;

					if (r1.test(v) || r2.test(v) || r3.test(v) || r4.test(v)) {
						v = dom.encode(v);
						v = v.replace(r5, '<span class="mceItemHiddenSpellWord">$1</span>$2');
						v = v.replace(r3, '<span class="mceItemHiddenSpellWord">$1</span>$2');

						dom.replace(dom.create('span', {'class' : 'mceItemHidden'}, v), n);
					}
				}
			});

			se.moveToBookmark(b);
		},

		_showMenu : function(ed, e) {
			var t = this, ed = t.editor, m = t._menu, p1, dom = ed.dom, vp = dom.getViewPort(ed.getWin()), wordSpan = e.target;

			e = 0; // Fixes IE memory leak

			if (!m) {
				p1 = DOM.getPos(ed.getContentAreaContainer());
				//p2 = DOM.getPos(ed.getContainer());

				m = ed.controlManager.createDropMenu('spellcheckermenu', {
					offset_x : p1.x,
					offset_y : p1.y,
					'class' : 'mceNoIcons'
				});

				t._menu = m;
			}

			if (dom.hasClass(wordSpan, 'mceItemHiddenSpellWord')) {
				m.removeAll();
				m.add({title : 'spellchecker.wait', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

				t._sendRPC('getSuggestions', [t.selectedLang, dom.decode(wordSpan.innerHTML)], function(r) {
					var ignoreRpc;

					m.removeAll();

					if (r.length > 0) {
						m.add({title : 'spellchecker.sug', 'class' : 'mceMenuItemTitle'}).setDisabled(1);
						each(r, function(v) {
							m.add({title : v, onclick : function() {
								dom.replace(ed.getDoc().createTextNode(v), wordSpan);
								t._checkDone();
							}});
						});

						m.addSeparator();
					} else
						m.add({title : 'spellchecker.no_sug', 'class' : 'mceMenuItemTitle'}).setDisabled(1);

					ignoreRpc = t.editor.getParam("spellchecker_enable_ignore_rpc", '');
					m.add({
						title : 'spellchecker.ignore_word',
						onclick : function() {
							var word = wordSpan.innerHTML;

							dom.remove(wordSpan, 1);
							t._checkDone();

							// tell the server if we need to
							if (ignoreRpc) {
								ed.setProgressState(1);
								t._sendRPC('ignoreWord', [t.selectedLang, word], function(r) {
									ed.setProgressState(0);
								});
							}
						}
					});

					m.add({
						title : 'spellchecker.ignore_words',
						onclick : function() {
							var word = wordSpan.innerHTML;

							t._removeWords(dom.decode(word));
							t._checkDone();

							// tell the server if we need to
							if (ignoreRpc) {
								ed.setProgressState(1);
								t._sendRPC('ignoreWords', [t.selectedLang, word], function(r) {
									ed.setProgressState(0);
								});
							}
						}
					});


					if (t.editor.getParam("spellchecker_enable_learn_rpc")) {
						m.add({
							title : 'spellchecker.learn_word',
							onclick : function() {
								var word = wordSpan.innerHTML;

								dom.remove(wordSpan, 1);
								t._checkDone();

								ed.setProgressState(1);
								t._sendRPC('learnWord', [t.selectedLang, word], function(r) {
									ed.setProgressState(0);
								});
							}
						});
					}

					m.update();
				});

				ed.selection.select(wordSpan);
				p1 = dom.getPos(wordSpan);
				m.showMenu(p1.x, p1.y + wordSpan.offsetHeight - vp.y);

				return tinymce.dom.Event.cancel(e);
			} else
				m.hideMenu();
		},

		_checkDone : function() {
			var t = this, ed = t.editor, dom = ed.dom, o;

			each(dom.select('span'), function(n) {
				if (n && dom.hasClass(n, 'mceItemHiddenSpellWord')) {
					o = true;
					return false;
				}
			});

			if (!o)
				t._done();
		},

		_done : function() {
			var t = this, la = t.active;

			if (t.active) {
				t.active = 0;
				t._removeWords();

				if (t._menu)
					t._menu.hideMenu();

				if (la)
					t.editor.nodeChanged();
			}
		},

		_sendRPC : function(m, p, cb) {
			var t = this;

			JSONRequest.sendRPC({
				url : t.rpcUrl,
				method : m,
				params : p,
				success : cb,
				error : function(e, x) {
					t.editor.setProgressState(0);
					t.editor.windowManager.alert(e.errstr || ('Error response: ' + x.responseText));
				}
			});
		}
	});

	// Register plugin
	tinymce.PluginManager.add('spellchecker', tinymce.plugins.SpellcheckerPlugin);
})();
/**
 * $Id: editor_plugin_src.js 1037 2009-03-02 16:41:15Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var each = tinymce.each;

	tinymce.create('tinymce.plugins.EmbedMediaPlugin', {
		init : function(ed, url) {
			var t = this;
			t.editor = ed;
			t.url = url;

			function isMedia(n) {
				return /^mceItemFlash$/.test(n.className);
			};

			// Register commands
			ed.addCommand('mceEmbedMedia', function() {
				ed.windowManager.open({
					file : url + '/media.htm',
					width : 480 + parseInt(ed.getLang('embedmedia.delta_width', 0)),
					height : 500 + parseInt(ed.getLang('embedmedia.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url
				});
			});

			// Register buttons
			ed.addButton('embedmedia', {title : 'media.desc', cmd : 'mceEmbedMedia'});

			ed.onNodeChange.add(function(ed, cm, n) {
				cm.setActive('embedmedia', n.nodeName == 'IMG' && isMedia(n));
			});

			ed.onInit.add(function() {

				if (ed.settings.content_css !== false)
					ed.dom.loadCSS(url + "/css/content.css");
                              
				if (ed && ed.plugins.contextmenu) {
					ed.plugins.contextmenu.onContextMenu.add(function(th, m, e) {
						if (e.nodeName == 'IMG' && /mceItemFlash/.test(e.className)) {
							m.add({title : 'media.edit', icon : 'media', cmd : 'mceEmbedMedia'});
						}
					});
				}
			});

			ed.onSetContent.add(function() {
                            var content = $(ed.getBody());
                            content.find('embed,object').each(function() {
                                var embed = $(this);
                                // If we are an embed inside an object, do not process
                                if (embed.is('embed') && embed.parent().is('object')) {
                                    return;
                                }
                                // Do the transformation
                                var embed_text = $('<div />').append(embed.clone()).html();
                                var result = $('<img />')
                                    .attr('src', t.url + '/img/trans.gif')
                                    .addClass('mceItemFlash')
                                    .addClass('mceMarker-embedmedia')
                                    .attr('title', embed_text)
                                    .attr('width', embed.attr('width'))
                                    .attr('height', embed.attr('height'));
                                    //.attr('align', f.align.options[f.align.selectedIndex].value);
                                // XXX for some reason, this serialization is essential on IE
                                result = $('<div />').append(result).html();
                                embed.replaceWith(result);
                            });

			});

			function getAttr(s, n) {
				n = new RegExp(n + '=\"([^\"]+)\"', 'g').exec(s);

				return n ? ed.dom.decode(n[1]) : '';
			};

			ed.onPostProcess.add(function(ed, o) {
                            o.content = o.content.replace(/<img[^>]+>/g, function(img) {
				var cl = getAttr(img, 'class');
                                // this class is never removed
                                if (cl == 'mceMarker-embedmedia') {
                                    // update width, height
                                    var snippet = t.newEmbedSnippet();
                                    snippet.setContent(getAttr(img, 'title'));
                                    snippet.setParms({
                                        width: getAttr(img, 'width'),
                                        height: getAttr(img, 'height')
                                    });
                                    img = snippet.getContent();
                                }
                                return img;
                            });
			});

		},
			
		newEmbedSnippet : function() {
                    // manipulation of embed snippets
                    // created here because at this point we have jquery
                    // for sure.
                    var EmbedSnippet = function EmbedSnippet() {};
                    $.extend(EmbedSnippet.prototype, {

                        setContent: function(html) {
                            this.wrapper = $('<div />');
                            var wrapper = this.wrapper;
                            wrapper.append(html);
                            this.root = wrapper.children();
                            var root = this.root;
                            // detect type
                            this.emtype = null;
                            if (root.is('object')) {
                                var inside = root.find('embed');
                                if (inside) {
                                    this.emtype = 'object+embed';
                                    this.inside = inside;
                                    // remove bad attributes. (Important: 
                                    // will explode flash if left in)
                                    if (inside.attr('mce_src')) {
                                        inside.removeAttr('mce_src');
                                    }
                                }
                            }
                            // remove bad attributes. (Important: 
                            // will explode flash if left in)
                            if (root.attr('mce_src')) {
                                root.removeAttr('mce_src');
                            }
                            // cascade
                            return this;
                        },

                        getContent: function() {
                            return this.wrapper.html();
                        },

                        getParms: function() {
                            return {
                                width: this.root.attr('width'),
                                height: this.root.attr('height')
                            };
                        },

                        setParms: function(parms) {
                            if (this.emtype == 'object+embed') {
                                parms.width && this.root.attr('width', parms.width); 
                                parms.height && this.root.attr('height', parms.height); 
                                parms.width && this.inside.attr('width', parms.width); 
                                parms.height && this.inside.attr('height', parms.height); 
                            } else {
                                parms.width && this.root.attr('width', parms.width); 
                                parms.height && this.root.attr('height', parms.height); 
                            }
                            return this;
                        }

                    });
                    // give access to the class from the popup
                    this.newEmbedSnippet = function newEmbedSnippet() {
                        return new EmbedSnippet();   
                    };
                    return this.newEmbedSnippet();
                },

		getInfo : function() {
			return {
				longname : 'Media',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/media',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}

	});

	// Register plugin
	tinymce.PluginManager.add('embedmedia', tinymce.plugins.EmbedMediaPlugin);
})();
/* Downloaded from:
   http://www.phpletter.com/Our-Projects/AjaxFileUpload/

   Modified:
    2009: Balazs Ree <ree@greenfinity.hu>
        * make more useful error when we expect json response, and
          html error arrives, like a 404.
    2010: Balazs Ree <ree@greenfinity.hu>
        * allow extra parameters to be passed with the file upload
        * Fix cloning to prevent an issue on IE, that caused
          all uploads except the first one to fail.
        * fixed semicolon, causing grave error on concatenation

*/

jQuery.extend({
	

    createUploadIframe: function(id, uri)
	{
			//create frame
            var frameId = 'jUploadFrame' + id;
            
            if(window.ActiveXObject) {
                var io = document.createElement('<iframe id="' + frameId + '" name="' + frameId + '" />');
                if(typeof uri== 'boolean'){
                    io.src = 'javascript:false';
                }
                else if(typeof uri== 'string'){
                    io.src = uri;
                }
            }
            else {
                var io = document.createElement('iframe');
                io.id = frameId;
                io.name = frameId;
            }
            io.style.position = 'absolute';
            io.style.top = '-1000px';
            io.style.left = '-1000px';

            document.body.appendChild(io);

            return io			
    },
    createUploadForm: function(id, fileElementId, /*optional*/ extraParams)
	{
		//create form	
		var formId = 'jUploadForm' + id;
		var fileId = 'jUploadFile' + id;
		var form = $('<form  action="" method="POST" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data"></form>');	
		var oldElement = $('#' + fileElementId);
		var newElement = $(oldElement).clone(true);
                // XXX Setting the name attribute explicitely seems
                // to be crucial on IE. The result of this bug is that
                // the first upload succeeds but any further ones
                // will fail. Not setting the name here seems to
                // cause the input field missing from the form.
                newElement.attr('name', oldElement.attr('name'));
		$(oldElement).attr('id', fileId);
		$(oldElement).before(newElement);
		$(oldElement).appendTo(form);
                // Optionally, add some more parameters.
                extraParams && $.each(extraParams, function(k, v) {
                    $('<input type="hidden">')
                        .attr('name', k)
                        .attr('value', v)
                        .appendTo(form);
                });
		//set attributes
		$(form).css('position', 'absolute');
		$(form).css('top', '-1200px');
		$(form).css('left', '-1200px');
		$(form).appendTo('body');		
		return form;
    },

    ajaxFileUpload: function(s) {
        // TODO introduce global settings, allowing the client to modify them for all requests, not only timeout		
        s = jQuery.extend({}, jQuery.ajaxSettings, s);
        var id = new Date().getTime();
		var form = jQuery.createUploadForm(id, s.fileElementId, s.extraParams);
		var io = jQuery.createUploadIframe(id, s.secureuri);
		var frameId = 'jUploadFrame' + id;
		var formId = 'jUploadForm' + id;		
        // Watch for a new set of requests
        if ( s.global && ! jQuery.active++ )
		{
			jQuery.event.trigger( "ajaxStart" );
		}            
        var requestDone = false;
        // Create the request object
        var xml = {}   
        if ( s.global )
            jQuery.event.trigger("ajaxSend", [xml, s]);
        // Wait for a response to come back
        var uploadCallback = function(isTimeout)
		{			
			var io = document.getElementById(frameId);
            try 
			{				
				if(io.contentWindow)
				{
					 xml.responseText = io.contentWindow.document.body?io.contentWindow.document.body.innerHTML:null;
                	 xml.responseXML = io.contentWindow.document.XMLDocument?io.contentWindow.document.XMLDocument:io.contentWindow.document;
					 
				}else if(io.contentDocument)
				{
					 xml.responseText = io.contentDocument.document.body?io.contentDocument.document.body.innerHTML:null;
                	xml.responseXML = io.contentDocument.document.XMLDocument?io.contentDocument.document.XMLDocument:io.contentDocument.document;
				}						
            }catch(e)
			{
				jQuery.handleError(s, xml, null, e);
			}
            if ( xml || isTimeout == "timeout") 
			{				
                requestDone = true;
                var status;
                try {
                    status = isTimeout != "timeout" ? "success" : "error";
                    // Make sure that the request was successful or notmodified
                    if ( status != "error" )
					{
                        // process the data (runs the xml through httpData regardless of callback)
                        var data = jQuery.uploadHttpData( xml, s.dataType );    
                        // If a local callback was specified, fire it and pass it the data
                        if ( s.success )
                            s.success( data, status );
    
                        // Fire the global callback
                        if( s.global )
                            jQuery.event.trigger( "ajaxSuccess", [xml, s] );
                    } else
                        jQuery.handleError(s, xml, status);
                } catch(e) 
				{
                    status = "error";
                    jQuery.handleError(s, xml, status, e);
                }

                // The request was completed
                if( s.global )
                    jQuery.event.trigger( "ajaxComplete", [xml, s] );

                // Handle the global AJAX counter
                if ( s.global && ! --jQuery.active )
                    jQuery.event.trigger( "ajaxStop" );

                // Process result
                if ( s.complete )
                    s.complete(xml, status);

                jQuery(io).unbind()

                setTimeout(function()
									{	try 
										{
											$(io).remove();
											$(form).remove();	
											
										} catch(e) 
										{
											jQuery.handleError(s, xml, null, e);
										}									

									}, 100)

                xml = null

            }
        }
        // Timeout checker
        if ( s.timeout > 0 ) 
		{
            setTimeout(function(){
                // Check to see if the request is still happening
                if( !requestDone ) uploadCallback( "timeout" );
            }, s.timeout);
        }
        try 
		{
           // var io = $('#' + frameId);
			var form = $('#' + formId);
			$(form).attr('action', s.url);
			$(form).attr('method', 'POST');
			$(form).attr('target', frameId);
            if(form.encoding)
			{
                form.encoding = 'multipart/form-data';				
            }
            else
			{				
                form.enctype = 'multipart/form-data';
            }			
            $(form).submit();

        } catch(e) 
		{			
            jQuery.handleError(s, xml, null, e);
        }
        if(window.attachEvent){
            document.getElementById(frameId).attachEvent('onload', uploadCallback);
        }
        else{
            document.getElementById(frameId).addEventListener('load', uploadCallback, false);
        } 		
        return {abort: function () {}};	

    },

    uploadHttpData: function( r, type ) {
        var data = !type;
        data = type == "xml" || data ? r.responseXML : r.responseText;
        // If the type is "script", eval it in global context
        if ( type == "script" )
            jQuery.globalEval( data );
        // Get the JavaScript object, if JSON is used.
        if ( type == "json" )
            // evaluate json in an exception jail
            try {
                data = window["eval"]("(" + data + ")");
            } catch(e) {
                throw new Error(
                    'Could not evaluate data, probably server side error or 404. [Received: ' + 
                    data.substring(0, 30) + '...]');
            }
        // evaluate scripts within html
        if ( type == "html" )
            jQuery("<div>").html(data).evalScripts();
			//alert($('param', data).each(function(){alert($(this).attr('value'));}));
        return data;
    }
});


(function() {

    // unique id needed for the file upload input
    var next_fileinputid = 0;
    // unique id needed to serialize file uploads
    var upload_serial = 0;
    // unique id needed to serialize file uploads
    var external_check_serial = 0;

    // Support classes for the image thumbnail handling
    //
    // Since we may not have $ (jquery) during loading,
    // the initialization will be called later.
    var ImageStripe = function() {
        this.init.apply(this, arguments);
    };
    var register_widgets = function() {
        if ($['tiny']) {
            // widgets registered already
            return;
        }
        $.tiny = {};

        // I was getting desperate to solve this from css,
        // but this iterator seems to be more stable.
        $.fn.tiny_fixIEPanelSize = function(widthdiff, heightdiff) {
            if (!jQuery.boxModel) {
                return this.each(function() {
                    var el = $(this);
                    var w = el.css('width');
                    if (w && w != 'auto') {
                        el.width(parseInt(w) + widthdiff);
                    }
                    var h = el.css('height');
                    if (h && h != 'auto') {
                        el.height(parseInt(h) + heightdiff);
                    }
                });
            }
            return this;
        };

        // the sizes we use all imagedrawer panels:
        // contain 6px padding + 1px border in each direction.
        $.tiny.PANEL_WD = 14;
        $.tiny.PANEL_HD = 14;

        // actually, register the widgets.
        $.widget('tiny.imagedrawerimage', {

            options: {
                record: null
            },

            _create: function() {
                // Locate markup
                this.image = this.element.find('.tiny-imagedrawer-image img');
                this.label = this.element.find('.tiny-imagedrawer-imagelabel');
                // Initial value
                if (this.options.record) {
                    this.record(this.options.record);
                }
            },

            record: function(/*optional*/ value) {

                if (typeof value == 'undefined') {
                    // Geting value.
                    return this._record;
                }

                // Seting value.
                //
                // Store the record.
                this._record = value;

                // Show the new values in the widget
                var shortened_title = value.title;
                if (shortened_title && shortened_title.length > 9) {
                    shortened_title = shortened_title.substr(0, 9) + '...';
                }
                this.label.text(shortened_title);
                this.image.attr('src', value.thumbnail_url); 

                // Setting width and height is important for
                // external images, where there is no thumbnail
                // and the fullsize image is used. On IE, the
                // following stanza is needed to get such thumbnails
                // "behave", ie. scale properly
                if (value.thumbnail_width) {
                    this.image.attr('width', value.thumbnail_width); 
                } else {
                    this.image.removeAttr('width');
                }
                if (value.thumbnail_height) {
                    this.image.attr('height', value.thumbnail_height); 
                } else {
                    this.image.removeAttr('height');
                }

                // XXX this will work in jquery.ui >= 1.8
                return this;
            }

        });

        $.widget('tiny.imagedrawerinfopanel', {

            options: {
                record: null,
                insertButtonLabel: null
            },

            _create: function() {
                var self = this;
                // Locate markup
                this.info_title = this.element.find('.tiny-imagedrawer-info-title');
                this.info_location = this.element.find('.tiny-imagedrawer-info-location');
                this.info_author = this.element.find('.tiny-imagedrawer-info-author');
                this.info_modified = this.element.find('.tiny-imagedrawer-info-modified');
                this.input_caption = this.element.find('input:checkbox[name=tiny-imagedrawer-input-caption]');
                this.input_captiontext = this.element.find('input:text[name=tiny-imagedrawer-input-captiontext]');
                this.input_align = {};
                this.element.find('input:radio[name=tiny-imagedrawer-input-align]')
                    .each(function(index, value) {
                        self.input_align[$(value).attr('value')] = value;
                    });
                this.input_dimension = this.element.find('select[name=tiny-imagedrawer-input-dimension]');
                this.wrapper_location = this.element.find('.tiny-imagedrawer-info-location-wrapper');
                this.wrapper_author = this.element.find('.tiny-imagedrawer-info-author-wrapper');
                this.wrapper_modified = this.element.find('.tiny-imagedrawer-info-modified-wrapper');
                this.wrapper_captiontext = this.element.find('.tiny-imagedrawer-input-captiontext-wrapper');
                this.buttonset_save = this.element
                    .find('.karl-buttonset.tiny-imagedrawer-buttonset-save')
                    .karlbuttonset({
                        clsContainer: 'tiny-imagedrawer-buttonset-save'
                    });
                this.insert_button = this.buttonset_save
                    .karlbuttonset('getButton', 0);
                this.insert_button_label = this.insert_button
                    .find('a');
                // Wire up the status boxes in the info panel
                this.statusbox = this.element.find('.tiny-imagedrawer-statusbox')
                    .multistatusbox({
                        //clsItem: 'portalMessage',
                        hasCloseButton: false
                    });
                // Wire up the caption selector
                if (this.input_caption.is(':checked')) {
                    this.wrapper_captiontext.show();
                } else {
                    this.wrapper_captiontext.hide();
                }
                this.input_caption.click(function() {
                    if ($(this).is(':checked')) {
                        self.wrapper_captiontext
                            .show('fold')
                            .focus();
                    } else {
                        self.wrapper_captiontext.hide('fold');
                    }
                });
                // Initial value
                if (this.options.insertButtonLabel) {
                    this.insertButtonLabel(this.options.insertButtonLabel);
                }
                if (this.options.record) {
                    this.record(this.options.record);
                }
            },

            insertButtonEnabled: function(/*optional*/ value) {

                if (value === undefined) {
                    // Geting value.
                    this.insert_button.hasClass('ui-state-disabled');
                }

                // Seting value.
                //
                if (value) {
                    this.insert_button.removeClass('ui-state-disabled');
                } else {
                    this.insert_button.addClass('ui-state-disabled');
                }

                // XXX this will work in jquery.ui >= 1.8
                return this;
            },

            insertButtonLabel: function(/*optional*/ value) {

                if (value === undefined) {
                    // Geting value.
                    return this.insert_button_label.text();
                }

                // Seting value.
                //
                this.insert_button_label.attr('title', value);
                this.insert_button_label.text(value);

                // XXX this will work in jquery.ui >= 1.8
                return this;
            },

            record: function(/*optional*/ value) {
                var self = this;

                if (typeof value == 'undefined') {
                    // Geting value.
                    return this._record;
                }

                // Store the record.
                this._record = value;

                // Setting values, taking care of sensible defaults.
                if (value.title) {
                    this.info_title.text(value.title);
                    this.input_captiontext.val(value.title);
                } else {
                    this.info_title.text('No selection');
                    this.input_captiontext.val('');
                }
                var author_name = value.author_name || '';
                this.info_author.text(author_name);
                if (author_name) {
                    this.wrapper_author.show();
                } else {
                    this.wrapper_author.hide();
                }
                var last_modified = value.last_modified || '';
                this.info_modified.text(last_modified);
                if (last_modified) {
                    this.wrapper_modified.show();
                } else {
                    this.wrapper_modified.hide();
                }

                // iterate on the location chain and render it
                this.info_location.html('');
                $(value.location).each(function(i) {
                    if (i > 0) {
                        self.info_location.append(
                            '<span>&nbsp;&gt;&nbsp;</span>'
                        );
                    }
                    self.info_location.append(
                        $('<span></span>')
                            // XXX title should be limited (...)
                            .text(this.title)
                        );
                });
                if (value.location && value.location.length > 0) {
                    this.wrapper_location.show();
                } else {
                    this.wrapper_location.hide();
                }

                // update statuses
                this.statusbox.multistatusbox('clear');
                if (value.error) {
                    this.statusbox.multistatusbox('append', value.error,
                        null, 'ui-state-error ui-corner-all');
                } else if (value.status) {
                    this.statusbox.multistatusbox('append', value.status,
                        null, 'ui-state-highlight ui-corner-all');
                }

                // handle the insert button enabled state
                this.insertButtonEnabled(value.image_url);

                // XXX this will work in jquery.ui >= 1.8
                return this;
            },

            insertOptions: function(/*optional*/ value) {
                var self = this;

                if (typeof value == 'undefined') {
                    // Geting value from the inputs.
                    return {
                        caption: this.input_caption.is(':checked'),
                        captiontext: this.input_captiontext.val(),
                        align: this.element.find('input:radio[name=tiny-imagedrawer-input-align]:checked').val(),
                        dimension: this.input_dimension.val()
                    };
                }

                // Setting values, taking care of sensible defaults.
                if (value) {
                    if (value.caption != undefined) {
                        this.input_caption[0].checked = value.caption;
                        if (value.caption) {
                            this.wrapper_captiontext.show();
                        } else {
                            this.wrapper_captiontext.hide();
                        }
                    }
                    if (value.captiontext != undefined) {
                        this.input_captiontext.val(value.captiontext);
                    }
                    if (value.align != undefined) {
                        this.input_align[value.align].checked = true;
                    }
                    if (value.dimension != undefined) {
                        this.input_dimension.val(value.dimension);
                    }
                }

                // XXX this will work in jquery.ui >= 1.8
                return this;
            }


        });

        $.extend(ImageStripe.prototype, {

            init: function(container, column_width, proto_image,
                proto_value) {
                this.container = container;
                this.column_width = column_width;
                this.proto_image = proto_image;
                this.proto_value = proto_value;
                this.reset();
            },

            reset: function() {
                this.offset = 0;
                this.container.empty();
            },

            // Generates a thumb image.
            _thumb: function(/*optional*/ value) {
                return this.proto_image
                    .clone(true)
                    .imagedrawerimage({
                        record: $.extend({}, this.proto_value, value)
                    });
            },

            preload: function(start, end) {
                var self = this;

                var oldstart = this.offset;
                var oldend = oldstart + this.items().length;

                // Check if we are beyond region.
                if ((oldend - oldstart > 0) && 
                        ((end < oldstart) || (start > oldend))) {
                    throw new Error('Preloading non-adjoining regions: must have reset before.');
                }

                var i = start;

                // Prepend records to the container.
                while (i < oldstart) {
                    this._thumb({loading: true}).prependTo(this.container);
                    i += 1;
                }
                // Update the offset
                var decrease_offset = i - start;
                if (decrease_offset > 0) {
                    this.offset -= decrease_offset;
                } else {
                    // No change in offset. At this point we
                    // check if we are after a reset, and initiate
                    // the margin according to the offset.
                    if (this.items().length == 0) {
                        // No previous region.
                        this.offset = start;
                    }
                }

                // Replace records inside the container.
                while (i < Math.min(oldend, end)) {
                    // XXX Just update the value, instead? TODO
                    this._thumb({loading: true}).replaceAll(this.item(i));
                    i += 1;
                }

                // Append records to the container.
                while (i < end) {
                    this._thumb({loading: true}).appendTo(this.container);
                    i += 1;
                }

                this._setLength();
            },

            insertRecord: function(index, /*optional*/ value) {
                // inserts a record at the given position
                // this pushes all following records to the right.

                // Generates the item.
                var newItem = this._thumb(value);

                if (index - this.offset == this.items().length) {
                    // Allow appending the item right at the
                    // end of the stored region.
                    newItem.appendTo(this.container);
                } else {
                    // Insert the item before the given index.
                    var item = this.item(index);
                    // Check if we store this item.
                    if (item.length != 1) {
                        throw new Error('insertRecord must extend a region continously.');
                    }
                    newItem.insertBefore(item);
                }

                this._setLength();

                // Return the newly created object
                return newItem;
            },

            _setLength: function() {
                // set the length of the container to
                // always hold all the elements
                this.container.width(this.items().length 
                    * (this.column_width + 20) + 100);
            },

            moveTo: function(start) {
                this.container.css('margin-left',
                    Math.round((this.offset - start) * this.column_width) 
                    + 'px');
            },

            items: function() {
                // Return all items.
                return this.container.children();
            },

            item: function(index) {
                // Get the item at the given index.
                return this.items().eq(index - this.offset);
            },

            recordAt: function(index, value) {

                var item = this.item(index);
                // Check if we store this item.
                if (item.length != 1) {
                    throw new Error('recordAt with an unstored index: item must have preloaded before.');
                }

                if (typeof value == 'undefined') {
                    // Get the value at the given index.
                    return item.imagedrawerimage('record');
                }

                // Set the value.
                item.imagedrawerimage('record', value);
                
            }

        });
    };


    // allow this to fail if tinymce is not present
    window.tinymce || register_widgets();
    window.tinymce && tinymce.create('tinymce.plugins.ImageDrawerPlugin', {

        // Mandatory parameters:
        //      imagedrawer_dialog_url
        //      imagedrawer_upload_url
        //        -- Only needed if the upload (tab) button is enabled.
        //
        init : function(ed, url) {
            var self = this;
            this.editor = ed;
            this.url = url;

            // Make sure the support classes are loaded...
            // ... we need this because we cannot depend on
            // jquery in the outer closure.
            register_widgets();

            // Mark that we don't have a dialog and that we
            // will need to get it with ajax.
            this.dialog = null;
            // no selection initially
            this.selected_item = undefined; 

            // Register commands
            ed.addCommand('mceImageDrawer', function() {
                // Internal image object like a flash placeholder
                if (ed.dom.getAttrib(ed.selection.getNode(), 'class').indexOf('mceItem') != -1)
                    return;
                
                // Let's see what image the user wants us to replace
                var img = self._getEditorImageSelection();
                if (img) {
                    img = $(img);

                    // Fetch the data from the image
                    self.editor_image_data = self._getEditorImageData(img);

                    // Analyze the source.
                    var re_domain = /^https?:\/\/([^\/\?]*)[\/\?]?/;
                    var a_1 = re_domain.exec(window.location.href);
                    var a_domain = a_1 && a_1[1];
                    var b_1 = re_domain.exec(img.attr('src')); // null if relative
                    var b_domain = b_1 && b_1[1];
                    self.editor_image_data.external = b_1 && a_domain != b_domain;

                } else {
                    // Not replacing (...will insert)
                    self.editor_image_data = null;
                }

                // XXX Workaround IE selection handle problem
                self._save_editor_selection(img);

                // Do we need a dialog?
                if (! self.dialog) {
                    var data = {};
                    if (self.editor_image_data && ! self.editor_image_data.external) { 
                        // If this is our internal image, we start
                        // on the My Recent tab. The server will
                        // incorporate the image to be replaced
                        // in the thumbnail result list.
                        data = {
                            source: 'myrecent',
                            include_image_url: self.editor_image_data.image_url
                        };
                    }
                    // Make a request to the server to fetch the dialog snippet
                    // as well as the initial batch of the image list
                    $.ajax({
                            type: 'GET',
                            url: ed.getParam('imagedrawer_dialog_url'),
                            data: data,
                            success: function(json) {
                                var error = json && json.error;
                                if (error) {
                                    // server sent an error
                                    this._dialogError(error);
                                } else {
                                    self._dialogSuccess(json);
                                }
                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) {
                                // reraise exception, if any
                                if (errorThrown) {
                                    throw errorThrown;
                                }
                                self._dialogError(textStatus);
                            },
                            dataType: 'json'
                        });

                        // XXX show loading status here?
                } else {
                    self._restore_formstate();  // XXX XXX
                    // XXX...
                    var button_value = $(self.buttonset).data('karlbuttonset')
                        .element.children().eq(self.selected_source).attr('value');

                    // Set the Insert/Replace button's text.
                    self._updateInsertReplaceState();
                    // Set the source in case we are replacing.
                    if (self.editor_image_data) {
                        // We are replacing. Source is either My Recent or Web.
                        if (self.editor_image_data.external) {
                            self.buttonset
                                .karlbuttonset('getButton', 3)   // Web
                                .click();
                            self.input_url.val(self.editor_image_data.image_url);
                            self._externalDoCheck({
                                image_url: self.editor_image_data.image_url
                            });
                        } else {
                            if (self.selected_source != 1) {
                                self.buttonset
                                    .karlbuttonset('getButton', 1)   // My Recent
                                    .click();
                            } else if (button_value == 'myrecent' ||
                                       button_value == 'thiscommunity' ) {
                                // need to force the re-fetch
                                self._requestRecords(0, 12, true);   // XXX XXX
                            }
                        } 
                    } else {
                        if (button_value == 'myrecent' ||
                                button_value == 'thiscommunity' ) {
                            // need to force the re-fetch
                            self._requestRecords(0, 12, true);   // XXX XXX
                        }
                    }
                    // We have it, so (re-)open it.
                    self._save_formstate();     // XXX XXX
                    self.dialog.dialog('open');
                    self._restore_formstate();  // XXX XXX
                }

            });

            // Register buttons
            ed.addButton('image', {
                title : 'imagedrawer.image_desc',
                cmd : 'mceImageDrawer'
            });

            // dynamic loading of the plugin's css
            ed.onInit.add(function() {
                // only load it if editor_css is not specified.
                // If it is, the theme must have loaded it
                // already.
                if (! ed.settings.editor_css) {
                    tinymce.DOM.loadCSS(url + "/css/ui.css");
                }
            });

        },

        // Hack to work around:
        //   http://sikanrong.com/blog/radio_button_javascript_bug__internet_explorer
        // Every time we open / close the dialog, the snippet will be
        // moved in the dom. Which causes IE to forget the selection of
        // the radio buttons, and revert to their value at creation.
        _save_formstate: function() {
            this._formstate = {
                insertOptions: this.info_panel.imagedrawerinfopanel('insertOptions')
            };
        },
        //
        _restore_formstate: function() {
            this.info_panel.imagedrawerinfopanel('insertOptions',
                    this._formstate.insertOptions);
        },


        // Hack to work around:
        // on IE (including IE7, and IE8) the resize handles
        // of the image selected in the editor are displayed
        // in front of the dialog. To work around this, the
        // selection is removed while the dialog is active.
        _save_editor_selection: function(img) {
            // only active on IE, in case a single image is selected.
            if (img && $.browser.msie) {
                this._saved_editor_selection = $(img)[0];
                var ed = this.editor;
                ed.selection.collapse();
                // Needed.
                ed.execCommand('mceRepaint');
            } else {
                this._saved_editor_selection = null;
            }
        },
        _get_editor_selection: function() {
            // We don't really restore the selection.
            // Instead, use the saved image at insertion time.
            var result;
            if (this._saved_editor_selection) {
                result = this._saved_editor_selection;
                this._saved_editor_selection = null;
            } else {
                result = this._getEditorImageSelection();
            }
            return result;
        },

        _dialogSuccess: function(json) {
            var self = this;
            var ed = this.editor;
            //
            // Bring up the dialog
            this.dialog = $(json.dialog_snippet);
            this.dialog.hide().appendTo('body');
            this.dialog.dialog({
                // the next options are adjustable if the style changes
                // Full width is computed from width border and padding.
                // IE's quirkmode is also taken to consideration.
                width: 6 + 390 + 7 + 320 + 6 + (jQuery.boxModel ? 0 : 10), // ?? XXX
                dialogClass: 'tiny-imagedrawer-dialog',
                // the next options are mandatory for desired behaviour
                autoOpen: false,
                modal: true,
                bgiframe: true,    // XXX bgiFrame is currently needed for modal
                hide: 'fold'
            });
            // remove these classes from the dialog. This is to avoid
            // the outside border that this class adds by default.
            // Instead we add our own panel, with the advantage that
            // sizes can be set correctly even on IE.
            // XXX actually one problem is that we get rid of the header,
            // and the component does not really support this oob.
            var dialog_parent = this.dialog
                .css('border', '0')
                .css('padding', '0')
                .css('overflow', 'hidden')
                .parents('.ui-dialog');
            dialog_parent
                    //.removeClass('ui-dialog-content ui-widget-content')
                    .removeClass('ui-dialog-content')
                    .css('overflow', 'hidden');
            // We need a close button. For simplicity, we just move the
            // close button from the header here, since it's already wired
            // up correctly.
            dialog_parent.find('.ui-dialog-titlebar-close').eq(0)
                .appendTo(this.dialog.find('.tiny-imagedrawer-panel-top'))
                .removeClass('ui-dialog-titlebar-close')
                .addClass('tiny-imagedrawer-button-close');
            

            //
            // Wire up the dialog
            //
            
            // each tab panel gets selected by a button
            // from the source selection buttonset
            var download_panel = this.dialog.find('.tiny-imagedrawer-panel-download');
            this.upload_panel = this.dialog.find('.tiny-imagedrawer-panel-upload')
                .tiny_fixIEPanelSize($.tiny.PANEL_WD, $.tiny.PANEL_HD); // fix the box model if needed
            this.external_panel = download_panel.find('.tiny-imagedrawer-panel-external')
                .tiny_fixIEPanelSize($.tiny.PANEL_WD, $.tiny.PANEL_HD); // fix the box model if needed
            this.images_panel = this.dialog
                .find('.tiny-imagedrawer-panel-images')
                .tiny_fixIEPanelSize($.tiny.PANEL_WD, $.tiny.PANEL_HD); // fix the box model if needed
            // source selection buttonset
            var top_panel = this.dialog.find('.tiny-imagedrawer-panel-top');
            var source_panel = top_panel.find('.tiny-imagedrawer-sources');
            this.buttonset = this.dialog
                .find('.karl-buttonset.tiny-imagedrawer-buttonset-tabselect');
            this.buttonset
                .karlbuttonset({
                    clsContainer: 'tiny-imagedrawer-buttonset-tabselect'
                })
                .bind('change.karlbuttonset', function(event, button_index, value) {
                    if (value) {
                        // XXX...
                        var button_value = $(this).data('karlbuttonset')
                            .element.children().eq(button_index).attr('value');

                        if (button_value == 'uploadnew') {
                            // Handle the Upload tab
                            self.upload_panel.show();
                            self.images_panel.hide();
                            self.external_panel.hide();
                            // There is only one thumb on the upload panel,
                            // and that should be selected when switched there.
                            var value = self.upload_preview_image
                                .imagedrawerimage('record');
                            if (value && value.image_url) {
                                self._setSelection(self.upload_preview_image);
                            } else {
                                self._setSelection(null);
                            }
                            self.selected_source = button_index;
                        } else if (button_value == 'myrecent' ||
                                   button_value == 'thiscommunity') {
                            // Handle the search result browsers
                            // Did the source change?
                            if (button_index != self.selected_source) {
                                // Yes. Reset the results
                                // and do a new query.
                                self._requestRecords(0, 12, true);   // XXX XXX
                                self.selected_source = button_index;
                                // The selection will resetted, but we
                                // also need to reset the info panel.
                                self.info_panel.imagedrawerinfopanel('record', {});
                            }
                            self.upload_panel.hide();
                            self.images_panel.show();
                            self.external_panel.hide();
                        } else if (button_value == 'external') {
                            // Handle the External tab
                            self.upload_panel.hide();
                            self.images_panel.hide();
                            self.external_panel.show();
                            // There is only one thumb on the external panel,
                            // and that should be selected when switched there.
                            var value = self.external_preview_image
                                .imagedrawerimage('record');
                            if (value && value.image_url) {
                                self._setSelection(self.external_preview_image);
                            } else {
                                self._setSelection(null);
                            }
                            self.selected_source = button_index;
                        }
                    }
                });

            // Wire up the info panel
            this.info_panel = this.dialog.find('.tiny-imagedrawer-panel-info')
                .imagedrawerinfopanel({
                })
                .tiny_fixIEPanelSize($.tiny.PANEL_WD, $.tiny.PANEL_HD); // fix the box model if needed
            // Wire up the Insert / Cancel buttons in the info panel
            this.info_panel.data('imagedrawerinfopanel').buttonset_save
                .bind('change.karlbuttonset', function(event, button_index, value) {
                    if (button_index == 0) { // Insert
                        // If there is no selection, nothing to do.
                        if (self.selected_item == null) {
                            return;
                        }
                        // Insert the selected one to the editor.
                        self._insertToEditor();
                        // Done. Close.
                        self._save_formstate();     // XXX XXX
                        self.dialog.dialog('close');
                        self._restore_formstate();  // XXX XXX
                    } else { // Cancel.
                        self._save_formstate();     // XXX XXX
                        self.dialog.dialog('close');
                        self._restore_formstate();  // XXX XXX
                    }
                });


            // Give the file input field a unique id
            this.fileinputid = 'tiny-imagedrawer-fileinputid-' + next_fileinputid;
            next_fileinputid += 1;
            var fileinput = this.upload_panel.find('.tiny-imagedrawer-fileinput');
            this.textinput = this.upload_panel.find('.tiny-imagedrawer-input-titletext');
            fileinput.attr('id', this.fileinputid);
            // Name is important as well!
            if (! fileinput.attr('name')) {
                // Give it default 'file', if it is not specified.
                // (Note, It will become the parameter name of the file
                // in the post.)
                fileinput.attr('name', 'file');
            }
            this._fileinput_change = function() {
                // If the file is selected, fill out the title.
                var value = '' + this.value;
                // XXX We want only the basename of the file. However
                // on Windows we get the full path. To make sure
                // we don't get the full path, we calculate the
                // basename ourselves.
                var index = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'));
                if (index != -1) {
                    value = value.substring(index + 1);
                }
                self.textinput.val(value);
                // reset the buttonset state
                // so, upload becomes clickable.
                self._uploadReset();
                self.buttonset_upload
                    .karlbuttonset('getButton', 0).removeClass('ui-state-disabled');
                self.buttonset_upload
                    .karlbuttonset('getButton', 1).addClass('ui-state-disabled');
            };
            fileinput.change(this._fileinput_change);

            // Upload panel
            this.upload_statusbox = this.upload_panel.find('.tiny-imagedrawer-statusbox')
                .multistatusbox({
                    //clsItem: 'portalMessage',
                    hasCloseButton: false
                });
            // Wire up the Upload button
            this.buttonset_upload = this.upload_panel
                .find('.karl-buttonset.tiny-imagedrawer-buttonset-upload')
                .karlbuttonset({
                    clsContainer: 'tiny-imagedrawer-buttonset-upload'
                })
                .bind('change.karlbuttonset', function(event, button_index, value) {
                    var buttonset = $(this);
                    if (button_index == 0) { // upload
                        // Signal the start of this upload
                        var eventContext = {};
                        upload_serial += 1;
                        eventContext.upload_serial = upload_serial;
                        self._uploadStart(eventContext);
                        // enable the reset button
                        buttonset.karlbuttonset('getButton', 0).addClass('ui-state-disabled');
                        buttonset.karlbuttonset('getButton', 1).removeClass('ui-state-disabled');

                        // Initiate the upload
                        $.ajaxFileUpload({
                            url: ed.getParam('imagedrawer_upload_url'),
                            secureuri: false,
                            fileElementId: self.fileinputid,
                            extraParams: {
                                // extra parameters passed with the upload
                                title: self.textinput.val()
                            },
                            dataType: 'json',
                            success: function(json, status) {
                                self._uploadSuccess(json, eventContext);
                            },
                            error: function (json, status, e) {
                                // Consider using the exception's text,
                                // if available. This shows us a sensible message
                                // about client side errors, including the 404
                                // which results in eval-error.
                                if (e && e.message) {
                                    json = {error: e.message};
                                }
                                self._uploadError(json, eventContext);
                            }
                        });

                    } else { // Reset in-progress upload
                        // by increasing the serial
                        // we ignore the current upload's result
                        upload_serial += 1;
                        // Ignore what is going on
                        self._uploadReset();
                        // reset the buttonset state
                        buttonset.karlbuttonset('getButton', 0).removeClass('ui-state-disabled');
                        buttonset.karlbuttonset('getButton', 1).addClass('ui-state-disabled');
                    }
                });


            // Web (was: external) panel
            this.input_url = this.external_panel.find('.tiny-imagedrawer-input-url');
            this.label_previewtext = this.external_panel.find('.tiny-imagedrawer-external-previewtext');
            this.external_statusbox = this.external_panel.find('.tiny-imagedrawer-statusbox')
                .multistatusbox({
                    //clsItem: 'portalMessage',
                    hasCloseButton: false
                });
            // Wire up the Check button
            this.buttonset_check = this.external_panel
                .find('.karl-buttonset.tiny-imagedrawer-buttonset-check')
                .karlbuttonset({
                    clsContainer: 'tiny-imagedrawer-buttonset-check'
                })
                .bind('change.karlbuttonset', function(event, button_index, value) {
                    var buttonset = $(this);
                    //if (button_index == 0) { // check                    
                        self._externalDoCheck({
                            image_url: self.input_url.val()
                        });
                    // }
                });

            // Wire the image list
            // 
            // First, it contains a single image. We save
            // this as hidden, and will use it
            // to clone any images.
            this.proto_image = this.images_panel
                .find('ul.tiny-imagedrawer-imagestripe > li')
                .eq(0);
            var proto_wrapper = $('<ul></ul>')
                .hide()
                .appendTo(this.images_panel)
                .append(this.proto_image);
            // Wire the proto image completely.
            this.proto_image
                .dblclick(function(event) {
                    // Doubleclick on the images acts the same as 
                    // pressing the insert button. 
                    //
                    //
                    var value = $(this).imagedrawerimage('record');
                    // Only act if it contains an insertable image!
                    if (value && value.image_url) {
                        // Insert the selected one to the editor.
                        self._insertToEditor(this);
                        // And close the dialog.
                        self._save_formstate();     // XXX XXX
                        self.dialog.dialog('close');
                        self._restore_formstate();  // XXX XXX
                    }
                    // Default clicks should be prevented.
                    event.preventDefault();
                })
                .click(function(event) {
                    // Clicking on an image selects it.
                    self._setSelection(this);
                    event.preventDefault();
                })
                .hover(
                    function() { $(this).addClass('ui-state-hover'); },
                    function() { $(this).removeClass('ui-state-hover'); }
                );

            // In case there are any other image prototypes:
            // we get rid of them.
            this.images_panel
                .find('ul.tiny-imagedrawer-imagestripe > li')
                .remove();

            // column size is the same in all stripes 
            this.visible_columns = 4;

            // We have the following stripes to take care of:
            // - 3 in the download panel
            // - 1 in the upload panel
            // - 1 in the external panel
            
            // handle the stripes in the download panel
            this.stripes = [];
            this.images_panel.find('ul.tiny-imagedrawer-imagestripe')
                .each(function(index) {
                    self.stripes.push(
                        new ImageStripe($(this), 95, self.proto_image, {
                            title: self.editor.getLang('imagedrawer.loading_title'),
                            thumbnail_url: self.url + '/images/default_image.png'
                        })
                    );
                });
            // A counter to enable rejection of obsolate batches
            this.region_id = 0;
            // Wire the scrollbar in the download panel
            this.scrollbar = this.images_panel.find('.tiny-imagedrawer-scrollbar')
                .karlslider({
                    enableClickJump: true,
                    enableKeyJump: true,
                    slide: function(e, ui) {
                        self._moveStripe(ui.value / 100);
                    }
                });

            // handle the image in the upload panel
            this.upload_preview_image = this.proto_image.clone(true)
                .imagedrawerimage({});
            this.upload_panel.find('.tiny-imagedrawer-image')
                .replaceWith(this.upload_preview_image);
            // reset the upload state
            this._uploadReset();

            // handle the image in the external panel
            this.external_preview_image = this.proto_image.clone(true)
                .imagedrawerimage({});
            this.external_panel.find('.tiny-imagedrawer-image')
                .replaceWith(this.external_preview_image);
            // reset the external check state
            this._externalReset();

            // Wire up the help panel
            var help_panel = this.dialog.find('.tiny-imagedrawer-panel-help')
                .hide();
            var help_panel_state_shown = false;
            help_panel.find('.karl-buttonset')
                .karlbuttonset({
                    clsContainer: 'tiny-imagedrawer-buttonset-cancelhelp'
                })
                .bind('change.karlbuttonset', function(event, button_index, value) {
                    help_panel.hide('slow');
                    download_panel.show('slow');
                    source_panel.show('slow');
                    help_panel_state_shown = false;
                });
            this.dialog.find('.tiny-imagedrawer-button-help')
                .click(function(event) {
                    if (! help_panel_state_shown) {
                        help_panel.show('fold');
                        source_panel.hide();
                        download_panel.hide();
                        help_panel_state_shown = true;
                    }
                    event.preventDefault();
                });


            // Check that the slider is either jquery ui version 1.8,
            // or that the code is patched with 1.7.
            // The bug in question would prevent the slider to ever go
            // back to value 0.
            if ($.ui.version < '1.8' && ! this.scrollbar.data('karlslider')._uiHash_patched) {
                throw new Error('jquery-ui version >= 1.8, or patched 1.7 version required.');
            }

            // Set the Insert/Replace button's text,
            // as well as the title on the top.
            this.title_tag = this.dialog
                .find('.tiny-imagedrawer-title');
            self._updateInsertReplaceState();

            //
            // Render the first batch of images
            //
            if (json.images_info) {
                this._initImages(json.images_info);
                this._loadRecords(json.images_info);
            }

            // force initial selection to null 
            self._setSelection(null);


            // Initial source tab switch
            if (this.editor_image_data) {
                // We are replacing. Source is either My Recent or Web.
                if (this.editor_image_data.external) {
                    this.buttonset
                        .karlbuttonset('getButton', 3)   // Web
                        .click();
                    this.input_url.val(this.editor_image_data.image_url);
                    this._externalDoCheck({
                        image_url: this.editor_image_data.image_url
                    });
                } else {
                    this.selected_source = 1;    // My Recent
                    // this will change the tabbing but importantly
                    // _not_ re-fetch the data set
                    this.buttonset
                        .karlbuttonset('getButton', 1)   // My Recent
                        .click();
                    // We select the
                    // first element. XXX Note in a refined implementation,
                    // the server should not append the replaced image as
                    // a first fake, but return the (source tab / ) batch
                    // that contains the image, so the client could just
                    // select it whichever index it has.
                    this._setSelection(this._getListItem(0));
                    // prevent selection for another time
                    this.editor_image_data._selected_once = true;
                }
            } else {
                // We are inserting (not replacing).
                // panels are shown based on initial selection
                this.selected_source = this.buttonset[0].selectedIndex; 
                // (Note: we use the index, not the option values,
                // which are irrelevant for the working of this code.)
            }

            // XXX...
            var button_value = this.buttonset.data('karlbuttonset')
                .element.children().eq(this.selected_source).attr('value');

            if (button_value == 'uploadnew') {
                this.upload_panel.show();
                this.images_panel.hide();
                this.external_panel.hide();
            } else if (button_value == 'myrecent' ||
                       button_value == 'thiscommunity') {
                this.upload_panel.hide();
                this.images_panel.show();
                this.external_panel.hide();
            } else if (button_value == 'external') {
                this.upload_panel.hide();
                this.images_panel.hide();
                this.external_panel.show();
            }

            // Finally, open the dialog.
            this._save_formstate();     // XXX XXX
            this.dialog.dialog('open');
            this._restore_formstate();  // XXX XXX
        },
            
        // Initialize images for the given search criteria.
        _initImages: function(images_info) {
            // Reset the region control
            this.region_start = 0;
            this.region_end = images_info.records.length;
            this.region_total = images_info.totalRecords;
            this._resetStripe();
            // Preload the region
            this._preloadRegion(this.region_start, this.region_end);
            this._moveStripe(this.scrollbar.karlslider('value') / 100);
            // Set the jump increment of the slider.
            // One jump step should scroll ahead one full page.
            var jumpStep = Math.floor(100 / (Math.ceil(this.region_total / this.stripes.length)
                    ) * this.visible_columns); 
            this.scrollbar.karlslider('option', 'jumpStep', jumpStep);
        },

        _dialogError: function(error) {
            error = 'Error when fetching drawer_dialog_view.html: ' + error;
            // XXX XXX XXX do something...
            alert(error);
        },

        _dataSuccess: function(json, region_id, initial) {

            var self = this;
            // use error sent by server, if available
            var error = json && json.error;
            if (error) {
                this._dataError(json);
            }

            if (this.region_id != region_id) {
                // Wrong region. Discard.
                // (This was a region we asked for
                // before a previous reset, but
                // arrived later.)
                ////console.log('Discarding', json.images_info.start, 
                ////    json.images_info.start + json.images_info.records.length);
                return;
            }
            
            // if this is an initial batch: set up the size
            if (initial) {
               this._initImages(json.images_info); 
            }

            // load the records 
            this._loadRecords(json.images_info);

            // If we are in the initial batch: we select the
            // first element. XXX Note in a refined implementation,
            // the server should not append the replaced image as
            // a first fake, but return the (source tab / ) batch
            // that contains the image, so the client could just
            // select it whichever index it has.
            if (initial && this.editor_image_data
                    && ! this.editor_image_data.external
                    && ! this.editor_image_data._selected_once) {
                // XXX ... maybe, assert that we loaded record 0?
                // Select the first element
                this._setSelection(this._getListItem(0));
                // prevent selection for another time
                this.editor_image_data._selected_once = true;
            }

        },

        _dataError: function(json) {
            // use error sent by server, if available
            var error = json && json.error;
            if (! error) {
                error = 'Server error when fetching drawer_data_view.html';
            }
            // XXX XXX XXX do something...
            alert(error);
        },

        _uploadStart: function(eventContext) {
            // Start the throbber
            this.upload_preview_image
                .parent().show();
            this.upload_preview_image
                .imagedrawerimage('record', 
                {
                    loading: true,
                    title: this.textinput.val(),
                    thumbnail_url: this.url + '/images/throbber.gif'
                });
            // clear the status box
            this.upload_statusbox.multistatusbox('clear');
        },

        _uploadReset: function() {
            // hide the image
            this.upload_preview_image
                .parent().hide();
            this.upload_preview_image
                .imagedrawerimage('record', 
                {
                    loading: true,
                    thumbnail_url: this.url + '/images/throbber.gif'
                });
            // clear the status box
            this.upload_statusbox.multistatusbox('clear');
            // clear the selection
            this._setSelection(null);
        },

        _uploadSuccess: function(json, eventContext) {
            var self = this;
            // use error sent by server, if available
            var error = json && json.error;
            if (error) {
                this._uploadError(json, eventContext);
                return;
            }

            // prevent doing anything if this is not the current upload
            if (eventContext.upload_serial != upload_serial) {
                return;
            }

            // Update the image data that just arrived
            this.upload_preview_image
                .imagedrawerimage('record', json.upload_image_info);
            //
            // If we are still on
            // the upload tab: select it,
            if (this.buttonset.val() == 'uploadnew') {
                if (this.selected_item == null) {
                    this._setSelection(this.upload_preview_image);
                } else {
                    // This is the selected item. Update the info panel.
                    this._updateInfoPanel();
                }
            }
        },

        _uploadError: function(json, eventContext) {

            // prevent doing anything if this is not the current upload
            if (eventContext.upload_serial != upload_serial) {
                return;
            }

            // use error sent by server, if available
            var error = json && json.error;
            if (! error) {
                error = 'Server error when fetching drawer_upload_view.html';
            }
            // hide the image, and
            // Get the existing data record and save the error in it.
            this.upload_preview_image
                .parent().hide();
            this.upload_preview_image
                .imagedrawerimage('record', 
                $.extend(this.upload_preview_image.imagedrawerimage('record'),
                    {
                        //thumbnail_url: this.url + '/images/error.png'
                        thumbnail_url: this.url + '/images/throbber.gif'
                    }
                )
            );
            // Show the error in the message box
            this.upload_statusbox.multistatusbox('clearAndAppend', error,
                        null, 'ui-state-error ui-corner-all');
            // update selection
            if (this.buttonset.val() == 'uploadnew') {
                // We are the selected item. Update the info panel.
                this._updateInfoPanel();
            }
        },

        _externalDoCheck: function(eventContext) {
            var self = this;

            external_check_serial += 1;
            eventContext.external_check_serial = external_check_serial;
            this._externalStart(eventContext);

            // Initiate the check
            var img = new Image();

            $(img)
                .load(function() {
                    self._externalSuccess(this, eventContext);
                })
                .error(function() {
                    self._externalError(this, eventContext);
                })
                // XXX It is _very_ important to have this _after_
                // setting the load handler, to satisfy IE. 
                // Explanation: If the image
                // is cached, IE will _never_ execute the onload
                // handler if the src is set preceding the handler
                // setup. This is pretty unexpected, concerning
                // that javascript should execute single-threaded.
                .attr('src', eventContext.image_url);
        },

        _externalStart: function(eventContext) {
            var image_url = eventContext.image_url;
            // XXX TODO eventually, title could be calculated
            // XXX from the image_url.
            var title = 'External image';

            // Start the throbber
            this.external_preview_image
                .parent().show();
            this.external_preview_image
                .imagedrawerimage('record', {
                    loading: true,
                    title: title,
                    thumbnail_url: this.url + '/images/throbber.gif',
                    location: [{
                        title: image_url,
                        href: image_url
                        }]
                });

            // clear the status box
            this.external_statusbox.multistatusbox('clear');
            // hide the "none selected" label
            this.label_previewtext.hide(); 
        },

        _externalReset: function() {
            // hide the image
            this.external_preview_image
                .parent().hide();
            this.external_preview_image
                .imagedrawerimage('record', 
                {
                    loading: true,
                    thumbnail_url: this.url + '/images/throbber.gif'
                });
            // clear the status box
            this.external_statusbox.multistatusbox('clear');
            // clear the selection
            this._setSelection(null);
            // show the "none selected" label
            this.label_previewtext.show(); 
        },

        _externalSuccess: function(img, eventContext) {
            var self = this;

            // prevent doing anything if this is not the current upload
            if (eventContext.external_check_serial != external_check_serial) {
                return;
            }

            // We will not actually use a thumbnail image, because
            // for external images, this is not available. We will
            // use the original size image. This works everywhere
            // but on IE. For the sole purpose of making this
            // work on IE, we must calculate and explicitely set
            // the size of the thumbnails.
            var thumbnail_width = undefined;
            var thumbnail_height = undefined;

            // We _could_ have it everywhere, but apart from IE
            // it makes no point, and it makes the image appearing
            // ugly (size set, before the image actually gets loaded)
            if ($.browser.msie) {
                var clipping_size = 175;   // 175px: must match the css
                if (img.width > clipping_size || img.height > clipping_size) {
                    var ratio = img.width / img.height;
                    if (ratio > 1) {
                        thumbnail_width = clipping_size;
                        thumbnail_height = Math.floor(clipping_size / ratio);
                    } else {
                        thumbnail_width = Math.floor(clipping_size * ratio);
                        thumbnail_height = clipping_size;
                    }
                }
            }

            // update the record with the image sizes we have now
            // and also set the thumbnail to show the image
            this.external_preview_image.imagedrawerimage('record', $.extend({},
                this.external_preview_image.imagedrawerimage('record'), {
                    image_width: img.width,
                    image_height: img.height,
                    image_url: eventContext.image_url,
                    thumbnail_url: eventContext.image_url,
                    thumbnail_width: thumbnail_width,
                    thumbnail_height: thumbnail_height
            }));

            // clear the status box
            this.external_statusbox.multistatusbox('clear');
            // hide the "none selected" label
            this.label_previewtext.hide(); 
            // If we are still on
            // the external tab: select it,
            if (this.buttonset.val() == 'external') {
                if (this.selected_item == null) {
                    this._setSelection(this.external_preview_image);
                } else {
                    // This is the selected item. Update the info panel.
                    this._updateInfoPanel();
                }
            }
        },

        _externalError: function(img, eventContext) {
            // prevent doing anything if this is not the current check
            if (eventContext.external_check_serial != external_check_serial) {
                return;
            }

            var error = 'Wrong url, or not an image.';

            // hide the image, and
            // Get the existing data record and save the error in it.
            this.external_preview_image
                .parent().hide();
            this.external_preview_image
                .imagedrawerimage('record', 
                $.extend(this.upload_preview_image.imagedrawerimage('record'),
                    {
                        //thumbnail_url: this.url + '/images/error.png'
                        thumbnail_url: this.url + '/images/throbber.gif'
                    }
                )
            );
            // Show the error in the message box
            this.external_statusbox.multistatusbox('clearAndAppend', error,
                        null, 'ui-state-error ui-corner-all');
            // show the "none selected" label
            this.label_previewtext.show(); 
            // update selection
            if (this.buttonset.val() == 'external') {
                // We are the selected item. Update the info panel.
                this._updateInfoPanel();
            }
        },

        _getListItem: function(index) {
            var stripenum = this.stripes.length;
            var whichstripe = index % stripenum;
            return this.stripes[whichstripe]
                    .item(Math.floor((index + whichstripe) / stripenum));
        },

        _setSelection: function(item) {

            if (item) {
                item = $(item);
            }

            if ((this.selected_item && this.selected_item[0]) === 
                    (item && item[0])) {
                // no change in selection. Nothing to do
                return
            }

            if (this.selected_item != null) {
                // unselect previous one
                this.selected_item.removeClass('ui-state-default ui-state-active');
            }

            this.selected_item = item;
            this._updateInfoPanel();
        },

        _updateInfoPanel: function() {
            var item = this.selected_item;
            if (item != null) {
                // select new one
                // (Use active rather than highlight.)
                item.addClass('ui-state-default ui-state-active');
                var record = item.imagedrawerimage('record');
                this.info_panel.imagedrawerinfopanel('record', record);
            } else {
                this.info_panel.imagedrawerinfopanel('record', {});
            }
        },

        _preloadRegion: function(start, end) {
            // Preload. This will create a "loading" image.
            var stripenum = this.stripes.length;
            $(this.stripes).each(function(index) {
                var revindex = stripenum - index - 1;
                this.preload(
                    Math.floor((start + revindex) / stripenum),
                    Math.floor((end + revindex) / stripenum)
                );
            });
        },

        _resetStripe: function() {
            $(this.stripes).each(function(index) {
                this.reset();
            });
            // increase region counter
            this.region_id += 1;
            // reset the selection
            this._setSelection(null);
            // reset the scrollbar
            this.scrollbar.karlslider('value', 0);
        },

        _moveStripe: function(percentage_float) {
            // Move the stripe to a percentage position.
            // Load records as needed.
            //
            var self = this;

            var slider_index = percentage_float * 
                    (Math.ceil(this.region_total / this.stripes.length)
                    - this.visible_columns); 
            
            if (slider_index < 0) {
                // Region fits entirely without scrolling.
                // Do nothing.
                return;
            }

            // See which region is needed
            var visible_start = Math.floor(slider_index * this.stripes.length);
            var visible_end = Math.ceil(slider_index + this.visible_columns) 
                                    * this.stripes.length;
            var needed_start;
            var needed_end;
            var needed_total;
            if ((visible_start < this.region_start) || 
                    (visible_end > this.region_end)) {
                // We need to acquire this region.
                var minimal_batch = 12;
                if (visible_start < this.region_start) {
                    // prepending
                    needed_end = visible_end;
                    // Is it non-overlapping?
                    if (needed_end < this.region_start) {
                        // Reset everything. We need to start
                        // a new region.
                        ////console.log('Resetting <');
                        this._resetStripe();
                        this.region_end = needed_end;
                    } else {
                        needed_end = this.region_start;
                    }
                    needed_start = Math.min(visible_start,
                            needed_end - minimal_batch);
                    needed_start = Math.max(needed_start, 0);
                    this.region_start = needed_start;
                } else if (visible_end > this.region_end) {
                    // appending
                    needed_start = visible_start;
                    // Is it non-overlapping?
                    if (needed_start > this.region_end) {
                        // Reset everything. We need to start
                        // a new region.
                        ////console.log('Resetting >');
                        this._resetStripe();
                        this.region_start = needed_start;
                    } else {
                        needed_start = this.region_end;
                    }
                    // Assure minimal batching
                    needed_end = Math.max(visible_end,
                        needed_start + minimal_batch);
                    needed_end = Math.min(needed_end, this.region_total);
                    this.region_end = needed_end;
                }
                
                if (needed_start < needed_end) {
                    ////console.log('Preloading', needed_start, needed_end);
                    this._preloadRegion(needed_start, needed_end);
                    var region_id = this.region_id;
                    // load the required data
                    this._requestRecords(needed_start, needed_end - needed_start, false);
                }

            }

            // Move to the position
            $(this.stripes).each(function(index) {
                this.moveTo(slider_index);
            });

        },

        _requestRecords: function(start, limit, /*optional*/ initial) {
            // XXX There are two invariants that this method
            // fetches from the dom:
            // - the source parameter (fetched from the buttonset)
            // - the url of the replaced (internal) image
            var self = this;
            // load the required data
            var region_id = this.region_id;
            var data = {
                start: start, 
                limit: limit,
                sort_on: 'creation_date',
                reverse: '1',
                source: this.buttonset.val()
            };
            // if replacing, we pass the image_url of the image
            // that we want to include into the result set
            // Simple implementation on server side may present
            // this image as first in the My Recent tab.
            if (this.editor_image_data && ! this.editor_image_data.external) {
                data.include_image_url = this.editor_image_data.image_url;
            }
            $.ajax({
                type: 'GET',
                url: this.editor.getParam('imagedrawer_data_url'),
                data: data,
                success: function(json) { self._dataSuccess(json, region_id, initial); },
                error: function(json) { self._dataError(json); },
                dataType: 'json'
            });
        },

        _loadRecords: function(images_info) {
            var self = this;
            var start = images_info.start;
            // Append these records
            var stripenum = this.stripes.length;
            $.each(images_info.records, function(index) {
                var whichstripe = (index + start) % stripenum;
                self.stripes[whichstripe].recordAt(
                        Math.floor((index + start) / stripenum),
                        this);
            });
        },

        _insertToEditor: function(/*optional*/ item) {
    
            var record;
            if (item) {
                // allow to shortcut insert a given image item
                record = $(item).imagedrawerimage('record');
            } else {
                // normally, we're inserting what shows in the info panel
                record = this.info_panel.imagedrawerinfopanel('record');
            }

            var ed = this.editor;
            var v;
            var el;

            // get the insertion options from the info panel
            var insertOptions = this.info_panel.imagedrawerinfopanel('insertOptions');

            // In principle, we use the real image size
            // for the insertion,
            // but we do want to limit width and height
            // initially to a sensible max.
            var width = record.image_width;
            var height = record.image_height;
            var max_width;
            var max_height;
            var dim = {
                original: {max_width: 530, max_height: 530},
                large: {max_width: 400, max_height: 400},
                medium: {max_width: 250, max_height: 250},
                small: {max_width: 100, max_height: 100}
            }[insertOptions.dimension];
            var max_width = dim.max_width;
            var max_height = dim.max_height;
            if (width > max_width) {
                height = Math.floor(height * max_width / width);
                width = max_width;
            }
            if (height > max_height) {
                width = Math.floor(width * max_height / height);
                height = max_height;
            }

            var klass = '';

            // Set the caption
            alt = insertOptions.captiontext;
            if (insertOptions.caption) {
                klass = (klass ? klass + ' ' : '') + 'tiny-imagedrawer-captioned';
            }
            // set the align
            var style = '';
            var align;
            if (insertOptions.align == 'left') {
                align = 'left';
            } else if (insertOptions.align == 'right') {
                align = 'right';
            } else if (insertOptions.align == 'center') {
                style = 'display: block; margin-left: auto; margin-right: auto; text-align: center;';
                align = null;
            }

            //
            var args = {
                src: record.image_url,
                align: align,
                width: width,
                height: height,
                alt: alt,
                'class': klass,
                style: style

                // constrain (bool)
                // vspace
                // hspace
                // border
                // title
                // class
                // onmousemovecheck (bool)
                // onmouseoversrc
                // onmouseoutsrc
                // out-list
                // id
                // dir (ltr, rtl)
                // lang
                // usemap
                // longdesc
            }

            // XXX ???
            //if (ed.settings.inline_styles) {
            //    // Remove deprecated values
            //    args.vspace = '';
            //    args.hspace = '';
            //    args.border = '';
            //    args.align = '';
            //}

            // Fixes crash in Safari
            if (tinymce.isWebKit)
                ed.getWin().focus();

            args.onmouseover = args.onmouseout = '';

            if (args.onmousemovecheck) {
                if (args.onmouseoversrc) {
                    args.onmouseover = "this.src='" + args.onmouseoversrc + "';";
                }

                if (args.onmouseoutsrc)
                    args.onmouseout = "this.src='" + args.onmouseoutsrc + "';";
            }

            // Insert / Replace image.
            var editorImage = this._get_editor_selection();

            if (editorImage) {
                // We are replacing the image.
                ed.dom.setAttribs(editorImage, args);
                // Needed.
                ed.execCommand('mceRepaint');
            } else {
                // We are inserting a new image.
                ed.execCommand('mceInsertContent', false, '<img id="__mce_tmp" />', {skip_undo : 1});
                ed.dom.setAttribs('__mce_tmp', args);
                ed.dom.setAttrib('__mce_tmp', 'id', '');
                ed.undoManager.add();
            }


        },

        // Either return the selected image in the editor,
        // or null, in case we are inserting.
        _getEditorImageSelection: function() {

            var ed = this.editor;
            var el = ed.selection.getNode();

            // XXX Workaround for weird issue. Insert an image right when the editor
            // comes up. Select the image and try to upload a different one in place
            // of it. In the first case this fails; upon reselecting the image again,
            // the problem goes away. It seems that if an image is inserted, under
            // certain conditions, a new
            // paragraph is wrapped around it, and upon selecting the image, the
            // <p> wrapper will appear in the selection, which would make
            // the insertion fail.
            //
            // Tests need to include:
            // - selecting an image in an empty P (should replace!!)
            // - selecting an image with a P with spaces after it
            // - selecting a space in the same P where the image is (should insert)
            //
            if (el && el.nodeName == 'P') {
                var nicetry = el.childNodes[ed.selection.getRng().startOffset];
                if (nicetry && nicetry.nodeName == 'IMG') {
                    // Use this for the selection, eh...
                    el = nicetry;
                }
            }
            // XXX End of workaround. Note this should be tested with selenium.
            
            if (el && el.nodeName == 'IMG') {
                return el;
            } else {
                // No image selection. Will insert a new image.
                return null;
            }
        },

        _getEditorImageData: function(img) {
            img = $(img);
            // Figure properties of the image
            var w = img.attr('width');
            var h = img.attr('height');
            var d = {
                insert_width:   w, //img.attr('width'),
                insert_height:  h, //img.attr('height'),
                caption:        img.hasClass('tiny-imagedrawer-captioned'),
                captiontext:    img.attr('alt'),
                image_url:      img.attr('src'),
                dimension: 'original'
            };
            $.each([['small', 100], ['medium', 250], ['large', 400]],
                function(index, value) {
                    if (w <= value[1] && h <= value[1]) {
                        d.dimension = value[0];
                        return false;   // break
                    }
                }
            );
            if (img.css('float') == 'left') {
                d.align = 'left';
            } else if (img.css('float') == 'right') {
                d.align = 'right';
            } else if (img.css('margin-left') == 'auto' && 
                       img.css('margin-right') == 'auto') {
                d.align = 'center';
            } else {
                // no hint on align.
                d.align = null;
            }
            return d;
        },

        _updateInsertReplaceState: function() {
            var self = this;
            var title;
            var button_label;
            var d = this.editor_image_data;

            if (d) {
                title = 'Replace Image';
                button_label = 'Replace';
                // Set the insertion options in the info panel
                this.info_panel.imagedrawerinfopanel('insertOptions', d);
            } else {
                title = 'Insert Image';
                button_label = 'Insert';
            }
            // update the button
            this.info_panel.imagedrawerinfopanel('insertButtonLabel', button_label);
            // update the main title on the top
            this.title_tag.text(title);

        },

        getInfo : function() {
            return {
                longname : 'Image Drawer',
                author : 'Thomas Moroz, Open Society Institute',
                authorurl : '',
                infourl : '',
                version : '1.0'
            };
        }
    });

    // Register plugin
    // allow this to fail if tinymce is not present
    if (window.tinymce) {
        tinymce.PluginManager.add('imagedrawer', tinymce.plugins.ImageDrawerPlugin);
        tinymce.PluginManager.requireLangPack('imagedrawer');
    }

})();

tinyMCE.addI18n('en.imagedrawer',{
image_desc: "Insert/edit image",
loading_title: 'Loading...'
});
