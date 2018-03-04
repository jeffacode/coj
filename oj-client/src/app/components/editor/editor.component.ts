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
  language: string;
  sessionId: string;

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

  constructor(@Inject('collaboration') private collaboration, private route: ActivatedRoute) {
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

    // lastAppliedChange记录上一次的变化点
    this.editor.lastAppliedChange = null;
    // 给editor绑定change事件，当在本地编辑时就会触发这个事件
    this.editor.on('change', (e) => {
      if (this.editor.lastAppliedChange != e) {
        this.collaboration.sendLocalChange(JSON.stringify(e)); // 调用collaboration服务的sendLocalChange方法向server发送当前的变化点
      }
    })
  }

  setLanguage(language: string): void {
    this.language = language;
    this.resetEditor();
  }

  resetEditor(): void {
    this.editor.getSession().setMode('ace/mode/' + this.languageToMode[this.language]);
    this.editor.setValue(this.defaultContent[this.language]);
  }

  submit(): void {
    let userCode = this.editor.getValue();
    this.editor.log(userCode);
  }

}
