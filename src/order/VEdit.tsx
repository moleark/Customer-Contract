import * as React from 'react';
import { Page, VPage, tv, LMR, List, FA } from 'tonva';
import { COrder } from './COrder';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { OrderItem } from './Order';
import { CartPackRow } from '../cart/Cart';
import classNames from 'classnames';
import { GLOABLE } from '../configuration';

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
    private renderCoupon = observer((param: any) => {
        let { couponAppliedData, hasAnyCoupon, removeCoupon } = this.controller;
        if (couponAppliedData['id'] === undefined) {
            let tip = hasAnyCoupon ? "有可用优惠卡/券，点击使用" : "输入优惠券/积分码";
            return <span className="text-primary">{tip}</span>;
        } else {
            let { code, types } = couponAppliedData;
            let { couponOffsetAmount, couponRemitted, point } = param;
            let offsetUI, remittedUI, noOffsetUI;
            let cancelCouponUI = <div
                className="position-absolute text-primary border text-center border-primary dropdown-menu-right rounded-circle"
                style={{ border: 1, cursor: 'pointer', width: 19, height: 19, lineHeight: 1, top: 5, right: 5 }}
                onClick={(e) => { e.stopPropagation(); removeCoupon(); }}
            >&times;</div>
            if (types === "credits") {
                offsetUI = <div className="d-flex flex-row justify-content-between">
                    <div className="text-muted">积分:</div>
                    <div className="text-right text-danger">{point}<small>分</small></div>
                </div>
            }
            else if (couponOffsetAmount || couponRemitted) {
                if (couponOffsetAmount) {
                    offsetUI = <div className="d-flex flex-row justify-content-between">
                        <div className="text-muted">折扣:</div>
                        <div className="text-right text-danger"><small>¥</small>{couponOffsetAmount.toFixed(2)}</div>
                    </div>
                }
                if (couponRemitted) {
                    remittedUI = <div className="d-flex flex-row justify-content-between">
                        <div className="text-muted">抵扣:</div>
                        <div className="text-right text-danger"><small>¥</small>{couponRemitted.toFixed(2)}</div>
                    </div>
                }
            } else {
                noOffsetUI = <div>谢谢惠顾</div>;
            }
            return <div className="mr-2 position-relative border-primary border px-3 py-1 rounded">
                <div className="text-success">{code.substr(0, 4)} {code.substr(4)}</div>
                {offsetUI}
                {remittedUI}
                {noOffsetUI}
                {cancelCouponUI}
            </div>
        }
    });
    private packsRow = (item: CartPackRow, index: number) => {
        let { pack, quantity, retail, price, priceInit } = item;

        let retailUI: any;
        if (price !== retail) {
            retailUI = <del>¥{retail * quantity}</del>;
        }
        return <div key={index} className="px-2 py-2 border-top">
            <div className="d-flex align-items-center">
                <div className="flex-grow-1"><b>{tv(pack)}</b></div>
                <div className="w-12c mr-4 text-right">
                    <small className="text-muted">{retailUI}</small>&nbsp; &nbsp;
                    <span className="text-danger h5"><small>¥</small>{parseFloat((price * quantity).toFixed(2))}</span>
                    <small className="text-muted">(¥{parseFloat(price.toFixed(2))} × {quantity})</small>
                </div>
            </div>
            <div>{this.controller.cApp.cOrder.renderDeliveryTime(pack)}</div>
        </div>;
    }
    private renderOrderItem = (orderItem: OrderItem) => {
        let { product, packs } = orderItem;
        let { packsRow } = this;
        return <div>
            <div className="row">
                <div className="col-lg-6 pb-3">{this.controller.cApp.cOrder.renderOrderItemProduct(product)}</div>
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
    private onSubmit = async () => {
        let { orderData } = this.controller.cApp.cOrder;
        // 必填项验证
        let { shippingContact, invoiceContact, invoiceType, invoiceInfo } = orderData;
        if (!shippingContact) {
            this.shippingAddressIsBlank = true;
            setTimeout(() => this.shippingAddressIsBlank = false, GLOABLE.TIPDISPLAYTIME);
            return;
        }
        if (!invoiceContact) {
            if (this.useShippingAddress) {
                orderData.invoiceContact = shippingContact; //contactBox;
                this.invoiceAddressIsBlank = false;
            } else {
                this.invoiceAddressIsBlank = true;
                setTimeout(() => this.invoiceAddressIsBlank = false, GLOABLE.TIPDISPLAYTIME);
                return;
            }
        }
        if (!invoiceType || !invoiceInfo) {
            this.invoiceIsBlank = true;
            setTimeout(() => this.invoiceIsBlank = false, GLOABLE.TIPDISPLAYTIME);
            return;
        }

        this.controller.cApp.cOrder.submitOrder();
    }
    private page = observer(() => {
        let { onInvoiceInfoEdit, onCouponEdit, orderData, onSelectInvoiceContact, onSelectShippingContact, cApp } = this.controller;
        let { showCustomerSelect } = cApp.cCustomer;
        let { showProductSelect } = cApp.cProduct;
        let { currentUser } = cApp;

        let footer = <div className="w-100 px-3 py-1" style={{ backgroundColor: "#f8f8f8" }}>
            <div className="d-flex justify-content-left">
                <div className="text-danger flex-grow-1" style={{ fontSize: '1.8rem' }}><small>¥</small>{orderData.amount}</div>
                <button type="button"
                    className={classNames('btn', 'w-30', { 'btn-danger': currentUser.allowOrdering, 'btn-secondary': !currentUser.allowOrdering })}
                    onClick={this.onSubmit} disabled={!currentUser.allowOrdering}>提交订单
            </button>
            </div>
        </div>;

        let chevronRight = <FA name="chevron-right" className="cursor-pointer" />
        let shippingAddressBlankTip = this.shippingAddressIsBlank ?
            <div className="text-danger small my-2"><FA name="exclamation-circle" /> 必须填写收货地址</div>
            : null;
        let invoiceAddressBlankTip = this.invoiceAddressIsBlank ?
            <div className="text-danger small my-2"><FA name="exclamation-circle" /> 必须填写发票地址</div> : null;

        let divInvoiceContact: any = null;
        if (this.useShippingAddress === false) {
            if (orderData.invoiceContact !== undefined) {
                divInvoiceContact = <div className="col-8 col-sm-10 offset-4 offset-sm-2 d-flex">
                    {tv(orderData.invoiceContact, undefined, undefined, this.nullContact)}
                    <div>{chevronRight}</div>
                </div>
            } else {
                divInvoiceContact = <div className="col-8 offset-4 offset-sm-2">
                    <button className="btn btn-outline-primary"
                        onClick={onSelectInvoiceContact}>选择发票地址</button>
                    {invoiceAddressBlankTip}
                </div>
            }
        }
        let invoiceContactUI = <div className="row py-3 bg-white mb-1">
            <div className="col-4 col-sm-2 pb-2 text-muted">发票地址:</div>
            <div className="col-8 col-sm-10">
                <div>
                    <label className="cursor-pointer">
                        <input type="checkbox"
                            defaultChecked={this.useShippingAddress}
                            onChange={e => {
                                this.useShippingAddress = e.currentTarget.checked;
                                orderData.invoiceContact = undefined;
                                this.invoiceAddressIsBlank = false;
                            }} /> 同收货地址
                </label>
                </div>
            </div>
            {divInvoiceContact}
        </div>

        let invoiceBlankTip = this.invoiceIsBlank ? <div className="text-danger small my-2"><FA name="exclamation-circle" /> 必须填写发票信息</div> : null;
        let invoiceInfoUI = <div className="row py-3 bg-white mb-1" onClick={onInvoiceInfoEdit}>
            <div className="col-4 col-sm-2 pb-2 text-muted">发票信息:</div>
            <div className="col-8 col-sm-10">
                <LMR className="w-100 align-items-center" right={chevronRight}>
                    {tv(orderData.invoiceType, (v) => <>{v.description}</>, undefined, () => <span className="text-primary">填写发票信息</span>)}
                    {tv(orderData.invoiceInfo, (v) => <> -- {v.title}</>, undefined, () => <></>)}
                    {invoiceBlankTip}
                </LMR>
            </div>
        </div>

        let freightFeeUI = <></>;
        let freightFeeRemittedUI = <></>;
        freightFeeUI = <>
            <div className="col-4 col-sm-2 pb-2 text-muted">运费:</div>
            <div className="col-8 col-sm-10 text-right text-danger"><small>¥</small></div>
        </>

        freightFeeRemittedUI = <>
            <div className="col-4 col-sm-2 pb-2 text-muted">运费减免:</div>
            <div className="col-8 col-sm-10 text-right text-danger"><small>¥</small></div>
        </>

        let couponUI = <div className="row py-3 bg-white mb-1" onClick={onCouponEdit}>
            <div className="col-4 col-sm-2 pb-2 text-muted">优惠卡券:</div>
            <div className="col-8 col-sm-10">
                <LMR className="w-100 align-items-center" right={chevronRight}>
                    {React.createElement(this.renderCoupon,
                        {
                            couponOffsetAmount: orderData.couponOffsetAmount,
                            couponRemitted: orderData.couponRemitted,
                            point: orderData.point
                        })}
                </LMR>
            </div>
        </div>

        return <Page header={'填写订单'} footer={footer}>
            <div className="px-2">
                <div className="row py-3 bg-white mb-1" onClick={showCustomerSelect}>
                    <div className="col-4 col-sm-2 pb-2 text-muted">客户信息:</div>
                    <div className="col-8 col-sm-10" >
                        <LMR className="w-100 align-items-center" right={chevronRight}>

                        </LMR>
                    </div>
                </div>
                <div className="row py-3 bg-white mb-1" onClick={onSelectShippingContact}>
                    <div className="col-4 col-sm-2 pb-2 text-muted">收货地址:</div>
                    <div className="col-8 col-sm-10">
                        <LMR className="w-100 align-items-center" right={chevronRight}>
                            {tv(orderData.shippingContact, undefined, undefined, this.nullContact)}
                        </LMR>
                        {shippingAddressBlankTip}
                    </div>
                </div>
                {invoiceContactUI}
                {invoiceInfoUI}
            </div>
            <List items={orderData.orderItems} item={{ render: this.renderOrderItem, key: this.orderItemKey as any }} />
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
                    <div className="col-8 col-sm-10 text-right"><small>¥</small></div>
                    {freightFeeUI}
                    {freightFeeRemittedUI}
                </div >
                {couponUI}
            </div>
        </Page>
    })
}



