$(function() {
  $('.contest-like-btn').click(function(e) {
    var $el = $(e.currentTarget);
    $.ajax({
      url: '/api/contests/' + $el.data('id') + '/like',
      method: 'POST',
      dataType: 'json',
      success: function(data) {
        $('.contest .num-likes').text(data.numLikes);
        $('.contest-like-btn').hide();
      },
      error: function(data, status) {
        if (data.status == 401) {
          alert('Login required!');
          location = '/signin';
        }
        console.log(data, status);
      }
    })
  })
});
