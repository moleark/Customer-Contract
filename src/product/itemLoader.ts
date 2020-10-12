import _ from 'lodash';
import { ProductPackRow } from './Product';
import { Loader } from '../mainSubs/loader';
import { MainSubs, MainProductChemical, MainBrand } from '../mainSubs';
import { LoaderProductChemical } from '../tools/productChemical';

export class LoaderBrand extends Loader<MainBrand> {
    protected async loadToData(brandId: number, data: MainBrand): Promise<void> {
        let brand = await this.cApp.uqs.product.Brand.load(brandId);
        data.id = brand.id;
        data.name = brand.name;
    }

    protected initData(): MainBrand {
        return {} as MainBrand;
    }
}

export class LoaderProductWithChemical extends Loader<MainProductChemical> {

    protected async loadToData(productId: number, data: MainProductChemical): Promise<void> {

        let { cApp } = this;
        let { currentUser, uqs } = cApp;
        let { product: productUq, webuser } = uqs;
        let product = await productUq.ProductX.load(productId);
        if (product === undefined)
            return;
        _.merge(data, product);

        let brandLoader = new LoaderBrand(this.cApp);
        data.brand = await brandLoader.load(data.brand.id);

        let productChemicalLoader = new LoaderProductChemical(this.cApp);
        let productChemical: any = await productChemicalLoader.load(productId);
        if (productChemical) {
            let { chemical, purity, CAS, molecularFomula, molecularWeight } = productChemical;
            data.chemical = chemical;
            data.purity = purity;
            data.CAS = CAS;
            data.molecularFomula = molecularFomula;
            data.molecularWeight = molecularWeight;
        }

        data.packs = [];
        product.packx.forEach((e: any) => {
            data.packs.push(e);
        });
    }

    protected initData(): MainProductChemical {
        return {} as MainProductChemical;
    }
}

export class LoaderProductChemicalWithPrices extends Loader<MainSubs<MainProductChemical, ProductPackRow>> {

    protected initData(): MainSubs<MainProductChemical, ProductPackRow> {
        return { main: {} as MainProductChemical, subs: [] as ProductPackRow[] };
    }

    protected async loadToData(productId: any, data: MainSubs<MainProductChemical, ProductPackRow>): Promise<void> {
        let { customerDiscount, product, promotion } = this.cApp.uqs;
        let productLoader = new LoaderProductWithChemical(this.cApp);
        data.main = await productLoader.load(productId);

        let discount = 0;
        let { currentUser, currentSalesRegion, currentLanguage } = this.cApp;
        //线上客户是否是线下客户 协议折扣  discount   cart,
        if (currentUser.hasCustomer) {
            let discountSetting = await customerDiscount.GetDiscount.obj({ brand: data.main.brand.id, customer: currentUser.currentCustomer });
            if (discountSetting && discountSetting.discount)
                discount = discountSetting.discount;
        }

        // 协议客户与vip客户不同存
        if (currentUser.webUserVIPCard !== undefined) {
            let brandDiscounts = currentUser.VIPDiscount;
            let brandDiscount = brandDiscounts.ret.find((e: any) => e.brand.id === data.main.brand.id);
            // 协议与vip折扣比较 取其大值  (两者不可同存)
            if (brandDiscount && brandDiscount.discount > discount)
                discount = brandDiscount && brandDiscount.discount;
        }

        let { id: currentSalesRegionId } = currentSalesRegion;
        let prices = await product.PriceX.table({ product: productId, salesRegion: currentSalesRegionId });
        data.subs = prices.filter(e => e.discountinued === 0 && e.expireDate > Date.now()).sort((a, b) => a.retail - b.retail).map(element => {
            let ret: any = {};
            ret.pack = element.pack;
            ret.retail = element.retail;
            if (discount !== 0)
                ret.vipPrice = Math.round(element.retail * (1 - discount));
            ret.currency = currentSalesRegion.currency;
            // ret.quantity = cart.getQuantity(productId, element.pack.id)
            return ret;
        });

        let promises: PromiseLike<any>[] = [];
        data.subs.forEach(v => {
            promises.push(promotion.GetPromotionPack.obj({ product: productId, pack: v.pack, salesRegion: currentSalesRegion, language: currentLanguage }));
        })
        let results = await Promise.all(promises);

        for (let i = 0; i < data.subs.length; i++) {
            let promotion = results[i];
            let discount = promotion && promotion.discount;
            if (discount)
                data.subs[i].promotionPrice = Math.round((1 - discount) * data.subs[i].retail);
        }
    }
}