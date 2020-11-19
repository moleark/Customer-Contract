import * as React from 'react';
import { observer } from 'mobx-react';
import { CCustomerAddress } from './CCustomerInfo';
import { VPage, Page, Schema, UiSchema, UiInputItem, Edit, ItemSchema } from 'tonva';
import { observable } from 'mobx';
import { nameValidation, mobileValidation, emailValidation } from 'tools/inputValidations';
export const myCustomerSchema: Schema = [
    { name: 'name', type: 'string', required: true },
    { name: 'mobile', type: 'number' },
    { name: 'telephone', type: 'number' },
    { name: 'email', type: 'string' },
    { name: 'addressString', type: 'string' },
];

export const myCustomerUISchema: UiSchema = {
    items: {
        name: { widget: 'text', label: '姓名', placeholder: '请输入姓名', rules: nameValidation } as UiInputItem,
        mobile: { widget: 'text', label: '手机号', placeholder: '请输入手机号', rules: mobileValidation } as UiInputItem,
        telephone: { widget: 'text', label: '固话', placeholder: '请输入固话' } as UiInputItem,
        email: { widget: 'text', label: 'Email', placeholder: '请输入Email', rules: emailValidation } as UiInputItem,
        addressString: { widget: 'text', label: '地址', placeholder: '请输地址' } as UiInputItem,
    }
}
export class VCustomerAddress extends VPage<CCustomerAddress> {
    @observable private customer: any;


    async open(param: any) {
        this.customer = param;
        this.openPage(this.page, param);
    }

    private onItemChanged = async (itemSchema: ItemSchema, newValue: any, preValue: any,) => {
        let { name } = itemSchema;
        this.customer[name] = newValue;
        this.customer.isValid = 1;
        await this.controller.updateMyCustomer(this.customer);
    }

    private page = observer((param: any) => {

        let header: any = <span>{this.customer.name}</span>;
        return <Page header={header}>
            <Edit
                schema={myCustomerSchema}
                uiSchema={myCustomerUISchema}
                data={this.customer}
                onItemChanged={this.onItemChanged} />
        </Page >
    })
}
