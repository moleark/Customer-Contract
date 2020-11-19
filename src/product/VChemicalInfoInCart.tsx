import * as React from 'react';
import { tv, View } from 'tonva';
import { CProduct } from './CProduct';
import { observer } from 'mobx-react';
import { productPropItem } from './VProductView';

export class VChemicalInfoInCart extends View<CProduct> {

    render(param: any): JSX.Element {
        let { id: productId } = param;
        if (typeof productId === 'object')
            productId = productId.id;
        let { controller } = this;
        controller.getChemicalInfo(productId);
        return <this.content productId={productId} />;
    }

    private content = observer((param: any) => {

        let { productId } = param;
        let { chemicalInfoContainer } = this.controller;
        let chemicalInfo = chemicalInfoContainer[productId];
        if (chemicalInfo !== undefined) {
            let { chemical, purity, CAS, molecularFomula, molecularWeight } = chemicalInfo;
            return <>
                {productPropItem('CAS', CAS)}
                {productPropItem('纯度', purity)}
                {productPropItem('分子式', molecularFomula)}
                {productPropItem('分子量', molecularWeight)}
            </>
        }
        return <></>;
    })
}
