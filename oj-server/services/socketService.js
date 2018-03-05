var redisClient = require('../utils/redisClient');
const TIMEOUT_IN_SECONDS = 3600; // time_out时间定为1小时，超时的用户就会被剔除

module.exports = function(io_server) {
    var collaborations = [];
    var sessionPath = "/temp_sessions";

    io_server.on('connection', socket => {
        var sessionId = socket.handshake.query['sessionId'];
        var socketId = socket.id;

        // 查看同样的session是否已经被编辑过了，
        // session在collaborations里没有就去查redis
        if (sessionId in collaborations) {
            collaborations[sessionId]['participants'].push(socketId);
        } else{
            redisClient.get(sessionPath + '/' + sessionId, function(data) {
                if (data) {
                    // redis有的话，说明node server挂掉过，把数据装回到cachedChangeEvents中
                    console.log("session terminiated previsouly; pulling back from Redis.");
                    collaborations[sessionId] = {
                        'cachedChangeEvents': JSON.parse(data),
                        'participants': []
                    };
                } else {
                    // redis没有的话，那说明是全新的sessionId，创建新的空对象
                    console.log("creating new session");
                    collaborations[sessionId] = {
                        'cachedChangeEvents': [],
                        'participants': []
                    };
                }
                // 由于这个是异步函数，如果是全新的sessionId，没有初始化的空对象就会报错
                collaborations[sessionId]['participants'].push(socketId);
            });
        }

        // 来自client自己的socket上绑定的change事件，io_client会发送消息触发它
        socket.on('change', delta => {
            console.log('change' + sessionId + ' ' + delta);

            // 将获得的delta存到对应session的cachedChangeEvents里
            if (sessionId in collaborations) {
                collaborations[sessionId]['cachedChangeEvents'].push(['change', delta, Date.now()]);
            }

            forwardEvents(socketId, 'change', delta);
        });

        // 来自client自己的socket上绑定的cursorMove事件，io_client会发送消息触发它
        socket.on('cursorMove', cursor => {
            console.log( "cursorMove " + sessionId + " " + cursor ) ;
            // 往cursor信息里再加一项socketId
            cursor = JSON.parse(cursor);
            cursor['socketId'] = socketId;
            forwardEvents(socketId, 'cursorMove', JSON.stringify(cursor));
        });

        // 当某个client连接断开后，如果他原本编辑的问题下已经没有其他clients了，就将cachedChangeEvents中的数据放到redis里
        socket.on('disconnect', function() {
            console.log('socket ' + socketId + 'disconnected.');
            if (sessionId in collaborations) {
                let participants = collaborations[sessionId]['participants'];
                let index = participants.indexOf(socketId);
                if (index >= 0) {
                    participants.splice(index, 1); // 从数组里删掉index处开始的1个元素
                    if (participants.length == 0) {
                        console.log("last participant left. Storing in Redis.");
                        let key = sessionPath + "/" + sessionId;
                        let value = JSON.stringify(collaborations[sessionId]['cachedChangeEvents']);
                        redisClient.set(key, value, redisClient.redisPrint);
                        redisClient.expire(key, TIMEOUT_IN_SECONDS); // 超过1小时后redis也会自动清除掉这个session
                        delete collaborations[sessionId];
                    }
                }
            }
        });

        // 某个新加入的client触发此事件，当先前已经有clients编辑过相同问题时
        // server会逐个将已保存的变化点deltas返回给这个用户
        socket.on('restoreBuffer', () => {
            console.log('restoring buffer for session: ' + sessionId + ', socket: ' + socketId);
            if (sessionId in collaborations) {
                let changeEvents = collaborations[sessionId]['cachedChangeEvents'];
                for (let i = 0; i < changeEvents.length; i++) {
                    socket.emit(changeEvents[i][0], changeEvents[i][1]); // 不停触发change事件
                }
            }
        });

        function forwardEvents(socketId, eventName, dataString) {
            if (sessionId in collaborations) {
                let participants = collaborations[sessionId]['participants'];
                for (let i = 0; i < participants.length; i++) {
                    if (socketId != participants[i]) {
                        io_server.to(participants[i]).emit(eventName, dataString);
                    }
                }
            } else {
                console.log("WARNING: could not tie socket_id to any collaboration");
            }
        }

    });
};
