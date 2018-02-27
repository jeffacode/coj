import { Component, OnInit, Inject } from '@angular/core'; // 加载Inject
import { Problem } from '../../models/problem.model';
import { Subscription } from "rxjs/Subscription";

// @Component({
//   selector: 'app-problem-list',
//   templateUrl: "./problem-list.component.html",
//   styleUrls: ["./problem-list.component.css"]
// })
// export class ProblemListComponent implements OnInit {
//   problems: Problem[];
//
//   constructor(@Inject('data') private data) { } // 注入名为data的服务，并将其赋值给data这个私有变量
//
//   ngOnInit() {
//     this.getProblems(); // 组件类创建实例时会启动，因此调用getProblems方法
//   }
//
//   getProblems(): void {
//     this.problems = this.data.getProblems();
//   }
//
// }

@Component({
  selector: 'app-problem-list',
  templateUrl: "./problem-list.component.html",
  styleUrls: ["./problem-list.component.css"]
})
export class ProblemListComponent implements OnInit {
  problems: Problem[] = [];
  subscriptionProblems: Subscription;

  constructor(@Inject('data') private data) { } // 注入名为data的服务，并将其赋值给data这个私有变量

  ngOnInit() {
    this.getProblems(); // 组件类创建实例时会启动，因此调用getProblems方法
  }

  // 每当api发生变化就会触发subscribe里的callback
  getProblems(): void {
    this.subscriptionProblems = this.data.getProblems().subscribe(problems => this.problems = problems);
  }

}
