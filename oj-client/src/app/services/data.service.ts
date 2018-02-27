import { Injectable } from '@angular/core';
import { Problem } from "../models/problem.model";
// import { PROBLEMS } from "../mock-problems"
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/toPromise';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

// @Injectable()
// export class DataService {
//
//   problems: Problem[] = PROBLEMS;
//
//   constructor() { }
//
//   getProblems(): Problem[] {
//     return this.problems;
//   }
//
//   getProblem(id: number): Problem {
//     return this.problems.find((problem) => problem.id === id); // 遍历数组中的problem，返回id相同的那个problem
//   }
//
//   addProblem(problem: Problem): void {
//     problem.id = this.problems.length + 1; // 为新的问题分配一个id
//     this.problems.push(problem);
//   }
// }

@Injectable()
export class DataService {

  private problemSource = new BehaviorSubject<Problem[]>([]);

  constructor(private http: HttpClient) { }

  // error handler
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purpises only
    return Promise.reject(error.body || error);
  }

  getProblems(): Observable<Problem[]> {
    this.http.get("api/v1/problems")
      .toPromise()
      .then((res: Problem[]) => this.problemSource.next(res))
      .catch(this.handleError);

    return this.problemSource.asObservable(); // Observable可被订阅
  }

  // this.http.get获得的是一个Observable
  // Promise只会被触发一次
  // Observale只要api的值发生变化就会被触发
  getProblem(id: number): Promise<Problem> {
    return this.http.get(`api/v1/problems/${id}`)
      .toPromise()
      .then((res: Problem) => res)
      .catch(this.handleError);
  }

  addProblem(problem: Problem): Promise<Problem> {
    return this.http.post("api/v1/problems", problem, httpOptions)
      .toPromise()
      .then((res: Problem) => {
        this.getProblems(); // 当添加完后如果不调用它，那么页面上还是只有那几道题
        return res;
      })
      .catch(this.handleError);
  }
}
