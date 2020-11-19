import * as React from 'react';
import { VPage, Page, LMR, List, SearchBox, tv, EasyDate, UserIcon, FA } from 'tonva';
import { observer } from 'mobx-react';
import { CCustomer } from './CCustomer';
import { observable } from 'mobx';
// import { setting } from 'appConfig';


export class VCustomerSearchByUnit extends VPage<CCustomer> {
    @observable private type: any;
    async open(par: any) {
        this.type = par.selectCus
        this.openPage(this.page, par);
    }

    //每个视图都有一个render方法， 用于自定义页面
    render(member: any): JSX.Element {
        return <this.page />;
    }

    private renderCustomer = (customer: any, index: number) => {
        let { showCustomerOrderDetail, onCustomerSelect } = this.controller;

        let { name, unit, validity } = customer;
        let nameShow = <div className="cursor-pointer font-weight-bold w-100">{name}</div>;
        let unitShow = <div className=" cursor-pointer text-muted"><small> {tv(unit, s => s.name)}</small></div>;
        let date = <div className=" cursor-pointer small"><EasyDate date={validity} /></div>
        let order = <div className=" cursor-pointer text-primary">选择</div>
        if (this.type === 5) {
            return <LMR className="px-2 py-1" left={<FA name='user' className=' my-2 mr-3 text-info fa-2x' />} onClick={() => showCustomerOrderDetail(customer)}>
                <LMR className="px-1 pt-2" left={nameShow} ></LMR>
                <LMR className="px-1" left={unitShow} right={date}></LMR>
            </LMR>
        } else if (this.type === 6) {
            return <LMR className="px-2 py-1" left={<FA name='user' className=' my-2 mr-3 text-info fa-2x' />} onClick={() => onCustomerSelect(customer)}>
                <LMR className="px-1 pt-2" left={nameShow} ></LMR>
                <LMR className="px-1" left={unitShow} right={order}></LMR>
            </LMR>
        }

    }

    private page = observer((customer: any) => {
        let { pageCustomerSearchByUnit, searchCustomerSearchByUnit } = this.controller;
        let none = <div className="my-3 mx-2 text-warning">
            没有这个客户
        </div>;
        return <Page header='搜索客户' onScrollBottom={this.onScrollBottom}>
            <SearchBox className="px-1 w-100  mt-2 mr-2"
                size='md'
                onSearch={(key: string) => searchCustomerSearchByUnit(14, key)}
                placeholder="搜索客户姓名" />
            <List before={''} none={none} items={pageCustomerSearchByUnit} item={{ render: this.renderCustomer }} />
        </Page>
    })

    private onScrollBottom = async () => {
        await this.controller.pageCustomerSearch.more();
    }
}