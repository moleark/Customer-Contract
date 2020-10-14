import * as React from 'react';
import { observer } from 'mobx-react';
import { VPage, Page, Form, ObjectSchema, NumSchema, ArrSchema, UiSchema, UiArr, FormField, UiCustom } from 'tonva';
import { FA } from 'tonva';
import { tv } from 'tonva';
import { MinusPlusWidget } from '../tools/minusPlusWidget';
import { CCart } from './CCart';
import { CartPackRow, CartItem2 } from './Cart';

const cartSchema = [
    {
        name: 'list',
        type: 'arr',
        arr: [
            { name: 'checked', type: 'boolean' },
            { name: 'product', type: 'object' } as ObjectSchema,
            {
                name: 'packs', type: 'arr', arr: [
                    { name: 'pack', type: 'object' } as ObjectSchema,
                    { name: 'price', type: 'number' } as NumSchema,
                    { name: 'retail', type: 'number' } as NumSchema,
                    { name: 'quantity', type: 'number' } as NumSchema,
                    { name: 'currency', type: 'object' } as ObjectSchema
                ]
            }
        ],
    } as ArrSchema
];

export class VCart extends VPage<CCart> {
    async open() {
        this.openPage(this.page);
    }

    protected CheckOutButton = observer(() => {
        let { checkOut, strikeOut, cApp } = this.controller;
        let { cart } = cApp;
        let amount = cart.amount.get();
        let check = cart.editButton.get() ? '删除' : "添加订单列表";
        let content = cart.editButton.get() ? <>{check}</> : amount > 0 ?
            <>{check} (¥{amount})</> :
            <>{check}</>;
        if (cart.editButton.get()) {
            return <div className="d-flex justify-content-end">
                <button className="btn btn-success w-25 mx-5"
                    type="button"
                    onClick={strikeOut}>
                    {content}
                </button>
            </div>;
        } else {
            return <div className="d-flex justify-content-center">
                <button className="btn btn-success w-75 mx-5"
                    type="button"
                    onClick={checkOut} disabled={amount <= 0}>
                    {content}
                </button>
            </div>;
        }
    });

    private renderCartItem = (item: CartItem2) => {
        let { product } = item;
        let { controller } = this;
        let { onProductClick, renderCartProduct } = controller;
        return <div className="pr-1">
            <div className="row">
                <div className="col-lg-6 pb-3" onClick={() => onProductClick(product)}>
                    {renderCartProduct(product)}
                </div>
                <div className="col-lg-6"><FormField name="packs" /></div>
            </div>
        </div>;
    }

    private packsRow = (item: CartPackRow) => {
        let { pack, price, currency } = item;

        return <div className="px-2">
            <div className="d-flex align-items-center">
                <div className="flex-grow-1"><b>{tv(pack.obj, v => v.radioy)}{tv(pack.obj, v => v.unit)}</b></div>
                <div className="w-6c mr-4 text-right"><span className="text-danger h5">¥{price}</span></div>
                <FormField name="quantity" />
            </div>
            <div>{this.controller.renderDeliveryTime(pack)}</div>
        </div>;
    }

    private uiSchema: UiSchema = {
        selectable: true,
        deletable: true,
        restorable: true,
        items: {
            list: {
                widget: 'arr',
                Templet: this.renderCartItem,
                ArrContainer: (label: any, content: JSX.Element) => content,
                RowContainer: (content: JSX.Element) => <div className="py-3">{content}</div>,
                items: {
                    packs: {
                        widget: 'arr',
                        Templet: this.packsRow,
                        selectable: false,
                        deletable: false,
                        ArrContainer: (label: any, content: JSX.Element) => content,
                        RowContainer: (content: JSX.Element) => content,
                        RowSeperator: <div className="border border-gray border-top my-3" />,
                        items: {
                            quantity: {
                                widget: 'custom',
                                className: 'text-center',
                                WidgetClass: MinusPlusWidget as any,
                                onChanged: this.controller.onQuantityChanged
                            } as UiCustom
                        },
                    } as UiArr
                }
            } as UiArr
        }
    }

    protected cartForm = observer(() => {
        let { cart } = this.controller.cApp;
        let { data: cartData } = cart;
        return <Form className="bg-white flex-fill overflow-auto" schema={cartSchema} uiSchema={this.uiSchema} formData={cartData} />
    });

    private empty() {
        return <div className="py-5 text-center bg-white">你的购物车空空如也</div>
    }

    private page = observer((params: any): JSX.Element => {
        let { cart } = this.controller.cApp;
        let footer: any, content: any;
        if (cart.count.get() === 0 && cart.cartItems.length === 0) {
            content = this.empty();
            footer = undefined;
        }
        else {
            content = React.createElement(this.cartForm);
            footer = React.createElement(this.CheckOutButton);
        }
        return <Page header="购物车" footer={footer}>
            {content}
        </Page>;
    })
}