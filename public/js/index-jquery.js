$('document').ready(function () {
  var preloader = $('.preloader'); //var instead of let for old browsers
  var errorModal = $('#errorModal');

  preloader.fadeOut();

  errorModal.click(function () {
    errorModal.modal('toggle');
  });

  errorModal.on('shown.bs.modal', function () {
    //if the modal is shown, I listen to any key to close it
    $(document.body).keypress(function () {
      if (errorModal.is(':visible')) {
        errorModal.modal('toggle');
      }
      //errorModal.modal('hide');
    });
  });

  $('form').submit(function (e) {
    e.preventDefault();

    preloader.fadeIn();

    var postData = {
      username: $('input[name ="username"]').val(),
      password: $('input[name ="password"]').val(),
    };

    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/login',
      data: JSON.stringify(postData),
      success: function (data, status) {
        //var instead of let for old browsers
        var params = new URLSearchParams(data.user).toString();
        var url = `chat.html?room=general&token=${data.token}&${params}`;

        //preloader.fadeOut();

        window.location = url;
      },
      error: function (e) {
        preloader.fadeOut();

        if (e.readyState === 0) {
          $('#errorHint').html(
            '<h4>Danger!</h4>Connection lost with the server'
          );
          errorModal.modal('toggle');
        } else {
          resp = e.responseJSON;
          if (!resp.ok) {
            $('#errorHint').html('<h4>Error!</h4>' + resp.err.message);
            errorModal.modal('toggle');
          }
        }
      },
      dataType: 'json',
      contentType: 'application/json',
    });

    // return false;
  });
});
