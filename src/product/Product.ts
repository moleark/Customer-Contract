import { BoxId } from 'tonva';

export interface PackRow {
    pack: BoxId;
    quantity: number;
}

export interface ProductPackRow extends PackRow {
    retail: number;
    vipPrice?: number;
    promotionPrice?: number;
    currency: BoxId;
}