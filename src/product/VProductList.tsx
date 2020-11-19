import * as React from 'react';
import { CProduct } from './CProduct';
import { VPage, Page, SearchBox, Scroller, tv, List, Form } from 'tonva';
import { ProductImage } from 'tools/productImage';
import { observer } from 'mobx-react';

export class VProductList extends VPage<CProduct> {

    async open() {

        this.openPage(this.page);
    }
    private onProductClick = async (product: any) => {
        await this.controller.showProductDetail(product.id);
    }

    private renderBrand = (brand: any) => {
        return this.productPropItem('品牌', brand.name);
    }
    private productPropItem = (caption: string, value: any) => {
        if (value === null || value === undefined) return null;
        return <>
            <div className="col-4 col-sm-2 col-lg-4 text-muted pr-0 small">{caption}</div>
            <div className="col-8 col-sm-4 col-lg-8">{value}</div>
        </>;
    }
    // private renderProduct = (p: any) => {
    //     this.renderVm(VSdetail, p);
    // }
    private renderProduct = (product: any, index: number) => {
        let { id, brand, description, descriptionC, CAS, purity, molecularFomula, molecularWeight, origin, imageUrl } = product;
        return <div className="d-block mb-4 px-2">
            <div className="py-2">
                <div><strong>{description}</strong></div>
                <div>{descriptionC}</div>
            </div>
            <div className="row">
                <div className="col-3">
                    <ProductImage chemicalId={imageUrl} className="w-100" />
                </div>
                <div className="col-9">
                    <div className="row">
                        {this.productPropItem('CAS', CAS)}
                        {this.productPropItem('纯度', purity)}
                        {this.productPropItem('分子式', molecularFomula)}
                        {this.productPropItem('分子量', molecularWeight)}
                        {this.productPropItem('产品编号', origin)}
                        {tv(brand, this.renderBrand)}
                    </div>
                </div>
            </div>
            <div>
                {/* <Form schema={schema} uiSchema={this.uiSchema} formData={id} /> */}
            </div>
        </div>
    }
    private onScrollBottom = async (scroller: Scroller) => {
        scroller.scrollToBottom();
        let { pageProductList } = this.controller;
        pageProductList.more();
    }
    private page = observer(() => {
        let { pageProductList, cApp } = this.controller;
        let search = <SearchBox className="w-100 mr-2"
            size={"sm"}
            onSearch={(key: string) => this.controller.searchByKey(key)}
            placeholder="搜索品名、编号、CAS、MDL等" />
        let none = <div className="my-3 mx-2 text-warning">无</div>;
        return <Page header={search} onScrollBottom={this.onScrollBottom}>
            <div className="px-2 py-2 bg-white mb-3">
                {(pageProductList && pageProductList.items && (pageProductList.items.length > 0)) ? <List before={''} none={none}
                    items={pageProductList} item={{ render: this.renderProduct, onClick: this.onProductClick }} /> : null}
            </div>
        </Page>
    })
}
