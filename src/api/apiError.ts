
export class ApiError extends Error {
    statusCode?: number;
    isNetworkError: boolean;

    constructor(message: string, statusCode?: number, isNetworkError: boolean = false) {
        super(message);
        this.statusCode = statusCode;
        this.isNetworkError = isNetworkError;
    }
}





