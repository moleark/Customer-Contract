import * as React from 'react';
import { VPage, Page, TabProp, Tabs, TabCaptionComponent, List, EasyDate, LMR } from 'tonva';
import { CHome } from './CHome';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import logo from '../images/logo.png';

export const color = (selected: boolean) => selected === true ? 'text-primary' : 'text-muted';
export class VHome extends VPage<CHome> {
    private couponInput: HTMLInputElement;
    @observable startdate: any;
    @observable enddate: any;
    @observable starttimes: any;
    @observable private list: any[];
    private currentState: string;
    private valuename: string;
    private tabs: TabProp[];

    async open() {
    }

    render(): JSX.Element {
        return <this.page />
    }
    oss: any = [
        { caption: '待确认', state: 'confirmed', toolTip: '无' },
        { caption: '待发单', state: 'issued', toolTip: '待发单' },
        { caption: '待发货', state: 'completed', toolTip: '待发货' },
        { caption: '已完结', state: 'finished', toolTip: '已完结' },
        { caption: '全部', state: 'all', toolTip: '所有' },
    ];
    private renderOrder = (order: any, index: number) => {
        // let { openOrderDetail } = this.controller;
        let { id, no, date, discription, flow } = order;
        return <div className="m-3 justify-content-between cursor-pointer"
        //  onClick={() => openOrderDetail(id)}
        >
            <div><span className="small text-muted"></span><strong>{no}</strong></div>
            <div className="small text-muted"><EasyDate date={date} /></div>
            <div className="small cursor-pointer text-primary"
            // onClick={() => this.share(item)}
            >
                <span className="text-primary">分享确认</span>
            </div>
        </div>;
    }
    private getTabs = async () => {
        let { showMyOrders } = this.controller.cApp.cOrder;
        this.tabs = this.oss.map((v: any) => {
            let { caption, state, icon, toolTip } = v;
            return {
                name: caption,
                caption: (selected: boolean) => TabCaptionComponent(caption, icon, color(selected)),
                content: () => {
                    return <List items={this.list} item={{ render: this.renderOrder }} none="[无]" />
                },
                isSelected: this.currentState === state,
                load: async () => {
                    this.currentState = state;
                    this.list = await showMyOrders(this.currentState);
                }
            };
        });
    }
    private onChangeStartdate = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.startdate = evt.currentTarget.value;
        this.starttimes = Date.parse(this.startdate.replace(/-/g, "/"))
    }

    private onChangeEnddate = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.enddate = evt.currentTarget.value;
        let endtimes = Date.parse(this.enddate.replace(/-/g, "/"));
        // if (this.startdate !== "" && this.enddate !== "" && this.starttimes > endtimes) {
        //     document.getElementById('tips').innerHTML = ("结束时间必须大于或等于开始时间！");
        //     evt.currentTarget.value = null
        // } else {
        //     document.getElementById('tips').innerHTML = ("");
        //     this.enddate = evt.currentTarget.value;
        // }

    }
    private onChangeval = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.valuename = evt.currentTarget.value;

    }

    private selectCustomer = async () => {
        let { selectCustomer } = this.controller;
        selectCustomer(this.valuename, this.startdate, this.enddate);
    }

    private renderSelectbox = <div className='w-100 d-flex justify-content-center pt-2 small'>
        <div className=''>
            <input type="date" onChange={this.onChangeEnddate} />
        </div>
        <div className='pl-1'>
            <input type="text" onChange={this.onChangeval} placeholder="输入客户名" style={{ width: '' }} />
            <button type="button" className="btn-xs " onClick={this.selectCustomer}>查询</button>
        </div>

    </div>
    private page = observer(() => {
        this.getTabs();
        let { onAdd } = this.controller;
        let right = <div onClick={onAdd} className="d-flex small">
            <span className="mx-sm-2 iconfont icon-jiahao1 cursor-pointer text-primary" style={{ fontSize: "1.7rem" }}></span>
        </div>
            ;
        // let left = <div style={{ backgroundColor: '#f0f0f0' }}><img className="m-1 ml-2 mr-3" src={logo} alt="logo" style={{ height: "3rem", width: "3rem" }} /></div>;
        return <div className='bg-light'>
            <div style={{ borderBottom: '1px lightgray solid', backgroundColor: '#f0f0f0' }} className='d-flex px-1'>
                {this.renderSelectbox}
                {right}
            </div>
            <div>
                <Tabs tabs={this.tabs} tabPosition="top" />
            </div>
        </div>
    })
}
/**
 * <div className='w-100 d-flex small'>
        <div className="small pt-2 d-flex w-100" >
            <div className='d-flex w-50'> <span className='d-flex align-items-center'>日期：</span>
                <input type="date" onChange={this.onChangeEnddate} style={{ width: '72%' }} />
            </div>
            <div className='d-flex pl-1 w-50 small'><span className='d-flex align-items-center'>客户：</span>
                <input type="text" onChange={this.onChangeval} placeholder="输入客户名" style={{ width: '45%' }} />
                <button type="button" className="btn-xs " onClick={this.selectCustomer}>查询</button>
            </div>
        </div>
    </div>
 */