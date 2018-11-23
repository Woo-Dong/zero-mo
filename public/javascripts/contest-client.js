$(function() {
    $('.contest-like-btn').click(function(e) {
      var $el = $(e.currentTarget);
      if ($el.hasClass('loading')) return;
      $el.addClass('loading');
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
        },
        complete: function(data) {
          $el.removeClass('loading');
        }
      });
    });
  
    $('.comment-like-btn').click(function(e) {
      var $el = $(e.currentTarget);
      if ($el.hasClass('disabled')) return;
      $.ajax({
        url: '/api/comments/' + $el.data('id') + '/like',
        method: 'POST',
        dataType: 'json',
        success: function(data) {
          $el.parents('.contest').find('.num-likes').text(data.numLikes);
          $el.addClass('disabled');
        },
        error: function(data, status) {
          if (data.status == 401) {
            alert('Login required!');
            location = '/signin';
          }
          console.log(data, status);
        }
      });
    });
  }); 