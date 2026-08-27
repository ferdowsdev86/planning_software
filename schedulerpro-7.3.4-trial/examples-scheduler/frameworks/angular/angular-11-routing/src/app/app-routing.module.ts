import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SchedulerComponent } from './scheduler/scheduler.component';

const routes: Routes = [
    { path : '', redirectTo : 'schedulerpro', pathMatch : 'full' },
    { path : 'home', component : HomeComponent  },
    { path : 'schedulerpro', component : SchedulerComponent }
];

@NgModule({
    imports : [RouterModule.forRoot(routes, { useHash : true })],
    exports : [RouterModule]
})
export class AppRoutingModule { }
