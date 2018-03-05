import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class InputService {

  // BehaviorSubject初始自带一个值为空字符串
  private inputSubjects = new BehaviorSubject<string>('');

  constructor() { }

  changeInput(term) {
    // search bar调用它时，通过next改变BehaviorSubject的值
    this.inputSubjects.next(term);
  }

  getInput(): Observable<string> {
    // 使用asObservable能新建一个Observable，
    // 这样能避免直接传递reference，problem-list调用它时获得一个observable
    return this.inputSubjects.asObservable();
  }

}
