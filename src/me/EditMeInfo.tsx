import * as React from 'react';
import { observable } from 'mobx';
import {
    userApi, ItemSchema, StringSchema, ImageSchema, UiTextItem, UiImageItem, nav, Page,
    Edit, UiSchema,
    VPage, UiRadio, IdSchema, UiIdItem, Context, BoxId, tv
} from 'tonva';
import { CMe } from './CMe';
import {
    faxValidation, emailValidation, mobileValidation, telephoneValidation,
    addressDetailValidation, zipCodeValidation,
    organizationNameValidation, departmentNameValidation,
    salutationValidation, nameValidation
} from '../tools/inputValidations';

export class EditMeInfo extends VPage<CMe>{

    async open(param: any) {
        this.openPage(this.page);
    }

    private schema: ItemSchema[] = [
        { name: 'nick', type: 'string' } as StringSchema,
        { name: 'icon', type: 'image' } as ImageSchema,
    ];
    private uiSchema: UiSchema = {
        items: {
            nick: { widget: 'text', label: '别名', placeholder: '好的别名更方便记忆' } as UiTextItem,
            icon: { widget: 'image', label: '头像' } as UiImageItem,
        }
    }
    @observable private data: any;

    constructor(props: any) {
        super(props);
        let { nick, icon } = nav.user;
        this.data = {
            nick: nick,
            icon: icon,
        };
    }

    private onItemChanged = async (itemSchema: ItemSchema, newValue: any, preValue: any) => {
        let { name } = itemSchema;
        await userApi.userSetProp(name, newValue);
        this.data[name] = newValue;
        (nav.user as any)[name] = newValue;
        nav.saveLocalUser();
    }

    private page = () => {
        let { schema, uiSchema, data, onItemChanged } = this;
        return <Page header="个人信息">
            <Edit schema={schema} uiSchema={uiSchema}
                data={data}
                onItemChanged={onItemChanged} />
        </Page>;
    }
}

export const webUserSchema: ItemSchema[] = [
    { name: 'firstName', type: 'string', required: true } as StringSchema,
    { name: 'gender', type: 'string' } as StringSchema,
    { name: 'salutation', type: 'string' } as StringSchema,
    { name: 'organizationName', type: 'string', required: true } as StringSchema,
    { name: 'departmentName', type: 'string' } as StringSchema,
];

export const webUserUiSchema: UiSchema = {
    items: {
        firstName: {
            widget: 'text', label: '真实姓名',
            placeholder: '真实姓名',
            rules: nameValidation
        } as UiTextItem,
        gender: { widget: 'radio', label: '性别', list: [{ value: '1', title: '男' }, { value: '0', title: '女' }] } as UiRadio,
        salutation: { widget: 'text', label: '称谓', rules: salutationValidation } as UiTextItem,
        organizationName: { widget: 'text', label: '单位名称', placeholder: '单位名称', rules: organizationNameValidation } as UiTextItem,
        departmentName: { widget: 'text', label: '部门名称', placeholder: '部门名称', rules: departmentNameValidation } as UiTextItem,
    }
}

// 个人联系方式信息
export const webUserContactSchema: ItemSchema[] = [
    { name: 'telephone', type: 'string' } as StringSchema,
    { name: 'mobile', type: 'string', required: true } as StringSchema,
    { name: 'email', type: 'string' } as StringSchema,
    { name: 'fax', type: 'string', required: false } as StringSchema,
    { name: 'address', type: 'id', required: false } as IdSchema,
    { name: 'addressString', type: 'string', required: false } as StringSchema,
    { name: 'zipCode', type: 'string', required: false } as StringSchema,
];

export function webUserContactUiSchema(pickAddress: any) {
    return {
        items: {
            telephone: { widget: 'text', label: '固定电话', placeholder: '固定电话', rules: telephoneValidation } as UiTextItem,
            mobile: { widget: 'text', label: '手机号', placeholder: '手机号', rules: mobileValidation } as UiTextItem,
            email: { widget: 'text', label: 'Email', rules: emailValidation, placeholder: 'Email' } as UiTextItem,
            fax: { widget: 'text', label: '传真', placeholder: '传真', rules: faxValidation } as UiTextItem,
            address: {
                widget: 'id', label: '所在地区', placeholder: '所在地区',
                pickId: async (context: Context, name: string, value: number) => await pickAddress(context, name, value),
                Templet: (address: BoxId) => {
                    if (!address) return <small className="text-muted">(无)</small>;
                    return tv(address, (addressValue) => {
                        let { country, province, city, county } = addressValue;
                        /* 下面这种在使用tv之前的一堆判断应该是tv或者什么的有bug, 应该让Henry改改 */
                        return <>
                            {country !== undefined && country.id !== undefined && tv(country, v => <>{v.chineseName}</>)}
                            {province !== undefined && province.id !== undefined && tv(province, (v) => <>{v.chineseName}</>)}
                            {city !== undefined && city.id !== undefined && tv(city, (v) => <>{v.chineseName}</>)}
                            {county !== undefined && county.id !== undefined && tv(county, (v) => <>{v.chineseName}</>)}
                        </>;
                    }, () => {
                        return <small className="text-muted">请选择地区</small>;
                    })
                }
            } as UiIdItem,
            addressString: { widget: 'text', label: '详细地址', placeholder: '详细地址', rules: addressDetailValidation } as UiTextItem,
            zipCode: { widget: 'text', label: '邮编', placeholder: '邮编', rules: zipCodeValidation } as UiTextItem,
        }
    }
}