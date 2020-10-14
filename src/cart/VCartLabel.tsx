import * as React from 'react';
import classNames from 'classnames';
import { View } from 'tonva';
import { CCart } from './CCart';
import { observer } from 'mobx-react';

export class VCartLabel extends View<CCart> {

    private showCart = async () => {
        let { cart } = this.controller.cApp;
        cart.editButton.set(false);
        this.controller.start();
    }

    render(param: any): JSX.Element {
        return <this.content />
    };

    private content = observer(() => {
        let { cart } = this.controller.cApp;
        let count: any = cart.count.get();
        let badge, onClick, pointer;
        if (count > 0) {
            onClick = this.showCart;
            pointer = 'cursor-pointer';
            if (count < 100) badge = <u>{count}</u>;
            else badge = <u>99+</u>;
        }
        return <div className={classNames('jk-cart ml-1 mr-2', pointer)} onClick={onClick}>
            <div>
                <span className="fa-stack">
                    <i className="fa fa-square fa-stack-2x text-white"></i>
                    <i className="fa fa-shopping-cart fa-stack-1x text-info"></i>
                </span>
                {badge}
            </div>
        </div>
    });
}