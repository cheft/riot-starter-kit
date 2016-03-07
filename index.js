var riot = window.riot = require('riot');

$(function() {
  $.init();
  $(document).on('pageInit', function(e, pageId, $page) {
    console.log($page.find('a[href="' + pageId + '"]'));
  });
});
