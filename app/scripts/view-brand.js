(function() {

    var BrandModel = Amour.Model.extend({
        url: Amour.APIRoot + 'beacon/data/getBrand.do'
    });

    var ProductsCollection = Amour.Collection.extend({
        url: Amour.APIRoot + 'beacon/data/listItemByBid.do'
    });

    var TopicsCollection = Amour.Collection.extend({
        url: Amour.APIRoot + 'beacon/data/listTopicByBid.do'
    });

    var BrandView = Amour.ModelView.extend({
        events: {
            'click .more': 'showMore'
        },
        template: App.getTemplate('brand-detail'),
        render: function() {
            Amour.ModelView.prototype.render.call(this);
            var h = this.$('.description').height();
            if (h > 50) {
                var desc = this.model.get('description').substr(0, $(window).width() / 10);
                this.$('.desc').text(desc + ' ......');
                this.$('.description').addClass('ellipsis');
            }
            return this;
        },
        showMore: function() {
            $('#desc-full')
            .find('h4').text('品牌介绍').end()
            .find('article').text(this.model.get('description')).end()
            .removeClass('invisible')
            .one('click', function() {
                $(this).addClass('invisible');
            });
        }
    });

    var TopicsListView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            events: { 'click': 'viewDetail' },
            className: 'topic-media-item',
            template: '<div class="img" data-bg-src="{{apiFullpath img}}"><div class="title">{{title}}</div></div>',
            viewDetail: function() {
                App.router.navigate('topic/' + this.model.id);
            }
        })
    });

    var ProductsListView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            events: { 'click': 'viewDetail' },
            className: 'product-media-item',
            template: App.getTemplate('product-media-item'),
            viewDetail: function() {
                App.router.navigate('product/' + this.model.id);
            }
        })
    });

    App.Pages.Brand = new (App.PageView.extend({
        events: {
            'click .store .btn': 'viewStores'
        },
        initPage: function() {
            this.brand = new BrandModel();
            this.products = new ProductsCollection();
            this.topics = new TopicsCollection();
            this.views = {
                brand: new BrandView({
                    model: this.brand,
                    el: this.$('.brand-wrapper')
                }),
                products: new ProductsListView({
                    collection: this.products,
                    el: this.$('.brand-products .media-list')
                }),
                topics: new TopicsListView({
                    collection: this.topics,
                    el: this.$('.brand-topics .media-list')
                })
            };
        },
        viewStores: function() {
            App.router.navigate(['brand', this.brand.id, 'address'].join('/'));
        },
        render: function() {
            var brandId = this.options.brandId;
            this.brand.fetch({
                dataType: 'jsonp',
                data: { id: brandId }
            });
            this.products.fetch({
                global: false,
                dataType: 'jsonp',
                data: { id: brandId, start: 0, size: 99 }
            });
            this.topics.fetch({
                global: false,
                dataType: 'jsonp',
                data: { id: brandId, start: 0, size: 99 }
            });
        }
    }))({el: $('#view-brand')});

})();
