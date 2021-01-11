$('document').ready(function () {
  let preloader = $('.preloader');
  let errorModal = $('#error-modal');
  let errorHint = $('#error-hint');
  let params = new URLSearchParams(window.location.search);

  // Sounds
  let errorSound = $('#error-sound')[0];

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
          errorSound.play();
        } else {
          resp = e.responseJSON;
          if (!resp.ok) {
            errorHint.html('<h4>Error!</h4>' + resp.err.message);
            errorModal.modal('toggle');
            errorSound.play();
          }
        }
      },
      dataType: 'json',
      contentType: 'application/json',
    });

    // return false;
  });
  console.log(params.get('ok'));
  if (params.get('ok') === 'false') {
    errorHint.html('<h4>Error!</h4>' + params.get('err'));
    errorModal.modal('toggle');
    errorSound.play();
  } else {
    errorHint.html(
      '<h4>Warning!</h4>' +
        'I am Sergio González and you can use this ' +
        'chat ONLY if you are one of my students. ' +
        'The main goal of this project is to show my students the ' +
        'importance of a database within a web project. ' +
        'Messages can be stored in a database, so YOU ARE ' +
        'NOT ALLOWED TO USE THIS WEBSITE TO COMMUNICATE. As I ' +
        'told you, this is a project for ACADEMIC PURPOSES ONLY. ' +
        'For more information visit: https://github.com/sgonzalez77/eChat'
    );
    errorModal.modal('toggle');
  }
});
