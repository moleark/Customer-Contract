import { AppConfig, env } from "tonva";
import { tvs } from "tvs";

export const appConfig: AppConfig = {
    appName: '百灵威系统工程部/cart',
    version: '1.0.0',
    tvs: tvs,
    oem: '百灵威',
};

const GLOABLE_PRODUCTION = {
    CHINA: 44,
    CHINESE: 196,
    SALESREGION_CN: 1,
    TIPDISPLAYTIME: 3000,
    ANDROIDAPPADDRESS: "https://shop.jkchemical.com/download/jk-shop.apk",
    PIRVACYURL: "https://shop.jkchemical.com/privacy/shop.txt",
    CONTENTSITE: "https://web.jkchemical.com",
}

const GLOABLE_TEST = {
    CHINA: 43,
    CHINESE: 197,
    SALESREGION_CN: 4,
    TIPDISPLAYTIME: 3000,
    CONTENTSITE: "https://c.jkchemical.com/jk-web",
    ANDROIDAPPADDRESS: "https://shop.jkchemical.com/download/jk-shop.apk",
    PIRVACYURL: "https://c.jkchemical.com/privacy/shop.txt",
}

// 生产配置
export const MadiaType = {
    IAMGE: 1,
    PDF: 2,
    VIDEO: 3,
    NOTIMAGE: 0
};

export const GLOABLE = env.testing === true ? GLOABLE_TEST : GLOABLE_PRODUCTION;