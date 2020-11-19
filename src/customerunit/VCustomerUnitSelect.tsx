import * as React from 'react';
import { observer } from 'mobx-react';
import { VPage, Page, tv } from 'tonva';
import { LMR, List, SearchBox, FA } from 'tonva';
import { CCustomerUnit } from './CCustomerUnit';
import { observable } from 'mobx';
// import { setting } from 'appConfig';


export class VCustomerUnitSelect extends VPage<CCustomerUnit> {

    /**显示类型
    1.新建客户时的查询单位；
    2.关联单位用的，选择后返回单位对象
    3.按照客户搜素单位用的； 点击后进入客户搜素页面
    **/
    @observable private type: any;
    @observable private selectCus: any;
    async open(param: any) {
        this.type = param.type;
        this.selectCus = param.selectCus
        this.openPage(this.page);
    }

    private renderItem(salesTask: any, index: number) {
        let { name } = salesTask;

        return <LMR className="px-3 py-1" left={<FA name='university' className='my-2 mr-3 text-info' />}>
            <div className="font-weight-bold my-1">{name}</div>
        </LMR >
    }

    private onClickRow = async (model: any) => {
        let { showCreateCustomer, returnCustomerUnit, cApp } = this.controller;
        let selectCus = this.selectCus;
        let modelS = { model, selectCus }
        if (this.type === 1) {
            await showCreateCustomer(model.id);
        } else if (this.type === 2) {
            await returnCustomerUnit(model);
        } else if (this.type === 3) {
            await cApp.cCustomer.showCustomerSearchByUnit(modelS);
        }
    }

    private page = observer(() => {
        let { pageUnit, showCreateOrganization } = this.controller;
        let onshowCreateUnit = async () => await showCreateOrganization(this.type);
        let none, text, search;
        if (this.type === 1 || this.type === 2) {
            none = <div className="my-3 mx-2 text-warning">
                还没有创建过客户单位，请先<span className="text-primary" onClick={onshowCreateUnit}>创建单位！</span>
            </div>;
            text = <div className="my-3 mx-2 text-warning">新建客户前先选择单位，或点击右上角加号新建单位！</div>;
            search = <div className="w-100 d-flex">
                <span className="pt-1 text-white " style={{ width: '9rem' }}>选择单位</span>
                <SearchBox
                    className="w-100 px-2 small"
                    size="sm"
                    onSearch={(key: string) => this.controller.searchByKey(key)}
                    placeholder="搜索单位"
                />
                <div onClick={onshowCreateUnit} className="cursor-pointer pl-1 pr-3"><span className="iconfont icon-tianjia1" style={{ fontSize: "20px", color: "#ffffff" }}></span></div>
            </div>
        } else {
            text = "";
            none = <div className="my-3 mx-2 text-warning">你还没有创建单位，无法根据单位搜索！</div>;
            search = <div className="w-100 d-flex">
                <span className="pt-1 text-white " style={{ width: '3rem' }}>单位</span>
                <SearchBox
                    className="w-100 px-2 small"
                    size="sm"
                    onSearch={(key: string) => this.controller.searchByKey(key)}
                    placeholder="搜索单位"
                />
            </div>
        }
        return <Page header={search} onScrollBottom={this.onScrollBottom}>
            <List before={''} none={none} className="mt-2" items={pageUnit}
                item={{ render: this.renderItem, onClick: this.onClickRow }} />
            {(!pageUnit) && text}
        </Page>
    })

    private onScrollBottom = async () => {
        await this.controller.pageUnit.more();
    }
}