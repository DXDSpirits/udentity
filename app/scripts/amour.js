(function() {

    if (navigator.userAgent.match(/MQQBrowser/)) {
        Backbone.emulateHTTP = true;
    }

    if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
        var msViewportStyle = document.createElement("style");
        msViewportStyle.appendChild(
            document.createTextNode(
                "@-ms-viewport{width:auto!important}"
            )
        );
        document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
    }

    if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }

    (function() {
        var keys = [], vals = [];
        _.chain(window.location.search.substr(1).split('&'))
        .compact().each(function(item) {
            var s = item.split('=');
            keys.push(s[0]);
            vals.push(s[1]);
        });
        window.location.query = _.object(keys, vals);
    })();

    (function initFastclick() {
        var fastclick = new FastClick(document.body);
    })();

    /*
     * Amour
     */

    var Amour = window.Amour = {
        version: '1.0',
        APIRoot: 'http://123.57.253.146/',
        StaticURL: '/'
    };

    /*
     * Devices
     */

    Amour.isWeixin = /MicroMessenger/i.test(navigator.userAgent);
    Amour.isMobile = /iPhone|Android|iPad|Windows Phone/i.test(navigator.userAgent);

    /*
     * Events and Routers
     */

    // Allow the `Amour` object to serve as a global event bus
    _.extend(Amour, Backbone.Events);

    var EventAggregator = Amour.EventAggregator = (function() {
        var EA = function() {};
        EA.extend = Backbone.Model.extend;
        _.extend(EA.prototype, Backbone.Events);
        return EA;
    })();

    /*
     * Models and Views
     */

    if (window.Handlebars) {
        Amour.TPL = Handlebars;
        Handlebars.render = function(template, attrs) {
            var template = template || '';
            var attrs = attrs || {};
            var compiledTemplate = Handlebars.compile(template);
            return compiledTemplate(attrs);
        }
        Handlebars.registerHelper('apiFullpath', function(imageUrl, options) {
            return Amour.APIRoot + (imageUrl && imageUrl[0] == '/' ? imageUrl.substr(1) : imageUrl);
        });
        Handlebars.registerHelper('eq', function(a, b, options) {
            return a == b ? options.fn(this) : options.inverse(this);
        });
        Handlebars.registerHelper('list', function(context, options) {
            if (!Handlebars.Utils.isEmpty(context)) {
                var context = (typeof context === 'object') ? context : [context];
                return Handlebars.helpers.each.call(this, context, options);
            } else {
                return options.inverse(this);
            }
        });
    } else if (window.Mustache) {
        Amour.TPL = Mustache;
    } else {
        Amour.TPL = {
            render: function(template, attrs) { return template; }
        };
    }
    var TPL = Amour.TPL;

    var Model = Amour.Model = Backbone.Model.extend({
        initialize: function(attributes, options) {
            options = options || {};
            if (this.initModel) this.initModel(options);
        },
        parse: function(response) {
            if (response.response != null) {
                this.responseCode = response.code;
                return response.response;
            } else {
                return response;
            }
        },
        url: function() {
            var origUrl = Backbone.Model.prototype.url.call(this);
            return origUrl + (origUrl.charAt(origUrl.length - 1) == '/' ? '' : '/');
        }
    });

    var Collection = Amour.Collection = Backbone.Collection.extend({
        model: Model,
        initialize: function(models, options) {
            options = options || {};
            if (this.initCollection) this.initCollection(options);
        },
        parse: function(response) {
            if (response.response != null) {
                this.responseCode = response.code;
                if (response.response.list != null) {
                    this.size = response.response.size;
                    return response.response.list;
                } else {
                    return response.response;
                }
            } else {
                return response;
            }
        },
        fetchNext: function(options) {
            var options = options || {};
            if (this.next) {
                options.url = this.next;
                this.fetch(options);
            }
        },
        fetchPrev: function(options) {
            var options = options || {};
            if (this.previous) {
                options.url = this.previous;
                this.fetch(options);
            }
        }
    });

    var View = Amour.View = Backbone.View.extend({
        initialize: function(options) {
            if (this.initView) this.initView(options || {});
        },
        renderTemplate: function(attrs, template) {
            var template = template || _.result(this, 'template') || '';
            var attrs = this.mixinTemplateHelpers(attrs);
            this.$el.html(TPL.render(template, attrs));
            this.$el.find('img[data-src]').addBack('img[data-src]').each(function() {
                Amour.loadImage($(this), $(this).data('src'));
            });
            this.$el.find('.img[data-bg-src]').addBack('.img[data-bg-src]').each(function() {
                Amour.loadBgImage($(this), $(this).data('bg-src'));
            });
            return this;
        },
        mixinTemplateHelpers: function(target){
            var target = target || {};
            return _.extend(target, _.result(this, 'templateHelpers'));
        }
    });

    var ModelView = Amour.ModelView = View.extend({
        listenToModel: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'hide', this.hide);
        },
        initView: function(options) {
            this.model = this.model || new Model();
            this.listenToModel();
            if (this.initModelView) this.initModelView(options || {});
        },
        setModel: function(model) {
            this.stopListening(this.model);
            this.model = model;
            this.listenToModel();
        },
        hide: function() {
            this.remove();
        },
        serializeData: function() {
            return this.model ? this.model.toJSON() : {};
        },
        render: function() {
            return this.renderTemplate(this.serializeData());
        }
    });

    var CollectionView = Amour.CollectionView = View.extend({
        ModelView: ModelView,
        listenToCollection: function() {
            this.listenTo(this.collection, 'reset', this.addAll);
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'remove', this.removeOne);
        },
        initView: function(options) {
            options = options || {};
            this.reverse = (options.reverse === true);
            this.collection = this.collection || new Collection();
            this.listenToCollection();
            if (this.initCollectionView) this.initCollectionView(options);
        },
        setCollection: function(collection) {
            this.stopListening(this.collection);
            this.collection = collection;
            this.listenToCollection();
        },
        renderItem: function(item) {
            var modelView = new this.ModelView({model: item});
            return modelView.render().el;
        },
        removeOne: function(item) {
            item.trigger('hide');
        },
        addOne: function(item) {
            var method = this.reverse ? 'prepend' : 'append';
            this.$el[method](this.renderItem(item));
        },
        addAll: function(_collection, options) {
            if (options && options.previousModels) {
                _.each(options.previousModels, function(model) {
                    model.trigger('hide');
                });
            }
            if (this.collection) {
                var nodelist = this.collection.reduce(function(nodelist, item) {
                    return nodelist.concat(this.renderItem(item));
                }, [], this);
                this.$el.html(this.reverse ? nodelist.reverse() : nodelist);
            }
        },
        render: function() {
            this.addAll();
            return this;
        }
    });

    /*
     * Utility Functions
     */

    Amour.storage = new function() {
        this.set = function(key, val) { localStorage.setItem(key, val); };
        this.get = function(key) { return localStorage.getItem(key); };
        this.del = function(key) { localStorage.removeItem(key); };
        try {
            localStorage.setItem('TEST_LOCALSTORAGE', 1);
        } catch (e) {
            alert('您的浏览器可能开启了“无痕(Private)浏览”，可能需要多次输入用户名和密码以保持登录状态');
            this.vault = {};
            this.set = function(key, val) { this.vault[key] = val; };
            this.get = function(key) { return this.vault[key]; };
            this.del = function(key) { this.vault[key] = null; };
        }
    };

    Amour.openWindow = function(link) {
        window.open(link, '_self', 'location=no');
    };

    Amour.optimizeImage = function(fullpath) {
        return fullpath;
    };

    Amour.imageFullpath = function(src, options) {
        options = options || {};
        var fullpath = /^http:\/\//.test(src) ? src : Amour.StaticURL + src;
        return options.optimize === false ? fullpath: Amour.optimizeImage(fullpath);
    };

    Amour.loadImage = function(img, src, options) {
        options = options || {};
        if (!src) {
            options.error && options.error();
            return;
        }
        var image = new Image(), image_src = Amour.imageFullpath(src, options);
        image.onload = function() {
            img.removeClass('img-loading');
            img.attr('src', image_src);
            options.success && options.success();
        };
        image.onerror = function() {
            img.removeClass('img-loading').addClass('img-broken');
            options.error && options.error();
        };
        img.attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        img.removeClass('img-broken').addClass('img-loading');
        image.src = image_src;
    };

    Amour.loadBgImage = function(el, src, options) {
        options = options || {};
        if (!src) {
            options.error && options.error();
            return;
        }
        if (src == 'none') {
            el.css('background-image', 'none');
            options.success && options.success();
            return;
        }
        var image = new Image(), image_src = Amour.imageFullpath(src, options);
        image.onload = function() {
            el.removeClass('img-loading');
            el.css('background-image', 'url(' + image_src + ')');
            options.success && options.success();
        };
        image.onerror = function() {
            el.removeClass('img-loading').addClass('img-broken');
            options.error && options.error();
        };
        el.removeClass('img-broken').addClass('img-loading');
        image.src = image_src;
    };

    Amour.fillImages = function() {
        var count = 1 + $('img[data-src]').length + $('.img[data-bg-src]').length;
        var imageLoad = _.after(count, function() {
            Amour.imagesLoaded = true;
            Amour.trigger('ImagesLoaded');
        });
        imageLoad();
        $('img[data-src]').each(function() {
            var src = $(this).data('src');
            Amour.loadImage($(this), src, {
                success: imageLoad, error: imageLoad
            });
        });
        $('.img[data-bg-src]').each(function() {
            var src = $(this).data('bg-src');
            Amour.loadBgImage($(this), src, {
                success: imageLoad, error: imageLoad
            });
        });
    };

    /*
     * Initializations
     */

    var initSync = function () {
        var authToken = Amour.storage.get('auth-token');
        var originalSync = Backbone.sync;
        Backbone.sync = function (method, model, options) {
            _.extend((options.headers || (options.headers = {})), { 'Accept-Language': 'zh-CN' });
            if (authToken) {
                // _.extend((options.headers || (options.headers = {})), { 'Authorization': 'Token ' + authToken });
                _.extend(options.headers, { 'Authorization': 'Token ' + authToken });
            }
            return originalSync.call(model, method, model, options);
        };
        Amour.TokenAuth = {
            get: function () {
                return _.clone(authToken);
            },
            set: function (token) {
                authToken = _.clone(token);
                Amour.storage.set('auth-token', authToken);
            },
            clear: function () {
                authToken = null;
                Amour.storage.del('auth-token');
            }
        };
    };

    var initAjaxEvents = function () {
        _.extend((Amour.ajax = {}), Backbone.Events);
        $(document).ajaxStart(function () {
            Amour.ajax.trigger('start');
        });
        $(document).ajaxStop(function () {
            Amour.ajax.trigger('stop');
        });
        $(document).ajaxError(function (event, jqxhr, settings, exception) {
            var response = jqxhr.responseJSON || {};
            if (jqxhr.status == 401 || jqxhr.status == 499) {
                Amour.TokenAuth.clear();
                Amour.ajax.trigger('unauthorized');
            } else if (jqxhr.status == 403) {
                Amour.TokenAuth.clear();
                Amour.ajax.trigger('forbidden');
            } else if (settings.type == 'GET' && jqxhr.statusText != 'abort') {
                Amour.ajax.trigger('error');
            }
        });
    };

    if (!window['amour-lazy-loading-images']) {
        Amour.fillImages();
    }

    /*
     * Export
     */
    initSync();
    initAjaxEvents();

})();
