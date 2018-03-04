import { Injectable } from '@angular/core';

declare var io: any; // 避免出现can't find name的问题

@Injectable()
export class CollaborationService {

  io_client: any;

  constructor() { }

  init(editor: any, sessionId: string): void {
    // 实例化io_client对象，向io_server发送一条query=sessionId的消息来握手
    this.io_client = io(window.location.origin, {query: 'sessionId=' + sessionId});

    // 以下两个事件会被持续监听
    // io_client绑定change事件，io_server会返回消息来触发change事件
    this.io_client.on('change', (delta: string) => {
      console.log('collaboration: editor changed by' + delta); // 打印变化点字符串
      delta = JSON.parse(delta); // 解析为json对象
      editor.lastAppliedChange = delta; // 作为editor新的变化点
    });

    // io_client绑定message事件，io_server会返回消息来触发message事件
    this.io_client.on('message', (message) => {
      console.log("received: " + message);
    })
  }

  sendLocalChange(delta: string): void {
    this.io_client.emit('change', delta); // 向io_server发送消息，在server端触发自己socket上绑定的change事件
  }

  change(): void {

  }
}
