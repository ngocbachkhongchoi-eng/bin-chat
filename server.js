const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const users = [];
const friends = {};
const requests = {};
const messages = {};

const HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BIN Chat</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',sans-serif}
body{background:#e9eef5;height:100vh;overflow:hidden}
.hide{display:none!important}
.auth{position:fixed;inset:0;background:linear-gradient(135deg,#0052cc,#007bff,#00c6ff);display:flex;align-items:center;justify-content:center;z-index:100}
.box{background:#fff;padding:30px;border-radius:20px;width:340px;box-shadow:0 10px 30px rgba(0,0,0,0.3);text-align:center}
.logo{font-size:32px;font-weight:800;letter-spacing:5px;background:linear-gradient(90deg,#0052cc,#00c6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:20px}
input{width:100%;padding:12px;margin:8px 0;border:2px solid #eee;border-radius:10px;font-size:15px;outline:none}
input:focus{border-color:#007bff}
button{width:100%;padding:12px;background:linear-gradient(90deg,#0052cc,#007bff);color:#fff;border:0;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;margin-top:10px;transition:0.2s}
.link{margin-top:15px;color:#007bff;font-size:14px;cursor:pointer;text-decoration:underline}
.msg{font-size:13px;margin-top:10px;height:18px;font-weight:bold}
.err{color:red}.ok{color:green}
.app{position:fixed;inset:0;display:flex;flex-direction:column;background:#e9eef5}
.head{background:#fff;padding:15px;display:flex;justify-content:space-between;border-bottom:1px solid #ddd;font-weight:bold;font-size:16px}
.nav{display:flex;background:#fff;border-top:1px solid #ddd}
.nav div{flex:1;text-align:center;padding:15px;font-size:14px;cursor:pointer;color:#888;user-select:none}
.nav div.on{color:#007bff;font-weight:bold}
.body{flex:1;overflow-y:auto;padding:15px}
.chat-body{display:flex;flex-direction:column;height:100%;overflow:hidden}
.chat-list{flex:1;overflow-y:auto;padding:15px;display:flex;flex-direction:column;gap:10px}
.msg-me{background:#007bff;color:#fff;padding:10px 15px;border-radius:15px;align-self:flex-end;max-width:70%;font-size:15px}
.msg-you{background:#fff;color:#000;padding:10px 15px;border-radius:15px;align-self:flex-start;max-width:70%;font-size:15px;box-shadow:0 2px 5px rgba(0,0,0,0.05)}
.chat-input{display:flex;padding:10px;background:#fff;border-top:1px solid #ddd}
.chat-input input{flex:1;margin:0;border-radius:20px;padding:10px 15px}
.chat-input button{width:auto;margin:0 0 0 10px;padding:10px 20px;border-radius:20px}
.loading{position:fixed;inset:0;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:1000;font-size:18px;color:#0052cc;font-weight:bold}
</style>
</head>
<body>

<div id="loading" class="loading">Đang kết nối...</div>

<div id="loginView" class="auth hide">
  <div class="box">
    <div class="logo">BIN</div>
    <input id="lu" placeholder="Tên đăng nhập">
    <input id="lp" type="password" placeholder="Mật khẩu">
    <button onclick="doLogin()">ĐĂNG NHẬP</button>
    <div class="link" onclick="showReg()">Chưa có tài khoản? Đăng ký</div>
    <div id="lmsg" class="msg"></div>
  </div>
</div>

<div id="regView" class="auth hide">
  <div class="box">
    <div class="logo">BIN</div>
    <input id="ru" placeholder="Tên đăng nhập mới">
    <input id="rp" type="password" placeholder="Mật khẩu mới">
    <button onclick="doReg()">ĐĂNG KÝ NGAY</button>
    <div class="link" onclick="showLogin()">Đã có tài khoản? Đăng nhập</div>
    <div id="rmsg" class="msg"></div>
  </div>
</div>

<div id="app" class="app hide">
  <div class="head">
    <span id="hName">...</span>
    <span style="color:red;cursor:pointer" onclick="location.reload()">Thoát</span>
  </div>
  <div class="body" id="bFriend">
    <h3>Kết bạn</h3>
    <div style="display:flex;gap:10px;margin:10px 0">
      <input id="searchName" placeholder="Tìm tên...">
      <button style="width:80px" onclick="doSearch()">Tìm</button>
    </div>
    <div id="searchResult"></div>
    <h3 style="margin-top:20px">Lời mời</h3>
    <div id="reqList"></div>
  </div>
  <div class="body hide" id="bChat">
    <h3>Bạn bè</h3>
    <div id="friendList"></div>
  </div>
  <div class="chat-body hide" id="bChatRoom">
    <div class="chat-list" id="chatList"></div>
    <div class="chat-input">
      <input id="msgInput" placeholder="Nhập tin nhắn...">
      <button onclick="sendMsg()">Gửi</button>
    </div>
  </div>
  <div class="body hide" id="bSetting">
    <h3>Cài đặt</h3>
    <p>Tài khoản: <b id="setName"></b></p>
  </div>
  <div class="nav">
    <div onclick="tab('Friend')" id="navFriend">Kết bạn</div>
    <div onclick="tab('Chat')" id="navChat">Nhắn tin</div>
    <div onclick="tab('Setting')" id="navSetting">Cài đặt</div>
  </div>
</div>

<script src="/socket.io/socket.io.js"></script>
<script>
var socket = io();
var me = "";
var currentFriend = "";

socket.on('connect', function() {
  document.getElementById('loading').classList.add('hide');
  document.getElementById('loginView').classList.remove('hide');
});

function showReg(){ document.getElementById('loginView').classList.add('hide'); document.getElementById('regView').classList.remove('hide'); }
function showLogin(){ document.getElementById('regView').classList.add('hide'); document.getElementById('loginView').classList.remove('hide'); }

function doReg(){
  var u = document.getElementById('ru').value.trim();
  var p = document.getElementById('rp').value.trim();
  if(!u || !p) { document.getElementById('rmsg').innerText = "Nhập đủ!"; return; }
  socket.emit('register', {username:u, password:p}, function(res){
    if(res.ok) {
      document.getElementById('rmsg').innerText = "Thành công!";
      setTimeout(function(){ showLogin(); }, 800);
    } else {
      document.getElementById('rmsg').innerText = res.error;
    }
  });
}

function doLogin(){
  var u = document.getElementById('lu').value.trim();
  var p = document.getElementById('lp').value.trim();
  if(!u || !p) { document.getElementById('lmsg').innerText = "Nhập đủ!"; return; }
  socket.emit('login', {username:u, password:p}, function(res){
    if(res.ok) {
      me = res.user;
      document.getElementById('loginView').classList.add('hide');
      document.getElementById('app').classList.remove('hide');
      document.getElementById('hName').innerText = me;
      document.getElementById('setName').innerText = me;
      tab('Friend');
      renderFriends(res.friends);
      renderRequests(res.requests);
    } else {
      document.getElementById('lmsg').innerText = res.error;
    }
  });
}

function tab(name){
  document.getElementById('bFriend').classList.add('hide');
  document.getElementById('bChat').classList.add('hide');
  document.getElementById('bChatRoom').classList.add('hide');
  document.getElementById('bSetting').classList.add('hide');
  document.getElementById('navFriend').classList.remove('on');
  document.getElementById('navChat').classList.remove('on');
  document.getElementById('navSetting').classList.remove('on');
  document.getElementById('b' + name).classList.remove('hide');
  document.getElementById('nav' + name).classList.add('on');
}

function doSearch(){
  var q = document.getElementById('searchName').value.trim();
  if(!q) return;
  
  socket.emit('searchUser', {query:q}, function(res){
    var box = document.getElementById('searchResult');
    box.innerHTML = "";
    
    if(res.ok){
      if(res.username === me) { 
        box.innerHTML = "<div style='margin-top:10px;color:red'>Đây là bạn!</div>"; 
        return; 
      }
      
      var div = document.createElement('div');
      div.style.cssText = "background:#fff;padding:10px;border-radius:10px;margin-top:10px;display:flex;justify-content:space-between;align-items:center";
      
      var span = document.createElement('span');
      span.innerText = res.username;
      
      var btn = document.createElement('button');
      btn.innerText = "Kết bạn";
      btn.style.cssText = "width:auto;padding:5px 10px;margin:0";
      btn.onclick = function(){ addFriend(res.username); };
      
      div.appendChild(span);
      div.appendChild(btn);
      box.appendChild(div);
      
    } else {
      box.innerHTML = "<div style='margin-top:10px;color:red'>Không tìm thấy!</div>";
    }
  });
}

function addFriend(name){
  socket.emit('sendFriendRequest', {to:name}, function(res){
    alert("Đã gửi lời mời!");
    document.getElementById('searchResult').innerHTML = "";
    document.getElementById('searchName').value = "";
  });
}

function renderRequests(list){
  var box = document.getElementById('reqList');
  box.innerHTML = "";
  list.forEach(function(name){
    var d = document.createElement('div');
    d.style.cssText = "background:#fff;padding:10px;border-radius:10px;margin-top:5px;display:flex;justify-content:space-between;align-items:center";
    
    var span = document.createElement('span');
    span.innerText = name;
    
    var btn = document.createElement('button');
    btn.innerText = "Đồng ý";
    btn.style.cssText = "width:auto;padding:5px 15px;margin:0";
    btn.onclick = function(){ acceptReq(name); };
    
    d.appendChild(span);
    d.appendChild(btn);
    box.appendChild(d);
  });
}

function acceptReq(name){
  socket.emit('acceptFriend', {from:name}, function(res){
    if(res.ok) { alert("Đã kết bạn!"); location.reload(); }
  });
}

function renderFriends(list){
  var box = document.getElementById('friendList');
  box.innerHTML = "";
  list.forEach(function(name){
    var d = document.createElement('div');
    d.style.cssText = "background:#fff;padding:10px;border-radius:10px;margin-top:5px;cursor:pointer";
    d.innerText = name;
    d.onclick = function(){ openChat(name); };
    box.appendChild(d);
  });
}

function openChat(name){
  currentFriend = name;
  document.getElementById('bFriend').classList.add('hide');
  document.getElementById('bChat').classList.add('hide');
  document.getElementById('bSetting').classList.add('hide');
  document.getElementById('bChatRoom').classList.remove('hide');
  document.getElementById('chatList').innerHTML = "<div style='text-align:center;margin-top:20px;color:#888'>Đang tải...</div>";
  
  socket.emit('getMessages', {withUser:name}, function(msgs){
    var box = document.getElementById('chatList');
    box.innerHTML = "";
    msgs.forEach(function(m){
      var d = document.createElement('div');
      d.className = m.from === me ? 'msg-me' : 'msg-you';
      d.innerText = m.text;
      box.appendChild(d);
    });
    box.scrollTop = box.scrollHeight;
  });
}

function sendMsg(){
  var txt = document.getElementById('msgInput').value;
  if(!txt || !currentFriend) return;
  document.getElementById('msgInput').value = "";
  socket.emit('sendMessage', {to:currentFriend, text:txt}, function(){
    openChat(currentFriend);
  });
}

socket.on('newMessage', function(data){
  if(currentFriend === data.from || currentFriend === data.to){
    openChat(currentFriend);
  }
});

socket.on('requestUpdate', function(){
  socket.emit('getRequests', function(res){
    renderRequests(res);
  });
});
</script>
</body>
</html>`;

app.get('/', (req, res) => res.send(HTML));

io.on('connection', (socket) => {
  socket.on('register', (data, cb) => {
    const { username, password } = data;
    if(users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return cb({ ok: false, error: 'Tên đã có người dùng' });
    }
    users.push({ username, password });
    cb({ ok: true });
  });

  socket.on('login', (data, cb) => {
    const { username, password } = data;
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if(!user || user.password !== password) {
      return cb({ ok: false, error: 'Sai tài khoản hoặc mật khẩu' });
    }
    socket.username = user.username;
    cb({ ok: true, user: user.username, friends: friends[user.username] || [], requests: requests[user.username] || [] });
  });

  socket.on('searchUser', (data, cb) => {
    const f = users.find(u => u.username.toLowerCase() === data.query.toLowerCase());
    if(f) cb({ ok: true, username: f.username });
    else cb({ ok: false });
  });

  socket.on('sendFriendRequest', (data, cb) => {
    const from = socket.username;
    const to = data.to;
    if(!requests[to]) requests[to] = [];
    if(requests[to].indexOf(from) === -1) requests[to].push(from);
    io.emit('requestUpdate');
    cb({ ok: true });
  });

  socket.on('getRequests', (cb) => {
    cb(requests[socket.username] || []);
  });

  socket.on('acceptFriend', (data, cb) => {
    const me = socket.username;
    const them = data.from;
    if(requests[me]) requests[me] = requests[me].filter(n => n !== them);
    if(!friends[me]) friends[me] = [];
    if(!friends[them]) friends[them] = [];
    if(friends[me].indexOf(them) === -1) friends[me].push(them);
    if(friends[them].indexOf(me) === -1) friends[them].push(me);
    cb({ ok: true });
  });

  socket.on('getMessages', (data, cb) => {
    const key = [socket.username, data.withUser].sort().join('::');
    cb(messages[key] || []);
  });

  socket.on('sendMessage', (data, cb) => {
    const from = socket.username;
    const key = [from, data.to].sort().join('::');
    if(!messages[key]) messages[key] = [];
    const msg = { from, to: data.to, text: data.text };
    messages[key].push(msg);
    io.emit('newMessage', msg);
    cb({ ok: true });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Server chạy thành công!');
});
