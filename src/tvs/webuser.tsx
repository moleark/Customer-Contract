import * as React from 'react';

export const tvWebUser = (value: any) => {
    let { firstName, salutation, organizationName, departmentName } = value;
    return <>
        <div className="mr-3"><strong>{firstName}</strong> <span className="small">{salutation}</span></div>
        <div className="small text-muted">{organizationName} &nbsp;{departmentName}</div>
    </>
}

export const webuser = {
    webuser: tvWebUser
}