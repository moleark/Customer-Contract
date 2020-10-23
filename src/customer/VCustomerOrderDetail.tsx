import * as React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { VPage, Page, LMR, tv, FA, Tabs, TabCaptionComponent, TabProp, List, EasyDate } from "tonva";
import { CCustomer } from "./CCustomer";

export const color = (selected: boolean) => selected === true ? 'text-primary' : 'text-muted';
export class VCustomerOrderDetail extends VPage<CCustomer> {

    @observable private customer: any;
    @observable private list: any[];
    private currentState: string;
    private tabs: TabProp[];

    async open(param: any) {
        this.customer = param;
        this.openPage(this.page, param);
    }
    content(): JSX.Element {
        return <Tabs tabs={this.tabs} tabPosition="top" />;
    }
    private renderOrder = (order: any, index: number) => {
        // let { openOrderDetail } = this.controller;
        let { id, no, date, discription, flow } = order;
        return <div className="m-3 justify-content-between cursor-pointer"
        //  onClick={() => openOrderDetail(id)}
        >
            <div><span className="small text-muted"></span><strong>{no}</strong></div>
            <div className="small text-muted"><EasyDate date={date} /></div>
            <div className="small cursor-pointer text-primary"
            // onClick={() => this.share(item,this.customer)}
            >
                <span className="text-primary">分享确认</span>
            </div>
        </div>;
    }
    oss: any = [
        { caption: '待确认', state: 'confirmed' },
        { caption: '待审核', state: 'processing' },
        { caption: '待发货', state: 'completed' },
        { caption: '全部', state: 'all' },
    ];
    private getTabs = async () => {
        let { getMyOrders } = this.controller.cApp.cOrder;
        this.tabs = this.oss.map(v => {
            let { caption, icon, state } = v;
            return {
                name: caption,
                caption: (selected: boolean) => TabCaptionComponent(caption, icon, color(selected)),
                content: () => {
                    return <List items={this.list} item={{ render: this.renderOrder }} none="[无]" />
                },
                isSelected: this.currentState === state,
                load: async () => {
                    this.currentState = state;
                    this.list = await getMyOrders(this.currentState);
                }
            };
        });
    }
    private page = observer((param: any) => {

        this.getTabs();
        let { name: customerName, webuser, unit } = param;
        let left = <span className='px-2 py-1'><FA name='user' className='text-info mr-3' />{customerName}</span>
        let right = <span className='px-2 py-1 mr-3'>{tv(unit, s => s.name)}</span>
        return <Page header='订单详情'>
            <LMR left={left} right={right}></LMR>
            <Tabs tabs={this.tabs} tabPosition="top" />
        </Page>
    });
}
