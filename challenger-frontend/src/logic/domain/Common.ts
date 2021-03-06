
export enum WebState {
    NEED_REFETCH,
    FETCHING,
    FETCHING_VISIBLE, // components may be invalid but we want to display them only if too much time took web call
    FETCHED
}
export const WEB_STATUS_NOTHING_RETURNED_YET=307; // for async calls
export const WEB_STATUS_UNAUTHORIZED=401;
export const WEB_STATUS_INTERNAL_ERROR=500;


export interface WebCallDTO<T> {
    webCallState: WebCallState;
    webCallError?: string,
    webCallResponse?: T;
}

export enum WebCallState {
    INITIAL,
    IN_PROGRESS,
    RESPONSE_OK,
    RESPONSE_FAILURE
}