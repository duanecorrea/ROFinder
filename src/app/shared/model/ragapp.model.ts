import { IRagAppItems } from './ragappItems.model';

export interface IRagApp {
    id: number;
    refine: string;
    code: string;
    enchant: string;
    broken: string;
    hasNew: string;
    hasRecords: boolean;
    isExpanded: boolean;
    pK: string;
    rangeIni: number;
    rangeFim: number;

    items: Array<IRagAppItems>;
    history: Array<IRagAppItems>;

}

export class RagApp implements IRagApp {
    id: number;
    refine: string;
    code: string;
    enchant: string;
    broken: string;
    hasNew: string;
    hasRecords: boolean;
    isExpanded: boolean;
    pK: string;
    rangeIni: number;
    rangeFim: number;

    items: Array<IRagAppItems> = [];
    history: Array<IRagAppItems> = [];

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: IRagApp): string {
        return item.id.toString();
    }

    get $id() { return this.id; }
    get $refine() { return this.refine; }
    get $code() { return this.code; }
    get $enchant() { return this.enchant; }
    get $pK() { return this.pK; }
    get $broken() { return this.broken; }
    get $hasRecords() { return this.hasRecords; }
    get $hasNew() { return this.hasNew; }
    get $isExpanded() { return this.isExpanded; }
    get $rangeIni() { return this.rangeIni; }
    get $rangeFim() { return this.rangeFim; }
    get $items(): Array<IRagAppItems> { return this.items; }
    get $history(): Array<IRagAppItems> { return this.items; }

    set $id(value: number) { this.id = value; }
    set $refine(value: string) { this.refine = value; }
    set $code(value: string) { this.code = value; }
    set $enchant(value: string) { this.enchant = value; }
    set $pK(value: string) { this.pK = value; }
    set $broken(value: string) { this.broken = value; }
    set $hasRecords(value: boolean) { this.hasRecords = value; }
    set $hasNew(value: string) { this.hasNew = value; }
    set $isExpanded(value: boolean) { this.isExpanded = value; }
    set $rangeIni(value: number) { this.rangeIni = value; }
    set $rangeFim(value: number) { this.rangeFim = value; }
    set $items(value: Array<IRagAppItems>) { this.items = value; }    
    set $history(value: Array<IRagAppItems>) { this.history = value; }


}
