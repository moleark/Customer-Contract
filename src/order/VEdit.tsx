import * as React from 'react';
import { Page, VPage, tv, LMR, List, FA, BoxId } from 'tonva';
import { COrder } from '../order/COrder';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import classNames from 'classnames';
import { GLOABLE } from '../configuration';
import { OrderItem } from './Order';
import { CartPackRow } from 'cart/Cart';
export class VEdit extends VPage<COrder> {
    @observable private useShippingAddress: boolean = true;
    @observable private shippingAddressIsBlank: boolean = false;
    @observable private invoiceAddressIsBlank: boolean = false;
    @observable private invoiceIsBlank: boolean = false;
    private productBox: BoxId;
    async open() {
        this.openPage(this.page);
    }

    private packsRow = (item: CartPackRow, index: number) => {
        let { plusQuantity, minusQuantity } = this.controller;
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
                    <div className='pt-3'>
                        <input type='button' value='-' onClick={() => minusQuantity(pack)} />
                        <input type="number" value={quantity} style={{ width: '25%' }} />
                        <input type='button' value='+' onClick={() => plusQuantity(pack)} />
                    </div>
                </div>

            </div>
            <div className='d-flex p-2'>{this.controller.renderDeliveryTime(pack)}</div>
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
                }
                </div>
            </div>
        </div>;
    }
    private orderItemKey = (orderItem: OrderItem) => {
        return orderItem.product.id;
    }
    private onSubmit = async () => {
        let { orderData, cApp } = this.controller;
        let { CustomerInfo } = cApp.cCustomer;
        let { id: customerid, unit, name, telephone, addressString, invoiceType, invoiceInfo } = CustomerInfo;
        // 必填项验证
        // let { shippingContact, invoiceContact, invoiceType, invoiceInfo } = orderData;
        if (!addressString) {
            this.shippingAddressIsBlank = true;
            setTimeout(() => this.shippingAddressIsBlank = false, GLOABLE.TIPDISPLAYTIME);
            return;
        }
        if (!addressString) {
            if (this.useShippingAddress) {
                // orderData.invoiceContact = shippingContact; //contactBox;
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

        this.controller.submitOrder();
    }

    private renderCoupon = observer((param: any) => {
        let { couponAppliedData, hasAnyCoupon, removeCoupon } = this.controller;
        if (couponAppliedData) {
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
        }
    });
    // private productvalue = () => { }
    private onChangeval = (evt: React.ChangeEvent<HTMLInputElement>) => {

    }
    private page = observer(() => {
        let { cApp, orderData } = this.controller;
        let { onShowCustomerSelect, onShowCustomerAddress, onInvoiceInfoEdit, onCouponEdit, CustomerInfo } = cApp.cCustomer;
        let { unit, name, addressString, mobile } = CustomerInfo;
        let { showProductSelect } = cApp.cProduct;
        let footer = <div className="w-100 px-3 py-1" style={{ backgroundColor: "#f8f8f8" }}>
            <div className="d-flex justify-content-left">
                <div className="text-danger flex-grow-1" style={{ fontSize: '1.8rem' }}><small>¥</small>
                    {(orderData && orderData.amount) ? orderData.amount : null}</div>
                <button type="button"
                    onClick={this.onSubmit}
                >提交订单
            </button>
            </div>
        </div>;
        let invoiceBlankTip = this.invoiceIsBlank ? <div className="text-danger small my-2"><FA name="exclamation-circle" /> 必须填写发票信息</div> : null;
        let chevronRight = <FA name="chevron-right" className="cursor-pointer" />
        let shippingAddressBlankTip = this.shippingAddressIsBlank ?
            <div className="text-danger small my-2"><FA name="exclamation-circle" /> 必须填写收货地址</div>
            : null;
        let invoiceContactUI = <div className="row py-3 bg-white mb-1" onClick={onShowCustomerAddress}>
            <div className="col-4 col-sm-2 pb-2 text-muted">发票地址:</div>
            <div className="col-8 col-sm-10">
                <LMR className="w-100 align-items-center" right={chevronRight}>
                    {tv(unit, s => s.name)} {addressString}
                </LMR>
                {shippingAddressBlankTip}
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

        let couponUI = <div className="row py-3 bg-white mb-1" onClick={onCouponEdit}>
            <div className="col-4 col-sm-2 pb-2 text-muted">优惠卡券:</div>
            <div className="col-8 col-sm-10">
                <LMR className="w-100 align-items-center" right={chevronRight}>
                    {React.createElement(this.renderCoupon,
                        {
                            couponOffsetAmount: (orderData) ? orderData.couponOffsetAmount : null,
                            couponRemitted: (orderData) ? orderData.couponRemitted : null,
                            point: (orderData) ? orderData.point : null
                        })}
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
                            {tv(unit, s => s.name)} {mobile} {addressString}
                        </LMR>
                        {shippingAddressBlankTip}
                    </div>
                </div>
                {invoiceContactUI}
                <div className="row py-3 bg-white mb-1" onClick={onInvoiceInfoEdit}>
                    <div className="col-4 col-sm-2 pb-2 text-muted">发票信息:</div>
                    <div className="col-8 col-sm-10">
                        <LMR className="w-100 align-items-center" right={chevronRight}>
                            {tv(CustomerInfo.invoiceType, (v) => <>{v.description}</>, undefined, () => <span className="text-primary">填写发票信息</span>)}
                            {tv(CustomerInfo.invoiceInfo, (v) => <> -- {v.title}</>, undefined, () => <></>)}
                            {invoiceBlankTip}
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




