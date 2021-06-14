export interface IApiResponse {
    data: [] | Record<string, any>;
    message: string;
}

interface IDataUnprocessable {
    property: string;
    message: string[];
}

export interface IUnprocessableResponse {
    message: string;
    data: Array<IDataUnprocessable>;
}
