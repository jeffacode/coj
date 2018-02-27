import { Component, OnInit, Inject } from '@angular/core';
import { Problem } from "../../models/problem.model";
import { ActivatedRoute } from "@angular/router";

// @Component({
//   selector: 'app-problem-detail',
//   templateUrl: './problem-detail.component.html',
//   styleUrls: ['./problem-detail.component.css']
// })
// export class ProblemDetailComponent implements OnInit {
//
//   problem: Problem;
//
//   constructor(
//     private route: ActivatedRoute, // 定义私有变量route，它包含了当前页面url的所有信息
//     @Inject('data') private data // 注入data服务
//   ) { }
//
//   ngOnInit() {
//     this.route.params.subscribe(params => {
//       this.problem = this.data.getProblem(+params['id'])})
//   }
//
// }

@Component({
  selector: 'app-problem-detail',
  templateUrl: './problem-detail.component.html',
  styleUrls: ['./problem-detail.component.css']
})
export class ProblemDetailComponent implements OnInit {

  problem: Problem;

  constructor(
    private route: ActivatedRoute, // 定义私有变量route，它包含了当前页面url的所有信息
    @Inject('data') private data // 注入data服务
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.data.getProblem(+params['id'])
        .then(problem => this.problem = problem);
    })
  }

}

