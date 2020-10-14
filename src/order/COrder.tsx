import * as React from "react";
import { CUqBase } from "../CBase";
import { observer } from "mobx-react";
import { BoxId, nav } from "tonva";
import { observable } from "mobx";
import { Order, OrderItem } from './Order';
import { CartItem2, CartPackRow } from '../cart/Cart';
import { VEdit } from "./VEdit";

const FREIGHTFEEFIXED = 12;
const FREIGHTFEEREMITTEDSTARTPOINT = 100;

/* eslint-disable */
export class COrder extends CUqBase {
    @observable orderData: Order = new Order();
    @observable goalCustomerInfoname: any;
    /**下单后删除 */
    @observable couponAppliedData: any = {};
    hasAnyCoupon: boolean;
    @observable buyerAccounts: any[] = [];
    protected async internalStart(param: any) {

    }

    /**
     * 打开编辑订单页面
     */
    onAddOrderPage = async () => {
        this.openVPage(VEdit);
    }

    createOrderFromCart = async (cartItems: CartItem2[]) => {
        if (cartItems !== undefined && cartItems.length > 0) {
            this.orderData.currency = cartItems[0].packs[0].currency;
            this.orderData.orderItems = cartItems.map((e: any) => {
                var item = new OrderItem();
                item.product = e.product;
                item.packs = e.packs.map((v: any) => { return { ...v } }).filter((v: any) => v.quantity > 0 && v.price);
                item.packs.forEach((pk) => {
                    pk.priceInit = pk.price;
                })
                return item;
            });

            // 运费和运费减免
            this.orderData.freightFee = FREIGHTFEEFIXED;
            if (this.orderData.productAmount > FREIGHTFEEREMITTEDSTARTPOINT)
                this.orderData.freightFeeRemitted = FREIGHTFEEFIXED * -1;
            else
                this.orderData.freightFeeRemitted = 0;
        }
        this.openVPage(VEdit);
    }


    /**
    * 提交订单
    */
    submitOrder = async () => {
        let { uqs, cart, currentUser } = this.cApp;
        let { order, webuser, 积分商城 } = uqs;
        let { orderItems } = this.orderData;

        let result: any = await order.Order.save("order", this.orderData.getDataForSave());
        let { id: orderId, flow, state } = result;
        await order.Order.action(orderId, flow, state, "submit");
        // 如果使用了coupon/credits，需要将其标记为已使用
        let { id: couponId, code, types } = this.couponAppliedData;
        if (couponId) {
            let nowDate = new Date();
            let usedDate = `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`;
            switch (types) {
                case 'coupon':
                    webuser.WebUserCoupon.del({ webUser: currentUser.id, coupon: couponId, arr1: [{ couponType: 1 }] });
                    webuser.WebUserCouponUsed.add({ webUser: currentUser.id, arr1: [{ coupon: couponId, usedDate: usedDate }] });
                    break;
                case 'credits':
                    积分商城.WebUserCredits.del({ webUser: currentUser.id, arr1: [{ credits: couponId }] });
                    积分商城.WebUserCreditsUsed.add({ webUser: currentUser.id, arr1: [{ credits: couponId, usedDate: usedDate }] });
                    break;
                default:
                    break;
            }
        }

        let param: [{ productId: number, packId: number }] = [] as any;
        orderItems.forEach(e => {
            e.packs.forEach(v => {
                param.push({ productId: e.product.id, packId: v.pack.id })
            })
        });
        cart.removeFromCart(param);

        // 打开下单成功显示界面
        nav.popTo(this.cApp.topKey);
        // this.openVPage(OrderSuccess, result);
    }


    renderDeliveryTime = (pack: BoxId) => {
        let { cProduct } = this.cApp;
        return cProduct.renderDeliveryTime(pack);
    }
    renderOrderItemProduct = (product: BoxId) => {
        let { cProduct } = this.cApp;
        return cProduct.renderCartProduct(product);
    }


    /**
 * 根据状态读取我的订单
 */
    getMyOrders = async (state: string) => {
        let { order } = this.uqs;
        switch (state) {
            case 'pendingpayment':
                return await order.GetPendingPayment.table(undefined);
            case 'confirmed':
                return await order.Order.mySheets(undefined, 1, -20);
            case 'processing':
                return await order.Order.mySheets(undefined, 1, -20);
            case 'completed':
                return await order.Order.mySheets("#", 1, -20)
            case 'all':
                let promises: PromiseLike<any>[] = [];
                promises.push(order.Order.mySheets(undefined, 1, -20));
                promises.push(order.Order.mySheets("#", 1, -20));
                let presult = await Promise.all(promises);
                return presult[0].concat(presult[1]).sort((a: any, b: any) => new Date(b.date).valueOf() - new Date(a.date).valueOf());
            default:
                break;
        }
    }
}