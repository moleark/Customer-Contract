import * as React from "react";
import { CUqBase } from "../CBase";
import { observer } from "mobx-react";
import { VHome } from "./VHome";

import { } from "tonva";

/* eslint-disable */
export class CHome extends CUqBase {
    protected async internalStart(param: any) {

    }

    render = observer(() => {
        return this.renderView(VHome);
    });

    tab = () => {
        return <this.render />;
    };

    /**
  * 获取不同状态下的订单
  */
    getOrder = async (state: any) => {
        let { webuser } = this.uqs;
        // let { currentUser } = this.cApp;
        let result;
        switch (state) {
            case 'confirmed':
                // result = await this.getValidCardForWebUser();
                // return this.getValidMusterForWebUser(result);
                return '待确认'
            case 'issued':
                // result = new QueryPager<any>(webuser.getMyUsedCoupon, 10, 10);
                // await result.first({ webUser: currentUser });
                // return result;
                return '待发单'
            case 'completed':
                // result = new QueryPager<any>(webuser.getMyExpiredCoupon, 10, 10);
                // await result.first({ webUser: currentUser });
                // return result;
                return '待发货'
            case 'finished':
                // result = new QueryPager<any>(webuser.getMyExpiredCoupon, 10, 10);
                // await result.first({ webUser: currentUser });
                // return result;
                return '已完结'
            case 'all':
                // result = new QueryPager<any>(webuser.getMyExpiredCoupon, 10, 10);
                // await result.first({ webUser: currentUser });
                // return result;
                return '全部'
            default:
                break;
        }
    }
}