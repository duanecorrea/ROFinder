import { formatDate } from '@angular/common';
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
  @ViewChild('modalHistory', { static: true }) modalHistory: PoModalComponent;
  @ViewChild('countdown', { static: false }) private counter: CountdownComponent;
  @ViewChild(PoTableComponent, { static: true }) poTable: PoTableComponent;

  literals: any = {};

  breadcrumb: PoBreadcrumb;

  columns: Array<PoTableColumn>;
  columnsItems: Array<PoTableColumn>;
  columnsHistory: Array<PoTableColumn>;

  items: Array<IRagApp> = new Array<IRagApp>();

  itemsHistory: Array<IRagAppItems> = new Array<IRagAppItems>();

  tableActions: Array<PoTableAction>;

  confirmModalAdd: PoModalAction;
  cancelModalAdd: PoModalAction;
  closeModalHistory: PoModalAction;

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

  cont: number;
  refineLv = '';
  refineFiltered = '';

  rangeIni: string;
  rangeFim: string;

  isWaiting = false;
  isDisabled = false;

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

  onChange(){
    this.rangeIni = '0';
    this.rangeFim = '15';
    if(this.addRefine === 'any'){
      this.isDisabled = true;
    }
    else{this.isDisabled = false;}
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
      this.rangeIni = '0';
      this.rangeFim = '15';
      this.isDisabled = true;
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
          { property: 'spriteId', label: this.literals['blank'], type: 'cellTemplate', width: '5%'},
          { property: 'refine', label: this.literals['refine'], type: 'string', width: '5%'},
          { property: 'code', label: this.literals['code'], type: 'string', width: '20%'},
          { property: 'enchant', label: this.literals['enchant'], type: 'string', width: '20%'},
          { property: 'broken', label: this.literals['broken'], type: 'label', width: '10%',
          labels: [
            { value: 'false', label: 'Normal' },
            { value: 'true', color: 'color-07', label: 'Broken' }]},
          { property: 'qty', label: this.literals['qty'], type: 'string', width: '10%'},
          { property: 'snap', label: this.literals['snap'], type: 'string', color: 'color-07', width: '10%'},
          { property: 'price', label: this.literals['price'], type: 'string', width: '10%'},
          { property: 'hasNew', label: this.literals['hasNew'], type: 'label', width: '10%',
          labels: [
            { value: 'true', color: 'color-10', label: 'Novo Item'}
            ]}
      ];
   }

   getColumnsHistory(): PoTableColumn[] {

    return [
        { property: 'spriteId', label: this.literals['blank'], type: 'cellTemplate', width: '5%'},
        { property: 'refine', label: this.literals['refine'], type: 'string', width: '5%'},
        { property: 'code', label: this.literals['code'], type: 'string', width: '20%'},
        { property: 'enchant', label: this.literals['enchant'], type: 'string', width: '20%'},
        { property: 'broken', label: this.literals['broken'], type: 'label', width: '10%',
        labels: [
          { value: 'false', label: 'Normal' },
          { value: 'true', color: 'color-07', label: 'Broken' }]},
        { property: 'price', label: this.literals['price'], type: 'string', width: '10%'}
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

    const vPk = this.addRefine + this.rangeIni + this.rangeFim +
                this.addCode.trim() + this.addEnchant + this.addBroken;
    let vReturn = true;

    if(this.addCode === ''){
      this.poNotification.error('Item não informado!')
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

    this.addNewdata();
    this.modalAdd.close();
   }

   delete(item: IRagApp): void {
     const vIndex = this.items.findIndex(o => o.id === item.id);
     this.items.splice(vIndex,1);
   }

   history(item: RagApp):void {

      this.itemsHistory = item.history;
      this.modalHistory.open();
   }

  setupComponents(): void {

      this.breadcrumb = this.breadcrumbControlService.getBreadcrumb();

      this.columns = this.getColumns();
      this.columnsItems = this.getColumnsItems();
      this.columnsHistory = this.getColumnsHistory();

      this.tableActions = [
        { action: this.delete.bind(this), label: this.literals['remove'], icon: 'po-icon po-icon-delete' },
        { action: this.history.bind(this), label: this.literals['history'], icon: 'po-icon po-icon-history' }
      ];

      this.confirmModalAdd = {
        action: () => this.onConfirmModalAdd(), label: this.literals['confirm']
      };

      this.cancelModalAdd = {
        action: () => this.modalAdd.close(), label: this.literals['cancel']
      };

      this.closeModalHistory = {
        action: () => this.modalHistory.close(), label: this.literals['close']
      };

      this.addComboEnchant();
      // this.addNewdata('any','mono','any','any',this.globId++)
      // this.addNewdata('any','natto','any','any',this.globId++)
      // this.addNewdata('any','abyss','any','any',this.globId++)
      // this.addNewdata('any','str','any','any',this.globId++)
      // this.addNewdata('any','meteorite','any','any',this.globId++)
      // this.addNewdata('any','buckler','any','any',this.globId++)
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
      // if(this.oData.code === 'mono') {result = this.serviceRagApp.callFake1();}
      // if(this.oData.code === 'telekin') {result = this.serviceRagApp.callFake2();}

      if (result){
          result.forEach(item => {

            this.refineLv = '';
            if(item.name.indexOf('+') !== -1){
              this.refineLv = item.name.substring(item.name.indexOf('+') +1,3).trim();
            }

              if (this.oData.refine !== 'any'){
                if(this.refineLv === ''){return;}
                if(Number(this.refineLv) < Number(this.oData.rangeIni) ||
                   Number(this.refineLv) > Number(this.oData.rangeFim)) {return;}
              }

              if (this.oData.enchant !== 'any' && item.name.indexOf(this.oData.enchant) === -1){return;}
              if (this.oData.broken !== 'any'){
                  if(this.oData.broken === 'Sim' && item.name.indexOf('broken') === -1){return;}
                  if(this.oData.broken === 'Não' && item.name.indexOf('broken') !== -1){return;}
              }

              this.dataObjItems = this.addNewdataItems(this.oData.id,
                                                      item);

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

              this.cont=0;
              if (this.dataObjItems.hasNew === 'true'){
                this.oData.hasNew = 'true';
                this.playSound = true;
                this.oData.items.push(this.dataObjItems);

                this.oData.history.forEach(item => {
                    if (item.refine  === this.dataObjItems.refine  &&
                        item.code    === this.dataObjItems.code    &&
                        item.enchant === this.dataObjItems.enchant &&
                        item.broken  === this.dataObjItems.broken){
                      this.oData.history.splice(this.cont,1);
                    }
                    this.cont++;
                });
              }

              if(this.oData.items){this.oData.hasRecords = true;}
          });

          this.cont = 0;
          this.oData.items.forEach(item => {
              if(item.isAlive === 'false'){
                this.oData.history.push(item);
                this.oData.items.splice(this.cont,1);
              }
              this.cont++;
          });
      }
  }

  addNewdataItems(id: number, item){

    const dataObjAux: IRagAppItems = new RagAppItems();
    const broken = item.name.indexOf('broken') !== -1;

    this.enchantFiltered = '';
    this.codeFiltered = item.name;

    if(this.codeFiltered.indexOf('<') > 0){
        this.enchantFiltered = this.codeFiltered.substring(this.codeFiltered.indexOf('<') +1,this.codeFiltered.indexOf('>'));
        this.codeFiltered = this.codeFiltered.substring(0,this.codeFiltered.indexOf('<'));
    }
    if(this.codeFiltered.indexOf('broken') > 0){
        this.codeFiltered = this.codeFiltered.replace('(broken)','');
    }

    this.refineFiltered = '';
    if(this.refineLv !== ''){
      this.refineFiltered = '+' + this.refineLv;
      this.codeFiltered   = this.codeFiltered.replace(this.refineFiltered, '');
    }

    dataObjAux.id       = id;
    dataObjAux.refine   = this.refineFiltered;
    dataObjAux.code     = this.codeFiltered;
    dataObjAux.enchant  = this.enchantFiltered;
    dataObjAux.broken   = broken.toString();
    dataObjAux.hasNew   = 'true';
    dataObjAux.price    = (item.lastRecord.price / 1000000).toFixed(3) + 'kk';
    dataObjAux.spriteId = item.icon;
    dataObjAux.snap     = item.lastRecord.snapEnd;
    dataObjAux.qty      = item.lastRecord.stock;
    dataObjAux.isAlive  = 'true';

    if(Number(dataObjAux.snap) !== 0){
      dataObjAux.snap = formatDate(dataObjAux.snap + '000','short','pt');
    }else{
      dataObjAux.snap = '';
    }

    return dataObjAux;

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

  addNewdata(){

      const dataObjAux: IRagApp = new RagApp();

      dataObjAux.pK = this.addRefine + this.rangeIni + this.rangeFim +
                      this.addCode.trim() + this.addEnchant + this.addBroken
      dataObjAux.id = this.globId++;
      dataObjAux.code = this.addCode.trim();
      dataObjAux.enchant = this.addEnchant;
      dataObjAux.broken = this.addBroken;

      if(this.addRefine === 'range'){
        dataObjAux.refine = this.rangeIni + '-' + this.rangeFim;
        dataObjAux.rangeIni = Number(this.rangeIni);
        dataObjAux.rangeFim = Number(this.rangeFim);
      }else{
        dataObjAux.refine = this.addRefine;
      }

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
}

