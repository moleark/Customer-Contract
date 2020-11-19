import { Tuid, Map, Query, Action, Sheet, Book } from "tonva";

export interface UqProduct {
    ProductX: Tuid;
    GetFutureDeliveryTime: Query;
    SearchProduct: Query;
    Brand: Tuid;
    PriceX: Map;
    ProductChemical: Map;
}
export interface UqHr {
    employee: Tuid;
    SearchEmployeeByid: Query;
    SearchTeam: Query;
}
export interface UqCommon {
    SalesRegion: Tuid;
    Language: Tuid;
    Address: Tuid;
    InvoiceType: Tuid;
    GetCountryProvinces: Query;
    GetProvinceCities: Query;
    GetCityCounties: Query;
}

export interface UqWebUser {
    WebUserBuyerAccount: Map;
    WebUser: Tuid;
    WebUserContact: Map;
    WebUserSetting: Map;
    WebUserCustomer: Map;
    WebUserContacts: Map;
    myFavorites: Map;
    getMyFavirates: Query;
    WebUserVIPCard: Map;
    WebUserCoupon: Map;
    WebUserCouponUsed: Map;
    getMyUsedCoupon: Query,
    getMyExpiredCoupon: Query,

    RecordLogin: Action,
}


export interface UqPointShop {

    WebUserCredits: Map;
    WebUserCreditsUsed: Map;
}
export interface UqOrder {
    SetCart: Action;
    RemoveFromCart: Action;
    MergeCart: Action;
    Order: Sheet;
    GetCart: Query;
    GetPendingPayment: Query;
    CommonText: Tuid;
}
export interface UqSalesTask {
    Coupon: Tuid;
    MyCustomerUnit: Tuid;
    IsCanUseCoupon: Action;
    CreateMyCustomerUnit: Action;
    CreateMyCustomer: Action;
    VIPCardDiscount: Map;
    BottomDiscount: Map;
    searchMyCustomer: Query;
    SearchMyCustomerByUnit: Query;
    searchMyCustomerUnit: Query;
    searchNewMyCustomer: Query;

    MyCustomer: Tuid;
    Task: Tuid;
    Organization: Tuid;
    CreateCoupon: Action;
    UpateCustomerMyCustomerMap: Action;
    ComputeAchievement: Action;
    UpdateNowMessage: Action;
    SavePeerAssigned: Action;
    CompletionTask: Action;
    SearchCoupon: Query;
    SearchAchievement: Query;
    SearchAchievementHistory: Query;
    getCustomerOrganization: Query;
    Relation: Map;
    WebUserEmployeeMap: Map;
    SearchBalanceHistory: Query;
    WebUserAccountMap: Map;
    AddWebUserAccountMap: Action;
    ComputeBalance: Action;
    SearchCustomerOrder: Query;
    SearchMyCustomerDepartment: Query;
    SearchMyCustomerResearch: Query;

    VIPCardForWebUser: Map;
    SearchCouponUsed: Query;
}
export interface UqCustomer {
    Contact: Tuid;
    InvoiceInfo: Tuid;
    CustomerContacts: Map;
    CustomerSetting: Map;
    CustomerContractor: Map;
}
export interface UqWarehouse {
    GetInventoryAllocation: Query;
}
export interface UqCustomerDiscount {
    GetDiscount: Query;
}
export interface UqPromotion {
    GetPromotionPack: Query;
}
export interface UQs {
    order: UqOrder;
    hr: UqHr;
    product: UqProduct;
    common: UqCommon;
    webuser: UqWebUser;
    salesTask: UqSalesTask;
    customer: UqCustomer;
    积分商城: UqPointShop;
    warehouse: UqWarehouse;
    customerDiscount: UqCustomerDiscount;
    promotion: UqPromotion;
}
