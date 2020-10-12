import * as React from 'react';
import { MainProduct, SubPack } from './model';

export type Render<T> = (model: T) => JSX.Element;

export function renderMainProduct(model: MainProduct): JSX.Element {
    return <div>
        {model.description}
    </div>
}

export function renderSubPack(model: SubPack): JSX.Element {
    let { pack, vipPrice, price, quantity, amount } = model;
    return <div>
        {pack.unit}, {vipPrice}, {price}, {quantity}, {amount}
    </div>
}
