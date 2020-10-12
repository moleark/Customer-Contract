import { Entity } from 'tonva';
import { CApp } from 'CApp';

export abstract class Loader<T> {
    protected cApp: CApp;
    private entities: Entity[] = [];
    private schemaLoaded: boolean = false;
    constructor(cApp: CApp) {
        this.cApp = cApp;
    }

    protected async loadSchemas() {
        if (this.schemaLoaded === true) return;
        await Promise.all(this.entities);
        this.schemaLoaded = true;
    }

    async load(param: any): Promise<T> {
        await this.loadSchemas();
        let data = this.initData();
        await this.loadToData(param, data);
        return data;
    }
    protected abstract async loadToData(param: any, data: T): Promise<void>;
    protected abstract initData(): T;
}
