import * as React from 'react';
import { View, tv, FormField, ObjectSchema, NumSchema, UiSchema, UiCustom, RowContext, BoxId, Form, ItemSchema, ArrSchema, UiArr } from 'tonva';
import { CProduct } from './CProduct';
import { ProductImage } from 'tools/productImage';
import { observer } from 'mobx-react';

import { observable } from 'mobx';
import classNames from 'classnames';


export class VCartProuductView extends View<CProduct> {

    render(param: any): JSX.Element {
        return <>{tv(param, this.renderCartProduct)}</>;
    }


    private renderCartProduct = (product: any) => {
        let { id, brand, description, descriptionC, origin, imageUrl } = product;

        return <div className="row d-flex mb-3 px-2">
            <div className="col-12">
                <div className="py-2">
                    <strong>{description}</strong>
                </div>
                <div className="pb-2">
                    <strong>{descriptionC}</strong>
                </div>
                <div className="row">
                    <div className="col-3">
                        <ProductImage chemicalId={imageUrl} className="w-4c h-4c" />
                    </div>
                    <div className="col-9">
                        <div className="row">
                            {productPropItem('编号', origin)}
                            {this.controller.renderChemicalInfoInCart(product)}
                            {tv(brand, renderBrand)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    };
}

export function renderBrand(brand: any) {
    return productPropItem('品牌', brand.name);
}

export function productPropItem(caption: string, value: any, captionClass?: string) {
    if (value === null || value === undefined || value === '0') return null;
    let capClass = captionClass ? classNames(captionClass) : classNames("text-muted");
    let valClass = captionClass ? classNames(captionClass) : "";
    return <>
        <div className={classNames("col-6 col-sm-2 pr-0 small", capClass)}> {caption}</div>
        <div className={classNames("col-6 col-sm-4", valClass)}>{value}</div>
    </>;
}
