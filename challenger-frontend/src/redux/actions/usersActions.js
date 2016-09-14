import ajaxWrapper from "../../logic/AjaxWrapper";
import {fetchWebChallenges} from "./actions";

export const LOGIN_USER_REQUEST='LOGIN_USER_REQUEST';
export const LOGIN_USER_RESPONSE_SUCCESS='LOGIN_USER_RESPONSE_SUCCESS';
export const LOGIN_USER_RESPONSE_FAILURE='LOGIN_USER_RESPONSE_FAILURE';

function loginUserRequest(login, password, primary) {
    return { type: LOGIN_USER_REQUEST, login:login, password: password, primary: primary }
}
function loginUserResponseSuccess(login, jwtToken) {
    return { type: LOGIN_USER_RESPONSE_SUCCESS, login: login, jwtToken:jwtToken }
}
function loginUserResponseFailure(login, data, jqXHR) {
    return { type: LOGIN_USER_RESPONSE_FAILURE, login: login, data:data, jqXHR: jqXHR }
}

export function loginUserAction(login, password, primary) {
    return function (dispatch) {
        dispatch(loginUserRequest(login, password, primary));
        ajaxWrapper.login(login, password).then(
            jwtToken=>{
                dispatch(loginUserResponseSuccess(login, jwtToken));
                dispatch(fetchWebChallenges());
            },
            (data, jqXHR)=> dispatch(loginUserResponseFailure(login, data, jqXHR))
        )
    }
}