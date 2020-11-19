import { observable, autorun, IReactionDisposer } from 'mobx';
import { Action, Query, TuidDiv, BoxId, Tuid } from 'tonva';
import { PackRow } from 'product/Product';
import { groupByProduct } from 'tools/groupByProduct';
import { CApp } from '../CApp';

export interface CartItem2 {
    product: BoxId;
    packs: CartPackRow[];
    $isSelected?: boolean;
    $isDeleted?: boolean;
    createdate: number;
}

export interface CartPackRow extends PackRow {
    /**
     * 销售成交价（在购物车中是目录价或市场活动价或协议价的最小值），订单中还会经过券的计算
     */
    price: number;

    /**
     * 订单中的初始销售成交价（订单中应用折扣券之前的价格）
     */
    priceInit?: number;
    /**
     * 订单中目录价
     */
    retail: number;
    currency: any;
}

export class Cart {
    cApp: CApp;

    private cartStore: CartStore;
    private disposer: IReactionDisposer;

    @observable data: any = {
        list: observable<CartItem2>([]),
    };
    cartItems: CartItem2[];
    count = observable.box<number>(0);
    amount = observable.box<number>(0);
    editButton = observable.box<boolean>(false);
    constructor(cApp: CApp) {
        this.cApp = cApp;
        this.cartItems = this.data.list;
        this.disposer = autorun(this.calcSum);
    }

    dispose() {
        this.disposer();
    }

    protected calcSum = () => {
        let count = 0, amount = 0;
        for (let cp of this.cartItems) {
            let { $isSelected, $isDeleted, packs } = cp;
            if ($isDeleted === true || !($isSelected === true)) continue;
            for (let pi of packs) {
                let { price, quantity } = pi;
                count += quantity;
                if (price === Number.NaN || quantity === Number.NaN) continue;
                amount += quantity * price;
            }
        }
        this.count.set(count);
        this.amount.set(parseFloat(amount.toFixed(2)));
    }

    async init(): Promise<void> {
        let { isLogined, uqs, currentSalesRegion } = this.cApp;
        // if (isLogined)
        //     this.cartStore = new CartRemote(this.cApp);
        // else
        this.cartStore = new CartLocal(this.cApp);
        let cartData = await this.cartStore.load();

        // 初始化购物车中产品的目录价
        let { product } = uqs;
        let { PriceX } = product;
        let promises: PromiseLike<void>[] = [];
        cartData.forEach((e: any) => promises.push(PriceX.obj({ product: e.product, pack: e.pack, salesRegion: currentSalesRegion })));
        let prices = await Promise.all(promises);
        for (let index = cartData.length - 1; index >= 0; index--) {
            let e: any = cartData[index];
            let priceMap: any = prices.find((v: any) => Tuid.equ(v.product, e.product)
                && Tuid.equ(v.pack, e.pack) && v.discountinued === 0 && v.expireDate > Date.now());
            if (priceMap && priceMap.retail) {
                e.retail = priceMap.retail;
            } else {
                cartData.splice(index, 1);
            }
        }

        let cartDataGrouped = groupByProduct(cartData);
        if (cartDataGrouped && cartDataGrouped.length > 0) {
            for (let i = 0; i < cartDataGrouped.length; i++) {
                let { product, packs, createdate } = cartDataGrouped[i];
                this.cartItems.push({
                    product: product,
                    packs: packs,
                    $isSelected: true,
                    $isDeleted: false,
                    createdate: createdate,
                })
            }
        }
    }



    // getQuantity(productId: number, packId: number): number {
    //     let cp = this.cartItems.find(v => v.$isDeleted !== true && Tuid.equ(v.product, productId));
    //     if (!cp) return 0;
    //     let cpp = cp.packs.find(v => v.pack.id === packId);
    //     return cpp === undefined ? 0 : cpp.quantity;
    // }

    isDeleted(productId: number): boolean {
        let i = this.cartItems.findIndex(v => v.$isDeleted === true && Tuid.equ(v.product, productId));
        return i !== -1;
    }

    getSelectedItems(): CartItem2[] {
        return this.cartItems.filter(v => {
            let { $isSelected, $isDeleted } = v;
            return $isSelected === true && $isDeleted !== true;
        });
    }

    /**
     *
     */
    add = async (product: BoxId, pack: BoxId, quantity: number, price: number, retail: number, currency: any) => {
        let cartItemExists = this.cartItems.find((e) => Tuid.equ(e.product, product));
        if (!cartItemExists) {
            cartItemExists = {
                product: product,
                packs: [{ pack: pack, quantity: quantity, price: price, retail: retail, currency: currency }],
                $isSelected: true,
                $isDeleted: false,
                createdate: Date.now()
            };
            this.cartItems.push(cartItemExists);
        }
        else {
            let { $isDeleted, packs } = cartItemExists;
            if ($isDeleted === true)
                packs.splice(0);

            let packExists: CartPackRow = packs.find(e => Tuid.equ(e.pack, pack));
            if (packExists === undefined) {
                let added = false;
                for (let index = packs.length - 1; index >= 0; index--) {
                    if (packs[index].price < price) {
                        packs.splice(index + 1, 0, { pack: pack, quantity: quantity, price: price, retail: retail, currency: currency });
                        added = true;
                        break;
                    }
                }
                if (!added)
                    packs.unshift({ pack: pack, quantity: quantity, price: price, retail: retail, currency: currency })
                // packs.push();
            }
            else {
                packExists.quantity = quantity;
                packExists.price = price;
                packExists.currency = currency;
            }
            cartItemExists.$isSelected = true;
            cartItemExists.$isDeleted = false;
            cartItemExists.createdate = Date.now();
        }
        // if (this.cartStore)
        //     await this.cartStore.storeCart(product, pack, quantity, price, currency);
    }
    removeStrike = async (data: any) => {
        console.log(data);
        // data.forEach((el: CartItem2) => {
        //     el.packs.forEach(async (v: any) => {
        //         await this.cartStore.storeCart(el.product, v.pack, v.quantity, v.price, v.currency);
        //     })
        // });
    }

    /**
     *
     * @param rows 
     */
    async removeFromCart(rows: [{ productId: number, packId: number }]) {
        if (rows && rows.length > 0) {
            rows.forEach(pe => {
                let cartItemIndex = this.cartItems.findIndex(e => e.product.id === pe.productId);
                if (cartItemIndex >= 0) {
                    let cartItem = this.cartItems[cartItemIndex];
                    let i = cartItem.packs.findIndex(e => e.pack.id === pe.packId)
                    if (i >= 0) {
                        cartItem.packs.splice(i, 1);
                        if (cartItem.packs.length === 0) {
                            this.cartItems.splice(cartItemIndex, 1);
                        }
                    }
                }
            })
            if (this.cartStore)
                this.cartStore.removeFromCart(rows);
        }
    }
}

abstract class CartStore {

    protected cApp: CApp;
    constructor(cApp: CApp) {
        this.cApp = cApp;
    }
    abstract get isLocal(): boolean;
    abstract async load(): Promise<CartItem2[]>;
    abstract async storeCart(product: BoxId, pack: BoxId, quantity: number, price: number, currency: any): Promise<void>;
    abstract async removeFromCart(rows: [{ productId: number, packId: number }]): Promise<void>;
}

const LOCALCARTNAME: string = "cart";
class CartLocal extends CartStore {

    private cartData: any[] = [];
    private productTuid: Tuid;
    private packTuid: TuidDiv;
    constructor(cApp: CApp) {
        super(cApp);

        this.productTuid = this.cApp.uqs.product.ProductX;
        this.packTuid = this.productTuid.div('packx');
    }

    get isLocal(): boolean { return true }

    async load(): Promise<CartItem2[]> {
        try {
            let cartstring = localStorage.getItem(LOCALCARTNAME);
            if (cartstring === null) return [];
            this.cartData = JSON.parse(cartstring);
            let cartDataBoxed = [];
            for (let i = 0; i < this.cartData.length; i++) {
                let { product, pack, quantity, price, currency } = this.cartData[i];
                let productbox = this.productTuid.boxId(product);
                let packbox = this.packTuid.boxId(pack);
                cartDataBoxed.push({
                    product: productbox,
                    pack: packbox,
                    quantity: quantity,
                    price: price,
                    currency: currency
                } as any)
            }
            return cartDataBoxed;
        }
        catch (e) {
            localStorage.removeItem(LOCALCARTNAME);
            this.cartData = [];
            return this.cartData;
        }
    }

    async storeCart(product: BoxId, pack: BoxId, quantity: number, price: number, currency: any) {
        let cartItemExists = this.cartData.find(e => Tuid.equ(e.product, product) && TuidDiv.equ(e.pack, pack));
        if (cartItemExists !== undefined) {
            cartItemExists.quantity = quantity;
            cartItemExists.price = price;
            cartItemExists.currency = currency && currency.id;
        } else
            this.cartData.push({ product: product.id, pack: pack.id, quantity: quantity, price: price, currency: currency && currency.id });
        localStorage.setItem(LOCALCARTNAME, JSON.stringify(this.cartData));
    }

    async removeFromCart(rows: [{ productId: number, packId: number }]) {

        rows.forEach(e => {
            let i = this.cartData.findIndex(v => v.product = e.productId && v.pack === e.packId);
            if (i >= 0)
                this.cartData.splice(i, 1);
        })
        localStorage.setItem(LOCALCARTNAME, JSON.stringify(this.cartData));
    }
}