(function() {

    moment.lang('zh-cn');

    var lazyResize = _.debounce(function() {
        $('.views-wrapper').height($(window).height());
    }, 300);
    $(window).resize(lazyResize);
    lazyResize();

    $('body').on('click', '[data-route]', function(e) {
        var route = $(e.currentTarget).data('route');
        if (route == 'return') {
            window.history.back();
        } else if (route == 'preview') {
            App.previewStory(App.story.get('name'));
        } else {
            App.router.navigate(route);
        }
    });

    /*
     * App
     */

    var App = {
        Version: '1.0.0',
        Models: {},
        Views: {},
        Pages: {}
    };

    /*
     * Page Router
     */

    App.pageRouter = new (function(pages) {
        this.pages = pages;
        this.history = { active: null, stack: [] };
        this.goTo = function(pageName, options) {
            var next = this.pages[pageName];
            var prev = _.last(this.history.stack);
            (options || (options = {})).caller = options.caller || this.history.active;
            if (!next) {
            } else if (next == prev) {
                this.history.active.leave();
                if (this.pushNext) {
                    this.history.stack.push(this.history.active);
                } else {
                    this.history.stack.length -= 1;
                }
                options.reverse = !this.pushNext;
                next.go(options);
                this.history.active = next;
            } else {
                if (this.history.active) {
                    this.history.active.leave();
                    this.history.stack.push(this.history.active);
                }
                next.go(options);
                this.history.active = next;
            }
            this.pushNext = false;
        };
        this.clearHistory = function() {
            this.history.stack.length = 0;
        };
        this.refreshActivePage = function() {
            this.history.active.refresh();
        };
        this.goBack = function() {
            if (this.history.stack.length > 0) {
                var prev = this.history.stack.pop();
                this.history.active = prev;
                this.history.active.showPage({reverse: true});
            }
        };
        this.pop = function() {
            if (this.history.stack.length > 0) {
                var prev = this.history.stack.pop();
                this.history.active = prev;
            }
        };
    })(App.Pages);

    /*
     * Utilities
     */

    App.getTemplate = function(name) {
        return $('#template-' + name).html();
    };

    /*
     * Ajax events
     */

    var timeout = 500;
    var timeout_stop, timeout_error;

    Amour.ajax.on('start', function() {
        clearTimeout(timeout_stop);
        clearTimeout(timeout_error);
        $('#apploader').removeClass('invisible');
    });

    Amour.ajax.on('stop', function() {
        timeout_stop = setTimeout(function () {
            $('#apploader').addClass('invisible');
            timeout = 500;
        }, timeout);
    });

    Amour.ajax.on('error', function() {
        $('#apploader .ajax-error').removeClass('hidden');
        timeout_error = setTimeout(function () {
            $('#apploader .ajax-error').addClass('hidden');
        }, (timeout = 1500));
    });

    Amour.ajax.on('unauthorized', function() {
        var url = '/accounts/?url=' + encodeURIComponent(location.href);
        App.openUrl(url, {
            replace: true
        });
    });

    Amour.ajax.on('forbidden', function() {
        var url = '/accounts/?url403=' + encodeURIComponent(location.href);
        App.openUrl(url, {
            replace: true
        });
    });

    /*
     * Initializations
     */

    App.vent = new Amour.EventAggregator();

    /*
     * Authorizations
     */

    /*
     * Start application
     */
    App.start = function() {
        Amour.trigger('ComposerAppReady');
        Backbone.history.start();
    };

    window.App = App;

})();
