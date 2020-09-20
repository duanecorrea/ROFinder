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
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
                                'Access-Control-Max-Age' : '1000',
                                'Access-Control-Allow-Headers': 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token'
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
