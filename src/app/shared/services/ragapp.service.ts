import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PoDisclaimer, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { Observable, Subscription } from 'rxjs';
import { IRagApp, RagApp } from '../model/ragapp.model';
import { IRagAppItems, RagAppItems } from '../model/ragappItems.model';
import { DecimalPipe } from '@angular/common';
import { promise } from 'protractor';

@Injectable()
export class RagAppService {


    private headers = { headers: { 'Content-Type':  'application/json',
                                'X-PO-Screen-Lock': 'true',
                                'Cache-Control': 'false',
                                'X-Requested-With': 'false',
                                'Access-Control-Allow-Origin': '*'
                            }};

    constructor(private http: HttpClient) { }

    url = '';

    myRequest(code: string){

          console.log(code);

        this.url =
            `https://poring.world/api/search?order=popularity&rarity=&inStock=1&modified=&category=&endCategory=&q=${code}`;

        return this.http.get(this.url, this.headers);

    }
}
