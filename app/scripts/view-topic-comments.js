(function() {

    var CommentsCollection = Amour.Collection.extend({
        url: Amour.APIRoot + 'beacon/data/getAllCommentByTopic.do'
    });

    var CommentsListView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            className: 'comment-item',
            template: App.getTemplate('comment-item'),
            serializeData: function() {
                var data = Amour.ModelView.prototype.serializeData.call(this);
                data.formatted_date = moment(data.createTime).format('MM月DD日 HH:mm');
                data.like = data.like || '';
                return data;
            }
        })
    });

    App.Pages.TopicComments = new (App.PageView.extend({
        initPage: function() {
            this.comments = new CommentsCollection();
            this.views = {
                comments: new CommentsListView({
                    collection: this.comments,
                    el: this.$('.comments-list')
                })
            };
        },
        render: function() {
            var topicId = this.options.topicId;
            var self = this;
            this.comments.fetch({
                dataType: 'jsonp',
                data: { tid: topicId, size: 99, max_id: null }
            });
        }
    }))({el: $('#view-topic-comments')});

})();
