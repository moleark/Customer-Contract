import * as React from 'react';
import { CMe } from './CMe';
import { observer } from 'mobx-react';
import { VPage, Page, Image, Prop, PropGrid, nav, LMR, FA } from 'tonva';
import { appConfig } from 'configuration';
import { EditMeInfo } from './EditMeInfo'

export class VMe extends VPage<CMe> {
    private version: any;
    async open() {
        this.version = await nav.checkVersion();
    }

    render(member: any): JSX.Element {
        return <this.page />
    }

    private logouts = () => {
        nav.showLogout();
    }

    private changePassword = async () => {
        await nav.changePassword();
    }
    private meInfo = observer(() => {
        let { user } = nav;
        if (user === undefined) return null;
        let { id, name, nick, icon } = user;
        return <LMR className="py-2 cursor-pointer w-100"
            left={<Image className="w-3c h-3c mr-3" src={icon} />}
            right={<FA className="align-self-end" name="angle-right" />}
            onClick={() => {
                this.openVPage(EditMeInfo);
            }}
        >
            <div>
                <div>{userSpan(name, nick)}</div>
                <div className="small"><span className="text-muted">ID:</span> {id > 10000 ? id : String(id + 10000).substr(1)}</div>
            </div>
        </LMR>;
    });
    private page = observer(() => {
        const { user } = nav;
        let aboutRows: Prop[] = [
            '',
            {
                type: 'component',
                component: <div className="text-primary w-100 d-flex p-2 justify-content-between">
                    <div>
                        <i className="iconfont icon-guanyu text-primary " style={{ fontSize: "20px", color: "#2aa515" }}></i> 关于本app
                            </div>
                    <div className="py-2 small text-muted">V {appConfig.version}</div>
                </div>,
            }
        ];

        let rows: Prop[];
        if (user === undefined) {
            rows = aboutRows;
            rows.push(
                {
                    type: 'component',
                    component: <button className="btn btn-success w-100 my-2" onClick={() => nav.showLogin(undefined, true)}>
                        <FA name="sign-out" size="lg" /> 请登录
                </button>
                },
            );
        }
        else {
            let logOutRows: Prop[] = [
                '',
                {
                    type: 'component',
                    component: <div className="bg-warning p-2 my-1 text-center col-12" onClick={this.logouts}>
                        <span>退出登陆</span>
                    </div>,
                },
            ];

            rows = [
                {
                    type: 'component',
                    component: <this.meInfo />
                },
                // '',
                // {
                //     type: 'component',
                //     component: <div className="bg-white p-2 mb-1 text-primary">
                //         <span className="iconfont icon-yonggongzongliang" style={{ fontSize: '24px', verticalAlign: 'middle' }}></span> 账户信息
                // </div>,
                // },
                '',
                {
                    type: 'component',
                    component: <div className="bg-white p-2 mb-1 text-primary">
                        <span className="iconfont icon-mima" style={{ fontSize: '24px', verticalAlign: 'middle' }}></span> 修改密码
                            </div>,
                    onClick: this.changePassword
                },
            ]
            rows.push(...aboutRows, ...logOutRows);
        }
        return <>
            <PropGrid rows={[...rows]} values={{}} />
        </>
    })
}

function userSpan(name: string, nick: string): JSX.Element {
    return nick ?
        <><b>{nick} &nbsp; <small className="muted">{name}</small></b></>
        : <b>{name}</b>
}

