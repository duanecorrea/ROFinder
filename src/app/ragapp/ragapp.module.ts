import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoModule } from '@po-ui/ng-components';
import { RagAppRoutingModule } from './ragapp-routing.module';
import { RagAppListComponent } from './list/ragapp.list.component';
import { CountdownConfig, CountdownGlobalConfig, CountdownModule } from 'ngx-countdown';


@NgModule({
    imports: [
        CommonModule,
        PoModule,
        FormsModule,
        HttpClientModule,
        CountdownModule,
        RagAppRoutingModule
    ],
    declarations: [
        RagAppListComponent
    ],
    exports: [
        RagAppListComponent
    ],
    providers: [

    ],
})
export class RagAppModule { }
