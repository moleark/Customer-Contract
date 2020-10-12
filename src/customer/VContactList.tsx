import * as React from 'react';
import { VPage, Page } from 'tonva';
import { CSelectContact } from './CSelectContact';
import { List, LMR, FA } from 'tonva';
import { tv } from 'tonva';
import { observer } from 'mobx-react';

export class VContactList extends VPage<CSelectContact> {

    async open() {

        this.openPage(this.page);
    }

    private onContactRender = (contact: any) => {
        let { onEditContact, onContactSelected } = this.controller;
        let right = <div className="p-2 cursor-pointer text-info" onClick={() => onEditContact(contact)}>
            <FA name="edit" />
        </div>
        return <LMR right={right} className="px-3 py-2">
            <div onClick={() => onContactSelected(contact)}>
                {tv(contact)}
            </div>
        </LMR>
    }

    private page = observer(() => {
        let { onNewContact, userContacts } = this.controller;
        let footer = <button type="button" className="btn btn-primary w-100" onClick={() => onNewContact()} >添加新地址</button>;
        let contactList = <List items={userContacts} item={{ render: this.onContactRender }} none="无地址" />;
        return <Page footer={footer} header="管理地址">
            {contactList}
        </Page>
    })
}