import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import * as ace from 'brace';
import 'brace/mode/java';
import 'brace/mode/c_cpp';
import 'brace/mode/python';
import 'brace/theme/eclipse';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  editor: any;
  languages = ['Java', 'C++', 'Python'];
  languageToMode = {
    'Java': 'java',
    'C++': 'c_cpp',
    'Python': 'python'
  };
  language = 'Java';
  sessionId: string;
  output: string; // 接收代码执行结果

  defaultContent = {
    'Java': `public class Example {
  public static void main(String[] args) {
    // Type your Java code here
  }
}`,
    'C++': `#include <iostream>
using namespace std;

int main() {
    // Type your C++ code here
    return 0;
}`,
    'Python': `class Solution: 
  def example():
    # write your Python code here`
  };

  constructor(@Inject('collaboration') private collaboration,
              @Inject('data') private data,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    // 实例化editor对象，这行代码只能放在ngOnInit里才能执行，不能放到constructor里
    this.editor = ace.edit('editor');

    // 从路由中提取问题id作为sessionId，编辑相同问题的clients虽然socket.id不同，但都有同一个sessionId
    this.route.params
      .subscribe(params => {
        this.sessionId = params['id'];
        this.initEditor(); // 再初始化editor
      })
  }

  initEditor() {
    // default editor options
    this.editor.setTheme('ace/theme/eclipse');
    this.editor.getSession().setMode('ace/mode/java');
    this.editor.setValue(this.defaultContent['Java']);
    // 防止代码过长时出现问题
    this.editor.$blockScrolling = Infinity;
    // 进入问题页面时鼠标焦点直接在editor
    document.getElementsByTagName('textarea')[0].focus();

    // 调用init方法开启websocket通信
    this.collaboration.init(this.editor, this.sessionId);

    // 给editor绑定change事件，监视本地是否产生编辑操作
    this.editor.lastAppliedChange = null; // lastAppliedChange记录上一次的变化点
    this.editor.on('change', (e) => {
      if (this.editor.lastAppliedChange != e) {
        this.collaboration.sendMyChange(JSON.stringify(e)); // 调用collaboration服务的sendMyChange方法向server发送本用户的变化点
      }
    });

    // 给editor绑定changeCursor事件，监视本地是否发送光标移动
    this.editor.getSession().getSelection().on("changeCursor", () => {
      let cursor = this.editor.getSession().getSelection().getCursor(); // 获得当前的光标对象
      this.collaboration.sendMyCursor(JSON.stringify(cursor)); // 调用collaboration服务的sendMyCursor方法向server发送本用户的光标
    });

    // 在编辑器初始化时首先要从server端恢复相同sessionId的数据
    this.collaboration.restoreBuffer();
  }

  setLanguage(language: string): void {
    this.language = language;
    this.resetEditor();
  }

  resetEditor(): void {
    this.editor.getSession().setMode('ace/mode/' + this.languageToMode[this.language]);
    this.editor.setValue(this.defaultContent[this.language]);
    this.output = ''; // 同时清空代码执行结果
  }

  submit(): void {
    let userCode = this.editor.getValue();
    let data = {
      user_code: userCode,
      lang: this.language
    };
    // 将代码发出后返回Promise
    this.data.buildAndRun(data)
      .then(result => this.output = result.text);
  }

}
