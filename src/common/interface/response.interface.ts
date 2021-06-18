export interface IApiResponse {
    message: string;
    data: [] | Record<string, any>;
}

interface IDataUnprocessable {
    property: string;
    message: string[];
}

export interface IUnprocessableResponse {
    message: string;
    data: Array<IDataUnprocessable>;
}
