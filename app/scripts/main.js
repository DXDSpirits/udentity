
(function () {

    var animate = [];

    animate[1] = _.once(function() {
        var $shop = $('#view-prologue .shop');
        $shop.empty();
        var append = function($img, delay) {
            _.delay(function() {
                $shop.append($img);
            }, delay);
        };
        for (var i=0; i<3; i++) {
            var $img = $('<div class="img img-contain"></div>');
            Amour.loadBgImage($img, 'images/shop/' + (i + 1) + '.png');
            append($img, i * 500);
        }
        _.delay(function() {
            var $text = $('<h1>在中国，你认识的十个人里或许有一个就是开着或者想要开店的</h1>');
            $shop.after($text);
        }, 1500);
    });

    $('#view-problems').find('.figure').each(function() {
        var $box = $(this).find('.box');
        var $line = $(this).find('.line');
        var h = $(this).height();
        $(this).css('width', h * 2);
    });

    animate[2] = _.once(function() {
        var $view = $('#view-problems');
        $view.addClass('active');
    });

    $('#view-solution').find('.thumbup').css('width', $('#view-solution').find('.thumbup').height() * 1.5);
    $('#view-solution').find('.idea').each(function() {
        var $box = $(this).find('.box');
        var h = $(this).height();
        $(this).css('width', h * 1.5);
    });

    animate[3] = _.once(function() {
        var $view = $('#view-solution');
        $view.addClass('active');
    });

    var scroller = new IScroll('.views-wrapper', {
        snap: true,
        momentum: false,
        bounce: false,
        keyBindings: true
    });
    scroller.on('scrollEnd', function() {
        var page = scroller.currentPage.pageY;
        animate[page] && animate[page]();
        var color = "#fff";
        if (page == 2) {
            color = '#ab773f';
        } else if (page == 0) {
            color = '#83bfe3';
        }
        $('#global-header').css('color', color);
    })
    var scrollAnim = function(event, delta, deltaX, deltaY) {
        var next = scroller.currentPage.pageY + (delta > 0 ? -1 : 1);
        scroller.goToPage(0, next, 500);
        return false;
    };
    // $(".views-wrapper").on('mousewheel', _.debounce(scrollAnim, 500, true));
    _.delay(function() {
        // animate[0]();
    }, 1000);
})();
