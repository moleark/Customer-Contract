import * as React from 'react';
import { VPage, Page, FA, EasyDate, nav } from 'tonva';
import { COrder } from './COrder';
import { GLOABLE } from "configuration";
import { observable } from 'mobx';

export class OrderSuccess extends VPage<COrder> {
    @observable showTips: any = "none"
    async open(orderCreateResult: any) {

        this.openPage(this.page, orderCreateResult);
    }
    private share = async (order: any) => {

        let { id, no, date } = order;
        if (navigator.userAgent.indexOf("Html5Plus") > -1) {
            // @ts-ignore  屏蔽错误
            window.plusShare(
                {
                    title: no, //订单号
                    content: <EasyDate date={date} />,
                    /**href 跟的地址有待确认 地址的订单 + ID */
                    href: GLOABLE.PIRVACYURL + "/" + id + "?sales=" + nav.user.id, //分享出去后，点击跳转地址
                },
                function (result) {
                    //分享回调
                }
            );
        } else {
            this.onTips();
        }
    };
    onTips = () => {
        this.showTips = "";
        setTimeout(() => {
            this.showTips = "none";
        }, GLOABLE.TIPDISPLAYTIME);
    }
    private page = (orderCreateResult: any) => {
        return <Page header="下单成功" back="close">
            <div className="py-4 px-3 bg-white mb-3 d-flex">
                <FA name="list-alt" className="text-success mr-3" size="4x" />
                <div>
                    <p className="text-primary"><span className="h4">下单成功！</span></p>
                    <p className="">
                        订单: <span className="h5 text-info">{orderCreateResult.no}</span><br /><br />
                        <span className="text-primary" onClick={() => this.share(orderCreateResult)}>分享确认</span>
                    </p>
                </div>
            </div>
        </Page>
    }
}