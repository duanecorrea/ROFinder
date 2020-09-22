export interface IRagAppItems {
    id: number;
    refine: string;
    code: string;
    enchant: string;
    broken: string;
    hasNew: string;
    price: string;
    spriteId: string;
    isAlive: string;
    snap: string;
    qty: string;

}

export class RagAppItems implements IRagAppItems {
    id: number;
    refine: string;
    code: string;
    enchant: string;
    broken: string;
    hasNew: string;
    price: string;
    spriteId: string;
    isAlive: string;
    snap: string;
    qty: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: IRagAppItems): string {
        return item.id.toString();
    }

    get $id() { return this.id; }
    get $refine() { return this.refine; }
    get $code() { return this.code; }
    get $enchant() { return this.enchant; }
    get $broken() { return this.broken; }
    get $hasNew() { return this.hasNew; }
    get $price() { return this.price; }
    get $spriteId() { return this.spriteId; }
    get $isAlive() { return this.isAlive; }
    get $snap() { return this.isAlive; }
    get $qty() { return this.isAlive; }

    set $id(value: number) { this.id = value; }
    set $refine(value: string) { this.refine = value; }
    set $code(value: string) { this.code = value; }
    set $enchant(value: string) { this.enchant = value; }
    set $broken(value: string) { this.broken = value; }
    set $hasNew(value: string) { this.hasNew = value; }
    set $price(value: string) { this.price = value; }
    set $spriteId(value: string) { this.spriteId = value; }
    set $isAlive(value: string) { this.isAlive = value; }
    set $snap(value: string) { this.snap = value; }
    set $qty(value: string) { this.qty = value; }


}
