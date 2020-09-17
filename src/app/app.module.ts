import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { PoModule } from '@po-ui/ng-components';
import { PoI18nConfig, PoI18nModule, PoI18nPipe } from '@po-ui/ng-components';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

import { CountdownConfig, CountdownGlobalConfig, CountdownModule } from 'ngx-countdown';

import { generalEn } from './shared/literals/i18n/general-en';
import { generalPt } from './shared/literals/i18n/general-pt';
import { ragAppPt } from './shared/literals/i18n/ragapp-pt';

import { BreadcrumbControlService } from './shared/services/breadcrumb-control.service';
import { RagAppService } from './shared/services/ragapp.service';

const i18nConfig: PoI18nConfig = {
    default: {
        context: 'general',
        cache: true
    },
    contexts: {
        general: {
            'pt-BR': generalPt,
            'pt': generalPt /*,
            'en-US': generalEn,
            'en': generalEn*/
        },
        ragApp: {
            'pt-BR': ragAppPt,
            'pt': ragAppPt /*,
            'en': ragAppPt*/
        }
    }
};

@NgModule({
    declarations: [
        AppComponent
    ],
    entryComponents: [
    ],
    imports: [
        BrowserModule,
        PoModule,
        CommonModule,
        FormsModule,
        AppRoutingModule,
        CountdownModule,
        PoI18nModule.config(i18nConfig)
    ],
    providers: [
        PoI18nPipe,
        BreadcrumbControlService,
        RagAppService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
