(function() {

    var pageRouter = App.pageRouter;

    App.router = new (Backbone.Router.extend({
        navigate: function(fragment, options) {
            options = options || {};
            options.trigger = !(options.trigger === false);
            options.replace && pageRouter.pop();
            pageRouter.pushNext = true;
            Backbone.Router.prototype.navigate.call(this, fragment, options);
        },
        initialize: function(){
            this.route('*path', 'index');
            this.route(/product\/(\d+)/, 'product');
            this.route(/product\/(\d+)\/address/, 'productAddress');
            this.route(/brand\/(\d+)/, 'brand');
            this.route(/brand\/(\d+)\/address/, 'brandAddress');
            this.route(/topic\/(\d+)/, 'topic');
            this.route(/topic\/(\d+)\/comments/, 'comments');
        },
        index: function(path) {
            // this.navigate('home', { replace: true });
            this.navigate('topic/96', { replace: true });
        },
        product: function(pid) {
            pageRouter.goTo('Product', { productId: pid });
        },
        brand: function(bid) {
            pageRouter.goTo('Brand', { brandId: bid });
        },
        topic: function(tid) {
            pageRouter.goTo('Topic', { topicId: tid });
        },
        comments: function(tid) {
            pageRouter.goTo('TopicComments', { topicId: tid });
        },
        brandAddress: function(bid) {
            pageRouter.goTo('Address', { brandId: bid });
        },
        productAddress: function(pid) {
            pageRouter.goTo('Address', { productId: pid });
        }
    }))();

})();
