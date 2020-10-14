import * as React from 'react';
import { VPage, Page, TabProp, Tabs, TabCaptionComponent } from 'tonva';
import { CHome } from './CHome';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

export const color = (selected: boolean) => selected === true ? 'text-primary' : 'text-muted';
export class VHome extends VPage<CHome> {
    private couponInput: HTMLInputElement;
    @observable startdate: any;
    @observable enddate: any;
    @observable starttimes: any;

    private currentStatus: string;
    private tabs: TabProp[];
    oss: any = [
        { caption: '待确认', state: 'confirmed', toolTip: '无' },
        { caption: '待发单', state: 'issued', toolTip: '待发单' },
        { caption: '待发货', state: 'completed', toolTip: '待发货' },
        { caption: '已完结', state: 'finished', toolTip: '已完结' },
        { caption: '全部', state: 'all', toolTip: '所有' },
    ];
    async open() {
    }

    render(): JSX.Element {
        return <this.page />
    }
    private getTabs = async () => {
        let { getOrder } = this.controller;
        this.tabs = this.oss.map((v: any) => {
            let { caption, state, icon, toolTip } = v;
            return {
                name: caption,
                caption: (selected: boolean) => TabCaptionComponent(caption, icon, color(selected)),
                content: () => {
                    return <span>无</span>
                    // return <List items={this.coupons} item={{ render: this.renderOrder }} none={none} />
                },
                isSelected: this.currentStatus === state,
                load: async () => {
                    this.currentStatus = state;
                    // this.order = await getOrder(this.currentStatus);
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
        if (this.startdate !== "" && this.enddate !== "" && this.starttimes > endtimes) {
            document.getElementById('tips').innerHTML = ("结束时间必须大于或等于开始时间！");
            evt.currentTarget.value = null
        } else {
            document.getElementById('tips').innerHTML = ("");
            this.enddate = evt.currentTarget.value;
        }

    }
    private renderbox = <form>
        <div className="mx-1 small mt-1">
            <label> 客户姓名：<input type="text" /></label>
            <label> 开始日期：<input type="date" onChange={this.onChangeStartdate} /></label>
            <label> 截至日期：<input type="date" onChange={this.onChangeEnddate} /></label> <input type="submit" value='搜索' />
            <p id="tips" style={{ color: "red" }}></p >

        </div>

    </form>

    private page = observer(() => {
        this.getTabs();
        let { onAdd } = this.controller;
        let right = (
            <div className="d-flex small">
                <div onClick={onAdd}>
                    <span className="mx-sm-2 iconfont icon-jiahao1 cursor-pointer mr-2" style={{ fontSize: "1.7rem", color: "white" }}></span>
                </div>
            </div>
        );
        return <Page right={right}>
            {this.renderbox}
            <div className="mt-2">
                <Tabs tabs={this.tabs} tabPosition="top" />
            </div>
        </Page>
    })

}



