(function() {

    var TopicModel = Amour.Model.extend({
        url: Amour.APIRoot + 'beacon/admin/getTopic.do'
    });

    var ProductsCollection = Amour.Collection.extend({
        url: Amour.APIRoot + 'beacon/data/listItemByTid.do'
    });

    var CommentsCollection = Amour.Collection.extend({
        url: Amour.APIRoot + 'beacon/data/getAllCommentByTopic.do'
    });

    var TopicView = Amour.ModelView.extend({
        template: App.getTemplate('topic-detail')
    });

    var ProductsListView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            events: { 'click': 'viewDetail' },
            className: 'media-item',
            template: App.getTemplate('product-media-item'),
            viewDetail: function() {
                App.router.navigate('product/' + this.model.id);
            }
        })
    });

    var CommentsListView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            className: 'comment-item',
            template: App.getTemplate('comment-item'),
            serializeData: function() {
                var data = Amour.ModelView.prototype.serializeData.call(this);
                data.formatted_date = moment(data.createTime).format('MM月DD日 HH:mm');
                data.likeCount = +data.likeCount;
                return data;
            }
        })
    });

    App.Pages.Topic = new (App.PageView.extend({
        events: {
            'click .comment-tip': 'viewAllComments'
        },
        initPage: function() {
            this.topic = new TopicModel();
            this.products = new ProductsCollection();
            this.comments = new CommentsCollection();
            this.views = {
                topic: new TopicView({
                    model: this.topic,
                    el: this.$('.topic-wrapper')
                }),
                products: new ProductsListView({
                    collection: this.products,
                    el: this.$('.topic-products .media-list')
                }),
                comments: new CommentsListView({
                    collection: this.comments,
                    el: this.$('.comments-list')
                })
            };
        },
        viewAllComments: function() {
            App.router.navigate(['topic', this.topic.id, 'comments'].join('/'));
        },
        render: function() {
            var topicId = this.options.topicId;
            this.topic.fetch({
                dataType: 'jsonp',
                data: { id: topicId },
            });
            this.products.fetch({
                dataType: 'jsonp',
                data: { id: topicId, start: 0, size: 99 }
            });
            var self = this;
            this.comments.fetch({
                dataType: 'jsonp',
                data: { tid: topicId, size: 3, max_id: null },
                success: function(collection) {
                    self.$('.comment-tip span').text(collection.size);
                }
            });
        }
    }))({el: $('#view-topic')});

})();
