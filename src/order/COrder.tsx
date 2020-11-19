import * as React from "react";
import { CUqBase } from "../CBase";
import { BoxId } from "tonva";
import { observable } from "mobx";
import { Order, OrderItem } from './Order';
import { CartItem2, CartPackRow } from '../cart/Cart';
import { VEdit } from "./VEdit";
import { createOrderPriceStrategy, OrderPriceStrategy } from 'coupon/Coupon';
import { OrderSuccess } from "./OrderSuccess";

const FREIGHTFEEFIXED = 12;
const FREIGHTFEEREMITTEDSTARTPOINT = 100;

/* eslint-disable */
export class COrder extends CUqBase {
    @observable orderData: Order = new Order();
    /**下单后删除 */
    @observable couponAppliedData: any = {};
    hasAnyCoupon: boolean;
    @observable buyerAccounts: any[] = [];

    @observable invoiceType: BoxId;
    @observable invoiceInfo: BoxId;
    protected async internalStart(param: any) {

    }

    createOrderFromCart = async (cartItems: CartItem2[]) => {
        let { cApp, uqs } = this;
        let { currentUser, currentSalesRegion, cCoupon, cCustomer } = cApp;
        let { CustomerInfo } = cCustomer;
        /*
        选择客户自己的webuser，地址发票地址，发票信息现在用的是该客户的是手动填写的、后期需要优化些
        (现在地址shippingContact，发票地址invoiceContact要改)
        */
        this.orderData.webUser = 68458;
        // this.orderData.webUser = currentUser.id;
        this.orderData.salesRegion = currentSalesRegion.id;
        this.removeCoupon();
        this.hasAnyCoupon = await this.hasCoupons();

        let buyerAccountQResult = await uqs.webuser.WebUserBuyerAccount.query({ webUser: currentUser.id })
        if (buyerAccountQResult) {
            this.buyerAccounts = buyerAccountQResult.ret;
            if (this.buyerAccounts && this.buyerAccounts.length === 1) {
                this.orderData.customer = this.buyerAccounts[0].buyerAccount;
            }
        }

        if (this.orderData.shippingContact === undefined) {
            this.orderData.shippingContact = await this.getDefaultShippingContact();

        }

        if (this.orderData.invoiceContact === undefined) {
            this.orderData.invoiceContact = await this.getDefaultInvoiceContact();
        }

        if (this.orderData.invoiceType === undefined) {
            this.orderData.invoiceType = CustomerInfo.invoiceType
        }

        if (this.orderData.invoiceInfo === undefined) {
            this.orderData.invoiceInfo = CustomerInfo.invoiceInfo;
        }

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


        // 如果当前webuser有VIP卡，默认下单时使用其VIP卡
        let { webUserVIPCard } = currentUser;
        if (webUserVIPCard !== undefined) {
            let coupon = await cCoupon.getCouponValidationResult(
                webUserVIPCard.vipCardCode.toString()
            );
            let { result, types, id } = coupon;
            if (result === 1 || result === 6) {
                if (types === "vipcard" || types === "coupon") {
                    coupon.discountSetting = await cCoupon.getValidDiscounts(types, id);
                }
                this.applyCoupon(coupon);
            }
        }
        this.closePage()
        this.openVPage(VEdit);

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

    private async getDefaultShippingContact() {
        let defaultSetting = await this.getDefaultSetting();
        return defaultSetting.shippingContact || await this.getContact();
    }

    private async getDefaultInvoiceContact() {
        let defaultSetting = await this.getDefaultSetting();
        return defaultSetting.invoiceContact || await this.getContact();
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

    /**
        * 使用优惠券后计算折扣金额和抵扣额
        */
    applyCoupon = async (coupon: any) => {

        this.removeCoupon();
        let { result: validationResult, validitydate, isValid } = coupon;
        if ((validationResult === 1 || validationResult === 6) && isValid === 1 && new Date(validitydate).getTime() > Date.now()) {
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
    /**
     * 增加产品数量
     * **/
    plusQuantity = (packid: any) => {
        this.removeCoupon()
        this.orderData.orderItems.forEach((e: OrderItem) => e.packs.forEach((v: CartPackRow) => {
            if (v.pack === packid) {
                v.quantity++
            }
        }));
        // 运费和运费减免
        this.orderData.freightFee = FREIGHTFEEFIXED;
        if (this.orderData.productAmount > FREIGHTFEEREMITTEDSTARTPOINT)
            this.orderData.freightFeeRemitted = FREIGHTFEEFIXED * -1;
        else
            this.orderData.freightFeeRemitted = 0;
    }
    /**减产品数量 */
    minusQuantity = (packid: any) => {
        this.removeCoupon()
        this.orderData.orderItems.forEach((e: OrderItem) => e.packs.forEach((v: CartPackRow) => {
            if (v.pack === packid) {
                if (v.quantity === 0)
                    return
                v.quantity--;
            }
        }));
        // 运费和运费减免
        this.orderData.freightFee = FREIGHTFEEFIXED;
        if (this.orderData.productAmount > FREIGHTFEEREMITTEDSTARTPOINT)
            this.orderData.freightFeeRemitted = FREIGHTFEEFIXED * -1;
        else if (this.orderData.productAmount === 0) {
            this.orderData.freightFeeRemitted = 0;
            this.orderData.freightFee = 0;
        } else
            this.orderData.freightFeeRemitted = 0;
    }
    /**
    * 提交订单
    */
    submitOrder = async () => {
        let { uqs, cart, currentUser, cCustomer } = this.cApp;
        let { order, webuser, 积分商城 } = uqs;
        let { orderItems } = this.orderData;
        let { CustomerInfo, CustomerAddress } = cCustomer;
        let productunit = this.orderData.getDataForSave();
        let par = { ...productunit, ...CustomerInfo }
        let result: any = await order.Order.save("order", par);
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
        // nav.popTo(this.cApp.topKey);
        this.openVPage(OrderSuccess, result);
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
     * 根据状态读取我的订单  不同客户
    */
    getMyOrders = async (state: string, customer: any) => {
        let { id } = customer;
        let { order } = this.uqs;
        switch (state) {
            case 'tobeconfirmed':
                return await order.Order.mySheets(undefined, 1, -20);
            case 'cancelled':
                return await order.Order.mySheets(undefined, 1, -20);
            case 'completed':
                return await order.Order.mySheets("#", 1, -20)
            default:
                break;
        }
    }
    /**
      * 获取不同状态下的订单
    */
    showMyOrders = async (state: any) => {
        let { order } = this.uqs;
        // let { currentUser } = this.cApp;
        let result;
        switch (state) {
            case 'tobeconfirmed':
                return await order.Order.mySheets(undefined, 1, -20);
            case 'cancelled':
                return await order.Order.mySheets(undefined, undefined, undefined);
            case 'completed':
                return await order.Order.mySheets(undefined, 1, -20);
            default:
                break;
        }
    }
}