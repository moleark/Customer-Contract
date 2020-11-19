import * as React from "react";
import { CUqBase } from "../CBase";
import { observer } from "mobx-react";
import { VHome } from "./VHome";
import { VEdit } from "../order/VEdit";

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

    edit = () => {
        this.openVPage(VEdit);
    };

    /**
     *根据时间，客户搜索其订单，并根据不同状态返回数据
     * @param valuename 
     * @param datetime 
     */
    selectCustomer = async (valuename: any, datetime: Date) => {
        return
    };

}