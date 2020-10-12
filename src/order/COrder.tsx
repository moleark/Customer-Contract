import * as React from "react";
import { CUqBase } from "../CBase";
import { observer } from "mobx-react";
import { CInvoiceInfo } from '../customer/CInvoiceInfo';
import { BoxId, nav } from "tonva";
import { observable } from "mobx";
import { Order, OrderItem } from './Order';
import { CartItem2, CartPackRow } from '../cart/Cart';
import { createOrderPriceStrategy, OrderPriceStrategy } from 'coupon/Coupon';
import { OrderSuccess } from './OrderSuccess';
import { CSelectShippingContact, CSelectInvoiceContact } from '../customer/CSelectContact';
import { VEdit } from "./VEdit";

const FREIGHTFEEFIXED = 12;
const FREIGHTFEEREMITTEDSTARTPOINT = 100;

/* eslint-disable */
export class COrder extends CUqBase {
    @observable orderData: Order = new Order();
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

    /**
        * 打开发票信息编辑界面
        */
    onInvoiceInfoEdit = async () => {
        let cInvoiceInfo = this.newC(CInvoiceInfo); // new CInvoiceInfo(this.cApp, undefined, true);
        let { invoiceType, invoiceInfo } = this.orderData;
        let origInvoice = {
            invoiceType: invoiceType,
            invoiceInfo: invoiceInfo,
        }
        let newInvoice = await cInvoiceInfo.call<any>(origInvoice, true);
        this.orderData.invoiceType = newInvoice.invoiceType;
        this.orderData.invoiceInfo = newInvoice.invoiceInfo;
    }
    private hasCoupons = async (): Promise<boolean> => {
        let { cCoupon, currentUser } = this.cApp;
        let { id: currentUserId } = currentUser;
        if (await cCoupon.getValidCreditsForWebUser(currentUserId))
            return true;
        let validCoupons = await cCoupon.getValidCouponsForWebUser(currentUserId);
        if (validCoupons && validCoupons.length > 0)
            return true;
        let validCredits = await cCoupon.getValidCreditsForWebUser(currentUserId);
        if (validCredits && validCoupons.length > 0)
            return true;
        return false;
    }
    // createOrderFromCart = async (cartItems: CartItem2[]) => {
    //     let { cApp, uqs } = this;
    //     let { currentUser, currentSalesRegion, cCoupon } = cApp;
    //     this.orderData.webUser = currentUser.id;
    //     this.orderData.salesRegion = currentSalesRegion.id;
    //     this.removeCoupon();
    //     this.hasAnyCoupon = await this.hasCoupons();

    //     let buyerAccountQResult = await uqs.webuser.WebUserBuyerAccount.query({ webUser: currentUser.id })
    //     if (buyerAccountQResult) {
    //         this.buyerAccounts = buyerAccountQResult.ret;
    //         if (this.buyerAccounts && this.buyerAccounts.length === 1) {
    //             this.orderData.customer = this.buyerAccounts[0].buyerAccount;
    //         }
    //     }

    //     if (this.orderData.shippingContact === undefined) {
    //         this.orderData.shippingContact = await this.getDefaultShippingContact();
    //     }

    //     if (this.orderData.invoiceContact === undefined) {
    //         this.orderData.invoiceContact = await this.getDefaultInvoiceContact();
    //     }

    //     if (this.orderData.invoiceType === undefined) {
    //         this.orderData.invoiceType = await this.getDefaultInvoiceType();
    //     }

    //     if (this.orderData.invoiceInfo === undefined) {
    //         this.orderData.invoiceInfo = await this.getDefaultInvoiceInfo();
    //     }

    //     if (cartItems !== undefined && cartItems.length > 0) {
    //         this.orderData.currency = cartItems[0].packs[0].currency;
    //         this.orderData.orderItems = cartItems.map((e: any) => {
    //             var item = new OrderItem();
    //             item.product = e.product;
    //             item.packs = e.packs.map((v: any) => { return { ...v } }).filter((v: any) => v.quantity > 0 && v.price);
    //             item.packs.forEach((pk) => {
    //                 pk.priceInit = pk.price;
    //             })
    //             return item;
    //         });

    //         // 运费和运费减免
    //         this.orderData.freightFee = FREIGHTFEEFIXED;
    //         if (this.orderData.productAmount > FREIGHTFEEREMITTEDSTARTPOINT)
    //             this.orderData.freightFeeRemitted = FREIGHTFEEFIXED * -1;
    //         else
    //             this.orderData.freightFeeRemitted = 0;
    //     }

    //     // 如果当前webuser有VIP卡，默认下单时使用其VIP卡
    //     let { webUserVIPCard } = currentUser;
    //     if (webUserVIPCard !== undefined) {
    //         let coupon = await cCoupon.getCouponValidationResult(
    //             webUserVIPCard.vipCardCode.toString()
    //         );
    //         let { result, types, id } = coupon;
    //         if (result === 1) {
    //             if (types === "vipcard" || types === "coupon") {
    //                 coupon.discountSetting = await cCoupon.getValidDiscounts(types, id);
    //             }
    //             this.applyCoupon(coupon);
    //         }
    //     }
    //     // this.openVPage(VCreateOrder);
    // }
    /**
    * 打开输入或选择使用卡券界面
    */
    onCouponEdit = async () => {
        let { cCoupon } = this.cApp;
        let coupon = await cCoupon.call<any>(this.orderData.coupon);
        if (coupon) {
            await this.applyCoupon(coupon);
        }
    }
    /**
     * 使用优惠券后计算折扣金额和抵扣额
     */
    applyCoupon = async (coupon: any) => {

        this.removeCoupon();
        let { result: validationResult, validitydate, isValid } = coupon;
        if (validationResult === 1 && isValid === 1 && new Date(validitydate).getTime() > Date.now()) {
            this.couponAppliedData = coupon;
            let orderPriceStrategy: OrderPriceStrategy = createOrderPriceStrategy(coupon);
            orderPriceStrategy.applyTo(this.orderData, this.uqs);

            // 运费和运费减免
            this.orderData.freightFee = FREIGHTFEEFIXED;
            if (this.orderData.productAmount > FREIGHTFEEREMITTEDSTARTPOINT)
                this.orderData.freightFeeRemitted = FREIGHTFEEFIXED * -1;
            else
                this.orderData.freightFeeRemitted = 0;
        }
    }
    /**
     * 删除优惠券
     */
    removeCoupon = () => {
        this.orderData.coupon = undefined;
        this.couponAppliedData = {};
        this.orderData.couponOffsetAmount = 0;
        this.orderData.couponRemitted = 0;
        this.orderData.point = 0;
        this.orderData.orderItems.forEach((e: OrderItem) => e.packs.forEach((v: CartPackRow) => v.price = v.priceInit));
    }
    private async getDefaultShippingContact() {
        let defaultSetting = await this.getDefaultSetting();
        return defaultSetting.shippingContact || await this.getContact();
    }

    private async getDefaultInvoiceContact() {
        let defaultSetting = await this.getDefaultSetting();
        return defaultSetting.invoiceContact || await this.getContact();
    }

    private async getDefaultInvoiceType() {
        let defaultSetting = await this.getDefaultSetting();
        return defaultSetting.invoiceType;
    }

    private async getDefaultInvoiceInfo() {
        let defaultSetting = await this.getDefaultSetting();
        return defaultSetting.invoiceInfo;
    }
    private defaultSetting: any;
    private async getDefaultSetting() {
        if (this.defaultSetting) return this.defaultSetting;
        let { currentUser } = this.cApp;
        return this.defaultSetting = await currentUser.getSetting() || {};
    }

    private contact0: BoxId;
    private async getContact(): Promise<BoxId> {
        if (this.contact0 === null) return;
        if (this.contact0 !== undefined) return this.contact0;
        let { currentUser } = this.cApp;
        let contactArr = await currentUser.getContacts();
        if (contactArr === undefined || contactArr.length === 0) {
            this.contact0 = null;
            return;
        }
        return this.contact0 = contactArr[0].contact;
    }

    /**
    * 提交订单
    */
    submitOrder = async () => {
        let { uqs, cart, currentUser } = this.cApp;
        let { order, webuser, 积分商城 } = uqs;
        // let { orderItems } = this.orderData;

        let result: any = await order.Order.save("order", this.orderData.getDataForSave());
        // let { id: orderId, flow, state } = result;
        // await order.Order.action(orderId, flow, state, "submit");
        // // 如果使用了coupon/credits，需要将其标记为已使用
        // let { id: couponId, code, types } = this.couponAppliedData;
        // if (couponId) {
        //     let nowDate = new Date();
        //     let usedDate = `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`;
        //     switch (types) {
        //         case 'coupon':
        //             webuser.WebUserCoupon.del({ webUser: currentUser.id, coupon: couponId, arr1: [{ couponType: 1 }] });
        //             webuser.WebUserCouponUsed.add({ webUser: currentUser.id, arr1: [{ coupon: couponId, usedDate: usedDate }] });
        //             break;
        //         case 'credits':
        //             积分商城.WebUserCredits.del({ webUser: currentUser.id, arr1: [{ credits: couponId }] });
        //             积分商城.WebUserCreditsUsed.add({ webUser: currentUser.id, arr1: [{ credits: couponId, usedDate: usedDate }] });
        //             break;
        //         default:
        //             break;
        //     }
        // }

        // let param: [{ productId: number, packId: number }] = [] as any;
        // orderItems.forEach(e => {
        //     e.packs.forEach(v => {
        //         param.push({ productId: e.product.id, packId: v.pack.id })
        //     })
        // });
        // cart.removeFromCart(param);

        // // 打开下单成功显示界面
        // nav.popTo(this.cApp.topKey);
        this.openVPage(OrderSuccess, result);
        // this.openVPage(OrderSuccess);
    }

    onSelectInvoiceContact = async () => {
        let cSelect = this.newC(CSelectInvoiceContact);
        let contactBox = await cSelect.call<BoxId>(true);
        this.orderData.invoiceContact = contactBox;
    }

    renderDeliveryTime = (pack: BoxId) => {
        let { cProduct } = this.cApp;
        return cProduct.renderDeliveryTime(pack);
    }
    renderOrderItemProduct = (product: BoxId) => {
        let { cProduct } = this.cApp;
        return cProduct.renderCartProduct(product);
    }

    onSelectShippingContact = async () => {
        let cSelect = this.newC(CSelectShippingContact);
        let contactBox = await cSelect.call<BoxId>(true);
        this.orderData.shippingContact = contactBox;
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