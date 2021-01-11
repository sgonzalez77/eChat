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

  // referencies to the popup chats
  let popupChats = [];

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

  // if (!params.has('username') || !params.has('room') || !params.has('token')) {
  //   let destination = '/index.html';
  //   window.location.href =
  //     destination +
  //     '?ok=false,err=' +
  //     encodeURIComponent('There was an error validating the user');
  // } else {
  //   //??
  //   //validate token, every time the page is loaded we must validate it
  //   //working with the database we will validate the user connection
  //   //(loading messages from de data base)
  // }

  let currentUser = {
    room: params.get('room'),
    token: params.get('token'),
    _id: params.get('_id'),
    username: params.get('username'),
    img: params.get('img'),
  };

  // ============================================
  // socket.io
  // ============================================

  // connecting to the server for the first time
  socket.on('connect', function () {
    console.log('Client connected to server');

    hiSound.play();

    socket.emit('loginChat', currentUser, function (usersConnected, err) {
      if (!usersConnected) {
        let destination = '/index.html';
        let error = 'An error ocurred. Try again.';
        if (err) {
          error = err.message;
        }
        window.location.href =
          destination + '?ok=false&err=' + encodeURIComponent(error);
      } else {
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
      }
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

    scrollBottom(divChatbox);

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
    newMsgReceived.play(); //another sound for private messages???

    // render new private message

    //sender data
    let sender = users.filter((user) => user._id === message.sender)[0];

    // Save reference for better performance
    let chatDiv = null;

    // cloning the template and rendering
    // we keep references to all private chats opened into popupChats

    if (!popupChats.filter((chat) => chat._id === message.sender)[0]) {
      // chats exists?

      popupChats.push({
        _id: message.sender,
        chatDiv,
      });
      createPrivChat(message.sender, sender.username);

      // event listeners for private chat
      setPrivChatEvListeners(message.sender);

      chatDiv = $(`#${message.sender}UL`);
    } else {
      chatDiv = $(`#${message.sender}UL`);
    }

    renderPrivateMessage(
      chatDiv,
      message.sender,
      'cpleft-chat',
      message.content,
      message.timestamp
    );

    scrollBottom2(chatDiv);
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

  // rendering private messages
  function renderPrivateMessage(el, _id, myclass, text, timestamp) {
    let date = new Date(Number(timestamp));
    let hour = twoDigits(date.getHours());
    let minutes = twoDigits(date.getMinutes());
    let time = `${hour}:${minutes}`;

    let li = $('<li/>');

    let divContent = $('<div/>', {
      class: myclass,
    }).appendTo(li);

    let pText = $('<p/>', {
      text: text,
    }).appendTo(divContent);

    let sTime = $('<span/>', {
      text: time,
    }).appendTo(divContent);

    // If we implement it this way the user may be able to execute JS code
    // html += '<li>';
    // html += `<div class="${myclass}">`;
    // html += `  <p>${text}</p>`;
    // html += `  <span>${time}</span>`;
    // html += '</div>';
    // html += '</li>';

    el.append(li);
  }

  // Render connected users
  function renderUsers(users) {
    // [{},{},{}]
    let html = '';
    let img = '';

    //username must be restricted to chars and numbers (and some symbols), JS code maybe be executed otherwise...
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
        '    <a data-_id="' +
        users[i]._id +
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
    let txt = '';
    let li = null;
    if (me) {
      li = $('<li/>', {
        class: 'reverse',
      });

      let divContent = $('<div/>', {
        class: 'chat-content',
      }).appendTo(li);

      let h5 = $('<h5/>', {
        text: `${time} – ${username}`,
      }).appendTo(divContent);

      let divImg = $('<div/>', {
        class: 'chat-img',
      }).appendTo(divContent);

      let imgEl = $('<img/>', {
        alt: 'user',
        src: img,
      }).appendTo(divImg);

      let divMsg = $('<div/>', {
        class: 'box bg-light-inverse',
        text: msgcontent,
      }).appendTo(divContent);

      // If we implement it this way the user may be able to execute JS code
      // txt += '<li class="reverse">';
      // txt += '  <div class="chat-content">';
      // txt += `    <h5>${time} – ${username}</h5>`;
      // txt += `    <div class="chat-img"><img src="${img}" alt="user" /></div>`;
      // txt += '    <div class="box bg-light-inverse">' + msgcontent + '</div>';
      // txt += '  </div>';

      // txt += '</li>';
    } else {
      li = $('<li/>', {});

      let divContent = $('<div/>', {
        class: 'chat-content',
      }).appendTo(li);

      let h5 = $('<h5/>', {
        text: `${time} – ${username}`,
      }).appendTo(divContent);

      let divImg = $('<div/>', {
        class: 'chat-img',
      }).appendTo(divContent);

      let imgEl = $('<img/>', {
        alt: 'user',
        src: img,
      }).appendTo(divImg);

      let divMsg = $('<div/>', {
        class: 'box bg-light-danger',
        text: msgcontent,
      }).appendTo(divContent);
      // If we implement it this way the user may be able to execute JS code
      // txt += '<li>';
      // txt += '  <div class="chat-content">';
      // txt += `    <h5>${username} – ${time}</h5>`;
      // txt += `    <div class="chat-img"><img src="${img}" alt="user" /></div>`;
      // txt += '    <div class="box bg-light-danger">' + msgcontent + '</div>';
      // txt += '  </div>';

      // txt += '</li>';
    }

    return li;
  }

  // ir renders a new message appending it to the current messages
  // (message generated from the view or coming from the DB)
  function renderMessage(message, curUser) {
    // message: {sender, receiver, room, content, timestamp}
    // curUser: {room, token, role, enabled, google, _id, username, email, img}
    // implement using DOM?

    let html = null;

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
      html = htmlSingleMessage(
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

      html = htmlSingleMessage(
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
      scrollBottom(divChatbox);
    }
  }

  // scroll to the last message
  function scrollBottom(el) {
    // selectors
    let newMessage = el.children('li:last-child');

    // heights
    let clientHeight = el.prop('clientHeight');
    let scrollTop = el.prop('scrollTop');
    let scrollHeight = el.prop('scrollHeight');
    let newMessageHeight = newMessage.innerHeight();
    let lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (
      clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
      scrollHeight
    ) {
      el.scrollTop(scrollHeight);
    }
  }

  // I don't know why with private messages with a similar structure
  // I need to run el.parent().scrollTop(scrollHeight); instead of
  // el.scrollTop(scrollHeight);
  // the structure is DIV-UL-LI in botx cases!!
  // I'll fix it when I have time
  function scrollBottom2(el) {
    // selectors
    let newMessage = el.children('li:last-child');

    // heights
    let clientHeight = el.prop('clientHeight');
    let scrollTop = el.prop('scrollTop');
    let scrollHeight = el.prop('scrollHeight');
    let newMessageHeight = newMessage.innerHeight();
    let lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (
      clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
      scrollHeight
    ) {
      el.parent().scrollTop(scrollHeight);
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

  function createPrivChat(_id, username) {
    //pure JS
    const popUpChat = document.createElement('div');
    popUpChat.id = _id;
    popUpChat.className = 'cpmain-section ui-widget-content';
    const popUpTemplate = document.getElementById('popup-chat-template');
    const popUpBody = document.importNode(popUpTemplate.content, true);

    popUpBody.querySelector('.fa-minus').id = _id + 'Min'; // minimize button
    popUpBody.querySelector('.fa-times').id = _id + 'Close'; // close button
    popUpBody.querySelector('.fa-paper-plane-o').id = _id + 'Send'; // send button
    popUpBody.querySelector('input').id = _id + 'Txt'; // input text
    popUpBody.querySelector('.cpchat-section').id = _id + 'Div'; // DIV containing the list with the messages
    popUpBody.querySelector('ul').id = _id + 'UL'; // list with the messages
    popUpBody.querySelector('p').textContent = username; // private chat title
    popUpChat.append(popUpBody);
    document.body.append(popUpChat);

    //jquery
    $(`#${_id}`).draggable();
  }

  // ============================================
  // Event listeners
  // ============================================

  // hide error modal on click
  errorModal.click(function () {
    errorModal.modal('toggle');
    let destination = '/index.html';
    window.location.href = destination + '?ok=false';
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

  function setPrivChatEvListeners(_id) {
    // event listener for minimize button

    // originally it was implemented with a css class and the mothod toggle,
    //but after using draggable it fails
    $(`#${_id}Min`).click(function () {
      let myWin = $(`#${_id}`);
      let wHeight = $(window).height();
      let bHeight = $('.cpborder-chat').height();
      let privateHeight = 0; // private window height

      $('.cpborder-chat').each(function () {
        privateHeight += $(this).outerHeight();
      });

      if ($(`#${_id}`).position().top < wHeight - bHeight) {
        myWin.animate(
          {
            top: $(window).height() - $('.cpborder-chat').height() + 'px',
          },
          200,
          function () {
            //end of animation.. if you want to add some code here
          }
        );
      } else {
        myWin.animate(
          {
            top: $(window).height() - privateHeight + 'px',
          },
          200,
          function () {
            //end of animation.. if you want to add some code here
          }
        );
      }
    });

    // event listener for close button
    $(`#${_id}Close`).click(function () {
      $(`#${_id}`).remove();
      popupChats = popupChats.filter((chat) => chat._id !== _id);
    });

    $(`#${_id}Send`).bind(
      'click',
      {
        txt: $(`#${_id}Txt`),
      },
      function (event) {
        if (event.data.txt.val().trim().length === 0) {
          return;
        }

        let message = {
          sender: currentUser._id,
          receiver: _id,
          content: event.data.txt.val().trim(),
          timestamp: new Date().getTime(),
        };
        // event listener for send button
        event.preventDefault();
        socket.emit('privateMessage', message, function (data) {
          renderPrivateMessage(
            $(`#${data.receiver}UL`),
            data.receiver,
            'cpright-chat',
            data.content,
            data.timestamp
          );

          scrollBottom2($(`#${data.receiver}UL`));
          event.data.txt.val('').focus();
        });
      }
    );

    // pressing enter on the input text of a private chat
    $(`#${_id}Txt`).on('keypress', function (event) {
      if (event.keyCode === 13 && $(this).val().trim() !== '') {
        let message = {
          sender: currentUser._id,
          receiver: _id,
          content: $(this).val().trim(),
          timestamp: new Date().getTime(),
        };
        // event listener for enter key press
        event.preventDefault();
        socket.emit('privateMessage', message, function (data) {
          renderPrivateMessage(
            $(`#${data.receiver}UL`),
            data.receiver,
            'cpright-chat',
            data.content,
            data.timestamp
          );

          $(`#${data.receiver}Txt`).val('').focus();

          scrollBottom2($(`#${data.receiver}UL`));
        });
      }
    });
  }

  // click on a user
  divUsers.on('click', 'a', function () {
    let _id = $(this).data('_id');

    // We can not send private messages to ourselves
    if (_id === currentUser._id) return;

    //receiver data
    let receiver = users.filter((user) => user._id === _id)[0];

    if (!popupChats.filter((chat) => chat._id === _id)[0]) {
      // chats exists?
      // cloning the template and rendering
      popupChats.push({
        _id,
        chatDiv: $(`#${_id}UL`),
      });
      createPrivChat(_id, receiver.username);

      // event listeners for private chat
      setPrivChatEvListeners(_id);

      // open priv chat window
      $(`#${_id}`).toggleClass('cpopen-more');
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
          scrollBottom(divChatbox);
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
