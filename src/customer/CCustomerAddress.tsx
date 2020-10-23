import { observable } from 'mobx';
import { VCustomerAddress } from './VCustomerAddress';
import { CUqBase } from 'CBase';
import { VCustomerAddrEdit } from "./VCustomerAddrEdit";

export class CCustomerAddress extends CUqBase {

    async internalStart(customer: any) {
        // this.customer = customer;
        this.openVPage(VCustomerAddress, customer);
    }

    /**
     * 选择客户
     */
    onCustomerAddress = (address: any) => {

        this.backPage();
        this.returnCall(address);
    }
    /**
    * 显示编辑客户信息界面
    */
    showCustomerEdit = async (customer: any) => {
        this.openVPage(VCustomerAddrEdit, customer);
    };
    //修改单位信息
    updateMyCustomer = async (param: any) => {
        await this.uqs.salesTask.MyCustomer.save(param.id, param);
    };
}
