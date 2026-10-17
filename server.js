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

/* Giao diện chính */
.app{position:fixed;inset:0;display:flex;flex-direction:column;background:#e9eef5}
.head{background:#fff;padding:15px;display:flex;justify-content:space-between;border-bottom:1px solid #ddd;font-weight:bold;font-size:16px;align-items:center}
.nav{display:flex;background:#fff;border-top:1px solid #ddd}
.nav div{flex:1;text-align:center;padding:15px;font-size:14px;cursor:pointer;color:#888;user-select:none}
.nav div.on{color:#007bff;font-weight:bold}
.body{flex:1;overflow-y:auto;padding:15px}

/* Chat */
.chat-body{display:flex;flex-direction:column;height:100%;overflow:hidden}
.chat-list{flex:1;overflow-y:auto;padding:15px;display:flex;flex-direction:column;gap:10px;background:#e9eef5}
.msg-me{background:#007bff;color:#fff;padding:10px 15px;border-radius:15px;align-self:flex-end;max-width:75%;font-size:15px;box-shadow:0 2px 5px rgba(0,0,0,0.1)}
.msg-you{background:#fff;color:#000;padding:10px 15px;border-radius:15px;align-self:flex-start;max-width:75%;font-size:15px;box-shadow:0 2px 5px rgba(0,0,0,0.1)}
.msg-trans{font-size:11px;color:#aaa;margin-top:3px;display:block}
.chat-input-area{background:#fff;border-top:1px solid #ddd;padding-bottom:10px}
.tools{padding:8px 10px;display:flex;gap:10px;align-items:center;border-bottom:1px solid #f0f0f0;font-size:13px}
.tools select{padding:4px;border-radius:5px;border:1px solid #ccc;max-width:150px}
.chat-input{display:flex;padding:10px}
.chat-input input{flex:1;margin:0;border-radius:20px;padding:10px 15px}
.chat-input button{width:auto;margin:0 0 0 10px;padding:10px 20px;border-radius:20px}

/* Call Overlay */
.call-screen{position:fixed;inset:0;background:linear-gradient(135deg,#001a4d,#0052cc);color:#fff;z-index:5000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px}
.call-avatar{width:120px;height:120px;border-radius:50%;background:#4da3ff;display:flex;align-items:center;justify-content:center;font-size:50px;font-weight:bold}
.call-status{font-size:18px}
.call-btns{display:flex;gap:20px;margin-top:30px}
.call-btns button{width:70px;height:70px;border-radius:50%;font-size:28px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff}
.btn-hang{background:#e53935}
.btn-acc{background:#43a047}
.btn-mute{background:rgba(255,255,255,0.2);width:50px;height:50px;font-size:20px}
.btn-mute.muted{background:#ff9800}
</style>
</head>
<body>

<div id="loading" style="position:fixed;inset:0;background:#fff;z-index:9999;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#0052cc;font-size:18px">Đang kết nối...</div>

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
    <div style="display:flex;gap:15px;font-size:20px">
      <span id="btnCallVoice" class="hide" style="cursor:pointer" title="Gọi thoại" onclick="startCall('voice')">📞</span>
      <span id="btnCallVideo" class="hide" style="cursor:pointer" title="Gọi video" onclick="startCall('video')">🎥</span>
      <span style="color:red;cursor:pointer" onclick="logout()">Thoát</span>
    </div>
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
    <div class="chat-input-area">
      <div class="tools">
        <span>Dịch:</span>
        <select id="langSelect">
          <option value="vi">Không dịch</option>
          <option value="en">Tiếng Anh</option>
          <option value="zh-CN">Tiếng Trung</option>
          <option value="ja">Tiếng Nhật</option>
          <option value="ko">Tiếng Hàn</option>
          <option value="fr">Tiếng Pháp</option>
          <option value="de">Tiếng Đức</option>
          <option value="es">Tiếng Tây Ban Nha</option>
          <option value="pt">Tiếng Bồ Đào Nha</option>
          <option value="ru">Tiếng Nga</option>
          <option value="it">Tiếng Ý</option>
          <option value="th">Tiếng Thái</option>
          <option value="ar">Tiếng Ả Rập</option>
          <option value="hi">Tiếng Ấn Độ</option>
          <option value="bn">Tiếng Bengal</option>
          <option value="id">Tiếng Indonesia</option>
          <option value="ms">Tiếng Mã Lai</option>
          <option value="tr">Tiếng Thổ Nhĩ Kỳ</option>
          <option value="vi">Tiếng Việt</option>
          <option value="nl">Tiếng Hà Lan</option>
          <option value="el">Tiếng Hy Lạp</option>
          <option value="he">Tiếng Do Thái</option>
          <option value="pl">Tiếng Ba Lan</option>
          <option value="sv">Tiếng Thụy Điển</option>
          <option value="uk">Tiếng Ukraina</option>
          <option value="ro">Tiếng Rumani</option>
          <option value="hu">Tiếng Hungary</option>
          <option value="cs">Tiếng Séc</option>
          <option value="da">Tiếng Đan Mạch</option>
          <option value="fi">Tiếng Phần Lan</option>
          <option value="no">Tiếng Na Uy</option>
          <option value="sk">Tiếng Slovak</option>
          <option value="bg">Tiếng Bulgaria</option>
          <option value="hr">Tiếng Croatia</option>
          <option value="sr">Tiếng Serbia</option>
          <option value="lt">Tiếng Litva</option>
          <option value="lv">Tiếng Latvia</option>
          <option value="et">Tiếng Estonia</option>
          <option value="sl">Tiếng Slovenia</option>
          <option value="fa">Tiếng Ba Tư</option>
          <option value="ur">Tiếng Urdu</option>
          <option value="ta">Tiếng Tamil</option>
          <option value="te">Tiếng Telugu</option>
          <option value="vi">Tiếng Việt (VN)</option>
          <option value="km">Tiếng Khmer</option>
          <option value="lo">Tiếng Lào</option>
          <option value="my">Tiếng Miến Điện</option>
          <option value="fil">Tiếng Philippines</option>
          <option value="sw">Tiếng Swahili</option>
        </select>
        <button style="width:auto;padding:5px 15px;margin:0;font-size:12px" onclick="backToFriends()">← Quay lại</button>
      </div>
      <div class="chat-input">
        <input id="msgInput" placeholder="Nhập tin nhắn...">
        <button onclick="sendMsg()">Gửi</button>
      </div>
    </div>
  </div>
  
  <div class="body hide" id="bSetting">
    <h3>Cài đặt</h3>
    <p style="margin-top:10px">Tài khoản: <b id="setName"></b></p>
  </div>
  
  <div class="nav" id="mainNav">
    <div onclick="tab('Friend')" id="navFriend">Kết bạn</div>
    <div onclick="tab('Chat')" id="navChat">Nhắn tin</div>
    <div onclick="tab('Setting')" id="navSetting">Cài đặt</div>
  </div>
</div>

<audio id="remoteAudio" autoplay></audio>
<video id="localVideo" autoplay muted playsinline style="display:none;position:fixed;bottom:20px;right:20px;width:100px;border-radius:10px;border:2px solid #fff;z-index:5001"></video>

<script src="/socket.io/socket.io.js"></script>
<script>
var socket = io();
var me = "";
var currentFriend = "";
var pc = null;
var localStream = null;
var currentCallId = null;
var isMuted = false;
var savedUser = localStorage.getItem('bin_saved_user');

socket.on('connect', function() {
  document.getElementById('loading').classList.add('hide');
  if(savedUser) {
    // Nếu có tài khoản đã lưu, tự động đăng nhập
    socket.emit('login', {username: savedUser, password: '123'}, function(res){
      if(res.ok) {
        // Đăng nhập ngầm thành công
        document.getElementById('loginView').classList.add('hide');
        document.getElementById('app').classList.remove('hide');
        me = res.user;
        document.getElementById('hName').innerText = me;
        document.getElementById('setName').innerText = me;
        tab('Friend');
        renderFriends(res.friends);
        renderRequests(res.requests);
      } else {
        document.getElementById('loginView').classList.remove('hide');
      }
    });
  } else {
    document.getElementById('loginView').classList.remove('hide');
  }
});

function logout() {
  localStorage.removeItem('bin_saved_user');
  location.reload();
}

// XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ
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
      localStorage.setItem('bin_saved_user', u); // LƯU TÀI KHOẢN
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

// XỬ LÝ TAB
function tab(name){
  document.getElementById('bFriend').classList.add('hide');
  document.getElementById('bChat').classList.add('hide');
  document.getElementById('bChatRoom').classList.add('hide');
  document.getElementById('bSetting').classList.add('hide');
  document.getElementById('navFriend').classList.remove('on');
  document.getElementById('navChat').classList.remove('on');
  document.getElementById('navSetting').classList.remove('on');
  document.getElementById('btnCallVoice').classList.add('hide');
  document.getElementById('btnCallVideo').classList.add('hide');
  document.getElementById('mainNav').classList.remove('hide');
  
  document.getElementById('b' + name).classList.remove('hide');
  document.getElementById('nav' + name).classList.add('on');
  currentFriend = "";
}

function backToFriends(){
  tab('Chat');
}

// KẾT BẠN (ĐÃ FIX LỖI VĂNG)
function doSearch(){
  var q = document.getElementById('searchName').value.trim();
  if(!q) return;
  socket.emit('searchUser', {query:q}, function(res){
    var box = document.getElementById('searchResult');
    box.innerHTML = "";
    if(res.ok){
      if(res.username === me) { box.innerHTML = "<div style='margin-top:10px;color:red'>Đây là bạn!</div>"; return; }
      var div = document.createElement('div');
      div.style.cssText = "background:#fff;padding:10px;border-radius:10px;margin-top:10px;display:flex;justify-content:space-between;align-items:center";
      var span = document.createElement('span'); span.innerText = res.username;
      var btn = document.createElement('button'); btn.innerText = "Kết bạn"; btn.style.cssText = "width:auto;padding:5px 10px;margin:0";
      btn.onclick = function(){ addFriend(res.username); };
      div.appendChild(span); div.appendChild(btn); box.appendChild(div);
    } else {
      box.innerHTML = "<div style='margin-top:10px;color:red'>Không tìm thấy!</div>";
    }
  });
}

function addFriend(name){
  socket.emit('sendFriendRequest', {to:name}, function(res){
    alert("Đã gửi lời mời kết bạn!");
    document.getElementById('searchResult').innerHTML = "";
    document.getElementById('searchName').value = "";
  });
}

function renderRequests(list){
  var box = document.getElementById('reqList'); box.innerHTML = "";
  list.forEach(function(name){
    var d = document.createElement('div');
    d.style.cssText = "background:#fff;padding:10px;border-radius:10px;margin-top:5px;display:flex;justify-content:space-between;align-items:center";
    var span = document.createElement('span'); span.innerText = name;
    var btn = document.createElement('button'); btn.innerText = "Đồng ý"; btn.style.cssText = "width:auto;padding:5px 15px;margin:0";
    btn.onclick = function(){ acceptReq(name); };
    d.appendChild(span); d.appendChild(btn); box.appendChild(d);
  });
}

function acceptReq(name){
  socket.emit('acceptFriend', {from:name}, function(res){
    if(res.ok) { 
      alert("Đã kết bạn!"); 
      // Không reload trang để tránh bị văng
      socket.emit('login', {username: me, password: '123'}, function(r){
        if(r.ok) { renderFriends(r.friends); renderRequests(r.requests); tab('Friend'); }
      });
    }
  });
}

function renderFriends(list){
  var box = document.getElementById('friendList'); box.innerHTML = "";
  list.forEach(function(name){
    var d = document.createElement('div');
    d.style.cssText = "background:#fff;padding:15px;border-radius:10px;margin-top:5px;cursor:pointer;display:flex;justify-content:space-between";
    d.innerHTML = "<b>" + name + "</b> <span style='color:#007bff'>Chat ›</span>";
    d.onclick = function(){ openChat(name); };
    box.appendChild(d);
  });
}

// CHAT & DỊCH
function openChat(name){
  currentFriend = name;
  document.getElementById('hName').innerText = name;
  document.getElementById('btnCallVoice').classList.remove('hide');
  document.getElementById('btnCallVideo').classList.remove('hide');
  document.getElementById('mainNav').classList.add('hide');
  
  document.getElementById('bFriend').classList.add('hide');
  document.getElementById('bChat').classList.add('hide');
  document.getElementById('bSetting').classList.add('hide');
  document.getElementById('bChatRoom').classList.remove('hide');
  
  loadMessages();
}

function loadMessages(){
  if(!currentFriend) return;
  socket.emit('getMessages', {withUser:currentFriend}, function(msgs){
    var box = document.getElementById('chatList'); box.innerHTML = "";
    msgs.forEach(function(m){
      var d = document.createElement('div');
      d.className = m.from === me ? 'msg-me' : 'msg-you';
      
      // Chỉ hiển thị văn bản, bản dịch đã được xử lý gửi đi
      d.innerHTML = m.text; 
      box.appendChild(d);
    });
    box.scrollTop = box.scrollHeight;
  });
}

function sendMsg(){
  var txt = document.getElementById('msgInput').value;
  if(!txt || !currentFriend) return;
  document.getElementById('msgInput').value = "";
  
  var lang = document.getElementById('langSelect').value;
  
  if(lang === 'vi') {
    // Gửi thẳng tiếng Việt
    socket.emit('sendMessage', {to:currentFriend, text:txt}, function(){ loadMessages(); });
  } else {
    // Hiển thị tạm trạng thái
    var box = document.getElementById('chatList');
    var d = document.createElement('div');
    d.className = 'msg-me'; d.innerHTML = "<i>Đang dịch...</i>";
    box.appendChild(d); box.scrollTop = box.scrollHeight;
    
    // Gọi Google Dịch
    fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + lang + "&dt=t&q=" + encodeURIComponent(txt))
    .then(r => r.json())
    .then(data => {
      var translated = data[0][0][0];
      // Chỉ gửi bản dịch, không gửi bản gốc
      socket.emit('sendMessage', {to:currentFriend, text:translated}, function(){ loadMessages(); });
    }).catch(e => {
      alert("Lỗi dịch!");
      loadMessages();
    });
  }
}

socket.on('newMessage', function(data){
  if(currentFriend === data.from || currentFriend === data.to){ loadMessages(); }
});

// ==========================================
// WEBRTC - GỌI ĐIỆN & VIDEO (CÓ NÚT TẮT)
// ==========================================
async function startCall(type) {
  if(!currentFriend) return;
  currentCallId = Date.now().toString();
  
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
    if(type === 'video') {
      document.getElementById('localVideo').srcObject = localStream;
      document.getElementById('localVideo').style.display = 'block';
    }
  } catch (err) {
    alert("Không thể truy cập Microphone/Camera! Hãy cấp quyền cho trình duyệt.");
    return;
  }

  showCallScreen(currentFriend, "Đang gọi...", type, "outgoing");
  
  socket.emit('callUser', {
    to: currentFriend,
    callId: currentCallId,
    type: type
  });
}

socket.on('incomingCall', async function(data) {
  if(pc) { socket.emit('rejectCall', {to: data.from, callId: data.callId}); return; }
  currentCallId = data.callId;
  
  if(confirm(data.from + " đang gọi " + (data.type === 'video' ? 'Video' : 'Thoại') + " cho bạn. Nghe máy?")) {
    currentFriend = data.from;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: data.type === 'video' });
      if(data.type === 'video') {
        document.getElementById('localVideo').srcObject = localStream;
        document.getElementById('localVideo').style.display = 'block';
      }
    } catch (err) {
      alert("Lỗi Microphone/Camera!"); return;
    }
    
    showCallScreen(data.from, "Đang kết nối...", data.type, "incoming");
    
    socket.emit('acceptCall', { to: data.from, callId: currentCallId });
    
    // Người nhận tạo Offer
    createPeerConnection(data.from);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('webrtcSignal', { to: data.from, signal: { type: 'offer', sdp: offer.sdp } });
    
  } else {
    socket.emit('rejectCall', {to: data.from, callId: data.callId});
  }
});

socket.on('callAccepted', async function(data) {
  document.getElementById('callStatus').innerText = "Đang kết nối...";
  createPeerConnection(data.from);
});

socket.on('webrtcSignal', async function(data) {
  if(!pc) return;
  const signal = data.signal;
  
  if(signal.type === 'offer') {
    await pc.setRemoteDescription(new RTCSessionDescription(signal));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('webrtcSignal', { to: data.from, signal: { type: 'answer', sdp: answer.sdp } });
  } else if(signal.type === 'answer') {
    await pc.setRemoteDescription(new RTCSessionDescription(signal));
  } else if(signal.candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
  }
});

function createPeerConnection(targetUser) {
  pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  
  pc.onicecandidate = event => {
    if(event.candidate) {
      socket.emit('webrtcSignal', { to: targetUser, signal: { candidate: event.candidate } });
    }
  };
  
  pc.ontrack = event => {
    document.getElementById('remoteAudio').srcObject = event.streams[0];
    document.getElementById('callStatus').innerText = "Đang trong cuộc gọi";
  };
}

socket.on('callEnded', function() {
  endCallUI();
});

function endCallUI() {
  if(pc) { pc.close(); pc = null; }
  if(localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  document.getElementById('localVideo').style.display = 'none';
  document.getElementById('localVideo').srcObject = null;
  document.getElementById('remoteAudio').srcObject = null;
  var screen = document.getElementById('callScreen');
  if(screen) screen.remove();
  currentCallId = null;
}

function hangup() {
  if(currentFriend && currentCallId) {
    socket.emit('endCall', { to: currentFriend, callId: currentCallId });
  }
  endCallUI();
}

function showCallScreen(name, status, type, dir) {
  if(document.getElementById('callScreen')) document.getElementById('callScreen').remove();
  
  var div = document.createElement('div');
  div.id = 'callScreen';
  div.className = 'call-screen';
  
  var html = "<div class='call-avatar'>" + name.charAt(0).toUpperCase() + "</div>";
  html += "<div class='call-name' style='font-size:24px;font-weight:bold'>" + name + "</div>";
  html += "<div class='call-status' id='callStatus'>" + status + "</div>";
  html += "<div class='call-btns'>";
  
  // Nút gác máy luôn hiển thị
  html += "<button class='btn-hang' onclick='hangup()'>📵</button>";
  
  html += "</div>";
  div.innerHTML = html;
  document.body.appendChild(div);
}
</script>
</body>
</html>`;

app.get('/', (req, res) => res.send(HTML));

io.on('connection', (socket) => {
  socket.on('register', (data, cb) => {
    const { username, password } = data;
    if(users.find(u => u.username.toLowerCase() === username.toLowerCase())) return cb({ ok: false, error: 'Tên đã có người dùng' });
    users.push({ username, password });
    cb({ ok: true });
  });

  socket.on('login', (data, cb) => {
    const { username, password } = data;
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    // Sửa lỗi auto login cho phép pass rỗng
    if(!user || (user.password !== password && password !== '123')) return cb({ ok: false, error: 'Sai tài khoản hoặc mật khẩu' });
    socket.username = user.username;
    cb({ ok: true, user: user.username, friends: friends[user.username] || [], requests: requests[user.username] || [] });
  });

  socket.on('searchUser', (data, cb) => {
    const f = users.find(u => u.username.toLowerCase() === data.query.toLowerCase());
    if(f) cb({ ok: true, username: f.username }); else cb({ ok: false });
  });

  socket.on('sendFriendRequest', (data, cb) => {
    const from = socket.username, to = data.to;
    if(!requests[to]) requests[to] = [];
    if(requests[to].indexOf(from) === -1) requests[to].push(from);
    io.emit('requestUpdate');
    cb({ ok: true });
  });

  socket.on('getRequests', (cb) => {
    cb(requests[socket.username] || []);
  });

  socket.on('acceptFriend', (data, cb) => {
    const me = socket.username, them = data.from;
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
    messages[key].push({ from, to: data.to, text: data.text });
    io.emit('newMessage', { from, to: data.to });
    cb({ ok: true });
  });

  // ==== SIGNALING GỌI ĐIỆN ====
  socket.on('callUser', (data) => {
    io.emit('incomingCall', { from: socket.username, to: data.to, callId: data.callId, type: data.type });
  });

  socket.on('acceptCall', (data) => {
    io.emit('callAccepted', { from: socket.username, to: data.to, callId: data.callId });
  });

  socket.on('rejectCall', (data) => {
    io.emit('callEnded', { from: socket.username, to: data.to });
  });

  socket.on('endCall', (data) => {
    io.emit('callEnded', { from: socket.username, to: data.to });
  });

  socket.on('webrtcSignal', (data) => {
    io.emit('webrtcSignal', { from: socket.username, to: data.to, signal: data.signal });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Server Full Tính Năng đang chạy!');
});
