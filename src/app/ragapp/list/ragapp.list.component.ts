import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PoBreadcrumb, PoI18nService, PoModalAction, PoModalComponent, PoNotificationService, PoTableComponent, PoTableDetail } from '@po-ui/ng-components';
import { PoPageAction, PoTableAction, PoTableColumn, PoTableModule } from '@po-ui/ng-components';
import { CountdownComponent, CountdownEvent, CountdownConfig } from 'ngx-countdown';
import { forkJoin, Subscription } from 'rxjs';
import { IRagApp, RagApp } from 'src/app/shared/model/ragapp.model';
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

  items: Array<IRagApp>;

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

  cdConfig: CountdownConfig = { leftTime: 180 };

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

    this.items = this.serviceRagApp.getItemsByFunct('all');
    setTimeout(() => this.counter.restart());
  }

  search(){
    this.items = this.serviceRagApp.getItemsByFunct('all');
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

    this.globId++;

    this.serviceRagApp.addNewdata(this.addRefine,this.addCode,this.addEnchant,this.addBroken,this.globId);
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

      this.search();
  }

  ngOnDestroy(): void {
      if (this.servRagAppSubscription$) { this.servRagAppSubscription$.unsubscribe(); }
  }
}

