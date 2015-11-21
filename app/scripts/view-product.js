(function() {

    var mediaSize = 9;

    var ProductModel = Amour.Model.extend({
        url: Amour.APIRoot + 'beacon/data/getItemBycityName.do'
    });

    var ProductSimilarCollection = Amour.Collection.extend({
        url: Amour.APIRoot + 'beacon/data/listSameCategoryItemsByid.do'
    });

    var ProductBrandCollection = Amour.Collection.extend({
        url: Amour.APIRoot + 'beacon/data/listItemByBid.do'
    });

    var ProductView = Amour.ModelView.extend({
        template: App.getTemplate('product-detail')
    });

    var MediasListView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            events: { 'click': 'viewDetail' },
            className: 'media-item',
            template: '<div class="img" data-bg-src="{{apiFullpath img}}"></div><div class="name">{{name}}</div><div>￥{{price}}</div>',
            viewDetail: function() {
                App.router.navigate('product/' + this.model.id);
            }
        })
    });

    App.Pages.Product = new (App.PageView.extend({
        events: {
            'click .store .btn': 'viewStores'
        },
        initPage: function() {
            this.product = new ProductModel();
            this.similarProducts = new ProductSimilarCollection();
            this.brandProducts = new ProductBrandCollection();
            this.views = {
                product: new ProductView({
                    model: this.product,
                    el: this.$('.product-wrapper')
                }),
                similarProducts: new MediasListView({
                    collection: this.similarProducts,
                    el: this.$('.similar-products .media-list')
                }),
                brandProducts: new MediasListView({
                    collection: this.brandProducts,
                    el: this.$('.brand-products .media-list')
                })
            };
        },
        viewStores: function() {
            App.router.navigate(['product', this.product.id, 'address'].join('/'));
        },
        render: function() {
            var productId = this.options.productId;
            var self = this;
            this.product.fetch({
                dataType: 'jsonp',
                data: { id: productId },
                success: function(model) {
                    var brandId = self.product.get('brand').id;
                    self.brandProducts.fetch({
                        dataType: 'jsonp',
                        data: { id: brandId, start: 0, size: mediaSize }
                    });
                    self.$('.store').toggleClass('hidden', model.get('online') == 1);
                }
            });
            this.similarProducts.fetch({
                dataType: 'jsonp',
                data: { id: productId, size: mediaSize }
            });
        }
    }))({el: $('#view-product')});

})();
