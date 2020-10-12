import { VAddress } from './VAddress';
import { CUqBase } from '../CBase';

export class CAddress extends CUqBase {
    protected async internalStart() {
        this.openVPage(VAddress);
    }

    getCountryProvince = async (countryId: number): Promise<any[]> => {
        return await this.uqs.common.GetCountryProvinces.table({ country: countryId });
    }

    getProvinceCities = async (provinceId: number): Promise<any[]> => {
        return await this.uqs.common.GetProvinceCities.table({ province: provinceId });
    }

    getCityCounties = async (cityId: number): Promise<any[]> => {
        return await this.uqs.common.GetCityCounties.table({ city: cityId });
    }

    saveAddress = async (countryId: number, provinceId: number, cityId?: number, countyId?: number): Promise<any> => {
        let { Address } = this.uqs.common;
        let newAddress = await Address.save(undefined, { country: countryId, province: provinceId, city: cityId, county: countyId });
        let addressId = newAddress && Address.boxId(newAddress.id);
        this.returnCall(addressId);
    }
}
