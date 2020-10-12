import * as React from 'react';
import { observer } from 'mobx-react';
import { CCustomer } from './CCustomer';
import { VPage, Page, LMR, List, SearchBox, FA, tv } from 'tonva';

export class VCustomerSelect extends VPage<CCustomer> {
    private type: any;
    async open(customer: any) {
        this.openPage(this.page, customer);
    }

    private renderCustomer = (customer: any, index: number) => {
        let { name, unit, validity, webuser } = customer;
        let { showCustomerOrderDetail } = this.controller

        let nameShow = <div className="cursor-pointer font-weight-bold w-100">{name}</div>;
        let unitShow = <div className=" cursor-pointer text-muted"><small> {tv(unit, v => v.name)}</small></div>;
        let order = <div className=" cursor-pointer text-primary">选择</div>
        let webuserid = webuser ? webuser.id : 47;

        return <LMR className="px-2 py-1" left={<FA name='user' className=' my-2 mr-3 text-info fa-2x' />}
        //  onClick={() => showCustomerOrderDetail(customer)}
        >
            <LMR className="px-1 pt-2" left={nameShow} ></LMR>
            <LMR className="px-1" left={unitShow} right={order}></LMR>
        </LMR>
    }

    private page = observer((customer: any) => {

        let { pageCustomer, searchByKey, showSelectOrganization, cApp } = this.controller;

        let search = <div className="w-100 d-flex">
            <span className="pt-1 text-white " style={{ width: '9rem' }}>选择客户</span>
            <SearchBox className="w-100 mr-2"
                size='sm'
                onSearch={(key: string) => searchByKey(key)}
                placeholder="输入客户信息" />

        </div>
        let none = <div className="my-3 mx-2 text-warning">请搜索客户！</div>;
        return <Page header={search} onScrollBottom={this.onScrollBottom} >
            {branch("单位", "icon-ren", () => cApp.cCustomerUnit.start(3))}
            {
                (pageCustomer && pageCustomer.items && (pageCustomer.items.length > 0)) ?
                    <List before={''} none={none} items={pageCustomer} item={{ render: this.renderCustomer }} />
                    : < div className="py-2 text-warning text-center bg-white mt-2">暂无客户<span className="text-primary"
                        onClick={() => showSelectOrganization(1)}>创建客户！</span></div>
            }
        </Page>
    })

    private onScrollBottom = async () => {
        await this.controller.pageCustomer.more();
    }
}
function branch(name: string, icon: string, action: any): JSX.Element {
    let vicon = "iconfont " + icon;
    return <LMR className="bg-white py-2 ml-1"
        left={<div className=""><i className={vicon} style={{ fontSize: "2rem", color: "#1296db" }}></i></div>}
        right={<i className="pt-2 px-2 iconfont icon-jiantouyou"></i>}
        onClick={action}>
        <div className="mx-3 pt-2 font-weight-bold">{name}</div>
    </LMR>;
}