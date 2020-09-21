import { HttpClient } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PoBreadcrumb, PoI18nService, PoModalAction, PoModalComponent, PoNotificationService, PoTableComponent, PoTableDetail } from '@po-ui/ng-components';
import { PoPageAction, PoTableAction, PoTableColumn, PoTableModule } from '@po-ui/ng-components';
import { CountdownComponent, CountdownEvent, CountdownConfig } from 'ngx-countdown';
import { forkJoin, Subscription } from 'rxjs';
import { IRagApp, RagApp } from 'src/app/shared/model/ragapp.model';
import { IRagAppItems, RagAppItems } from 'src/app/shared/model/ragappItems.model';
import { BreadcrumbControlService } from 'src/app/shared/services/breadcrumb-control.service';
import { RagAppService } from 'src/app/shared/services/ragapp.service';


@Component({
  selector: 'app-ragapp-list',
  templateUrl: './ragapp.list.component.html',
  styleUrls: ['./ragapp.list.component.css']
})
export class RagAppListComponent implements OnInit, OnDestroy {
  @ViewChild('modalAdd', { static: true }) modalAdd: PoModalComponent;
  @ViewChild('countdown', { static: false }) private counter: CountdownComponent;
  @ViewChild(PoTableComponent, { static: true }) poTable: PoTableComponent;

  literals: any = {};

  breadcrumb: PoBreadcrumb;

  columns: Array<PoTableColumn>;
  columnsItems: Array<PoTableColumn>;

  items: Array<IRagApp> = new Array<IRagApp>();
  itemsAux: Array<IRagApp> = new Array<IRagApp>();

  tableActions: Array<PoTableAction>;

  confirmModalAdd: PoModalAction;
  cancelModalAdd: PoModalAction;

  servRagAppSubscription$: Subscription;

  hasNext = true;
  currentPage = 1;
  pageSize = 20;

  expandables = [''];

  addCode: string;
  addRefine: string;
  addEnchant: string;
  addBroken: string;

  comboRefine: any = [];
  comboEnchant: any = [];

  pageActions: Array<PoPageAction>;

  globId = 0;

  vData;
  oData;

  cdConfig: CountdownConfig = { leftTime: 180 };

  dataObj: any = [];
  dataObjItems: any = [];

  url: string;

  enchantFiltered: string;
  codeFiltered: string;

  playSound: boolean = false;


  logAux = 0;
  cont: number;

  isWaiting = false;

  constructor(
      private breadcrumbControlService: BreadcrumbControlService,
      private serviceRagApp: RagAppService,
      private thfI18nService: PoI18nService,
      private activatedRoute: ActivatedRoute,
      private poNotification: PoNotificationService,
      private router: Router,
      @Inject(LOCALE_ID) private locale: string
  ) { }

  ngOnInit(): void {
      forkJoin(
          this.thfI18nService.getLiterals(),
          this.thfI18nService.getLiterals({ context: 'ragApp' })
      ).subscribe(literals => {
          literals.map(item => Object.assign(this.literals, item));

          this.breadcrumbControlService.addBreadcrumb(this.literals['ragAppList'], this.activatedRoute);

          this.setupComponents();
      });
  }
  addComboRefine(){
    this.comboRefine.push({value:'any',label: 'any'});
    for (var _i = 0; _i < 16; _i++) {
        this.comboRefine.push({value: _i,label: _i});
      }
  }

  pushCombo(eff: string){
    this.comboEnchant.push({value: eff,label: eff});
  }
  addComboEnchant(){
    this.pushCombo('any');
    this.pushCombo('Divine Blessing');
    this.pushCombo('Armor Breaking');
    this.pushCombo('Insight');
    this.pushCombo('Magic Pen.');
    this.pushCombo('Sharp');
    this.pushCombo('Arcane');
    this.pushCombo('Morale');
    this.pushCombo('CastInc');
    this.pushCombo('Arch');
    this.pushCombo('Sharp Blade');
    this.pushCombo('Tenacity');
    this.pushCombo('Blasphemy');
    this.pushCombo('Zeal');
    this.pushCombo('Armor');
  }

  hasRecords(row, index: number) {
    return row.hasRecords;
  }

  handleEvent(e: CountdownEvent){
    if(e.action === 'done'){
      this.onReload();
    }
  }

  onReload(){
    this.items.forEach((item, index) => {
      if (item.items) {
        if(item.isExpanded === true){
          this.onCollapse(item);
          this.poTable.collapse(index);
          item.isExpanded = false;
        }
      }
    });

    this.isWaiting = true;
    this.getItemsByFunct('all');
    this.isWaiting = false;
    setTimeout(() => this.counter.restart());
  }

  onClick(){
      this.addRefine = 'any';
      this.addEnchant = 'any';
      this.addBroken = 'any';
      this.addCode = '';
      this.modalAdd.open();
  }

  getColumns(): PoTableColumn[] {
      return [
          { property: 'refine', label: this.literals['refine'], type: 'string', width: '10%'},
          { property: 'code', label: this.literals['code'], type: 'string', width: '30%'},
          { property: 'enchant', label: this.literals['enchant'], type: 'string', width: '30%'},
          { property: 'broken', label: this.literals['broken'], type: 'string', width: '20%'},
          { property: 'hasNew', label: this.literals['hasNew'], type: 'label', width: '10%',
          labels: [
            { value: 'true', color: 'color-10', label: 'Novo Item'}
            ]}
        ];
   }

   getColumnsItems(): PoTableColumn[] {

      return [
          { property: 'spriteId', label: this.literals['blank'], type: 'cellTemplate', width: '10%'},
          { property: 'refine', label: this.literals['refine'], type: 'string', width: '10%'},
          { property: 'code', label: this.literals['code'], type: 'string', width: '20%'},
          { property: 'enchant', label: this.literals['enchant'], type: 'string', width: '20%'},
          { property: 'broken', label: this.literals['broken'], type: 'label', width: '20%',
          labels: [
            { value: 'false', label: 'Normal' },
            { value: 'true', color: 'color-07', label: 'Broken' }]},
          { property: 'price', label: this.literals['price'], type: 'string', width: '10%'},
          { property: 'hasNew', label: this.literals['hasNew'], type: 'label', width: '10%',
          labels: [
            { value: 'true', color: 'color-10', label: 'Novo Item'}
            ]}
      ];
   }

   onCollapse(rowIndex: IRagApp){
    rowIndex.hasNew = 'false';
    rowIndex.items.forEach(oItem => {
      oItem.hasNew = 'false';
    });
   }

   onExpanded(rowIndex: IRagApp){
    rowIndex.isExpanded = true;
   }

   validateFields():boolean{

    const vPk = this.addRefine + this.addCode.trim() + this.addEnchant + this.addBroken;
    let vReturn = true;

    if(this.addRefine === 'any' && this.addEnchant === 'any' && this.addBroken === 'any' && this.addCode === ''){
      this.poNotification.error('Campos em branco!')
      vReturn = false;
    }

    this.items.forEach(oItems => {
      if(oItems.pK  === vPk){
          this.poNotification.error('Pesquisa já realizada!')
          vReturn = false;
          return;
         }
    })

    return vReturn;
   }

   onConfirmModalAdd(){

    if (this.validateFields() === false){
      return;
    }

    this.addNewdata(this.addRefine,this.addCode,this.addEnchant,this.addBroken,this.globId++);
    this.modalAdd.close();
   }

   delete(item: IRagApp): void {
     const vIndex = this.items.findIndex(o => o.id === item.id);
     this.items.splice(vIndex,1);
   }

  setupComponents(): void {

      this.breadcrumb = this.breadcrumbControlService.getBreadcrumb();

      this.columns = this.getColumns();
      this.columnsItems = this.getColumnsItems();

      this.tableActions = [
        { action: this.delete.bind(this), label: this.literals['remove'], icon: 'po-icon po-icon-delete' }
      ];

      this.confirmModalAdd = {
        action: () => this.onConfirmModalAdd(), label: this.literals['confirm']
      };

      this.cancelModalAdd = {
        action: () => this.modalAdd.close(), label: this.literals['cancel']
      };

      this.addComboRefine();
      this.addComboEnchant();

      this.addNewdata('any','mono','any','any',this.globId++)
      // this.addNewdata('any','telekin','any','any',this.globId++)
      // this.addNewdata('any','abyss','any','any',this.globId++)
      // this.addNewdata('any','str','any','any',this.globId++)
      // this.onReload();

  }

  ngOnDestroy(): void {
      if (this.servRagAppSubscription$) { this.servRagAppSubscription$.unsubscribe(); }
  }

  getItems(result, id :number){

      this.oData = this.items[this.items.findIndex(o => o.id === id)];

      this.oData.items.map(function(oItems){
              oItems.isAlive = 'false';
      });

      // FAKE PROCESS
      // if(this.oData.code === 'mono') {result = this.callFake1();}
      // if(this.oData.code === 'telekin') {result = this.callFake2();}

      if (result){
          result.forEach(item => {

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
                                                      this.oData.id);

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
          this.cont = 0;
          this.oData.items.forEach(item => {
              if(item.isAlive === 'false'){
                  this.oData.items.splice(this.cont,1);
              }
              this.cont++;
          });
      }
  }

  async getItemsByFunct(funct: string, id?: number,code?: string){

      if(funct === 'all'){
        for (let i = 0, len = this.items.length; i < len; i++) {
            await this.serviceRagApp.myRequest(this.items[i].code).toPromise().then((result: any) =>
                                                                                    this.getItems(result, this.items[i].id));
          }
      }else{
        await this.serviceRagApp.myRequest(code).toPromise().then((result: any) =>
                                                                  this.getItems(result, id));
      }
      this.playSoundFunc();
  }

  addNewdata(refine: string, code: string,enchant: string,broken:string,id: number){

      const dataObjAux: IRagApp = new RagApp();

      dataObjAux.pK = refine + code.trim() + enchant + broken;
      dataObjAux.id = id;
      dataObjAux.refine = refine;
      dataObjAux.code = code;
      dataObjAux.enchant = enchant;
      dataObjAux.broken = broken;

      this.items.push(dataObjAux);

      this.getItemsByFunct('single',dataObjAux.id, dataObjAux.code);

  }

  playSoundFunc():void {
      const audio = new Audio();

      audio.src = '../../../assets/audio/Ring01.wav';

      if (this.playSound === true ){
          audio.load();
          audio.play();
          this.playSound = false;
      }
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

  callFake2(){

      return [
              {"id":24429,"itemId":42557,"icon":"item_42557","name":"+6 Telekinetic Orb (broken)","category":"Equipment - Off-Hand","description":"“Minds of a kind think alike.” This old saying about fate from Payon.","equipType":"Orb","equipEffect":{"Def":23},"equipUniqueEffect":["Attack Spd ＋10%"],"blueprintProduct":"Telekinetic Orb","blueprintProductPrice":261622,"blueprintCraftingFee":0,"blueprintMaterials":[{"name":"Topaz","quantity":10,"unitPrice":2500},{"name":"Gold Sand","quantity":30,"unitPrice":480},{"name":"Parts","quantity":1,"unitPrice":102847},{"name":"Immortal Heart","quantity":400,"unitPrice":271}],"refineLv":6,"safeRefineCost":410000,"safeRefineMaterials":[{"name":"Telekinetic Orb","quantity":3,"unitPrice":261622},{"name":"Elunium","quantity":19,"unitPrice":31335}],"rarity":2,"modified":true,"inStock":true,"priceChange1d":0.9386175659207535,"priceChange3d":0.9170508201822402,"priceChange7d":0.12222450277423544,"lastRecord":{"timestamp":1600392120,"price":1190249,"stock":1,"snapBuyers":0,"snapEnd":0}},
              {"id":24430,"itemId":42557,"icon":"item_42557","name":"+6 Telekinetic Orb","category":"Equipment - Off-Hand","description":"“Minds of a kind think alike.” This old saying about fate from Payon.","equipType":"Orb","equipEffect":{"Def":23},"equipUniqueEffect":["Attack Spd ＋10%"],"blueprintProduct":"Telekinetic Orb","blueprintProductPrice":261622,"blueprintCraftingFee":0,"blueprintMaterials":[{"name":"Topaz","quantity":10,"unitPrice":2500},{"name":"Gold Sand","quantity":30,"unitPrice":480},{"name":"Parts","quantity":1,"unitPrice":102847},{"name":"Immortal Heart","quantity":400,"unitPrice":271}],"refineLv":6,"safeRefineCost":410000,"safeRefineMaterials":[{"name":"Telekinetic Orb","quantity":3,"unitPrice":261622},{"name":"Elunium","quantity":19,"unitPrice":31335}],"rarity":2,"modified":true,"inStock":true,"priceChange1d":-6.079300167134881,"priceChange3d":-6.079300167134881,"priceChange7d":0.08253232516068794,"lastRecord":{"timestamp":1600392121,"price":1320572,"stock":1,"snapBuyers":0,"snapEnd":0}},
              {"id":24759,"itemId":142557,"icon":"item_42557","name":"+10 Telekinetic Orb[1]","category":"Equipment - Off-Hand","description":"“Minds of a kind think alike.” This old saying about fate from Payon.","equipType":"Orb","equipEffect":{"Def":23},"equipUniqueEffect":["Attack Spd ＋10%"],"blueprintProduct":"Telekinetic Orb[1]","blueprintProductPrice":2681900,"blueprintCraftingFee":100000,"blueprintMaterials":[{"name":"Telekinetic Orb","quantity":11,"unitPrice":261622}],"refineLv":10,"safeRefineCost":6160000,"safeRefineMaterials":[{"name":"Telekinetic Orb","quantity":26,"unitPrice":261622},{"name":"Elunium","quantity":194,"unitPrice":31335}],"rarity":2,"modified":true,"inStock":true,"priceChange1d":-2.2890271427451356,"priceChange3d":-1.0421209968048772,"priceChange7d":0.237743930049251,"lastRecord":{"timestamp":1600391993,"price":16387972,"stock":1,"snapBuyers":0,"snapEnd":1600396658}},
              {"id":27846,"itemId":42557,"icon":"item_42557","name":"+9 Telekinetic Orb (broken)","category":"Equipment - Off-Hand","description":"“Minds of a kind think alike.” This old saying about fate from Payon.","equipType":"Orb","equipEffect":{"Def":23},"equipUniqueEffect":["Attack Spd ＋10%"],"blueprintProduct":"Telekinetic Orb","blueprintProductPrice":261622,"blueprintCraftingFee":0,"blueprintMaterials":[{"name":"Topaz","quantity":10,"unitPrice":2500},{"name":"Gold Sand","quantity":30,"unitPrice":480},{"name":"Parts","quantity":1,"unitPrice":102847},{"name":"Immortal Heart","quantity":400,"unitPrice":271}],"refineLv":9,"safeRefineCost":3420000,"safeRefineMaterials":[{"name":"Telekinetic Orb","quantity":16,"unitPrice":261622},{"name":"Elunium","quantity":109,"unitPrice":31335}],"rarity":2,"modified":true,"inStock":true,"priceChange1d":-0.18406702585310022,"priceChange3d":-0.18406702585310022,"priceChange7d":-0.18406702585310022,"lastRecord":{"timestamp":1600392121,"price":8203075,"stock":3,"snapBuyers":0,"snapEnd":0}}
          ]
  }

  callFake1(){

      this.logAux++;

      if(this.logAux === 1){
          // 0 5 6 4
          return [{"id":63,"itemId":17525,"icon":"item_48525","name":"Monocle Blueprint","category":"Blueprint","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":0,"safeRefineCost":0,"rarity":4,"modified":false,"inStock":true,"priceChange1d":13.55168370697643,"priceChange3d":33.78609130508086,"priceChange7d":72.21220167435776,"lastRecord":{"timestamp":1600348491,"price":7498784,"stock":13,"snapBuyers":0,"snapEnd":0}},
                  {"id":6742,"itemId":48525,"icon":"item_48525","name":"+5 Monocle (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":5,"safeRefineCost":190000,"safeRefineMaterials":[{"name":"Monocle","quantity":1,"unitPrice":6890499},{"name":"Mithril","quantity":9,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":18.53332399015852,"priceChange3d":16.348416749523683,"priceChange7d":21.08838353911167,"lastRecord":{"timestamp":1600348124,"price":7611973,"stock":1,"snapBuyers":0,"snapEnd":1600355058}},
                  {"id":11564,"itemId":48525,"icon":"item_48525","name":"+6 Monocle (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":6,"safeRefineCost":410000,"safeRefineMaterials":[{"name":"Monocle","quantity":3,"unitPrice":6890499},{"name":"Mithril","quantity":19,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":7.425598082581845,"priceChange3d":9.819952376224752,"priceChange7d":22.31760802710576,"lastRecord":{"timestamp":1600348123,"price":14291604,"stock":1,"snapBuyers":0,"snapEnd":1600353879}},
                  {"id":23451,"itemId":48525,"icon":"item_48525","name":"+4 Monocle \u003cMorale 1\u003e (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":4,"safeRefineCost":90000,"safeRefineMaterials":[{"name":"Mithril","quantity":4,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":2.8366290383085317,"priceChange3d":2.073112321260354,"priceChange7d":2.7241232168232066,"lastRecord":{"timestamp":1600348124,"price":27580896,"stock":1,"snapBuyers":0,"snapEnd":0}}
                  ];
      }else if(this.logAux === 2){
          // 0 5 4
          return [{"id":63,"itemId":17525,"icon":"item_48525","name":"Monocle Blueprint","category":"Blueprint","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":0,"safeRefineCost":0,"rarity":4,"modified":false,"inStock":true,"priceChange1d":13.55168370697643,"priceChange3d":33.78609130508086,"priceChange7d":72.21220167435776,"lastRecord":{"timestamp":1600348491,"price":7498784,"stock":13,"snapBuyers":0,"snapEnd":0}},
              {"id":6742,"itemId":48525,"icon":"item_48525","name":"+5 Monocle (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":5,"safeRefineCost":190000,"safeRefineMaterials":[{"name":"Monocle","quantity":1,"unitPrice":6890499},{"name":"Mithril","quantity":9,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":18.53332399015852,"priceChange3d":16.348416749523683,"priceChange7d":21.08838353911167,"lastRecord":{"timestamp":1600348124,"price":7611973,"stock":1,"snapBuyers":0,"snapEnd":1600355058}},
              {"id":23451,"itemId":48525,"icon":"item_48525","name":"+4 Monocle \u003cMorale 1\u003e (broken)","category":"Headwear - Face","description":"The glass, which can only cover one eye, is mostly regarded as a fashionable accessory in terms of its practicality.","depositReward":["Refining M.Atk ＋10"],"refineDepositReward":{"6":["Atk +3, Def +3"],"8":["Atk +6, M.Def +3"]},"unlockReward":["M.Atk ＋4.5"],"equipType":"Face","equipUniqueEffect":["M.Atk ＋5%\nFor Refining ＋1, M.Atk ＋1% (upper limit of increases is 15%)"],"blueprintProduct":"Monocle","blueprintProductPrice":6890499,"blueprintCraftingFee":203000,"blueprintMaterials":[{"name":"Monocle Blueprint","quantity":1,"unitPrice":7498784},{"name":"Cyfar","quantity":1050,"unitPrice":957},{"name":"Crystal Mirror","quantity":10,"unitPrice":69006},{"name":"Parts","quantity":10,"unitPrice":108405},{"name":"Mercury","quantity":200,"unitPrice":1709}],"refineLv":4,"safeRefineCost":90000,"safeRefineMaterials":[{"name":"Mithril","quantity":4,"unitPrice":25000}],"rarity":4,"modified":true,"inStock":true,"priceChange1d":2.8366290383085317,"priceChange3d":2.073112321260354,"priceChange7d":2.7241232168232066,"lastRecord":{"timestamp":1600348124,"price":27580896,"stock":1,"snapBuyers":0,"snapEnd":0}}
                  ];
      }else {
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

