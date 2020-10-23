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

    onAdd = () => {
        // this.current = { caption: "", discription: "", content: "", image: undefined, template: undefined };
        this.openVPage(VEdit);
    };

    selectCustomer = async (valuename: any, startdate: Date, enddate: Date) => {
        return
    };
}