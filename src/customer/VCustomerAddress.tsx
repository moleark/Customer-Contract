import * as React from 'react';
import { observer } from 'mobx-react';
import { CCustomerAddress } from './CCustomerAddress';
import { VPage, Page, LMR, List, SearchBox, FA, tv } from 'tonva';

export class VCustomerAddress extends VPage<CCustomerAddress> {
    private type: any;
    async open(param) {
        this.openPage(this.page, param);
    }


    private page = observer((param: any) => {
        let { id: customerid, unit, name, salutation, telephone, gender,
            email, wechat, teacher, addressString, potential, research, department, officePost, mobile } = param;


        return <Page header={'管理地址'}>
            <div>
                {name}{tv(unit)}{mobile}{addressString}
            </div>
        </Page>
    })


}
