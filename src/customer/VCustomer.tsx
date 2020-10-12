import * as React from 'react';
import { VPage, Page, LMR, List, tv, EasyDate, UserIcon, FA, SearchBox } from 'tonva';
import { observer } from 'mobx-react';
import { CCustomer } from './CCustomer';


export class VCustomer extends VPage<CCustomer> {

    async open() {
        this.openPage(this.page);
    }

    render(member: any): JSX.Element {
        return <this.page />;
    }


    private renderCustomer = (customer: any, index: number) => {
        let { name, unit, validity, webuser } = customer;
        let { showCustomerOrderDetail } = this.controller

        let nameShow = <div className="cursor-pointer font-weight-bold w-100">{name}</div>;
        let unitShow = <div className=" cursor-pointer text-muted"><small> {tv(unit, s => s.name)}</small></div>;
        let order = <div className=" cursor-pointer text-primary">订单</div>
        let webuserid = webuser ? webuser.id : 47;

        return <LMR className="px-2 py-1" left={<FA name='user' className=' my-2 mr-3 text-info fa-2x' />} onClick={() => showCustomerOrderDetail(customer)}>
            <LMR className="px-1 pt-2" left={nameShow} ></LMR>
            <LMR className="px-1" left={unitShow} right={order}></LMR>
        </LMR>
    }

    private page = observer(() => {

        let { cApp, pageCustomer } = this.controller;

        let search = <div className="w-100 d-flex">
            <SearchBox className="w-100 mx-3"
                size='sm'
                onSearch={(key: string) => this.controller.searchByKey(key)}
                placeholder="输入客户信息" />
        </div>

        let none = <div className="my-3 mx-2 text-warning">【无】</div>;

        return <Page header={search}  >
            <LMR className="bg-white px-2 py-1 "
                left={<i className='iconfont icon-ren text-primary' style={{ fontSize: "2rem" }}></i>}
                right={<i className="pt-2 px-2 iconfont icon-jiantouyou"></i>}
                onClick={() => cApp.cCustomerUnit.start(3)}>
                <div className="mx-3 pt-2 font-weight-bold"  >单位</div>
            </LMR>
            {
                (pageCustomer && pageCustomer.items && (pageCustomer.items.length > 0)) ?
                    <List before={''} none={none} items={pageCustomer} item={{ render: this.renderCustomer }} />
                    : < div className="py-2 text-warning text-center bg-white mt-2">暂无客户</div>
            }
        </Page >
    })
}