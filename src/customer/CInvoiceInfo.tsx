import { CUqBase } from '../CBase';
import { VInvoiceInfo } from './VInvoiceInfo';

export class CInvoiceInfo extends CUqBase {
    private customer: any;
    async internalStart(customer: any) {
        this.customer = customer;
        this.openVPage(VInvoiceInfo, customer);
    }

    async saveInvoiceInfo(invoice: any) {
        //将信息可以保存到this.customer中，方便选中时显示--且在vedit中显示做修改
        // let { invoiceType, invoiceInfo, isDefault } = invoice;
        // let newInvoiceInfo = await this.uqs.customer.InvoiceInfo.save(undefined, invoiceInfo);

        // let { id: newInvoiceInfoId } = newInvoiceInfo;
        // let invoiceBox = {
        //     invoiceType: this.uqs.common.InvoiceType.boxId(invoiceType),
        //     invoiceInfo: this.uqs.customer.InvoiceInfo.boxId(newInvoiceInfoId),
        // }
        // let { currentUser } = this.cApp;//这是保存在登陆客户上了
        // await currentUser.setDefaultInvoice(invoiceBox.invoiceType, invoiceBox.invoiceInfo);

        this.backPage();
        this.returnCall(invoice);

    }
}