import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoDisclaimer, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { Observable, Subscription } from 'rxjs';
import { IRagApp, RagApp } from '../model/ragapp.model';
import { IRagAppItems, RagAppItems } from '../model/ragappItems.model';
import { DecimalPipe } from '@angular/common';
import { promise } from 'protractor';

@Injectable()
export class RagAppService {

    private headers = { headers: { 'X-PO-Screen-Lock': 'true' } };

    constructor(private http: HttpClient) { }

    url = '';

    myRequest(code: string){

        this.url =
            `https://poring.world/api/search?order=popularity&rarity=&inStock=1&modified=&category=&endCategory=&q=${code}`;

        return this.http.get<any>(this.url, this.headers);

    }
}
