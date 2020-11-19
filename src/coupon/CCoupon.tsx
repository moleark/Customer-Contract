import { CUqBase } from '../CBase';
import { observable } from 'mobx';
import { VCoupleAvailable } from './VCouponAvailable';
import { VCoupon, VCredits, VVIPCard } from './VVIPCard';
import { VVIPCardDiscount } from './VVIPCardDiscount';

export const COUPONBASE: any = {
    'coupon': { 'name': '优惠券', 'view': VCoupon },
    'credits': { 'name': '积分券', 'view': VCredits },
    'vipcard': { 'name': 'VIP卡', 'view': VVIPCard }
}
export class CCoupon extends CUqBase {
    @observable couponDrawed: boolean;
    protected async internalStart() {
        let result = await this.getValidCardForWebUser();

        this.openVPage(VCoupleAvailable, result);
    }
    applyCoupon = async (coupon: string) => {
        let validationResult = await this.getCouponValidationResult(coupon);
        let { result: rtn, id, types } = validationResult;
        if (rtn === 1 || rtn === 6) {
            if (types === 'vipcard' || types === 'coupon') {
                validationResult.discountSetting = await this.getCouponDiscountSetting(types, id);
            }
            this.returnCall(validationResult);
            this.closePage();
        }
        return rtn;
    }
    getCouponValidationResult = async (coupon: string) => {
        let { currentUser } = this.cApp;
        return await this.uqs.salesTask.IsCanUseCoupon.submit({ code: coupon, webUser: currentUser && currentUser.id });
    }
    /**
     * 获取用户有效的优惠券/vip卡
     */
    getValidCardForWebUser = async () => {
        let { currentUser } = this.cApp;
        let { id: currentUserId } = currentUser;

        let validVIPCardForWebUser = await this.getValidVipCardForWebUser(currentUserId);
        if (validVIPCardForWebUser) {
            validVIPCardForWebUser.coupon = await this.getCouponValidationResult(validVIPCardForWebUser.vipCardCode)
        }

        let validCouponsForWebUser = await this.getValidCouponsForWebUser(currentUserId);
        if (validCouponsForWebUser.length > 0) {
            for (let i = 0; i < validCouponsForWebUser.length; i++) {
                let e = validCouponsForWebUser[i];
                e.coupon = await this.getCouponValidationResult(e.couponCode);
            }
        }

        let validCreditsForWebUser = await this.getValidCreditsForWebUser(currentUserId);
        if (validCreditsForWebUser.length > 0) {
            for (let i = 0; i < validCreditsForWebUser.length; i++) {
                let e = validCreditsForWebUser[i];
                e.coupon = await this.getCouponValidationResult(e.creditsCode);
            }
        }

        return {
            'vipCardForWebUser': validVIPCardForWebUser,
            'couponsForWebUser': validCouponsForWebUser,
            'creditsForWebUser': validCreditsForWebUser
        }
    }

    /**
     * （在订单上）应用coupon
     * @param coupon 
     */
    applySelectedCoupon = async (coupon: string) => {
        if (!coupon)
            return "请输入您的优惠卡/券号";
        else {
            let ret = await this.applyCoupon(coupon);
            return this.applyTip(ret);
        }
    }

    applyTip = (ret: any) => {
        switch (ret) {
            case -1:
                return '对不起，当前服务器繁忙，请稍后再试。';
            case 1:
                return '有效';
            case 0:
                return "无此优惠券，请重新输入或与您的专属销售人员联系确认优惠码是否正确。";
            case 2:
                return '优惠券已过期或作废，请重新输入或与您的专属销售人员联系。';
            case 3:
            case 5:
                return '优惠券无效，请重新输入或与您的专属销售人员联系。';
            case 6:
                return '有效';
            case 4:
                return '该优惠券已经被使用过了，不允许重复使用。';
            default:
                break;
        }
    }

    /**
     * 
     * @param currentUserId 
     */
    getValidVipCardForWebUser = async (currentUserId: number): Promise<any> => {
        let { uqs } = this.cApp;
        let { webuser } = uqs;
        let { WebUserVIPCard } = webuser;
        let vipCardForWebUser: any = await WebUserVIPCard.obj({ webUser: currentUserId });
        if (vipCardForWebUser) {
            let { expiredDate } = vipCardForWebUser
            if (expiredDate.getTime() > Date.now()) {
                return vipCardForWebUser;
            }
        }
    }

    /**
     * 
     * @param currentUserId 
     */
    getValidCouponsForWebUser = async (currentUserId: number): Promise<any[]> => {
        let { uqs } = this.cApp;
        let { webuser } = uqs;
        let { WebUserCoupon } = webuser;
        let couponsForWebUser: any[] = await WebUserCoupon.table({ webUser: currentUserId });
        let validCouponsForWebUser: any[] = [];
        if (couponsForWebUser) {
            validCouponsForWebUser = couponsForWebUser.filter(v => v.expiredDate.getTime() > Date.now());
        }
        return validCouponsForWebUser;
    }

    /**
     * 
     * @param currentUserId 
     */
    getValidCreditsForWebUser = async (currentUserId: number): Promise<any[]> => {
        let { uqs } = this.cApp;
        let { 积分商城 } = uqs;
        let creditsForWebUser: any[] = await 积分商城.WebUserCredits.table({ webUser: currentUserId });
        let validCreditsForWebUser: any[] = [];
        if (creditsForWebUser) {
            validCreditsForWebUser = creditsForWebUser.filter(v => v.expiredDate.getTime() > Date.now());
        }
        return validCreditsForWebUser;
    }
    /**
       * 显示VIP卡的品牌折扣明细 
       * @param coupon 
       */
    showDiscountSetting = async (vipCard: any) => {
        let { types, id } = vipCard;
        vipCard.discountSetting = await this.getCouponDiscountSetting(types, id);
        this.openVPage(VVIPCardDiscount, vipCard);
    }

    /**
     * 获取卡券的有效折扣  
     */
    getValidDiscounts = async (types: string, id: number) => {
        return await this.getCouponDiscountSetting(types, id);
    }

    private getCouponDiscountSetting = async (types: string, couponId: number) => {
        if (types === 'vipcard' || types === 'coupon') {
            return await this.uqs.salesTask.VIPCardDiscount.table({ coupon: couponId });
        }
    }

    drawCoupon = async (credits: any) => {
        let { uqs, cApp } = this;
        let { currentUser } = cApp;
        let { id: currentUserId } = currentUser;
        let { 积分商城, webuser } = uqs;
        let { result, id: creditsId, code, validitydate, types } = credits;
        if (result !== 1 && result !== 6)
            return;
        switch (types) {
            case 'credits':
                let drawedResult = await 积分商城.WebUserCredits.obj({ webUser: currentUserId, credits: creditsId });
                if (!drawedResult) {
                    let now = new Date();

                    await 积分商城.WebUserCredits.add({
                        webUser: currentUserId,
                        arr1: [{
                            credits: creditsId,
                            creditsCode: code,
                            createDate: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
                            expiredDate: validitydate
                        }]
                    })
                }
                break;
            case 'coupon':
                let drawedResult3 = await webuser.WebUserCoupon.obj({ webUser: currentUserId, coupon: creditsId });
                if (!drawedResult3) {
                    let now = new Date();
                    await webuser.WebUserCoupon.add({
                        webUser: currentUserId,
                        coupon: creditsId,
                        arr1: [{
                            couponType: 1,
                            couponCode: code,
                            createDate: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
                            expiredDate: validitydate,
                        }]
                    })
                }
                break;
            case 'vipcard':
                let drawedResult2 = await webuser.WebUserVIPCard.obj({ webUser: currentUserId, vipCard: creditsId });
                if (!drawedResult2) {
                    let now = new Date();
                    await this.uqs.webuser.WebUserVIPCard.add({
                        webUser: currentUserId,
                        vipCard: creditsId,
                        arr1: [{
                            vipCardType: 1,
                            createDate: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
                            expiredDate: validitydate,
                            vipCardCode: code
                        }]
                    })
                }
                break;
            default:
                break;
        }
        this.couponDrawed = true;
    }

}