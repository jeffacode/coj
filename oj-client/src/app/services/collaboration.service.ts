import { Injectable } from '@angular/core';
import {COLORS} from '../../assets/colors';
import * as ace from 'brace';

declare var io: any; // 避免出现can't find name的问题

@Injectable()
export class CollaborationService {

  io_client: any;
  clientsInfo = {}; // 保存其他正在编辑当前页面的用户
  clientNum = 0;

  constructor() { }

  init(editor: any, sessionId: string): void {
    // 实例化io_client对象，向io_server发送一条query=sessionId的消息来握手
    this.io_client = io(window.location.origin, {query: 'sessionId=' + sessionId});

    // io_client绑定change事件，io_server会返回消息来触发change事件
    this.io_client.on('change', (delta: string) => {
      console.log('collaboration: editor changed by ' + delta); // 打印变化点字符串
      delta = JSON.parse(delta); // 解析为json对象
      editor.lastAppliedChange = delta; // 作为editor新的变化点

      // 实时更新其他clients发来的新变化点到编辑器
      editor.getSession().getDocument().applyDeltas([delta]);
    });

    // io_client绑定cursorMove事件，io_server会返回消息来触发cursorMove事件
    this.io_client.on('cursorMove', (cursor) => {
      console.log("cursor move: " + cursor);
      let session = editor.getSession();
      cursor = JSON.parse(cursor);

      // 提取位置信息
      let x = cursor['row'];
      let y = cursor['column'];

      // 提取cursor所有者的ID
      let changeClientId = cursor['socketId'];
      console.log(x + ' ' + y + ' ' + changeClientId);

      if (changeClientId in this.clientsInfo) {
        session.removeMarker(this.clientsInfo[changeClientId]['marker']); // 当用户再次编辑时将当期页面上旧的marker删掉
      } else {
        this.clientsInfo[changeClientId] = {}; // 新来的用户创建空对象

        let css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = ".editor_cursor_" + changeClientId
          + " { position:absolute; background:" + COLORS[this.clientNum] + ";"
          + " z-index: 100; width:3px !important; }";

        document.body.appendChild(css); // 每次触发事件都会在页面新插入一个style标签
        this.clientNum++; // 每次触发事件都+1
      }

      // 在当前页面上添加新的marker
      let Range = ace.acequire('ace/range').Range;
      let newMarker = session.addMarker(new Range(x, y, x, y + 1), 'editor_cursor_' + changeClientId, true);
      this.clientsInfo[changeClientId]['marker'] = newMarker;
    });

    // io_client绑定message事件，io_server会返回消息来触发message事件
    this.io_client.on('message', (message) => {
      console.log("received: " + message);
    })
  }

  sendMyChange(delta: string): void {
    this.io_client.emit('change', delta); // 向io_server发送消息，在server端触发自己socket上绑定的
  }

  sendMyCursor(cursor: string): void {
    this.io_client.emit('cursorMove', cursor);
  }

  restoreBuffer(): void {
    this.io_client.emit('restoreBuffer'); // 触发server端的restoreBuffer事件
  }

}
