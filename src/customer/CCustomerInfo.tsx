import { observable } from 'mobx';
import { VCustomerAddress } from './VCustomerAddress';
import { CUqBase } from 'CBase';
import { VCustomerSelect } from './VCustomerSelect';
import { QueryPager } from 'tonva';
import { VInvoiceInfo } from './VInvoiceInfo';

export class CCustomerSelect extends CUqBase {
    @observable pageCustomer: QueryPager<any>;
    @observable productGenres: any[] = [];
    async internalStart() {
        // await this.searchByKey('')
        this.openVPage(VCustomerSelect);
    }
    /**
   * 查询客户
   */
    searchByKey = async (key: string) => {
        this.pageCustomer = await new QueryPager(this.uqs.salesTask.searchMyCustomer, 15, 30);
        this.pageCustomer.first({ key: key });
    };
    /**
      * 新建客户时显示选择客户单位的页面
      */
    showSelectOrganization = (type: any) => {
        this.cApp.cCustomerUnit.start(type);
    };
    /**
     * 选择客户
     */
    onCustomerSelect = (customer: any) => {
        this.backPage();
        this.returnCall(customer);
    }
}

export class CCustomerAddress extends CUqBase {

    async internalStart(customer: any) {
        this.openVPage(VCustomerAddress, customer);
    }

    /**
     * 选择客户地址
     */
    onCustomerAddress = (address: any) => {
        this.backPage();
        this.returnCall(address);
    }

    //修改信息
    updateMyCustomer = async (param: any) => {
        this.closePage()
        await this.uqs.salesTask.MyCustomer.save(param.id, param);
    };
}

export class CInvoiceInfo extends CUqBase {
    private customer: any;
    async internalStart(customer: any) {
        this.customer = customer;
        this.openVPage(VInvoiceInfo, customer);
    }

    async saveInvoiceInfo(invoice: any) {
        //将信息可以保存到this.customer中，方便选中时显示--且在vedit中显示做修改
        let { invoiceType, invoiceInfo, isDefault } = invoice;
        let newInvoiceInfo = await this.uqs.customer.InvoiceInfo.save(undefined, invoiceInfo);

        let { id: newInvoiceInfoId } = newInvoiceInfo;
        let invoiceBox = {
            invoiceType: this.uqs.common.InvoiceType.boxId(invoiceType),
            invoiceInfo: this.uqs.customer.InvoiceInfo.boxId(newInvoiceInfoId),
        }
        // let { currentUser } = this.cApp;//这是保存在登陆客户上了
        // await currentUser.setDefaultInvoice(invoiceBox.invoiceType, invoiceBox.invoiceInfo);

        this.backPage();
        this.returnCall(invoiceBox);

    }
}

