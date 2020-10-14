import { observable } from 'mobx';
import { VCustomerAddress } from './VCustomerAddress';
import { CUqBase } from 'CBase';

export class CCustomerAddress extends CUqBase {
    @observable private customer: any;
    async internalStart(customer: any) {
        this.customer = customer;
        this.openVPage(VCustomerAddress);
    }

    /**
     * 选择客户
     */
    onCustomerSelect = (customer: any) => {
        // if (this.fromCustomerSelect) {
        this.backPage();
        this.returnCall(customer);
        // }
    }
}
