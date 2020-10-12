import * as React from 'react';
import { RowContext, nav, User, BoxId } from 'tonva';
import { CUqBase } from '../CBase';
import { CartPackRow, CartItem2 } from './Cart';
import { VCartLabel } from './VCartLabel';

export class CCart extends CUqBase {

    private selectedCartItems: CartItem2[];

    protected async internalStart(param: any) {

    }


    onQuantityChanged = async (context: RowContext, value: any, prev: any) => {
        let { data, parentData } = context;
        let { product } = parentData;
        let { pack, price, retail, currency } = data as CartPackRow;
        let { cart } = this.cApp;
        if (value > 0)
            await cart.add(product, pack, value, price, retail, currency);
        else
            await cart.removeFromCart([{ productId: product.id, packId: pack.id }]);
    }

    onRowStateChanged = async (context: RowContext, selected: boolean, deleted: boolean) => {
        alert('onRowStateChanged')
    }


    onProductClick = (product: BoxId) => {
        let { cart, cProduct } = this.cApp;
        if (!cart.isDeleted(product.id)) {
            cProduct.showProductDetail(product);
        }
    }
    /**
     * 商品从购物车永久性删除
     */
    strikeOut = async () => {
        let { cart } = this.cApp;
        this.selectedCartItems = cart.getSelectedItems();
        await cart.removeStrike(this.selectedCartItems)
    }

    renderDeliveryTime = (pack: BoxId) => {
        let { cProduct } = this.cApp;
        return cProduct.renderDeliveryTime(pack);
    }

    renderCartProduct = (product: BoxId) => {
        let { cProduct } = this.cApp;
        return cProduct.renderCartProduct(product);
    }

    /**
   *
   * 显示购物车图标
   */
    renderCartLabel() {
        return this.renderView(VCartLabel);
    }

}
