import * as React from 'react';
import { CProduct } from './CProduct';
import { VPage, Page, SearchBox } from 'tonva';

export class VProductList extends VPage<CProduct> {

    async open(param: any) {

        this.openPage(this.page);
    }
    private page = (product: any) => {
        let search = <SearchBox className="w-100"
            size={"sm"}
            onSearch={(key: string) => this.controller.searchByKey(key)}
            placeholder="搜索品名、编号、CAS、MDL等" />
        return <Page header={search}>

        </Page>
    }
}
