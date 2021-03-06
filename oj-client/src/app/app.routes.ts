import { Routes, RouterModule} from "@angular/router";
import { ProblemListComponent } from './components/problem-list/problem-list.component';
import { ProblemDetailComponent } from './components/problem-detail/problem-detail.component';
import {ProfileComponent} from "./components/profile/profile.component";

// Routes处理本地routing逻辑，根据url决定交由哪个组件的html来显示
const routes: Routes = [
  {
    path: "", // 根目录，localhost:4200
    redirectTo: "problems", // 自动跳转到/problems，这也是为什么输的是localhost:4200显示却多了/problems
    pathMatch: "full"
  },
  {
    path: "problems", // localhost:4200/problems
    component: ProblemListComponent // 使用ProblemListComponent组件
  },
  {
    path: "problems/:id", // 有指定id，localhost:4200/problems/123
    component: ProblemDetailComponent // 使用ProblemDetailComponent组件
  },
  {
    path: "profile", // localhost:4200/profile
    component: ProfileComponent, // 使用ProfileComponent组件
    canActivate: ['authGuard'] // 由AuthGuard服务提供的canActivate来决定是否显示这个组件
  },
  {
    path: "**", // 其他地址，localhost:4200/42133
    redirectTo: "problems", // 跳转到problems
  }
];

export const routing = RouterModule.forRoot(routes);
