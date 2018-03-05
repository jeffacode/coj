import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl } from "@angular/forms";
import { Subscription } from "rxjs/Subscription";
import { Router } from "@angular/router";
import "rxjs/add/operator/debounceTime";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  title = "COJ";
  profile: any;

  searchBox: FormControl = new FormControl(); // 获得名为searchBox的FormControl对象
  subscription: Subscription;

  constructor(@Inject('auth') private auth,
              @Inject('input') private input,
              private router: Router) {
  }

  ngOnInit() {
    this.profile = JSON.parse(localStorage.getItem('profile'));
    this.subscription = this.searchBox
                            .valueChanges // FormControl对象有一个valueChanges属性返回一个Observable
                            .debounceTime(200) // 并不是每个输入都要订阅而是每个200ms订阅一次
                            .subscribe(term => {
                              // 这个Observable emit的值就是来自search bar的输入
                              // 调用changeInput再将这个输入传递给BehaviorSubject
                              this.input.changeInput(term);
                            })
  }

  ngOnDestroy() {
    // 当组件销毁时取消订阅，防止memory leak
    this.subscription.unsubscribe();
  }

  searchProblem(): void {
    // 在search bar内回车触发submit事件，直接回到/problems下
    this.router.navigate(['/problems']);
  }

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }
}
