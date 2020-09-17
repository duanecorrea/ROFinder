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

    url: string;

    enchantFiltered: string;
    codeFiltered: string;

    playSound: boolean;

    data: any;
    oData: RagApp;

    logAux;
    cont: number;

    getItems(id :number){

        this.oData = new RagApp();

        this.playSound = false;
        this.oData = this.dataObj[this.dataObj.findIndex(o => o.id === id)];

        this.oData.items.map(function(oItems){
                oItems.isAlive = 'false';
        });

        this.url = 'https://poring.world/api/search?order=popularity&rarity=&inStock=1&modified=&category=&endCategory=&q='
                    + this.oData.code;

        // FAKE PROCESS
        this.data = this.callFake();

        // this.http.get<any>(this.url, this.headers).subscribe(data => {
            if (this.data){
                this.data.forEach(item => {

                    if (this.oData.refine !== 'any' && parseInt(this.oData.refine) !== item.refineLv){return;}
                    if (this.oData.enchant !== 'any' && item.name.indexOf(this.oData.enchant) === -1){return;}
                    if (this.oData.broken !== 'any'){
                        if(this.oData.broken === 'true' && item.name.indexOf('broken') === -1){return;}
                        if(this.oData.broken === 'false' && item.name.indexOf('broken') !== -1){return;}
                    }

                    this.dataObjItems = this.addNewdataItems(item.refineLv.toString(),
                                                                item.name,
                                                                item.name.indexOf('broken') !== -1,
                                                                item.lastRecord.price,
                                                                item.icon,
                                                                item.id);

                    this.oData.items.map(function(oItems){
                        if (oItems.refine  === this.dataObjItems.refine  &&
                            oItems.code    === this.dataObjItems.code    &&
                            oItems.enchant === this.dataObjItems.enchant &&
                            oItems.broken  === this.dataObjItems.broken){
                            this.dataObjItems.hasNew = 'false';
                            oItems.price  = this.dataObjItems.price;
                            oItems.isAlive = 'true';

                            if(oItems.hasNew === 'true'){this.playSound = true;}
                        }
                    }.bind(this));

                    if (this.dataObjItems.hasNew === 'true'){
                        this.oData.hasNew = 'true';
                        this.playSound = true;
                        this.oData.items.push(this.dataObjItems);
                    }

                    if(this.oData.items){this.oData.hasRecords = true;}
                });
                this.playSoundFunc();
            }
        // }) 

        this.cont = 0;
        this.oData.items.forEach(item => {
            if(item.isAlive === 'false'){
                this.oData.items.splice(this.cont,1);
            }
            this.cont++;
        });
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

        if(this.logAux === '1'){this.logAux = '2';}
        else if(this.logAux === '2'){this.logAux = '3';}

        this.playSound = false;

        this.dataObj.map(function(oData){
            this.getItems(oData.id);
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

        this.logAux = '1';

        dataObjAux.pK = refine + code.trim() + enchant + broken;
        dataObjAux.id = id;
        dataObjAux.refine = refine;
        dataObjAux.code = code;
        dataObjAux.enchant = enchant;
        dataObjAux.broken = broken;

        this.dataObj.push(dataObjAux);

        this.getItems(dataObjAux.id);

    }
    callFake(){

        if(this.logAux === '1'){
            // 0 5 6 4
            return [{"id":63,"itemId":17525,"icon":"item_48525","name":"Monocle Blueprint","category":"Blueprint","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":0,"safeRefineCost":0,"rarity":4,"modified":false,"inStock":true,"priceChange1d":13.55168370697643,"priceChange3d":33.78609130508086,"priceChange7d":72.21220167435776,"lastRecord":{"timestamp":1600348491,"price":7498784,"stock":13,"snapBuyers":0,"snapEnd":0}},
                    {"id":6742,"itemId":48525,"icon":"item_48525","name":"+5 Monocle (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":5,"safeRefineCost":190000,"safeRefineMaterials":[{"name":"Monocle","quantity":1,"unitPrice":6890499},{"name":"Mithril","quantity":9,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":18.53332399015852,"priceChange3d":16.348416749523683,"priceChange7d":21.08838353911167,"lastRecord":{"timestamp":1600348124,"price":7611973,"stock":1,"snapBuyers":0,"snapEnd":1600355058}},
                    {"id":11564,"itemId":48525,"icon":"item_48525","name":"+6 Monocle (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":6,"safeRefineCost":410000,"safeRefineMaterials":[{"name":"Monocle","quantity":3,"unitPrice":6890499},{"name":"Mithril","quantity":19,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":7.425598082581845,"priceChange3d":9.819952376224752,"priceChange7d":22.31760802710576,"lastRecord":{"timestamp":1600348123,"price":14291604,"stock":1,"snapBuyers":0,"snapEnd":1600353879}},
                    {"id":23451,"itemId":48525,"icon":"item_48525","name":"+4 Monocle \u003cMorale 1\u003e (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":4,"safeRefineCost":90000,"safeRefineMaterials":[{"name":"Mithril","quantity":4,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":2.8366290383085317,"priceChange3d":2.073112321260354,"priceChange7d":2.7241232168232066,"lastRecord":{"timestamp":1600348124,"price":27580896,"stock":1,"snapBuyers":0,"snapEnd":0}}
                    ];
        }else if(this.logAux === '2'){
            // 0 5 4
            return [{"id":63,"itemId":17525,"icon":"item_48525","name":"Monocle Blueprint","category":"Blueprint","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":0,"safeRefineCost":0,"rarity":4,"modified":false,"inStock":true,"priceChange1d":13.55168370697643,"priceChange3d":33.78609130508086,"priceChange7d":72.21220167435776,"lastRecord":{"timestamp":1600348491,"price":7498784,"stock":13,"snapBuyers":0,"snapEnd":0}},
                {"id":6742,"itemId":48525,"icon":"item_48525","name":"+5 Monocle (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":5,"safeRefineCost":190000,"safeRefineMaterials":[{"name":"Monocle","quantity":1,"unitPrice":6890499},{"name":"Mithril","quantity":9,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":18.53332399015852,"priceChange3d":16.348416749523683,"priceChange7d":21.08838353911167,"lastRecord":{"timestamp":1600348124,"price":7611973,"stock":1,"snapBuyers":0,"snapEnd":1600355058}},
                {"id":23451,"itemId":48525,"icon":"item_48525","name":"+4 Monocle \u003cMorale 1\u003e (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":4,"safeRefineCost":90000,"safeRefineMaterials":[{"name":"Mithril","quantity":4,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":2.8366290383085317,"priceChange3d":2.073112321260354,"priceChange7d":2.7241232168232066,"lastRecord":{"timestamp":1600348124,"price":27580896,"stock":1,"snapBuyers":0,"snapEnd":0}}
                    ];
        }else if(this.logAux === '3'){
            // 0 5 10 15 4
            return [{"id":63,"itemId":17525,"icon":"item_48525","name":"Monocle Blueprint","category":"Blueprint","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":0,"safeRefineCost":0,"rarity":4,"modified":false,"inStock":true,"priceChange1d":13.55168370697643,"priceChange3d":33.78609130508086,"priceChange7d":72.21220167435776,"lastRecord":{"timestamp":1600348491,"price":7498784,"stock":13,"snapBuyers":0,"snapEnd":0}},
                {"id":6742,"itemId":48525,"icon":"item_48525","name":"+5 Monocle (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":5,"safeRefineCost":190000,"safeRefineMaterials":[{"name":"Monocle","quantity":1,"unitPrice":6890499},{"name":"Mithril","quantity":9,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":18.53332399015852,"priceChange3d":16.348416749523683,"priceChange7d":21.08838353911167,"lastRecord":{"timestamp":1600348124,"price":7611973,"stock":1,"snapBuyers":0,"snapEnd":1600355058}},
                {"id":11564,"itemId":48525,"icon":"item_48525","name":"+6 Monocle (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":10,"safeRefineCost":410000,"safeRefineMaterials":[{"name":"Monocle","quantity":3,"unitPrice":6890499},{"name":"Mithril","quantity":19,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":7.425598082581845,"priceChange3d":9.819952376224752,"priceChange7d":22.31760802710576,"lastRecord":{"timestamp":1600348123,"price":14291604,"stock":1,"snapBuyers":0,"snapEnd":1600353879}},
                {"id":11564,"itemId":48525,"icon":"item_48525","name":"+6 Monocle (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":15,"safeRefineCost":410000,"safeRefineMaterials":[{"name":"Monocle","quantity":3,"unitPrice":6890499},{"name":"Mithril","quantity":19,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":7.425598082581845,"priceChange3d":9.819952376224752,"priceChange7d":22.31760802710576,"lastRecord":{"timestamp":1600348123,"price":14291604,"stock":1,"snapBuyers":0,"snapEnd":1600353879}},
                {"id":23451,"itemId":48525,"icon":"item_48525","name":"+4 Monocle \u003cMorale 1\u003e (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":4,"safeRefineCost":90000,"safeRefineMaterials":[{"name":"Mithril","quantity":4,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":2.8366290383085317,"priceChange3d":2.073112321260354,"priceChange7d":2.7241232168232066,"lastRecord":{"timestamp":1600348124,"price":27580896,"stock":1,"snapBuyers":0,"snapEnd":0}}
            ];

        }
    }
}
