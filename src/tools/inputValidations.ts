
export function telephoneValidation(value: string) {
    if (value && !/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value))
        return "固定电话格式不正确，请重新输入！";
    else
        return undefined;
}

export function mobileValidation(value: string) {
    if (value && !/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(value))
        return "手机号格式不正确，请重新输入！";
    else
        return undefined;
}

export function emailValidation(value: string) {
    if (value && !/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(value))
        return "Email格式不正确，请重新输入！";
    else
        return undefined;
}

export function faxValidation(value: string) {
    if (value && !/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value))
        return "传真号码格式不正确，请重新输入！";
    else
        return undefined;
}

export function productPointValidation(value: string) {
    return (value && !/^[0-9]+$/.test(value)) ? "积分格式不正确，请重新输入！" : undefined;
}

export function addressDetailValidation(value: string) {
    return (value && value.length > 200) ? "详细地址最多200个字！" : undefined;
}

export function zipCodeValidation(value: string) {
    return (value && value.length > 15) ? "邮编过长，请修改后录入！" : undefined;
}


export function organizationNameValidation(value: string) {
    return (value && value.length > 100) ? "单位名称最多100个字！" : undefined;
}

export function departmentNameValidation(value: string) {
    return (value && value.length > 100) ? "部门名称名称最多100个字！" : undefined;
}

export function salutationValidation(value: string) {
    return (value && value.length > 100) ? "单位名称最多100个字！" : undefined;
}

export function nameValidation(value: string) {
    return (value && value.length > 50) ? "姓名最多50个字！" : undefined;
}

export function productGenreValidation(value: string) {
    return (value && value.length > 10) ? "类型最多10个字！" : undefined;
}