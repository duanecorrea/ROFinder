import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RagAppListComponent } from './list/ragapp.list.component';

const routes: Routes = [
  {
    path: '',
    component: RagAppListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RagAppRoutingModule { }
