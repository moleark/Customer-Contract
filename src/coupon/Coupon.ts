import { UQs } from '../uqs';
import { Tuid, BoxId } from 'tonva';
import { Order } from 'order/Order';
import moment from 'moment';

export const activityTime = {
    startDate: '2020-09-01',
    endDate: '2020-09-30'
}

export class CouponBase {

    constructor(protected id: BoxId, private code: number, expiredDate: Date, private isValid: boolean) {
        this.expiredDate = new Date(expiredDate);
    }

    protected expiredDate: Date;

    getCodeShow() {
        let codeShow = String(this.code);
        let p1 = codeShow.substr(0, 4);
        let p2 = codeShow.substr(4);
        return p1 + ' ' + p2;
    }

    isAvaliable() {
        return this.isValid && this.expiredDate.getTime() > Date.now()
    }
}

export interface OrderPriceStrategy {

    applyTo(order: Order, uqs: UQs): Promise<void>;
}

export function createOrderPriceStrategy(couponData: any): OrderPriceStrategy {
    let { id, code, discount, preferential, validitydate, isValid, types, discountSetting } = couponData;
    switch (types) {
        case "coupon":
            if (discountSetting && discountSetting.length > 0)
                return new VIPCard(id, code, validitydate, isValid, discountSetting);
            else
                return new Coupon(id, code, validitydate, isValid, discount, preferential);
            break;
        case "coupon_sale":
            return new CouponSale(id, code, validitydate, isValid, discount, preferential);
            break;
        case "vipcard":
            return new VIPCard(id, code, validitydate, isValid, discountSetting);
            break;
        case "credits":
            return new Credits(id, code, validitydate, isValid);
            break;
        default:
            break;
    }
}

/**
 * 优惠券的价格验证策略：成交价格取优惠券折扣价与所购产品品牌折扣价中较高者
 */
export class Coupon extends CouponBase implements OrderPriceStrategy {

    constructor(protected id: BoxId, code: number, expiredDate: Date, isValid: boolean, protected discount: number, protected preferential: number) {
        super(id, code, expiredDate, isValid);
    }
    async applyTo(orderData: Order, uqs: UQs) {
        orderData.coupon = this.id
        if (this.isAvaliable()) {
            if (this.discount) {
                let { orderItems, salesRegion } = orderData;
                if (orderItems !== undefined && orderItems.length > 0) {
                    let { salesTask, product: uqsProduct } = uqs;
                    let couponOffsetAmount = 0;
                    for (let i = 0; i < orderItems.length; i++) {
                        let oi = orderItems[i];
                        let { product, packs } = oi;
                        let { ProductX } = uqsProduct;
                        let productTuid: any = await ProductX.load(product)
                        // 获取品牌的折扣
                        let { BottomDiscount } = salesTask;
                        let brandDiscountMap: any = await BottomDiscount.obj({ brand: productTuid.brand, salesRegion: salesRegion.id });

                        for (let j = 0; j < packs.length; j++) {
                            let pk = packs[j];
                            // 折扣价格取底线折扣价和折扣价格中较高者
                            let lastDiscount = Math.min((brandDiscountMap ? brandDiscountMap.discount : 0), this.discount);
                            let discountPrice = Math.round(pk.retail * (1 - lastDiscount));
                            // 最终价格取折扣价格和显示的价格（可能会有市场活动价)中较低者
                            pk.price = Math.round(Math.min(pk.price, discountPrice));
                            couponOffsetAmount += Math.round(pk.quantity * (pk.retail - pk.price) * -1);
                        };
                    };
                    orderData.couponOffsetAmount = Math.round(couponOffsetAmount);

                    /*
                    if (agentPrices && agentPrices.length > 0) {
                        let couponOffsetAmount = 0;
                        for (let i = 0; i < orderItems.length; i++) {
                            let oi = orderItems[i];
                            let { product, packs } = oi;

                            let eachProductAgentPrice = agentPrices[i];
                            for (let j = 0; j < packs.length; j++) {
                                let pk = packs[j];
                                let agentPrice: any = eachProductAgentPrice.find(
                                    (p: any) => p.product.id === product.id &&
                                        p.pack.id === pk.pack.id &&
                                        p.discountinued === 0 &&
                                        p.expireDate > Date.now());
                                if (!agentPrice) break;

                                // 折扣价格取agentPrice和折扣价格中较高者
                                let discountPrice = Math.round(Math.max(agentPrice.agentPrice, pk.retail * (1 - this.discount)));
                                // 最终价格取折扣价格和显示的价格（可能会有市场活动价)中较低者
                                pk.price = Math.round(Math.min(pk.price, discountPrice));
                                couponOffsetAmount += Math.round(pk.quantity * (pk.retail - pk.price) * -1);
                            };
                        };
                        orderData.couponOffsetAmount = Math.round(couponOffsetAmount);
                    };
                    */
                }
            }

            if (this.preferential) {
                orderData.couponRemitted = this.preferential * -1;
            }
        }
    }

}

/**
 * 销售发放的优惠券的价格验证策略（未使用） 
 */
export class CouponSale extends Coupon implements OrderPriceStrategy {

    async applyTo(orderData: Order, uqs: UQs) {
        orderData.coupon = this.id
        if (this.isAvaliable()) {
            if (this.discount) {
                let { orderItems } = orderData;
                if (orderItems !== undefined && orderItems.length > 0) {
                    let couponOffsetAmount = 0;
                    for (let i = 0; i < orderItems.length; i++) {
                        let oi = orderItems[i];
                        let { packs } = oi;

                        for (let j = 0; j < packs.length; j++) {
                            let pk = packs[j];
                            // 最终价格取折扣价格和显示的价格（可能会有市场活动价)中较低者
                            pk.price = Math.round(Math.min(pk.price, pk.retail * (1 - this.discount)));
                            couponOffsetAmount += Math.round(pk.quantity * (pk.retail - pk.price) * -1);
                        };
                    };
                    orderData.couponOffsetAmount = Math.round(couponOffsetAmount);
                }
            }

            if (this.preferential) {
                orderData.couponRemitted = this.preferential * -1;
            }
        }
    }
}

/**
 * VIP卡的价格策略:品牌包含在VIP卡折扣表中的，价格为目录价 * 对应的(1-discount)，否则为目录价
 */
export class VIPCard extends CouponBase implements OrderPriceStrategy {

    constructor(protected id: BoxId, code: number, expiredDate: Date, isValid: boolean, private discountSetting: any[]) {
        super(id, code, expiredDate, isValid);
    }
    async applyTo(orderData: Order, uqs: UQs) {
        orderData.coupon = this.id
        if (this.isAvaliable() && this.discountSetting && this.discountSetting.length > 0) {
            let { orderItems } = orderData;
            if (orderItems !== undefined && orderItems.length > 0) {
                let couponOffsetAmount = 0;
                for (let i = 0; i < orderItems.length; i++) {
                    let oi = orderItems[i];
                    let { product, packs } = oi;
                    // 获取明细中产品的VIP卡折扣
                    let thisDiscountSetting = this.discountSetting.find((e: any) => Tuid.equ(e.brand, product.obj.brand));
                    let discount = (thisDiscountSetting && thisDiscountSetting.discount) || 0;

                    for (let j = 0; j < packs.length; j++) {
                        let pk = packs[j];
                        pk.priceInit = pk.price === Math.round(pk.retail * (1 - discount)) ? pk.retail : pk.price;
                        // 最终价格取折扣价格和显示的价格（可能会有市场活动价)中较低者
                        pk.price = Math.round(Math.min(pk.price, pk.retail * (1 - discount)));
                        couponOffsetAmount += Math.round(pk.quantity * (pk.retail - pk.price) * -1);
                    };
                };
                orderData.couponOffsetAmount = Math.round(couponOffsetAmount);
            }
        }
    }

}


export class Credits extends CouponBase implements OrderPriceStrategy {
    async applyTo(orderData: Order, uqs: UQs) {
        orderData.coupon = this.id;
        if (this.isAvaliable()) {
            let { orderItems } = orderData;
            if (orderItems !== undefined && orderItems.length > 0) {
                let couponOffsetAmount = 0;
                for (let i = 0; i < orderItems.length; i++) {
                    let oi = orderItems[i];
                    let { packs } = oi;
                    for (let j = 0; j < packs.length; j++) {
                        let pk = packs[j];
                        pk.priceInit = pk.price;
                        //双倍积分 无折扣 取最大的价格 
                        pk.price = Math.round(Math.max(pk.price, pk.retail));
                        couponOffsetAmount = 0;
                    };
                };
                orderData.couponOffsetAmount = Math.round(couponOffsetAmount);
            }
        }
        let multiple = 2;
        if (IsInActivePeriod()) multiple = 4;
        orderData.point = Math.round(orderData.productAmount * multiple);
    }
}

/**
 * 是否在活动期
 */
export function IsInActivePeriod() {
    let { startDate, endDate } = activityTime;
    let newDate = moment().format('YYYY-MM-DD');
    return newDate >= startDate && newDate <= endDate;
}