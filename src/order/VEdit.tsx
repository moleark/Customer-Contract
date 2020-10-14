import * as React from 'react';
import { Page, VPage, tv, LMR, List, FA } from 'tonva';
import { COrder } from '../order/COrder';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
// import { OrderItem } from './Order';
// import { CartPackRow } from '../cart/Cart';
import classNames from 'classnames';
import { GLOABLE } from '../configuration';
import { OrderItem } from './Order';
import { CartPackRow } from 'cart/Cart';

export class VEdit extends VPage<COrder> {
    @observable private useShippingAddress: boolean = true;
    @observable private shippingAddressIsBlank: boolean = false;
    @observable private invoiceAddressIsBlank: boolean = false;
    @observable private invoiceIsBlank: boolean = false;
    async open() {
        this.openPage(this.page);
    }
    private nullContact = () => {
        return <span className="text-primary">选择收货地址</span>;
    }
    private packsRow = (item: CartPackRow, index: number) => {
        let { pack, quantity, retail, price, priceInit } = item;

        let retailUI: any;
        if (price !== retail) {
            retailUI = <del>¥{retail * quantity}</del>;
        }
        return <div key={index} className="px-2 py-2 border-top">
            <div className="d-flex align-items-center">
                <div className="flex-grow-1"><b>{tv(pack.obj, v => v.radioy)}{tv(pack.obj, v => v.unit)}</b></div>
                <div className="w-12c mr-4 text-right">
                    <small className="text-muted">{retailUI}</small>&nbsp; &nbsp;
                    <span className="text-danger h5"><small>¥</small>{parseFloat((price * quantity).toFixed(2))}</span>
                    <small className="text-muted">(¥{parseFloat(price.toFixed(2))} × {quantity})</small>
                </div>
            </div>
            <div>{this.controller.renderDeliveryTime(pack)}</div>
        </div>;
    }
    private renderOrderItem = (orderItem: OrderItem) => {
        let { product, packs } = orderItem;
        let { packsRow } = this;
        return <div>
            <div className="row">
                <div className="col-lg-6 pb-3">{this.controller.renderOrderItemProduct(product)}</div>
                <div className="col-lg-6">{
                    packs.map((p, index) => {
                        return packsRow(p, index);
                    })
                }</div>
            </div>
        </div>;
    }
    private orderItemKey = (orderItem: OrderItem) => {
        return orderItem.product.id;
    }
    private page = observer(() => {
        let { cApp, orderData } = this.controller;
        let { onShowCustomerSelect, onShowCustomerAddress, goalCustomerInfo, } = cApp.cCustomer;
        let { name, addressString } = goalCustomerInfo;
        let { showProductSelect } = cApp.cProduct;

        let footer = <div className="w-100 px-3 py-1" style={{ backgroundColor: "#f8f8f8" }}>
            <div className="d-flex justify-content-left">
                <div className="text-danger flex-grow-1" style={{ fontSize: '1.8rem' }}><small>¥</small>
                    {(orderData && orderData.amount) ? orderData.amount : null}</div>
                <button type="button"
                // className={classNames('btn', 'w-30', { 'btn-danger': currentUser.allowOrdering, 'btn-secondary': !currentUser.allowOrdering })}
                //     onClick={this.onSubmit} disabled={!currentUser.allowOrdering}
                >提交订单
            </button>
            </div>
        </div>;

        let chevronRight = <FA name="chevron-right" className="cursor-pointer" />

        let invoiceContactUI = <div className="row py-3 bg-white mb-1">
            <div className="col-4 col-sm-2 pb-2 text-muted">发票地址:</div>
            <div className="col-8 col-sm-10">
                <div>
                    <label className="cursor-pointer">

                    </label>
                </div>
            </div>
        </div>

        let freightFeeUI = <></>;
        let freightFeeRemittedUI = <></>;
        if (orderData && orderData.freightFee) {
            freightFeeUI = <>
                <div className="col-4 col-sm-2 pb-2 text-muted">运费:</div>
                <div className="col-8 col-sm-10 text-right text-danger"><small>¥</small>{orderData.freightFee}</div>
            </>
            if (orderData.freightFeeRemitted) {
                freightFeeRemittedUI = <>
                    <div className="col-4 col-sm-2 pb-2 text-muted">运费减免:</div>
                    <div className="col-8 col-sm-10 text-right text-danger"><small>¥</small>{orderData.freightFeeRemitted}</div>
                </>
            }
        }

        freightFeeUI = <>
            <div className="col-4 col-sm-2 pb-2 text-muted">运费:</div>
            <div className="col-8 col-sm-10 text-right text-danger"><small>¥</small></div>
        </>

        let couponUI = <div className="row py-3 bg-white mb-1">
            <div className="col-4 col-sm-2 pb-2 text-muted">优惠卡券:</div>
            <div className="col-8 col-sm-10">
                <LMR className="w-100 align-items-center" right={chevronRight}>

                </LMR>
            </div>
        </div>;

        return <Page header={'填写订单'} footer={footer}>

            <div className="px-2">
                <div className="row py-3 bg-white mb-1" onClick={onShowCustomerSelect}>
                    <div className="col-4 col-sm-2 pb-2 text-muted">客户信息:</div>
                    <div className="col-8 col-sm-10" >
                        <LMR className="w-100 align-items-center" right={chevronRight}>
                            {name}
                        </LMR>
                    </div>
                </div>
                <div className="row py-3 bg-white mb-1" onClick={onShowCustomerAddress}>
                    <div className="col-4 col-sm-2 pb-2 text-muted">收货地址:</div>
                    <div className="col-8 col-sm-10">
                        <LMR className="w-100 align-items-center" right={chevronRight}>
                            {addressString}
                        </LMR>
                        {/* {shippingAddressBlankTip} */}
                    </div>
                </div>
                {invoiceContactUI}
                <div className="row py-3 bg-white mb-1" >
                    <div className="col-4 col-sm-2 pb-2 text-muted">发票信息:</div>
                    <div className="col-8 col-sm-10">
                        <LMR className="w-100 align-items-center" right={chevronRight}>

                        </LMR>
                    </div>
                </div>
            </div>
            {(orderData && orderData.orderItems) ? <List items={orderData.orderItems} item={{ render: this.renderOrderItem, key: this.orderItemKey as any }} /> : null}
            <div className="px-2">
                <div className="row py-3 bg-white mb-1" onClick={showProductSelect}>
                    <div className="col-4 col-sm-2 pb-2 text-muted">添加产品</div>
                    <div className="col-8 col-sm-10">
                        <LMR className="w-100 align-items-center" right={chevronRight}>
                        </LMR>
                    </div>
                </div>
            </div>
            <div className="px-2">
                <div className="row py-3 pr-3 bg-white my-1">
                    <div className="col-4 col-sm-2 pb-2 text-muted">商品总额:</div>
                    <div className="col-8 col-sm-10 text-right"><small>¥</small>{(orderData && orderData.productAmount) ? orderData.productAmount : null}</div>
                    {freightFeeUI}
                    {freightFeeRemittedUI}
                </div >
                {couponUI}
            </div>
        </Page>
    })
}




