(function() {

    var geolocation = new function() {
        var self = this;
        this.get = function(callback) {
            if (this.coords) {
                callback(this.coords);
            } else {
                navigator.geolocation.getCurrentPosition(function(position) {
                    self.coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    callback(self.coords);
                });
            }
        };
        this.distance = function(lat1, lon1, lat2, lon2) {
            var lat1 = lat1*Math.PI/180, lon1 = lon1*Math.PI/180;
            var lat2 = lat2*Math.PI/180, lon2 = lon2*Math.PI/180;
            var R = 6371;
            var x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
            var y = (lat2-lat1);
            var d = Math.sqrt(x*x + y*y) * R;
            if (d > 1) {
                return (parseInt(d * 10) / 10) + 'km';
            } else {
                return parseInt(d * 1000) + 'm';
            }
        };
    };

    var AddressCollection = Amour.Collection.extend({});

    var AddressListView = Amour.CollectionView.extend({
        ModelView: Amour.ModelView.extend({
            className: 'address-item',
            template: App.getTemplate('address-item'),
            render: function() {
                Amour.ModelView.prototype.render.call(this);
                var self = this;
                geolocation.get(function(position) {
                    var distance = geolocation.distance(
                        self.model.get('lat'), self.model.get('lng'),
                        position.latitude, position.longitude);
                    self.$('.distance').text(distance);
                });
                return this;
            }
        })
    });

    App.Pages.Address = new (App.PageView.extend({
        initPage: function() {
            this.address = new AddressCollection();
            this.views = {
                address: new AddressListView({
                    collection: this.address,
                    el: this.$('.address-list')
                })
            };
        },
        render: function() {
            var id, url;
            if (this.options.brandId) {
                id = this.options.brandId;
                url = Amour.APIRoot + 'beacon/data/listBrandStores.do';
            } else {
                id = this.options.productId;
                url = Amour.APIRoot + 'beacon/data/listStoresByItemid.do';
            }
            this.address.fetch({
                dataType: 'jsonp',
                url: url,
                data: { id: id, cityName: '北京市' }
            });
        }
    }))({el: $('#view-address')});

})();
