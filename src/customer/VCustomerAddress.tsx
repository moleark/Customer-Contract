import * as React from 'react';
import { observer } from 'mobx-react';
import { CCustomerAddress } from './CCustomerAddress';
import { VPage, Page, LMR, FA, tv, Prop, PropGrid, ComponentProp } from 'tonva';
import { observable } from 'mobx';

export class VCustomerAddress extends VPage<CCustomerAddress> {
    @observable private customer: any;


    async open(param: any) {
        this.customer = param;
        this.openPage(this.page, param);
    }

    private geneCustomerPropertyComponent(name: string, showName: string, value: any) {
        return {
            type: "component",
            name: name,
            component: (
                <LMR
                    className="w-100 py-2"
                    left={<div>{showName}</div>}
                    right={<div className="text-right">{value}</div>}
                ></LMR>
            )
        } as ComponentProp;
    }

    private page = observer((param: any) => {
        let { id: customerid, unit, name, salutation, telephone, addressString, department, mobile } = param;
        let { showCustomerEdit } = this.controller;
        let rows: Prop[] = [];
        if (unit)
            rows.push(this.geneCustomerPropertyComponent("customer", "单位", <>{tv(unit, v => v.name)}</>));
        rows.push(this.geneCustomerPropertyComponent("name", "姓名", name));
        if (mobile) {
            let telephoneShow = <div>
                <a className="text-default" href={"tel:" + mobile} style={{ textDecorationLine: "none" }}  >
                    <FA name="phone" className="text-success px-1" />
                    {mobile}
                </a>
            </div>
            rows.push(this.geneCustomerPropertyComponent("mobile", "手机号", telephoneShow));
        }
        if (telephone)
            rows.push(this.geneCustomerPropertyComponent("telephone", "固话", telephone));
        if (addressString)
            rows.push(this.geneCustomerPropertyComponent("addressString", "地址", addressString));
        if (department)
            rows.push(this.geneCustomerPropertyComponent("research", "部门", <>{tv(department.department, v => v.name)}</>));

        let { name: customerName, webuser } = this.customer;
        let header: any = <span>{customerName}</span>;
        let editCustomerButton = (
            <div className="mt-2">
                <span
                    className="iconfont icon-icon-xiugai mx-3 "
                    onClick={() => showCustomerEdit(this.customer)}
                ></span>
            </div>
        );

        return (
            <Page header={header} right={editCustomerButton}>
                <PropGrid
                    rows={rows}
                    values={this.customer}
                    alignValue="right"
                />
            </Page>
        );
    });
}
