
(function () {
    scroller = new IScroll('.views-wrapper', {
        snap: true,
        momentum: false,
        bounce: false,
        // probeType: 3,
        // eventPassthrough: true
    });
    var scrollAnim = function(event, delta, deltaX, deltaY) {
        var next = scroller.currentPage.pageY + (delta > 0 ? -1 : 1);
        scroller.goToPage(0, next, 500);
        return false;
    };
    $(".views-wrapper").on('mousewheel', _.debounce(scrollAnim, 500, true));
})();
