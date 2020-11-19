import * as React from 'react';
import { VPage, Page, BoxId, EasyDate } from 'tonva';
import { CCustomer } from './CCustomer';
import { tv } from 'tonva';
import { List } from 'tonva';
import { OrderItem } from '../order/Order';
import { CartItem2 } from 'cart/Cart';
import { webuser } from 'tvs/webuser';

export class VOrderDetail extends VPage<CCustomer> {

    async open(order: any) {

        this.openPage(this.page, order);
    }


    private packsRow = (item: any, index: number) => {
        let { pack, quantity, price, currency } = item;

        return <div key={index} className="px-2 py-2 border-top">
            <div className="d-flex align-items-center">
                <div className="flex-grow-1"><b>{tv(pack.obj, v => v.radioy)}{tv(pack.obj, v => v.unit)}</b></div>
                <div className="w-12c mr-4 text-right">
                    <span className="text-danger h5"><small>¥</small>{parseFloat((price * quantity).toFixed(2))}</span>
                    <small className="text-muted">(¥{parseFloat(price.toFixed(2))} × {quantity})</small>
                </div>
            </div>
        </div>;
    }

    private renderOrderItem = (orderItem: OrderItem) => {
        let { product, packs } = orderItem;
        let { controller, packsRow } = this;
        return <div>
            <div className="row p-1 my-1">
                <div className="col-lg-6 pb-3">{controller.renderOrderItemProduct(product)}</div>
                <div className="col-lg-6">{
                    packs.map((p, index) => {
                        return packsRow(p, index);
                    })
                }</div>
            </div>
        </div>;
    }
    orderAgain = async (data: any) => {
        let { cOrder } = this.controller.cApp;
        let { orderItems } = data;

        orderItems = orderItems.map((el: CartItem2) => {
            return {
                product: el.product,
                packs: el.packs,
                $isDeleted: false,
                $isSelected: true,
                createdate: 'undefined'
            }
        })
        data = data.orderItems
        // console.log('orderItems', orderItems);
        await cOrder.createOrderFromCart(data)
    }
    private page = (order: any) => {

        let { brief, data } = order;
        let { id, no, state, description, date } = brief;
        let { orderItems, currency, shippingContact, invoiceContact, invoiceType, invoiceInfo, amount, couponOffsetAmount, couponRemitted
            , freightFee, freightFeeRemitted, adress, webUser, addressString, name, mobile } = data;
        let couponUI;
        if (couponOffsetAmount || couponRemitted) {
            let offsetUI, remittedUI;
            if (couponOffsetAmount) {
                offsetUI = <div className="d-flex flex-row justify-content-between">
                    <div className="text-muted">折扣:</div>
                    <div className="text-right text-danger"><small>¥</small>{couponOffsetAmount}</div>
                </div>
            }
            if (couponRemitted) {
                remittedUI = <div className="d-flex flex-row justify-content-between">
                    <div className="text-muted">抵扣:</div>
                    <div className="text-right text-danger"><small>¥</small>{couponRemitted}</div>
                </div>
            }
            couponUI = <div className="bg-white row no-gutters p-3 my-1">
                <div className="col-3 text-muted">优惠券:</div>
                <div className="col-9">
                    {offsetUI}
                    {remittedUI}
                </div>
            </div>
        }

        let freightFeeUI, freightFeeRemittedUI;
        if (freightFee) {
            freightFeeUI = <>
                <div className="text-right text-danger"><small>¥</small>{freightFee}</div>
            </>
            if (freightFeeRemitted) {
                freightFeeRemittedUI = <>
                    <div className="text-right text-danger"><small>¥</small>{freightFeeRemitted}(减免)</div>
                </>
            }
        }
        let orderAgainUI = <div className="d-flex justify-content-center">
            <button className="btn btn-primary w-10" onClick={async () => { this.orderAgain(order.data) }}>修改订单</button>
        </div>

        let header = <>订单详情: {no}</>
        return <Page header={header} footer={<></>}>
            <List items={orderItems} item={{ render: this.renderOrderItem }} />
            <div className="bg-white row no-gutters py-2 px-3 my-1">
                <div className="col-3 text-muted">姓名:</div>
                <div className="col-9 text-muted">{tv(webUser, v => v.firstName)}</div>
            </div>
            <div className="bg-white row no-gutters p-3 my-1">
                <div className="col-3 text-muted">收货地址:</div>
                <div className="col-9">
                    {tv(shippingContact, (v) => <>{v.name}{v.organizationName}{v.mobile}{v.addressString}</>)}
                </div>
            </div>
            <div className="bg-white row no-gutters p-3 my-1">
                <div className="col-3 text-muted">发票地址:</div>
                <div className="col-9">{tv(invoiceContact)}</div>
            </div>
            <div className="bg-white row no-gutters p-3 my-1">
                <div className="col-3 text-muted">发票信息:</div>
                <div className="col-9">{invoiceTemplate(invoiceType, invoiceInfo)}</div>
            </div>
            <div className="bg-white row no-gutters p-3 my-1">
                <div className="col-3 text-muted">运费:</div>
                <div className="col-9">{freightFeeUI}{freightFeeRemittedUI}</div>
            </div>
            {couponUI}
            <div className="bg-white row no-gutters p-3 my-1">
                <div className="col-3 text-muted">下单时间:</div>
                <div className="col-9 text-right"><EasyDate date={date} /></div>
            </div>
            <div className="bg-white p-3 my-1 text-right">
                <span className="text-danger font-weight-bold">总金额: {amount}{tv(currency)}</span>
            </div>
            {/* {orderAgainUI} */}
        </Page>
    }
}

function invoiceTemplate(invoiceType: BoxId, invoiceInfo: BoxId): JSX.Element {
    return <>
        {tv(invoiceType, invoiceTypeUI, undefined, () => <></>)}<br />
        {tv(invoiceInfo, invoiceInfoUI, undefined, () => <></>)}
    </>
}

function invoiceTypeUI(values: any) {
    let { id, description } = values;
    return <>{description}</>;
}

function invoiceInfoUI(values: any) {
    let { id, title, taxNo, address, telephone, bank, accountNo } = values;
    return <>{title}</>;
}