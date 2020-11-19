import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { VPage, Page, UiSchema, UiInputItem, Form, Context, tv, BoxId, FA } from 'tonva';
import { Schema } from 'tonva';
import { CInvoiceInfo } from './CCustomerInfo';

const schema: Schema = [
    { name: 'id', type: 'id', required: false },
    { name: 'title', type: 'string', required: false },
    { name: 'taxNo', type: 'string', required: false },
    { name: 'address', type: 'id', required: false },
    { name: 'telephone', type: 'string', required: false },
    { name: 'bank', type: 'string', required: false },
    { name: 'accountNo', type: 'string', required: false },
];

const uiSchema: UiSchema = {
    items: {
        id: { visible: false },
        title: {
            widget: 'text', label: '单位全称', placeholder: '必填',
            rules: (value: string) => {
                return (value && value.length > 200) ? '单位全称最多200个字！' : undefined;
            }
        } as UiInputItem,
        taxNo: {
            widget: 'text', label: '纳税人识别码', placeholder: '必填',
            rules: (value: string) => {
                if (value) {
                    var regArr = [/^[\da-z]{10,15}$/i, /^\d{6}[\da-z]{10,12}$/i, /^[a-z]\d{6}[\da-z]{9,11}$/i, /^[a-z]{2}\d{6}[\da-z]{8,10}$/i, /^\d{14}[\dx][\da-z]{4,5}$/i, /^\d{17}[\dx][\da-z]{1,2}$/i, /^[a-z]\d{14}[\dx][\da-z]{3,4}$/i, /^[a-z]\d{17}[\dx][\da-z]{0,1}$/i, /^[\d]{6}[\da-z]{13,14}$/i],
                        j = regArr.length;
                    for (var i = 0; i < j; i++) {
                        if (regArr[i].test(value)) {
                            return undefined;
                        }
                    }
                    return '纳税人识别码格式不正确，请重新输入！';
                }
            }
        } as UiInputItem,
        address: {
            widget: 'text', label: '注册地址', placeholder: '必填',
            rules: (value: string) => {
                return (value && value.length > 200) ? '注册地址最多200个字！' : undefined;
            }
        } as UiInputItem,
        telephone: {
            widget: 'text', label: '注册电话', placeholder: '必填',
            rules: (value: string) => {
                if (value && !/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value))
                    return "注册电话格式不正确，请重新输入！";
                else
                    return undefined;
            }
        } as UiInputItem,
        bank: {
            widget: 'text', label: '开户银行', placeholder: '必填',
            rules: (value: string) => {
                return (value && value.length > 100) ? '开户银行名称最多100个字！' : undefined;
            }
        } as UiInputItem,
        accountNo: {
            widget: 'text', label: '银行账号', placeholder: '必填',
            rules: (value: string) => {
                if (value && !/^([1-9]{1})(\d{14}|\d{18}|\d{15})$/.test(value))
                    return "银行账号格式不正确，请重新输入！";
                else
                    return undefined;
            }
        } as UiInputItem,
        submit: { widget: 'button', label: '提交' },
    }
}

const commonRequired = {
    id: false,
    title: true,
    taxNo: false,
    address: false,
    telephone: false,
    bank: false,
    accountNo: false,
    isDefault: false,
};

const valueAddedRequired = {
    id: false,
    title: true,
    taxNo: true,
    address: true,
    telephone: true,
    bank: true,
    accountNo: true,
    isDefault: false,
}

const commonVisible = {
    id: false,
    title: true,
    taxNo: false,
    address: false,
    telephone: false,
    bank: false,
    accountNo: false,
    isDefault: true,
};

const valueAddedVisible = {
    id: false,
    title: true,
    taxNo: true,
    address: true,
    telephone: true,
    bank: true,
    accountNo: true,
    isDefault: true,
}

export class VInvoiceInfo extends VPage<CInvoiceInfo> {
    private form: Form;
    @observable showTip: boolean = false;
    saveTip: string = "";
    private invoiceInfoData: any;

    async open() {
        this.openPage(this.page);
    }

    private onFormButtonClick = async (name: string, context: Context) => {
        let { form } = context;
        let { data } = form;
        let invoice = {
            invoiceType: this.invoiceType,
            invoiceInfo: data,
        };
        this.invoiceInfoData = data;

        try {
            await this.controller.saveInvoiceInfo(invoice);
            this.saveTip = "发票信息已经保存";
        } catch (error) {
            this.saveTip = "发票信息保存失败，请稍后再试";
        }
        this.showTip = true;
        setTimeout(() => { this.showTip = false; }, 2000);
    }

    private onSaveInvoice = async () => {
        if (!this.form) return;
        await this.form.buttonClick("submit");
    }

    @observable invoiceType: number;

    private buildForm(): JSX.Element {
        let requiredFields: any = this.invoiceType === 1 ? commonRequired : valueAddedRequired;
        let visibleFields: any = this.invoiceType === 1 ? commonVisible : valueAddedVisible;
        schema.forEach(e => {
            let { items } = uiSchema;
            e.required = requiredFields[e.name];
            items[e.name].visible = visibleFields[e.name];
        });
        return <Form ref={v => this.form = v} className="my-3"
            schema={schema}
            uiSchema={uiSchema}
            formData={''}//写入传入客户的发票信息
            onButtonClick={this.onFormButtonClick}
            fieldLabelSize={3} />
    }

    private onInvoiceTypeClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.invoiceType = parseInt(event.currentTarget.value);
    }

    private page = observer(() => {
        let frm = this.buildForm();

        let tipUI = this.showTip ? (<div className="alert alert-primary" role="alert">
            <FA name="exclamation-circle" className="text-warning float-left mr-3" size="2x"></FA>
            {this.saveTip}
        </div>) : null;
        return <Page header="发票">
            <div className="px-3">
                <div className="form-group row py-3 mb-1 bg-white">
                    <div className="col-12 col-sm-3 pb-2 text-muted">发票类型:</div>
                    <div className="col-12 col-sm-9">
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="invoiceType" id="common" value="1"
                                onChange={(event) => this.onInvoiceTypeClick(event)} checked={this.invoiceType === 1}></input>
                            <label className="form-check-label" htmlFor="common">增值税普通发票</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="invoiceType" id="valueAdded" value="2"
                                onChange={(event) => this.onInvoiceTypeClick(event)} checked={this.invoiceType === 2}></input>
                            <label className="form-check-label" htmlFor="valueAdded">增值税专用发票</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-3 bg-white">
                {frm}
                <button type="button"
                    className="btn btn-primary w-100"
                    onClick={this.onSaveInvoice}>确定</button>
                {tipUI}
            </div>
        </Page>
    });
}
