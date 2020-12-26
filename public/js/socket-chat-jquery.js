$('document').ready(function () {
  // ============================================
  // Global variables
  // ============================================

  //Using socket.io library
  let socket = io();

  // references to objects inside chat.html
  // list of users
  let divUsers = $('#div-users');
  let formSend = $('#form-send');
  let txtSend = $('#txt-send');
  let divChatbox = $('#chat-box');
  let chatRoomName = $('#chat-room-name');

  // modal to show errors
  let errorModal = $('#error-modal');
  let errorHint = $('#error-hint');

  // Users connected to the chat
  let users = [];

  // All users in the DB
  let allUsers = [];

  // Sounds
  let newMsgSend = $('#new-msg-send')[0];
  let newMsgReceived = $('#new-msg-received')[0];
  let newUser = $('#new-user')[0];
  // let exitUser = $('#exit-user')[0];
  let errorSound = $('#error-sound')[0];
  let bye = $('#bye')[0];
  let hiSound = $('#hi-sound')[0];

  //We could improve it using a single array of users

  // params: room, token, role, enabled, google, _id, username, email, img
  let params = new URLSearchParams(window.location.search);

  if (!params.has('username') || !params.has('room') || !params.has('token')) {
    window.location = 'index.html';
    throw new Error('There was an error validating the user');
  } else {
    //??
    //validate token, every time the page is loaded we must validate it
    //working with the database we will validate de user connection
    //(loading messages from de data base)
  }

  let currentUser = {
    room: params.get('room'),
    token: params.get('token'),
    role: params.get('role'),
    enabled: params.get('enabled'),
    google: params.get('google'),
    _id: params.get('_id'),
    username: params.get('username'),
    email: params.get('email'),
    img: params.get('img'),
  };

  // ============================================
  // socket.io
  // ============================================

  // connecting to the server for the first time
  socket.on('connect', function () {
    console.log('Client connected to server');

    hiSound.play();

    socket.emit('loginChat', currentUser, function (usersConnected) {
      chatRoomName.text(`'${currentUser.room}'`);
      //adding id (socket) to currentUser
      currentUser.id = usersConnected.filter(
        (user) => user._id === currentUser._id
      )[0].id;

      //I keep users in a global variable
      users = usersConnected;

      //on chat login, load users
      renderUsers(usersConnected);

      //on chat login, fist load all users' data and all messages
      loadAllUsers();
    });
  });

  // Disconnected from server
  socket.on('disconnect', function () {
    console.log('The connection with the server was lost');
    bye.play();
  });

  // Listening for new messages
  socket.on('createMessage', function (message) {
    // console.log('Servidor:', message);
    renderMessage(message, currentUser);

    scrollBottom();

    newMsgReceived.play();
  });

  // Listening for new users
  socket.on('userList', function (userArray) {
    //I keep users in a global variable
    //improvement: we only need the new user connected, not all users...
    users = userArray;
    renderUsers(userArray);
    newUser.play();
  });

  // Private message received
  socket.on('privateMessage', function (message) {
    console.log('Private message:', message);
    newMsgReceived.play(); //another sound for private messages???
  });

  // ============================================
  // Utils
  // ============================================

  // Format number to, at least, two digits
  function twoDigits(txt) {
    if (txt.toString().length === 1) {
      txt = '0' + txt;
    }
    return txt;
  }

  // ============================================
  // Render
  // ============================================

  // Render connected users
  function renderUsers(users) {
    // [{},{},{}]
    let html = '';
    let img = '';

    html += '<li>';
    html +=
      '    <a href="javascript:void(0)" class="active"> eChat:<span> ' +
      'Users connected' + //params.get('room') +
      '</span></a>';
    html += '</li>';

    for (let i = 0; i < users.length; i++) {
      html += '<li>';

      // if (!users[i].img) {
      //   img = 'assets/images/user/no-image.jpg';
      // } else {
      img = `/image/user/${users[i].img}?token=${users[i].token}`;
      // }
      html +=
        '    <a data-id="' +
        users[i].id +
        `"  href="javascript:void(0)"><img src="${img}" alt="user-img" class="img-circle"> <span>` +
        users[i].username +
        ' <small class="text-success">online</small></span></a>';
      html += '</li>';
    }

    divUsers.html(html);
  }

  // Rendering a single message
  function htmlSingleMessage(
    class1,
    class2,
    username,
    msgcontent,
    img,
    time,
    me
  ) {
    var txt = '';
    if (me) {
      txt += '<li class="reverse">';
      txt += '  <div class="chat-content">';
      txt += `    <h5>${time} – ${username}</h5>`;
      txt += `    <div class="chat-img"><img src="${img}" alt="user" /></div>`;
      txt += '    <div class="box bg-light-inverse">' + msgcontent + '</div>';
      txt += '  </div>';

      txt += '</li>';
    } else {
      txt += '<li>';
      txt += '  <div class="chat-content">';
      txt += `    <h5>${username} – ${time}</h5>`;
      txt += `    <div class="chat-img"><img src="${img}" alt="user" /></div>`;
      txt += '    <div class="box bg-light-danger">' + msgcontent + '</div>';
      txt += '  </div>';

      txt += '</li>';
    }

    return txt;
  }

  // ir renders a new message appending it to the current messages
  // (message generated from the view or coming from the DB)
  function renderMessage(message, curUser) {
    // message: {sender, receiver, room, content, timestamp}
    // curUser: {room, token, role, enabled, google, _id, username, email, img}
    // implement using DOM?

    let html = '';

    //for function htmlSingleMessage
    let class1 = '';
    let class2 = '';
    let username = '';
    let msgcontent = '';
    let img = '';
    //next variables to get current time in format hh:mm
    let date = new Date(Number(message.timestamp));
    let hour = twoDigits(date.getHours());
    let minutes = twoDigits(date.getMinutes());
    let time = `${hour}:${minutes}`;

    if (message.sender === curUser._id) {
      //sender is current user

      class1 = 'reverse';
      class2 = 'box bg-light-inverse';
      username = curUser.username;
      msgcontent = message.content;
      img = `/image/user/${curUser.img}?token=${curUser.token}`;
      html += htmlSingleMessage(
        class1,
        class2,
        username,
        msgcontent,
        img,
        time,
        true
      );
    } else {
      //class1 = 'animated fadeIn';
      msgcontent = message.content;

      //sender is another user
      let foundUser = allUsers.filter((user) => user._id === message.sender)[0];
      class2 = 'box bg-light-info';
      username = foundUser.username;

      img = `/image/user/${foundUser.img}?token=${curUser.token}`;

      html += htmlSingleMessage(
        class1,
        class2,
        username,
        msgcontent,
        img,
        time,
        false
      );
    }

    divChatbox.append(html);
  }

  //function to render messages stored in the DB
  //messages: array of messages
  function renderMessagesDB(messages) {
    for (const msg of messages) {
      renderMessage(msg, currentUser);
      scrollBottom();
    }
  }

  // scroll to the last message
  function scrollBottom() {
    // selectors
    let newMessage = divChatbox.children('li:last-child');

    // heights
    let clientHeight = divChatbox.prop('clientHeight');
    let scrollTop = divChatbox.prop('scrollTop');
    let scrollHeight = divChatbox.prop('scrollHeight');
    let newMessageHeight = newMessage.innerHeight();
    let lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (
      clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
      scrollHeight
    ) {
      divChatbox.scrollTop(scrollHeight);
    }
  }

  // To load all the messages from the DB, first we must have all the data about the users
  function loadAllUsers() {
    $.ajax({
      type: 'GET',
      beforeSend: function (request) {
        request.setRequestHeader('token', currentUser.token); //often "Authority" instead of "token"
      },
      url: `/user/`,
      success: function (data, status) {
        allUsers = data.users;
        //on chat login, load messages stored into the database and render them
        loadMessages();
      },
      error: function (e) {
        errorHint.html('<h4>Error!</h4>' + e.responseJSON.err.message);
        errorModal.modal('toggle');
        errorSound.play();
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  }

  // after getting the messages from the DB we call renderMessagesDB
  function loadMessages() {
    $.ajax({
      type: 'GET',
      beforeSend: function (request) {
        request.setRequestHeader('token', currentUser.token); //often "Authority" instead of "token"
      },
      url: `/messages/${currentUser.room}`,
      success: function (data, status) {
        renderMessagesDB(data.messages);
      },
      error: function (e) {
        errorHint.html('<h4>Error!</h4>' + e.responseJSON.err.message);
        errorModal.modal('toggle');
        errorSound.play();
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  }

  function createPrivChat(name, username) {
    name = name.trim();
    const popUpChat = document.createElement('div');
    popUpChat.id = name;
    popUpChat.className = 'cpmain-section';
    const popUpTemplate = document.getElementById('popup-chat-template');
    const popUpBody = document.importNode(popUpTemplate.content, true);
    popUpBody.querySelector('.fa-minus').id = name + 'Min'; // minimize button
    popUpBody.querySelector('.fa-times').id = name + 'Close'; // close button
    popUpBody.querySelector('.fa-paper-plane-o').id = name + 'Send'; // send button

    // I don't know why it does not work, I implement the same binding the input text
    // popUpBody.querySelector('input').id = name + 'Txt';
    console.log(popUpBody.querySelector('input').id);
    popUpBody.querySelector('p').textContent = username;
    popUpChat.append(popUpBody);
    $('body').append(popUpChat);
  }

  // ============================================
  // Event listeners
  // ============================================

  // hide error modal on click
  errorModal.click(function () {
    errorModal.modal('toggle');
  });

  // set an event listener for keys if the error modal is show
  // I don't like to implement this this way, improve it!
  errorModal.on('shown.bs.modal', function () {
    //if the modal is shown, I listen to any key to close it
    $(document.body).keypress(function () {
      if (errorModal.is(':visible')) {
        errorModal.modal('toggle');
      }
      // errorModal.modal('hide');
    });
  });

  // click on a user
  divUsers.on('click', 'a', function () {
    let id = $(this).data('id');
    // We can not send private messages to ourselves
    if (id === currentUser.id) return;

    //receiver data
    let receiver = users.filter((user) => user.id === id)[0];

    // cloning the template and rendering
    createPrivChat('privChat1', receiver.username);

    // event listener for minimize button
    $('#privChat1Min').click(function () {
      $('#privChat1').toggleClass('cpopen-more');
    });

    // event listener for close button
    $('#privChat1Close').click(function () {
      $('#privChat1').remove();
    });
    console.log('CLCIK', $('input')[0].value.trim());

    $('#privChat1Send').bind(
      'click',
      {
        txt: $('input')[2],
      },
      function (event) {
        let message = {
          sender: currentUser._id,
          receiver: id,
          content: event.data.txt.value.trim(),
          timestamp: new Date().getTime(),
        };

        // event listener for close button
        event.preventDefault();
        socket.emit('privateMessage', message);
      }
    );
  });

  // click on send button
  formSend.on('submit', function (e) {
    e.preventDefault();

    if (txtSend.val().trim().length === 0) {
      return;
    }

    // data to sent to the controller
    let postData = {
      sender: currentUser._id,
      receiver: currentUser.room,
      content: txtSend.val().trim(),
      timestamp: new Date().getTime(),
    };

    // Storing the message into the database
    $.ajax({
      type: 'POST',
      beforeSend: function (request) {
        request.setRequestHeader('token', currentUser.token); // often "Authority" instead of "token"
      },
      url: '/message',
      data: JSON.stringify(postData),
      success: function (data, status) {
        socket.emit('createMessage', postData, function (message) {
          txtSend.val('').focus();
          renderMessage(message, currentUser);
          scrollBottom();
          newMsgSend.play();
        });
      },
      error: function (e) {
        errorHint.html('<h4>Error!</h4>' + e.responseJSON.err.message);
        errorModal.modal('toggle');
        errorSound.play();
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  });
});
