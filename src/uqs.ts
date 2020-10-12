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

export interface WebBuilder {

}

export interface UqPointShop {
    Genre: Tuid;
    PointProductGenre: Map;
    PointProduct: Map;
    PointHistory: History;
    PointExchangeSheet: Sheet;
    getPoints: Query;
    GetPointProduct: Query;
    GetNewPointProducts: Query;
    GetHotPointProducts: Query;
    SetPointProductVisits: Action;
    PointProductLib: Tuid;
    PointProductSource: Map;
    // TODO：delete
    AddPoint: Action;
    IsCanUseOrder: Action;

    // TODO：delete
    GetPlatFormOrder: Query;
    GetLastPlatFormOrder: Action;
    AddPlatformOrderPoint: Action;
    AddUsedCoupon: Action;

    GetPointHistory: Query;
    GetPointSigninHistory: Query;
    WebUserCredits: Map;
    WebUserCreditsUsed: Map;
    SigninSheet: Sheet;
    checkIsSignin: Query;
    Signin: Action;
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
    TaskType: Tuid;
    Organization: Tuid;
    CreateCoupon: Action;
    UpateCustomerMyCustomerMap: Action;
    ComputeAchievement: Action;
    UpdateNowMessage: Action;
    SavePeerAssigned: Action;
    AddTask: Action;
    ImportTask: Action;
    ExtensionTask: Action;
    CompletionTask: Action;
    CompletionCustomerInfoTask: Action;
    CreateTaskProduct: Action;
    CreateTaskProductPack: Action;
    CreateTaskProject: Action;
    CreatePosition: Action;
    CustomerMyCustomerMap: Map;
    Position: Map;
    TaskBiz: Map;
    SearchCoupon: Query;
    SearchTask: Query;
    SearchJKTask: Query;
    SearchTaskCompletion: Query;
    SearchHistoryTask: Query;
    SearchHistoryTaskByEmployee: Query;
    SearchHistoryTaskByCustomer: Query;
    searchMyCustomerActive: Query;
    SearchTeam: Query;
    searchNowMessage: Query;
    searchMessage: Query;
    SearchPosition: Query;
    SearchAchievement: Query;
    SearchAchievementHistory: Query;
    getCustomerOrganization: Query;
    SearchTaskProduct: Query;
    SearchTaskProductPack: Query;
    SearchTaskProject: Query;
    MyCustomerIsOccupy: Query;
    Relation: Map;
    WebUserEmployeeMap: Map;
    Withdrawal: Sheet;
    WithdrawalStateBook: Book;
    SearchWithdrawalStateQuery: Query;
    SearchBalanceHistory: Query;
    WebUserAccountMap: Map;
    AddWebUserAccountMap: Action;
    ComputeBalance: Action;
    SearchMyCustomerByPost: Query;
    SearchMyCustomerByDomain: Query;
    SearchMyCustomerByCategory: Query;
    AddMyCustomerPost: Action;
    SearchSubordinate: Query;
    SearchCustomerOrder: Query;
    SearchMyCustomerDepartment: Query;
    SearchMyCustomerResearch: Query;
    SearchMyCustomerOfficePost: Query;
    TaskOrder: Map;
    SearchTaskHistoryCount: Query;
    SearchTeamAchievement: Query;
    SearchTeamAchievementDetail: Query;
    AddCouponSendHistory: Action;
    SearchBottomDiscount: Query;

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
    webBuilder: WebBuilder;
    salesTask: UqSalesTask;
    customer: UqCustomer;
    积分商城: UqPointShop;
    warehouse: UqWarehouse;
    customerDiscount: UqCustomerDiscount;
    promotion: UqPromotion;
}
