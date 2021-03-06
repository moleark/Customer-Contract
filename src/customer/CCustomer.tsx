import * as React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Context, QueryPager, BoxId } from "tonva";
import { CUqBase } from "../CBase";
import { VCustomer } from "./VCustomer";
import { VCustomerSearchByUnit } from "./VCustomerSearchByUnit";
import { VCreateCustomer } from "./VCreateCustomer";
import { VCreateCustomerFinish } from "./VCreateCustomerFinish";
import { VCustomerOrderDetail } from "./VCustomerOrderDetail";
import { CCustomerAddress, CCustomerSelect, CInvoiceInfo } from './CCustomerInfo';
import { groupByProduct } from '../tools/groupByProduct';
import { VOrderDetail } from './VOrderDetail';
import { VEdit } from "order/VEdit";


/* eslint-disable */

export class CCustomer extends CUqBase {
    @observable CustomerInfo: any = {};        /* 客户信息 */
    @observable CustomerAddress: any = {};        /* 客户地址 */
    @observable pageCustomer: QueryPager<any>;
    @observable pageCustomerSearch: QueryPager<any>;
    @observable pageCustomerSearchByUnit: QueryPager<any>;
    @observable customerorders: any;/**客户订单 */

    @observable newMyCustomerList: any[];
    //初始化
    protected async internalStart() {
    }

    render = observer(() => {
        return this.renderView(VCustomer);
    });

    tab = () => {
        this.searchByKey('');
        return <this.render />;
    };

    /**
     * 客户选择
    */
    onShowCustomerSelect = async () => {
        let cCustomerSelect = this.newC(CCustomerSelect);
        let selectmycustomer = await cCustomerSelect.call<any>(true);
        this.CustomerInfo = selectmycustomer;
    }
    onCustomerSelect = async (customer: any) => {
        this.CustomerInfo = customer;
        this.closePage(4)
        this.openVPage(VEdit);
    }
    /**客户地址 */
    onShowCustomerAddress = async () => {
        let cCustomerAddress = this.newC(CCustomerAddress);
        let customeraddress = await cCustomerAddress.call<any>(this.CustomerInfo);
        // this.CustomerAddress = customeraddress;
    }
    /**
      * 打开发票信息编辑界面
      */
    onInvoiceInfoEdit = async () => {
        let cInvoiceInfo = this.newC(CInvoiceInfo);
        let newInvoice = await cInvoiceInfo.call<any>(this.CustomerInfo);
        this.CustomerInfo.invoiceType = newInvoice.invoiceType;
        this.CustomerInfo.invoiceInfo = newInvoice.invoiceInfo;
    }
    /**打开优惠卡券界面 */
    onCouponEdit = async () => {
        let { cCoupon } = this.cApp;
        let coupon = await cCoupon.call<any>();
        if (coupon) {
            await this.cApp.cOrder.applyCoupon(coupon);
        }
    }

    searchCustomerByKey = async (key: string) => {
        this.pageCustomerSearch = new QueryPager(this.uqs.salesTask.searchMyCustomer, 15, 30);
        this.pageCustomerSearch.first({ key: key });
    };

    /**
     * 查询客户——用在客户首页
     */
    searchByKey = async (key: string) => {
        this.pageCustomer = new QueryPager(this.uqs.salesTask.searchMyCustomer, 15, 30);
        this.pageCustomer.first({ key: key });
    };

    //获取客户历史订单
    getCustomerOrder = async (customer: any) => {
        let { id } = customer;
        this.customerorders = await this.uqs.salesTask.SearchCustomerOrder.table(
            {
                _mycustomer: id,
                _ordertype: "coupon"
            }
        );
    };


    // 查询客户的订单详情
    showCustomerOrderDetail = async (myCustomer: any) => {
        let { uqs, user } = this;
        let { salesTask } = uqs;
        let { MyCustomer } = salesTask;
        let { id } = myCustomer;
        let mycustomer = await MyCustomer.load(id);
        // let department = await SearchMyCustomerDepartment.query({ mycustomer: id });
        // let research = await SearchMyCustomerResearch.query({ mycustomer: id });
        // if (department.ret.length > 0)
        //     mycustomer.department = department.ret[0];
        // if (research.ret.length > 0) mycustomer.research = research.ret[0];

        await this.getCustomerOrder(myCustomer);

        // let customermap = await CustomerMyCustomerMap.obj({ sales: user, mycustomer: myCustomer });
        // if (customermap) {
        //     let { webuser, customer } = customermap;
        //     mycustomer.webuser = webuser;
        //     await this.setIsBinded(customer);
        //     if (webuser) {
        //         let vipCardForWebUser = await this.getVIPCard(webuser);
        //         if (vipCardForWebUser) {
        //             let { vipCard } = vipCardForWebUser;
        //             vipCardForWebUser.vipCard = await Coupon.load(vipCard)
        //             vipCardForWebUser.drawed = await this.getVIPCardDrawing(webuser, vipCard);
        //             this.vipCardForWebUser = vipCardForWebUser;
        //         } else {
        //             this.vipCardForWebUser = undefined;
        //         }
        //     }
        // }
        this.openVPage(VCustomerOrderDetail, mycustomer);

    };
    /**
    * 新建客户时显示选择客户单位的页面
    */
    showSelectOrganization = (type: any) => {
        this.cApp.cCustomerUnit.start(type);
    };
    /**
       * 查询客户——用在客户首页
       */
    searchCustomerSearchByUnit = async (unit: any, key: string) => {
        this.pageCustomerSearchByUnit = new QueryPager(this.uqs.salesTask.SearchMyCustomerByUnit, 15, 30);
        this.pageCustomerSearchByUnit.first({ _unit: unit, _key: key });
    };

    showCustomerSearchByUnit = async (param: any) => {
        let { model } = param
        await this.searchCustomerSearchByUnit(model.id.id, "");
        this.openVPage(VCustomerSearchByUnit, param);
    }
    /**
        * 查询我的新客户
        */
    searchNewMyCustomer = async () => {
        let list = await this.uqs.salesTask.searchNewMyCustomer.query({});
        if (list.ret.length > 0) {
            this.newMyCustomerList = list.ret;
        }
    };
    /**
    * 显示新建客户页面
    */
    showCreateCustomer = (param: any) => {
        this.openVPage(VCreateCustomer, param);
    };
    //新建客户
    createMyCustomer = async (param: any, organization: any) => {
        let par = {
            unit: organization.id,
            no: undefined as any,
            name: param.name,
            firstName: "",
            lastName: "",
            gender: param.gender ? 1 : param.gender,
            salutation: param.salutation,
            telephone: param.telephone,
            mobile: param.mobile,
            newcustomerid: 0
        };
        let ret = await this.uqs.salesTask.CreateMyCustomer.submit(par);
        let { code } = ret;
        this.openVPage(VCreateCustomerFinish, code);
    };
    openOrderDetail = async (orderId: number) => {

        let order = await this.uqs.order.Order.getSheet(orderId);
        let { data } = order;
        let { orderItems } = data;
        let orderItemsGrouped = groupByProduct(orderItems);
        data.orderItems = orderItemsGrouped;
        this.openVPage(VOrderDetail, order);
    }
    renderDeliveryTime = (pack: BoxId) => {
        let { cProduct } = this.cApp;
        return cProduct.renderDeliveryTime(pack);
    }

    renderOrderItemProduct = (product: BoxId) => {
        let { cProduct } = this.cApp;
        return cProduct.renderCartProduct(product);
    }
}
