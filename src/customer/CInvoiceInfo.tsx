//import { Controller } from 'tonva';
import { CUqBase } from '../CBase';
import { VInvoiceInfo } from './VInvoiceInfo';
//import { CCartApp } from 'CCartApp';
//import { Tuid } from 'tonva';

export class CInvoiceInfo extends CUqBase {
    fromOrderCreation: boolean;

    async internalStart(origInvoice: any, fromOrderCreation: boolean) {
        this.fromOrderCreation = fromOrderCreation;
        this.openVPage(VInvoiceInfo, origInvoice);
    }

    async saveInvoiceInfo(invoice: any) {
        let { invoiceType, invoiceInfo, isDefault } = invoice;
        let newInvoiceInfo = await this.uqs.customer.InvoiceInfo.save(undefined, invoiceInfo);

        let { id: newInvoiceInfoId } = newInvoiceInfo;
        let invoiceBox = {
            invoiceType: this.uqs.common.InvoiceType.boxId(invoiceType),
            invoiceInfo: this.uqs.customer.InvoiceInfo.boxId(newInvoiceInfoId),
        }
        // if (isDefault === true || !this.fromOrderCreation) {
        // }
        //暂时隐藏
        // let { currentUser } = this.cApp;
        // await currentUser.setDefaultInvoice(invoiceBox.invoiceType, invoiceBox.invoiceInfo);

        if (this.fromOrderCreation) {
            this.backPage();
            this.returnCall(invoiceBox);
        }
    }
}