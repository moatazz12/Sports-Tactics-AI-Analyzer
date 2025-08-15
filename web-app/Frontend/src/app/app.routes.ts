import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { AuthGuard } from './guards/auth.guard';
import { AdminComponent } from './admin/admin';
import { Userhome } from './userhome/userhome';
import { Video } from './video/video';
import { History } from './history/history';
import { AiViewer } from './ai-viewer/ai-viewer';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent },
  { path: 'userhome', component: Userhome , canActivate: [AuthGuard]},
  { path: 'auto-annotation', component: Video , canActivate: [AuthGuard]},
  { path: 'history', component: History , canActivate: [AuthGuard]}
  ,{ path: 'ai-viewer', component: AiViewer , canActivate: [AuthGuard]}
];
