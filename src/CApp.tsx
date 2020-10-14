import { nav, User } from 'tonva';
// import { UQs } from 'uqs';
import { VMain } from 'VMain';
import { CUqApp } from 'CBase'
import { WebUser } from './currentUser';
import { CMe } from 'me/CMe';
import { CHome } from 'home/CHome';
import { CCustomer } from "customer/CCustomer";
import { CCustomerUnit } from "./customerunit/CCustomerUnit";
import { COrder } from 'order/COrder';
// import { CCoupon } from 'coupon/CCoupon';
import { CProduct } from 'product/CProduct';
import { GLOABLE } from 'configuration';
import { res } from 'res';
import { Cart } from "./cart/Cart";
import { CCart } from "./cart/CCart";

export class CApp extends CUqApp {

    cart: Cart;
    topKey: any;
    currentSalesRegion: any;
    currentLanguage: any;

    currentUser: WebUser;
    cMe: CMe;
    cHome: CHome;
    cCustomer: CCustomer;
    cCustomerUnit: CCustomerUnit;
    cOrder: COrder;
    // cCoupon: CCoupon;
    cProduct: CProduct;
    cCart: CCart;

    private setUser() {
        this.currentUser = new WebUser(this.uqs); //this.cUqWebUser, this.cUqCustomer);
        if (this.isLogined) {
            this.currentUser.setUser(this.user);
        }
    }

    protected async internalStart() {

        let { uqs } = this;
        let { common } = uqs;
        let { SalesRegion, Language } = common;
        let [currentSalesRegion, currentLanguage] = await Promise.all([
            SalesRegion.load(GLOABLE.SALESREGION_CN),
            Language.load(GLOABLE.CHINESE),
        ]);
        this.currentSalesRegion = currentSalesRegion;
        this.currentLanguage = currentLanguage;
        this.setUser();
        this.setRes(res);
        this.cart = new Cart(this);
        await this.cart.init();

        this.cHome = this.newC(CHome);
        this.cMe = this.newC(CMe);
        this.cCustomer = this.newC(CCustomer);
        this.cCustomerUnit = this.newC(CCustomerUnit);
        this.cOrder = this.newC(COrder);
        // this.cCoupon = this.newC(CCoupon);
        this.cProduct = this.newC(CProduct);
        this.cCart = this.newC(CCart);

        this.topKey = nav.topKey();

        this.showMain();
    }

    showMain(initTabName?: string) {
        this.openVPage(VMain, initTabName);
    }
    protected onDispose() {
        // this.cart.dispose();
    }
    async loginCallBack(user: User) {

    }
}
