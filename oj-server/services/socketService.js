module.exports = function(io_server) {
    // 每个sessionId包含一组socketIds
    var collaborations = [];
    // client的socketId到sessionId的映射
    var socketIdToSessionId = [];

    io_server.on('connection', socket => {
        var sessionId = socket.handshake.query['sessionId'];
        var socketId = socket.id;

        // 只要一个client发来握手消息，就将它加到队列中
        socketIdToSessionId[socketId] = sessionId;
        if (!(sessionId in collaborations)) {
            collaborations[sessionId] = {
                'participants': []
            };
        }
        collaborations[sessionId]['participants'].push(socketId);

        // 来自client自己的socket上绑定的change事件，io_client会发送消息触发它
        socket.on('change', delta => {
            console.log( "change " + sessionId + " " + delta ); // 打印出在哪个问题上发生了修改
            if (sessionId in collaborations) {
                var participants = collaborations[sessionId]['participants'];
                for (var i = 0; i < participants.length; i++) {
                    if (socketId != participants[i]) {
                        io_server.to(participants[i]).emit('message', delta);
                    }
                }
            } else {
                console.log('WARNING: could not tie socketId to any collaboration');
            }
        });
    });
};
