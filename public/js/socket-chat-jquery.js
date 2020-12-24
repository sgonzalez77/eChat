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
  // modal to show errprs
  let errorModal = $('#error-modal');
  let errorHint = $('#error-hint');

  // Users connected to the chat
  let users = [];

  // All users in the DB
  let allUsers = [];

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

  socket.on('connect', function () {
    console.log('Client connected to server');

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

  // escuchar
  socket.on('disconnect', function () {
    console.log('The connection with the server was lost');
  });

  // Listen for new messages
  socket.on('createMessage', function (message) {
    // console.log('Servidor:', message);
    renderMessage(message, currentUser);
    scrollBottom();
  });

  // Listen for new users
  socket.on('userList', function (userArray) {
    //I keep users in a global variable
    //improvement: we only need the new user connected, not all users...
    users = userArray;
    renderUsers(userArray);
  });

  // Private message
  // socket.on('privateMessage', function (message) {
  //   console.log('Private missage:', message);
  // });

  // ============================================
  // Utils
  // ============================================

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
    txt += `<li class="${class1}">`;
    if (!me)
      txt += `    <div class="chat-img"><img src="${img}" alt="user" /></div>`;
    txt += '    <div class="chat-content">';
    txt += `        <h5>${username}</h5>`;
    txt += `        <div class="${class2}">${msgcontent}</div>`;
    txt += '    </div>';
    if (me)
      txt += `    <div class="chat-img"><img src="${img}" alt="user" /></div>`;
    txt += `    <div class="chat-time">${time}</div>`;
    txt += '</li>';

    return txt;
  }

  //renders a new message appending it to the current messages
  //(message generated from the view or coming from the DB)

  function renderMessage(message, curUser) {
    //message: {sender, receiver, room, content, timestamp}
    //curUser: {room, token, role, enabled, google, _id, username, email, img}
    //implement using DOM?

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

    let adminClass = 'info';

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
      class1 = 'animated fadeIn';
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
      },
      dataType: 'json',
      contentType: 'application/json',
    });
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

    if (id) {
      console.log(id);
    }
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
        });
      },
      error: function (e) {
        $('#errorHint').html('<h4>Error!</h4>' + e.responseJSON.err.message);
        errorModal.modal('toggle');
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  });
});
