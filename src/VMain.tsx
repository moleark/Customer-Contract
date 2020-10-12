import * as React from 'react';
import { VPage, TabCaptionComponent, Page } from 'tonva';
import { CApp } from 'CApp';

const color = (selected: boolean) => selected === true ? 'text-primary' : 'text-muted';

export class VMain extends VPage<CApp> {
    async open(param?: any) {
        this.openPage(this.render);
    }
    render = (param?: any): JSX.Element => {
        let { cMe, cHome, cCustomer } = this.controller;
        let faceTabs = [
            { name: 'home', label: '首页', icon: 'home', content: cHome.tab, notify: undefined },
            { name: 'member', label: '客户', icon: 'vcard', content: cCustomer.tab },
            { name: 'me', label: '我的', icon: 'user', content: cMe.tab, notify: undefined }
        ].map(v => {
            let { name, label, icon, content, notify } = v;
            return {
                name: name,
                caption: (selected: boolean) => TabCaptionComponent(label, icon, color(selected)),
                content: content,
                notify: notify,
            }
        });
        return <Page header={false} tabsProps={{ tabs: faceTabs }}>
        </Page >;
    }
}