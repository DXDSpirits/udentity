(function() {

    App.PageView = Amour.View.extend({
        disablePage: function() {
            this.undelegateEvents();
            this.go = function() {};
            this.refresh = function() {};
            this.showPage = function() {};
        },
        initView: function() {
            if (!this.el) {
                this.disablePage();
                return;
            }
            this.views = {};
            _.bindAll(this, 'showPage', 'go', 'refresh', 'render', 'reset');
            var $el = this.$el;
            this.$('.wrapper').on('webkitAnimationEnd', function(e) {
                var animationName = e.originalEvent.animationName;
                if (animationName == "slideouttoleft" || animationName == "slideouttoright") {
                    $el.trigger('pageClose');
                } else if (animationName == "slideinfromright" || animationName == "slideinfromleft") {
                    $el.trigger('pageOpen');
                }
            });
            if (this.initPage) this.initPage();
        },
        leave: function() {},
        go: function(options) {
            this.options = options || {};
            this.reset();
            var render = this.render;
            var pageOpen = _.once(function() {
                render();
            });
            _.delay(pageOpen, 1000);
            this.$el.one('pageOpen', pageOpen);
            this.showPage();
        },
        refresh: function() {
            var render = this.render;
            var pageOpen = _.once(function() {
                render();
            });
            _.delay(pageOpen, 1000);
            this.$el.one('pageOpen', pageOpen);
            this.showPage();
        },
        reset: function() {},
        showPage: function(options) {
            var options = options || this.options || {};
            var $curPage;
            var isSamePage = !this.$el.hasClass('view-hidden');
            if (isSamePage) {
                $curPage = this.$el.clone().prependTo('.views-wrapper');
                $curPage.find('.wrapper').scrollTop(this.$('.wrapper').scrollTop());
                this.$el.addClass('view-hidden');
            } else {
                $curPage = $('.view:not(".view-hidden")');
            }
            var closeCurPage = _.once(function() {
                $curPage.removeClass('view-prev').removeClass('view-prev-reverse')
                if (isSamePage) {
                    $curPage.remove();
                } else {
                    $curPage.addClass('view-hidden');
                }
                $curPage.find('input').blur();
            });
            $curPage.addClass('view-prev');
            if (options.reverse) $curPage.addClass('view-prev-reverse');
            _.delay(closeCurPage, 1000);
            $curPage.one('pageClose', closeCurPage);

            var $nextPage = this.$el;
            var openNextPage = _.once(function() {
                $nextPage.removeClass('view-next').removeClass('view-next-reverse');
                $nextPage.find('input').blur();
                window.scrollTo(0, 0);
            });
            $nextPage.removeClass('view-hidden');
            $nextPage.addClass('view-next');
            if (options.reverse) $nextPage.addClass('view-next-reverse');
            _.delay(openNextPage, 1000);
            $nextPage.one('pageOpen', openNextPage);
        }
    });

})();
