import * as React from 'react';
import { CCoupon, COUPONBASE } from './CCoupon';
import { View, FA, EasyDate, LMR, tv } from 'tonva';
import { VIPCard, IsInActivePeriod, activityTime } from './Coupon';
import moment from 'moment';

function getTips(result: number, types: string, code: string) {
    let invalidTip = `${COUPONBASE[types]['name']}【${code}】无效，请与您的专属销售人员联系。`;
    switch (result) {
        case 0:
            invalidTip = `${COUPONBASE[types]['name']}【${code}】不存在，请与您的专属销售人员联系。`;
            break;
        case 2:
            invalidTip = `该${COUPONBASE[types]['name']}【${code}】已失效，请与您的专属销售人员联系。`;
            break;
        case 4:
            invalidTip = `该${COUPONBASE[types]['name']}【${code}】已经使用过，不可重复领用。`;
            break;
        // case 6:
        //     invalidTip = `您不能领用自己发出的${COUPONBASE[types]['name']}【${code}】。`;
        //     break;
        default:
            break;
    }
    return invalidTip;
}

export class VCoupon extends View<CCoupon> {

    protected coupon: any;
    protected renderRight = (): JSX.Element => {
        return null;
    }

    private showDiscountSetting = (vipCardId: VIPCard, event: React.MouseEvent) => {
        event.stopPropagation();
        this.controller.showDiscountSetting(vipCardId);
    }

    protected renderCardDescription = (): JSX.Element => {
        let { discount } = this.coupon;
        let cardDescription: any;
        if (typeof discount === 'number') {
            if (discount !== 0) {
                let discountShow: any;
                discountShow = (1 - discount) * 10;
                cardDescription = <div className="mr-3 font-weight-bold text-danger"><big>{discountShow === 10 ? '无折扣' : <>{discountShow.toFixed(1)} 折</>}</big></div>
            }
        }
        return cardDescription;
    }

    protected renderActivityDescription = (): JSX.Element => {
        return null;
    }

    protected renderCardReveal = (param: any): JSX.Element => {

        // let { isOpenMyCouponManage } = this.controller;
        let isOpenMyCouponManage = true;
        let { result, types, code, validitydate, useddate, expireddate } = this.coupon;
        let CardReveal: any;
        if (!isOpenMyCouponManage) {
            CardReveal = <div className="alert alert-primary my-1" role="alert">
                <FA name="exclamation-circle" className="text-warning float-left mr-3" size="2x"></FA>
                {getTips(result, types, code)}
            </div>
        } else {
            let showDate = validitydate !== undefined ? validitydate : (useddate !== undefined ? useddate : expireddate);
            let newDate = getEasyDate(showDate);
            let content = <div className="float-right pr-2">
                <div className="pb-1">
                    <FA name='th-large' className='mr-1 text-secondary' />
                    <small className="ml-3">{useddate !== undefined ? '使用日期' : '有效期'}: {newDate}</small>
                </div>
            </div>;
            let left = <div>
                <span className="text-body"><small>{COUPONBASE[types]['name']}</small></span>
            </div>;
            CardReveal = <div className="py-3 pl-3 pr-2 mb-1 alert" style={{ backgroundColor: '#e8eaeb', color: "text-secondary" }}>
                <LMR left={left}>
                    {content}
                </LMR>
            </div>
        }
        return CardReveal;
    }

    protected getCodeShow = (code: number) => {
        let codeShow = String(code);
        let p1 = codeShow.substr(0, 4);
        let p2 = codeShow.substr(4);
        codeShow = p1 + ' ' + p2;
        return codeShow;
    }

    render(param: any): JSX.Element {
        this.coupon = param
        let { result, code, discount, validitydate, isValid, types } = param;

        let couponUi;
        if ((result !== 1 && result !== 6) || !isValid) {

            couponUi = this.renderCardReveal(param);
        } else {

            let tipUI = null;
            if (types !== 'credits') {
                if (discount)
                    tipUI = <small className="text-success">此{COUPONBASE[types]['name']}全场通用</small>
                else
                    tipUI = <small className="text-success" onClick={(event) => this.showDiscountSetting(this.coupon, event)}>查看适用品牌及折扣</small>
            }
            let newDate = getEasyDate(validitydate);

            let content = <div className="float-right pr-2">
                <div className="pb-1">
                    <FA name='th-large' className='mr-1 text-warning' />{this.getCodeShow(code)}
                    <small className="ml-3">有效期：{newDate}</small>
                </div>
                <div className="float-right">
                    {tipUI}
                </div>
            </div>;

            let left = <div>
                <span className="text-muted"><small>{COUPONBASE[types]['name']}</small></span>
                {this.renderCardDescription()}
            </div>;

            couponUi = <div className="bg-white py-3 px-2 mb-1">
                <LMR left={left} right={this.renderRight()}>
                    {content}
                </LMR>
                {this.renderActivityDescription()}
            </div>
        }
        return couponUi;
    }
}

export class VVIPCard extends VCoupon {

    /*
    private showDiscountSetting = (vipCardId: VIPCard, event: React.MouseEvent) => {
        event.stopPropagation();
        this.controller.showDiscountSetting(vipCardId);
    }

    protected renderRight = (): JSX.Element => {
        return <span className="ml-3 my-3" onClick={(event) => this.showDiscountSetting(this.coupon, event)}>
            <FA name="chevron-right" className="corsor-pointer"></FA>
        </span>;
    }
    */
}

export class VCredits extends VCoupon {


    protected renderCardDescription = (): JSX.Element => {
        return <div className="pt-1 text-danger">
            <big>{
                IsInActivePeriod() ? '限时四倍积分' : '双倍积分'
            }</big>
        </div>
    }

    protected renderActivityDescription = (): JSX.Element => {
        let { startDate, endDate } = activityTime;
        return IsInActivePeriod() ? <div className="text-danger mt-1">
            <small className="text-muted">{startDate.replace(/\-/g, '.')} 至 {endDate.replace(/\-/g, '.')} 内下单可获四倍积分 </small>
        </div> : null;
    }
}

export class VCouponUsed extends VCoupon {
    protected renderCardReveal = (param: any): JSX.Element => {
        let { validitydate, types, useddate, expireddate } = param;
        let couponUi;
        let showDate = validitydate !== undefined ? validitydate : (useddate !== undefined ? useddate : expireddate);
        let newDate = getEasyDate(showDate);
        let content = <div className="float-right pr-2">
            <div className="pb-1">
                <FA name='th-large' className='mr-1 text-secondary' />
                <small className="ml-3">{useddate !== undefined ? '使用日期' : '有效期'}: {newDate}</small>
            </div>
        </div>;
        let left = <div>
            <span className="text-body"><small>{COUPONBASE[types]['name']}</small></span>
        </div>;
        couponUi = <div className="py-3 pl-3 pr-2 mb-1 alert" style={{ backgroundColor: '#e8eaeb', color: "text-secondary" }}>
            <LMR left={left}>
                {content}
            </LMR>
        </div>
        return couponUi;
    }
}

export function getEasyDate(validitydate: any) {
    let date = moment(validitydate).format('YYYY-MM-DD').split('-');
    // let date = new Date(validitydate).toLocaleDateString().split('/');
    let year = new Date().getFullYear().toString();
    return `${date[0] === year ? '' : (date[0] + '年')}${date[1]}月${date[2]}日`;
}