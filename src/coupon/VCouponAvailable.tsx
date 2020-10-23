import * as React from 'react';
import { VPage, Page, List, FA, LMR } from 'tonva';
import { CCoupon } from './CCoupon';
import { observable } from 'mobx';
import { VVIPCard, VCoupon, VCredits } from './VVIPCard';
import { GLOABLE } from '../configuration';
import { observer } from 'mobx-react';
// import { Credits } from './Coupon';

export class VCoupleAvailable extends VPage<CCoupon> {

    private couponInput: HTMLInputElement;
    private vipCardForWebUser: any;
    private coupons: any[];

    @observable tips: string;
    async open(param: any) {
        let { vipCardForWebUser, couponsForWebUser } = param;
        this.vipCardForWebUser = vipCardForWebUser;
        this.coupons = couponsForWebUser.map((v: any) => v.coupon).concat(param.creditsForWebUser.map((v: any) => v.coupon));
        this.openPage(this.page);
    }

    /**
     * 应用选择的vipcard等 
     */
    private applySelectedCoupon = async (coupon: string) => {
        this.tips = await this.controller.applySelectedCoupon(coupon);
        if (this.tips)
            setTimeout(() => this.tips = undefined, GLOABLE.TIPDISPLAYTIME);
    }
    /**
        * 领取优惠卡
        */
    private receiveCoupon = async () => {
        let { drawCoupon, getCouponValidationResult, applyTip } = this.controller;
        let coupon = this.couponInput.value;
        if (!coupon)
            this.tips = "请输入您的优惠卡/券号";
        else {
            this.couponInput.value = '';

            let validationResult = await getCouponValidationResult(coupon);
            let { result } = validationResult;
            if (result === 1 || result === 6) {
                await drawCoupon(validationResult);
                this.tips = '领取成功！';

            } else {
                this.tips = applyTip(result);
            }
        }
        if (this.tips) {
            setTimeout(() => this.tips = undefined, GLOABLE.TIPDISPLAYTIME);
        }
    }
    private renderCoupon = (coupon: any) => {
        let { result, code, types, discount } = coupon;
        if (result === 1 || result === 6) {
            let content = null;
            if (types === "coupon")
                content = discount ? this.renderVm(VCoupon, coupon) : this.renderVm(VVIPCard, coupon);
            else if (types === "credits")
                content = this.renderVm(VCredits, coupon);
            return <div className="d-block">
                <div className="px-2 bg-white" onClick={() => this.applySelectedCoupon(code)}>
                    {content}
                </div>
            </div>
        } else
            return null;
    }

    private tipsUI = observer(() => {
        let tipsUI = <></>;
        if (this.tips) {
            tipsUI = <div className="alert alert-primary" role="alert">
                <FA name="exclamation-circle" className="text-warning float-left mr-3" size="2x"></FA>
                {this.tips}
            </div>
        }
        return tipsUI;
    })

    private page = () => {

        let vipCardUI;
        if (this.vipCardForWebUser) {
            let { coupon } = this.vipCardForWebUser;
            vipCardUI = <div onClick={() => this.applySelectedCoupon(coupon.code)}>
                {/* {this.renderVm(VVIPCard, coupon)} */}
            </div>
        }

        let left = <div className="d-flex align-items-center mr-3"><div className="align-middle">优惠卡/券:</div></div>
        let right = <button className="btn btn-primary w-100" onClick={this.receiveCoupon}>领取</button>

        return <Page header="可用优惠">
            <div className="px-2 py-3">
                <LMR left={left} right={right}>
                    <input ref={v => this.couponInput = v} type="number" className="form-control"></input>
                </LMR>
                {React.createElement(this.tipsUI)}
            </div >

            <div className="px-2 bg-white">
                {vipCardUI}
            </div>
            <List items={this.coupons} item={{ render: this.renderCoupon }} none={null}></List>
        </Page >
    }
}
