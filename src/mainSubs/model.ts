
export interface Id {
    id: number;
}

export interface MainBrand extends Id {
    name: string;
}

export interface MainProduct extends Id {
    origin: string;
    description: string;
    descriptionC: string;
    brand: MainBrand;
    imageUrl: string;
}

export interface MainProductChemical extends MainProduct {

    chemical: number;
    CAS: string;
    purity: string;
    molecularFomula: string;
    molecularWeight: string;
    packs: Pack[];
}

export interface Pack extends Id {
    radiox: number;
    radioy: number;
    unit: string;
}

// 下面这些都还没有用，以后可能会用到
export interface Inventory extends Id {
    name: string;
}

export interface SubPack {
    pack: Pack;
    price: number;
    vipPrice: number;
    quantity: number;
    amount: number;
}

export interface RowInventory {
    inventory: Inventory;
    quantity: number;
}

export interface SubPackInventory extends SubPack {
    rowInventorys: RowInventory[];
}
