import { Component, OnInit, Inject } from '@angular/core';
import {Problem} from "../../models/problem.model";

const DEFAULT_PROBLEM: Problem = {
  id: 0,
  name: "",
  desc: "",
  difficulty: ""
};

// @Component({
//   selector: 'app-new-problem',
//   templateUrl: './new-problem.component.html',
//   styleUrls: ['./new-problem.component.css']
// })
// export class NewProblemComponent implements OnInit {
//
//   public difficulties = ['Easy', 'Medium', 'Hard', 'Super'];
//
//   newProblem: Problem = DEFAULT_PROBLEM; // 初始赋一个默认问题
//
//   constructor(@Inject('data') private data) { }
//
//   ngOnInit() {
//   }
//
//   addProblem(): void {
//     this.data.addProblem(this.newProblem);
//     this.newProblem = Object.assign({}, DEFAULT_PROBLEM); // 深拷贝，保证再触发submit事件时newProblem指向的是一个不同的对象
//   }
//
// }


@Component({
  selector: 'app-new-problem',
  templateUrl: './new-problem.component.html',
  styleUrls: ['./new-problem.component.css']
})
export class NewProblemComponent implements OnInit {

  public difficulties = ['Easy', 'Medium', 'Hard', 'Super'];

  newProblem: Problem = DEFAULT_PROBLEM; // 初始赋一个默认问题

  constructor(@Inject('data') private data, @Inject('authGuard') public authGuard) { }

  ngOnInit() {
  }

  addProblem(): void {
    this.data.addProblem(this.newProblem)
      .catch(error => console.log(error.body));
    this.newProblem = Object.assign({}, DEFAULT_PROBLEM); // 深拷贝，保证再触发submit事件时newProblem指向的是一个不同的对象
  }

}
