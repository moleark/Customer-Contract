import * as React from 'react';
import { tv } from 'tonva';

export const tvAddress = (values: any) => {
    let { country, province, city, county } = values;
    return <>
        {tv(country)}{tv(province, undefined, undefined, () => <></>)}{tv(city, undefined, undefined, () => <></>)}{tv(county, undefined, undefined, () => <></>)}
    </>
}

export const tvCountry = (values: any) => {
    return <> {values.chineseName} </>;
}

export const tvCurrency = (values: any) => {
    return <> {values.name} </>;
}

export const common = {
    address: tvAddress,
    country: tvCountry,
    province: tvCountry,
    city: tvCountry,
    county: tvCountry,
    currency: tvCurrency,
};
