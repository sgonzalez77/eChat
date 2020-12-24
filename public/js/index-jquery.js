$('document').ready(function () {
  let preloader = $('.preloader');
  let errorModal = $('#error-modal');
  let errorHint = $('#error-hint');

  preloader.fadeOut();

  // click to modal to hide it
  errorModal.click(function () {
    errorModal.modal('toggle');
  });

  //set an event listener for keys if the error modal is show
  //I don't like to implement this this way, improve it!
  errorModal.on('shown.bs.modal', function () {
    //if the modal is shown, I listen to any key to close it
    $(document.body).keypress(function () {
      // if (errorModal.is(':visible')) {
      //   errorModal.modal('toggle');
      // }
      errorModal.modal('hide');
    });
  });

  $('form').submit(function (e) {
    e.preventDefault();

    preloader.fadeIn();

    let postData = {
      username: $('input[name ="username"]').val(),
      password: $('input[name ="password"]').val(),
    };

    $.ajax({
      type: 'POST',
      url: '/login',
      data: JSON.stringify(postData),
      success: function (data, status) {
        let params = new URLSearchParams(data.user).toString();
        let url = `chat.html?room=general&token=${data.token}&${params}`;

        preloader.fadeOut();

        window.location = url;
      },
      error: function (e) {
        preloader.fadeOut();
        // Errors catched:
        // 1.- 2.- Wrong user/password
        // 3.- DB down
        // 4.- Server down
        if (e.readyState === 0) {
          errorHint.html('<h4>Danger!</h4>Connection lost with the server');
          errorModal.modal('toggle');
        } else {
          resp = e.responseJSON;
          if (!resp.ok) {
            errorHint.html('<h4>Error!</h4>' + resp.err.message);
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
