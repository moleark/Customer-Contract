import moment from "moment";

export function momentFormat(date?: any, delimitFormat?: string) {
    return moment(date).format(delimitFormat ? delimitFormat : 'YYYY-MM-DD');
}