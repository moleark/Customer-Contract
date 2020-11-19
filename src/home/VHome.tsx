import * as React from 'react';
import { VPage, TabProp, Tabs, TabCaptionComponent, List, EasyDate, nav, tv, LMR } from 'tonva';
import { CHome } from './CHome';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import logo from '../images/logo.png';
import { GLOABLE } from "configuration";

export const color = (selected: boolean) => selected === true ? 'text-primary' : 'text-muted';
export class VHome extends VPage<CHome> {
    private couponInput: HTMLInputElement;
    @observable startdate: any;
    @observable datetime: any;
    @observable starttimes: any;
    @observable private list: any[];
    private currentState: string;
    private valuename: string;
    private tabs: TabProp[];
    @observable showTips: any = "none"

    async open() {
    }

    render(): JSX.Element {
        return <this.page />
    }
    orderStatus: any = [
        { caption: '待确认', state: 'tobeconfirmed', toolTip: '无' },
        { caption: '已取消', state: 'cancelled', toolTip: '无' },
        { caption: '已确认', state: 'completed', toolTip: '无' }
    ];
    private getTabs = async () => {
        let { showMyOrders } = this.controller.cApp.cOrder;
        this.tabs = this.orderStatus.map((v: any) => {
            let { caption, state, icon, toolTip } = v;
            let none = <div>{`${toolTip}`}</div>
            return {
                name: caption,
                caption: (selected: boolean) => TabCaptionComponent(caption, icon, color(selected)),
                content: () => {
                    return <List items={this.list} item={{ render: this.renderOrder }} none={none} />
                },
                isSelected: this.currentState === state,
                load: async () => {
                    this.currentState = state;
                    this.list = await showMyOrders(this.currentState);
                }
            };
        });
    }
    private renderOrder = (order: any, index: number) => {
        let { openOrderDetail } = this.controller.cApp.cCustomer;
        let { id, no, date, name, unit } = order;
        let counts = 0
        let orderno = <div onClick={() => openOrderDetail(id)}><span className="small text-muted"></span><strong>{no}</strong></div>
        let orders = (this.currentState === 'tobeconfirmed') ? <div className="small cursor-pointer text-primary">
            <span className="text-primary" onClick={() => this.share(order)}>分享确认<i>( {counts} )</i></span>
        </div> : null;
        let unitShow = <div>{name}<small> {tv(unit, s => s.name)}</small></div>
        let datetime = <div className="small text-muted"><EasyDate date={date} /></div>
        return <div className='d-flex flex-column  m-2'>
            <LMR className="px-1" left={orderno} right={orders}></LMR>
            <LMR className="px-1" left={unitShow} right={datetime}></LMR>
        </div>
    }
    private onChangedate = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.datetime = evt.currentTarget.value;
    }
    private onChangeval = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.valuename = evt.currentTarget.value;
    }
    private onTips = () => {
        this.showTips = "";
        setTimeout(() => {
            this.showTips = "none";
        }, GLOABLE.TIPDISPLAYTIME);
    }
    private share = async (order: any) => {
        let { id, no, date } = order;
        if (navigator.userAgent.indexOf("Html5Plus") > -1) {
            // @ts-ignore  屏蔽错误
            window.plusShare(
                {
                    title: no, //订单号
                    content: <EasyDate date={date} />,
                    /**href 跟的地址有待确认 地址的订单 + ID */
                    href: GLOABLE.PIRVACYURL + "/" + id + "?sales=" + nav.user.id, //分享出去后，点击跳转地址
                },
                function (result) {
                    //分享回调
                }
            );
        } else {
            this.onTips();
        }
    }

    private selectCustomer = async () => {
        let { selectCustomer } = this.controller;
        selectCustomer(this.valuename, this.datetime);
    }

    private renderSelectbox = <div className='w-100 d-flex justify-content-center pt-2 small'>
        <div className=''>
            <input type="date" onChange={this.onChangedate} />
        </div>
        <div className='pl-1'>
            <input type="text" onChange={this.onChangeval} placeholder="输入客户名" style={{ width: '' }} />
            <button type="button" className="btn-xs " onClick={this.selectCustomer}>查询</button>
        </div>
    </div>

    private page = observer(() => {
        this.getTabs();
        let { edit } = this.controller;
        let editOrder = <div onClick={edit} className="d-flex small">
            <span className="mx-sm-2 pt-1 iconfont icon-jiahao1 cursor-pointer text-primary" style={{ fontSize: "1.7rem" }}></span>
        </div>
        let left = <img className="m-1 ml-2" src={logo} alt="logo" style={{ height: "3rem", width: "2.5rem" }} />;
        return <div className='bg-light'>
            <div style={{ borderBottom: '1px lightgray solid', backgroundColor: '#f0f0f0' }} className='d-flex px-1 d-flex justify-content-between'>
                {left}
                {/* {this.renderSelectbox} */}
                {editOrder}
            </div>
            <div className='w-100'>
                <Tabs tabs={this.tabs} tabPosition="top" />
            </div>
        </div>
    })
}
/**
 * <div className='w-100 d-flex small'>
        <div className="small pt-2 d-flex w-100" >
            <div className='d-flex w-50'> <span className='d-flex align-items-center'>日期：</span>
                <input type="date" onChange={this.onChangedatetime} style={{ width: '72%' }} />
            </div>
            <div className='d-flex pl-1 w-50 small'><span className='d-flex align-items-center'>客户：</span>
                <input type="text" onChange={this.onChangeval} placeholder="输入客户名" style={{ width: '45%' }} />
                <button type="button" className="btn-xs " onClick={this.selectCustomer}>查询</button>
            </div>
        </div>
    </div>
 */