import * as React from 'react';
import { VPage, Page, LMR, List, SearchBox, tv, EasyDate, UserIcon } from 'tonva';
import { observer } from 'mobx-react';
import { CCustomer } from './CCustomer';
// import { setting } from 'appConfig';

export class VCustomerSearch extends VPage<CCustomer> {

    async open(customer: any) {
        this.openPage(this.page, customer);
    }

    //每个视图都有一个render方法， 用于自定义页面
    render(member: any): JSX.Element {
        return <this.page />;
    }

    private renderCustomer = (customer: any, index: number) => {
        // let { showCustomerDetail } = this.controller;
        // let onshowCustomerDetail = () => showCustomerDetail(customer);

        let { name, unit, validity, webuser } = customer;
        let nameShow = <div className="cursor-pointer font-weight-bold w-100">{name}</div>;
        let unitShow = <div className=" cursor-pointer text-muted"><small> {tv(unit, s => s.name)}</small></div>;
        let date = <div className=" cursor-pointer small"><EasyDate date={validity} /></div>
        let webuserid = webuser ? webuser.id : 47;
        return <LMR
            // onClick={onshowCustomerDetail} 
            className="px-2 py-1" left={<UserIcon className="mt-1 mx-2 w-3c h-3c" id={webuserid} style={{ borderRadius: '8px' }} />} >
            <LMR className="px-1 pt-2" left={nameShow} ></LMR>
            <LMR className="px-1" left={unitShow} right={date}></LMR>
        </LMR>
    }


    private page = observer((customer: any) => {
        let { pageCustomerSearch, showSelectOrganization, cApp } = this.controller;
        let none = <div className="my-3 mx-2 text-warning">
            还没有这个客户，是否<span className="text-primary" onClick={() => showSelectOrganization(1)}  >创建客户！</span>
        </div>;
        let search = <div className="w-100 d-flex">
            <span className="pt-1 text-white " style={{ width: '9rem' }}>搜索客户</span>
            {/* <SearchBox className="w-100 mr-2"
                size='sm'
                 onSearch={(key: string) => this.controller.searchCustomerByKey(key)}
                placeholder="搜索客户姓名" /> */}
        </div>
        return <Page header={search} onScrollBottom={this.onScrollBottom}>
            <List before={''} none={none} items={pageCustomerSearch} item={{
                render: this.renderCustomer,
                // onClick: () => () => showCustomerDetail(customer)
            }}

            />
        </Page>
    })

    private onScrollBottom = async () => {
        await this.controller.pageCustomerSearch.more();
    }
}