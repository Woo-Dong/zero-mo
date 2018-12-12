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

  $('.contest-report-btn').click(function(e) {
    var $el = $(e.currentTarget);
    $.ajax({
      url: '/api/contests/' + $el.data('id') + '/report',
      method: 'POST',
      dataType: 'json',
      success: function(data) {
        $('.contest-report-btn').hide();
        alert('신고접수가 완료되었습니다.');
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
