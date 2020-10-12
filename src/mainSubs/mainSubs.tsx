import * as React from 'react';
import { Render } from './render';

export interface MainSubs<M, S> {
    main: M;
    subs: S[];
}

export abstract class ViewBase<T> {
    model: T;
    abstract render(): JSX.Element;
}

export class ViewMainSubs<M, S> extends ViewBase<MainSubs<M, S>> {
    protected main: Render<M>;
    protected sub: Render<S>;
    constructor(main: Render<M>, sub: Render<S>) {
        super();
        this.main = main;
        this.sub = sub;
    }
    protected subsContainer(subViews: JSX.Element[]): JSX.Element {
        return <div>{subViews}</div>
    }

    protected renderSubItems(): JSX.Element[] {
        let { subs } = this.model;
        if (!subs) return null;
        let subViews: JSX.Element[] = subs.map((v, index) => {
            return <this.sub key={index} {...v} />;
        });
        return subViews;
    }

    protected renderSubs = (): JSX.Element => {
        return this.subsContainer(this.renderSubItems());
    }

    render(): JSX.Element {
        let { main } = this.model;
        return <>
            <this.main {...main} />
            <this.renderSubs />
        </>;
    }
}

export class ViewListMainSubs<M, S> extends ViewBase<MainSubs<M, S>[]> {
    private row: new (main: Render<M>, sub: Render<S>) => ViewMainSubs<M, S>;
    private main: Render<M>;
    private sub: Render<S>;
    constructor(
        row: new (main: Render<M>, sub: Render<S>) => ViewMainSubs<M, S>,
        main: Render<M>,
        sub: Render<S>) {
        super();
        this.row = row;
        this.main = main;
        this.sub = sub;
    }
    render(): JSX.Element {
        return <>
            {this.model.map((v, index) => {
                let view = new this.row(this.main, this.sub);
                view.model = v;
                return <React.Fragment key={index}>{view.render()}</React.Fragment>;
            })}
        </>;
    }
}
