//Using socket.io library
var socket = io(); //var instead of let for old browsers

// references to objects inside chat.html
var divUsers = $('#divUsers');
var formSend = $('#formSend');
var txtSend = $('#txtSend');
var divChatbox = $('#divChatbox');
var chatRoomName = $('#chatRoomName');

// params: room, token, role, enabled, google, _id, username, email, __v, img
var params = new URLSearchParams(window.location.search);

// console.log(params.toString());
if (!params.has('username') || !params.has('room') || !params.has('token')) {
  window.location = 'index.html';
  throw new Error('There was an error validating the user');
} else {
  //??
  //validate token, every time the page is loaded we must validate it
  //working with the database we will validate de user connection
  //(loading messages from de data base)
}

var currentUser = {
  room: params.get('room'),
  token: params.get('token'),
  role: params.get('role'),
  enabled: params.get('enabled'),
  google: params.get('google'),
  _id: params.get('_id'),
  username: params.get('username'),
  email: params.get('email'),
  __v: params.get('__v'),
  img: params.get('img'),
};

socket.on('connect', function () {
  console.log('Client connected to server');

  socket.emit('loginChat', currentUser, function (userConnected) {
    chatRoomName.text(`'${currentUser.room}'`);
    renderUsers(userConnected);
  });
});

// escuchar
socket.on('disconnect', function () {
  console.log('The connection with the server was lost');
});

// Listen for new messages
socket.on('createMessage', function (message) {
  // console.log('Servidor:', message);
  renderMessages(message, false);
  scrollBottom();
});

// Listen for new users
socket.on('userList', function (users) {
  renderUsers(users);
});

// Private message
// socket.on('privateMessage', function (message) {
//   console.log('Private missage:', message);
// });

// Render connected users
function renderUsers(users) {
  // [{},{},{}]

  var html = '';
  var img = '';

  html += '<li>';
  html +=
    '    <a href="javascript:void(0)" class="active"> eChat:<span> ' +
    'Users connected' + //params.get('room') +
    '</span></a>';
  html += '</li>';

  for (var i = 0; i < users.length; i++) {
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

//renders a new message appending it to the current messages
function renderMessages(message, me) {
  //implement using DOM?
  var html = '';
  var date = new Date(message.date);
  var hour = date.getHours();
  var minutes = date.getMinutes();
  var time = ':';
  var img = '';

  var adminClass = 'info';

  if (hour.toString().length === 1) {
    hour = '0' + hour;
  }

  if (minutes.toString().length === 1) {
    minutes = '0' + minutes;
  }

  time = hour + time + minutes;

  // if (!message.img) {
  //   img = 'assets/images/user/no-image.jpg';
  // } else {
  img = `/image/user/${message.img}?token=${currentUser.token}`;
  // }

  if (message.username === 'Administrator') {
    adminClass = 'danger';
  }

  if (me) {
    html += '<li class="reverse">';
    html += '    <div class="chat-content">';
    html += '        <h5>' + message.username + '</h5>';
    html +=
      '        <div class="box bg-light-inverse">' +
      message.msgcontent +
      '</div>';
    html += '    </div>';
    html += `    <div class="chat-img"><img src="${img}" alt="user" /></div>`;
    html += '    <div class="chat-time">' + time + '</div>';
    html += '</li>';
  } else {
    html += '<li class="animated fadeIn">';

    if (message.username === 'Administrator') {
      img = 'assets/images/user/blm.png';
    } else {
      // if (!message.img) {
      //   img = 'assets/images/user/no-image.jpg';
      // } else {
      img = `/image/user/${message.img}?token=${currentUser.token}`;
      // }
    }

    html += `    <div class="chat-img"><img src="${img}" alt="user" /></div>`;
    html += '    <div class="chat-content">';
    html += '        <h5>' + message.username + '</h5>';
    html +=
      '        <div class="box bg-light-' +
      adminClass +
      '">' +
      message.msgcontent +
      '</div>';
    html += '    </div>';
    html += '    <div class="chat-time">' + time + '</div>';
    html += '</li>';
  }

  divChatbox.append(html);
}

function scrollBottom() {
  // selectors
  var newMessage = divChatbox.children('li:last-child');

  // heights
  var clientHeight = divChatbox.prop('clientHeight');
  var scrollTop = divChatbox.prop('scrollTop');
  var scrollHeight = divChatbox.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight() || 0;

  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    divChatbox.scrollTop(scrollHeight);
  }
}

// Listeners
divUsers.on('click', 'a', function () {
  var id = $(this).data('id');

  if (id) {
    console.log(id);
  }
});

formSend.on('submit', function (e) {
  e.preventDefault();

  if (txtSend.val().trim().length === 0) {
    return;
  }

  socket.emit(
    'createMessage',
    {
      username: currentUser.username,
      img: currentUser.username,
      msgcontent: txtSend.val(),
    },
    function (message) {
      txtSend.val('').focus();
      renderMessages(message, true);
      scrollBottom();
    }
  );
});
