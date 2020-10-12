import * as React from 'react';
import { VPage, Page, Schema, Form, UiSchema, UiInputItem, Context } from 'tonva';
import { observer } from 'mobx-react';
import { CCustomerUnit } from './CCustomerUnit';
// import { setting } from 'appConfig';

const schema: Schema = [
    { name: 'Name', type: 'string', required: true },
    { name: 'submit', type: 'submit' },
];

export class VCreateCustomerUnit extends VPage<CCustomerUnit> {
    private uiSchema: UiSchema = {
        items: {
            Name: { widget: 'text', label: '名称', placeholder: '请输入单位名称' } as UiInputItem,
            submit: { widget: 'button', label: '确定', className: 'btn btn-primary w-8c' },
        }
    }

    async open(param: any) {
        this.openPage(this.page);
    }

    private onFormButtonClick = async (name: string, context: Context) => {
        await this.controller.createOrganization(context.data);
    }

    private page = observer((param: any) => {
        return <Page header="新建单位">
            <Form className="my-3 mx-3"
                schema={schema}
                uiSchema={this.uiSchema}
                onButtonClick={this.onFormButtonClick}
                requiredFlag={false}
            />
        </Page >
    })
}