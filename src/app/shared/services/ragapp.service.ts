import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoDisclaimer, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { Observable, Subscription } from 'rxjs';
import { IRagApp, RagApp } from '../model/ragapp.model';
import { IRagAppItems, RagAppItems } from '../model/ragappItems.model';
import { DecimalPipe } from '@angular/common';

@Injectable()
export class RagAppService {

    private headers = { headers: { 'X-PO-Screen-Lock': 'true' } };

    private subscription: Subscription;

    constructor(private http: HttpClient) { }

    dataObj: any = [];
    dataObjItems: any = [];
    dataObjItemsComp:any = [];

    url: string;

    enchantFiltered: string;
    codeFiltered: string;

    index;
    playSound: boolean;

    getItems(oData){

        oData.hasNew = 'false';

        oData.items.map(function(oItems){
                oItems.isAlive = 'false';
        });

        this.url = 'https://poring.world/api/search?order=popularity&rarity=&inStock=1&modified=&category=&endCategory=&q='
                    + oData.code;

        this.http.get<any>(this.url, this.headers).subscribe(data => {
        if (data){
            data.forEach(item => {

                if (oData.refine !== 'any' && parseInt(oData.refine) !== item.refineLv){return;}
                if (oData.enchant !== 'any' && item.name.indexOf(oData.enchant) === -1){return;}
                if (oData.broken !== 'any'){
                    if(oData.broken === 'true' && item.name.indexOf('broken') === -1){return;}
                    if(oData.broken === 'false' && item.name.indexOf('broken') !== -1){return;}
                }

                this.dataObjItems = this.addNewdataItems(item.refineLv.toString(),
                                                            item.name,
                                                            item.name.indexOf('broken') !== -1,
                                                            item.lastRecord.price,
                                                            item.icon,
                                                            item.id);

                oData.items.map(function(oItems){
                    if (oItems.refine  === this.dataObjItems.refine  &&
                        oItems.code    === this.dataObjItems.code    &&
                        oItems.enchant === this.dataObjItems.enchant &&
                        oItems.broken  === this.dataObjItems.broken){
                        this.dataObjItems.hasNew = 'false';
                        oItems.hasNew = 'false';
                        oItems.price  = this.dataObjItems.price;
                        oItems.isAlive = 'true';
                    }
                }.bind(this));

                if (this.dataObjItems.hasNew === 'true'){
                    oData.hasNew = 'true';
                    this.playSound = true;
                    oData.items.push(this.dataObjItems);
                }

                if(oData.items){oData.hasRecords = true;}
            });
            this.playSoundFunc();
        }
        })

        while(this.index !== -1){
            this.index = oData.items.findIndex(o => o.isAlive === 'false');
            oData.items.splice(this.index,1);
        };
        
    }

    playSoundFunc():void {
        const audio = new Audio();

        audio.src = '../../../assets/audio/Ring01.wav';

        if (this.playSound === true ){

            audio.load();
            audio.play();

        }
    }

    getItemsByFunct(funct: string){

        this.playSound = false;

        this.dataObj.map(function(oData){
            this.getItems(oData);
        }.bind(this));

        return this.dataObj;
    }

    addNewdataItems(refine: string, code: string,broken:boolean,price: number,icon: string, id: number){

        const dataObjAux: IRagAppItems = new RagAppItems();
        const refineFiltered: string = '+' + refine;

        this.enchantFiltered = '';
        this.codeFiltered = code;

        if(code.indexOf('<') > 0){
            this.enchantFiltered = code.substring(code.indexOf('<') +1,code.indexOf('>'));
            this.codeFiltered = code.substring(0,code.indexOf('<'));
        }
        if(this.codeFiltered.indexOf('broken') > 0){
            this.codeFiltered = this.codeFiltered.replace('(broken)','');
        }

        this.codeFiltered = this.codeFiltered.replace(refineFiltered, '');

        dataObjAux.id = id;
        dataObjAux.refine = refineFiltered;
        dataObjAux.code = this.codeFiltered;
        dataObjAux.enchant = this.enchantFiltered;
        dataObjAux.broken = broken.toString();
        dataObjAux.hasNew = 'true';
        dataObjAux.price = (price / 1000000).toFixed(3) + 'kk';
        dataObjAux.spriteId = icon;
        dataObjAux.isAlive = 'true';

        return dataObjAux;

    }

    addNewdata(refine: string, code: string,enchant: string,broken:string,id: number){

        const dataObjAux: IRagApp = new RagApp();

        this.playSound = false;

        dataObjAux.id = id;
        dataObjAux.refine = refine;
        dataObjAux.code = code;
        dataObjAux.enchant = enchant;
        dataObjAux.broken = broken;

        this.dataObj.push(dataObjAux);

        this.getItems(dataObjAux);

    }
}
