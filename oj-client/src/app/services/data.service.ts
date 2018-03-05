import { Injectable } from '@angular/core';
import { Problem } from "../models/problem.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/toPromise';

const headers = new HttpHeaders().set('Content-Type', 'application/json');

@Injectable()
export class DataService {

  // 这个BehaviorSubject是client和server间信息传递的medium，用它能避免传递reference
  private problemSource = new BehaviorSubject<Problem[]>([]);

  constructor(private http: HttpClient) { }

  // error handler
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purpises only
    return Promise.reject(error.body || error);
  }

  // 无论get或post返回的都是一个Observable，在这里我们转换成Promise来处理
  getProblems(): Observable<Problem[]> {
    this.http.get("api/v1/problems")
      .toPromise()
      .then((res: Problem[]) => this.problemSource.next(res))
      .catch(this.handleError);
    return this.problemSource.asObservable();
  }

  getProblem(id: number): Promise<Problem> {
    return this.http.get(`api/v1/problems/${id}`)
      .toPromise()
      .then(res => res)
      .catch(this.handleError);
  }

  addProblem(problem: Problem): Promise<Problem> {
    return this.http.post("api/v1/problems", problem, {headers})
      .toPromise()
      .then(res => {
        this.getProblems(); // 当添加完后如果不调用它，那么页面上还是只有那几道题
        return res; // 返回一个新的Promise
      })
      .catch(this.handleError);
  }

  buildAndRun(data): Promise<Object> {
    return this.http.post("api/v1/build_and_run", data, {headers})
      .toPromise()
      .then(res => {
        console.log(res);
        return res;
      })
      .catch(this.handleError);
  }
}
