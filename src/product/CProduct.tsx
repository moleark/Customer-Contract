import { observable } from 'mobx';
import { BoxId, QueryPager } from 'tonva';
import { CUqBase } from '../CBase';
import { VProduct } from './VProduct';
import { VProductDelivery } from './VProductDelivery';
import { VCartProuductView } from './VProductView';
import { VProductList } from './VProductList';
import { LoaderProductChemicalWithPrices } from './itemLoader';

export class CProduct extends CUqBase {
    @observable pageProductList: QueryPager<any>;

    @observable futureDeliveryTimeDescriptionContainer: { [cacheId: string]: string } = {};
    @observable chemicalInfoContainer: { [productId: number]: any } = {};
    protected async internalStart() {
        // this.openVPage(VProductList);
    }

    renderDeliveryTime = (pack: BoxId) => {
        return this.renderView(VProductDelivery, pack);
    }
    getInventoryAllocation = async (productId: number, packId: number, salesRegionId: number) => {
        return await this.uqs.warehouse.GetInventoryAllocation.table({ product: productId, pack: packId, salesRegion: this.cApp.currentSalesRegion });
    }

    getFutureDeliveryTimeDescription = async (productId: number, salesRegionId: number) => {
        let cacheId = productId + '_' + salesRegionId;
        if (this.futureDeliveryTimeDescriptionContainer[cacheId] === undefined) {
            let futureDeliveryTime = await this.uqs.product.GetFutureDeliveryTime.table({ product: productId, salesRegion: salesRegionId });
            if (futureDeliveryTime.length > 0) {
                let { minValue, maxValue, unit, deliveryTimeDescription } = futureDeliveryTime[0];
                this.futureDeliveryTimeDescriptionContainer[cacheId] = minValue + (maxValue > minValue ? '~' + maxValue : '') + ' ' + unit;
            } else {
                this.futureDeliveryTimeDescriptionContainer[cacheId] = null;
            }
        }
        return this.futureDeliveryTimeDescriptionContainer[cacheId];
    }
    renderCartProduct = (product: BoxId) => {
        return this.renderView(VCartProuductView, product);
    }

    renderChemicalInfoInCart = (product: BoxId) => {
        // return this.renderView(VChemicalInfoInCart, product);
    }

    showProductSelect = async () => {
        this.openVPage(VProductList);
    }
    searchByKey = async (key: string) => {
        let { currentSalesRegion } = this.cApp;
        this.pageProductList = new QueryPager(this.uqs.product.SearchProduct, 10, 10);
        this.pageProductList.first({ keyWord: key, salesRegion: currentSalesRegion.id });
    };

    showProductDetail = async (productId: BoxId | any) => {
        if (productId) {
            let discount = 0, product = productId;
            let loader = new LoaderProductChemicalWithPrices(this.cApp);
            let productData = await loader.load(productId);
            this.openVPage(VProduct, { productData, product, discount });
        }
    }
}