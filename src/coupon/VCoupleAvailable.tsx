import * as React from 'react';
import { VPage, Page, List, FA, LMR } from 'tonva';
import { CCoupon } from './CCoupon';
import { observable } from 'mobx';
import { VVIPCard, VCoupon, VCredits } from './VVIPCard';
import { GLOABLE } from 'configuration';
import { observer } from 'mobx-react';

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

    private applyCoupon = async () => {
        let coupon = this.couponInput.value;
        await this.applySelectedCoupon(coupon);
    }

    /**
     * 应用选择的vipcard等 
     */
    private applySelectedCoupon = async (coupon: string) => {
        this.tips = await this.controller.applySelectedCoupon(coupon);
        if (this.tips)
            setTimeout(() => this.tips = undefined, GLOABLE.TIPDISPLAYTIME);
    }

    private renderCoupon = (coupon: any) => {
        let { result, code, types, discount } = coupon;
        if (result === 1) {
            // let content = this.renderVm(COUPONBASE[types]['view'], coupon);
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
            vipCardUI = <div onClick={() => this.applySelectedCoupon(coupon.code)}>{this.renderVm(VVIPCard, coupon)}</div>
        }

        let left = <div className="d-flex align-items-center mr-3"><div className="align-middle">优惠卡/券:</div></div>
        let right = <button className="btn btn-primary w-100" onClick={this.applyCoupon}>使用</button>

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

/*

            <div className="px-2 py-3">
                <div className="row pr-3 my-1">
                    <div className="col-4 col-sm-2 d-flex align-items-center text-muted"><span className="align-middle">优惠卡券:</span></div>
                    <div className="col-8 col-sm-10 d-flex">
                        <input ref={v => this.couponInput = v} type="number" className="form-control"></input>
                    </div>
                </div>
                <div className="row my-1">
                    <div className="col-12">
                        <button className="btn btn-primary w-100" onClick={this.applyCoupon}>使用填写的卡券</button>
                    </div>
                </div>
                {React.createElement(this.tipsUI)}
            </div>
*/