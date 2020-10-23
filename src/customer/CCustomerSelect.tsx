import { observable } from 'mobx';
import { VCustomerSelect } from './VCustomerSelect';
import { CUqBase } from 'CBase';
import { QueryPager } from 'tonva';

export class CCustomerSelect extends CUqBase {
    @observable pageCustomer: QueryPager<any>;
    @observable productGenres: any[] = [];
    async internalStart() {
        await this.searchByKey('')
        this.openVPage(VCustomerSelect);
    }
    /**
   * 查询客户——用在客户首页
   */
    searchByKey = async (key: string) => {
        this.pageCustomer = new QueryPager(this.uqs.salesTask.searchMyCustomer, 15, 30);
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
        // if (this.fromCustomerSelect) {
        this.backPage();
        this.returnCall(customer);
        // }
    }
}
