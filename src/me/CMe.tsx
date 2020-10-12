import { CUqBase } from "../CBase";
import { VMe } from "./VMe";
import { observer } from "mobx-react";

/* eslint-disable */

export class CMe extends CUqBase {

    protected async internalStart() { }

    render = observer(() => {
        return this.renderView(VMe);
    });
    tab = () => this.renderView(VMe);
}
