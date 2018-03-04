/* ----------使用express进行routing并开启服务器---------- */
var path = require("path");
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var restRouter = require("./routes/rest"); // 获得rest里定义的router
var indexRouter = require("./routes/index"); // 获得index里定义的router

// 连接mongoDB数据库
mongoose.connect("mongodb://jeff:jeff123@ds247648.mlab.com:47648/jeffacode-coj");

// 使用express进行routing
app.use(express.static(path.join(__dirname, "../public"))); // 从public里找寻静态文件
app.use('/', indexRouter); // 但凡要求根目录的请求都交由indexRouter处理
app.use('/api/v1', restRouter); // 但凡以/api/v1开头的请求都交由restRouter处理
app.use(function (req, res) {
    // send index.html to start client side
    res.sendFile("index.html", {root: path.join(__dirname, '../public')});

});

// 监听3000端口
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
});

/* ----------开启websocket通信---------- */
var io_server =  require('socket.io')(); // 创建io_server实例
var socketService = require('./services/socketService'); // 注入socket服务
socketService(io_server); // 使用socket服务，此时io_server绑定connection事件
io_server.attach(server); // 将io_server绑定到服务器