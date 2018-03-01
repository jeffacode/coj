var express = require('express');
var app = express();
var restRouter = require("./routes/rest"); // 获得rest里定义的router
var mongoose = require('mongoose');
var indexRouter = require("./routes/index"); // 获得index里定义的router
var path = require("path");

mongoose.connect("mongodb://jeff:jeff123@ds247648.mlab.com:47648/jeffacode-coj"); // 连接mongoDB数据库

app.use(express.static(path.join(__dirname, "../public"))); // 从public里找寻静态文件
app.use('/', indexRouter); // 但凡要求根目录的请求都交由indexRouter处理
app.use('/api/v1', restRouter); // 但凡以/api/v1开头的请求都交由restRouter处理

app.use(function (req, res) {
    // send index.html to start client side
    res.sendFile("index.html", {root: path.join(__dirname, '../public')});

});


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
