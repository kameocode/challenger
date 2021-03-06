import * as React from "react";
import {ReduxState, connect} from "../../redux/ReduxState";
import RaisedButton from "material-ui/RaisedButton";
import TextFieldExt from "../../views/common-components/TextFieldExt";
import LinearProgress from "material-ui/LinearProgress";
import {registerUserAction} from "../accountActions";
import {Col, Row, RowCol} from "../../views/common-components/Flexboxgrid";
import FlatButton from "material-ui/FlatButton";
import {REGISTER_EXIT_TO_LOGIN_PANEL} from "../accountActionTypes";
import {WebCallDTO, WebCallState} from "../../logic/domain/Common";
import {RegisterResponseDTO} from "../RegisterResponseDTO";

interface Props {
    registerFailed: boolean,
    inProgress: boolean,
    errorDescription: string,
    webCall: WebCallDTO<RegisterResponseDTO>,
    stillRequireEmailConfirmation: boolean,
    finishedWithSuccess: boolean

    requiredEmail?: string,
    proposedLogin?: string,
    emailIsConfirmedByConfirmationLink?: string
}
interface PropsFunc {
    onRegisterFunc: (email: string, login: string, pass: string, emailIsConfirmedByConfirmationLink: string)=>void;
    onExitToLoginFunc: ()=>void;
}
interface State {
    loginError?: string,
    emailError?: string,
    passwordError?: string,
}

class RegisterPanelInternal extends React.Component<Props & PropsFunc, State> {
    private loginField: TextFieldExt;
    private emailField: TextFieldExt;
    private passwordField: TextFieldExt;

    constructor(props) {
        super(props);
        this.state = {}
    }

    onRegister = () => {
        if (this.validate()) {
            var login = this.loginField.state.fieldValue;
            var pass = this.passwordField.state.fieldValue;
            var email = this.emailField.state.fieldValue;
            this.props.onRegisterFunc(email, login, pass, this.props.emailIsConfirmedByConfirmationLink);
        }
    };

    validate = (): boolean => {

        return this.loginField.checkIsValid() && this.passwordField.checkIsValid() && this.emailField.checkIsValid();
    }

    render() {


        //var height = Math.max(300, Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 200) + "px";
        return (
            <div id="main" className="container ">

                {this.props.registerFailed &&
                <Row horizontal="center" style={{minHeight: '120px', paddingTop:'50px'}}>
                    <Col col="8">
                        <p className="grey-text">
                            There is problem with registration:<br/>
                            <b className="red-text text-darken-3">{this.props.errorDescription}</b>
                        </p>
                    </Col>
                </Row> }

                {!this.props.registerFailed &&
                <Row horizontal="center" style={{height: '120px', paddingTop:'50px'}}>
                    <Col col="8-5-3">
                        <RowCol horizontal="start">
                            <h2>{this.props.inProgress ? "Please wait..." :
                                this.props.finishedWithSuccess ?
                                    <div>You account has been created.
                                        {this.props.stillRequireEmailConfirmation && <div><br/>Please confirm your email.</div>}
                                    </div>
                                    : "Register"}</h2>
                        </RowCol>
                    </Col>
                </Row>
                }

                {!this.props.finishedWithSuccess &&
                <Row horizontal="center">
                    <Col col="8-5-3">
                        <RowCol>
                            <TextFieldExt
                                disabled={this.props.requiredEmail!=null}
                                autoFocus={true}
                                fullWidth={true}
                                floatingLabelText="Email"
                                useRequiredValidator={true}
                                validateOnChange={true}
                                minLengthNumber={4}
                                maxLengthNumber={100}
                                checkEmailPattern={true}
                                fieldValue={this.props.requiredEmail!=null? this.props.requiredEmail: ""}
                                onEnterKeyDown={()=> { this.loginField.focus(); } }
                                ref={(c)=>{this.emailField=c}}/>
                        </RowCol>
                        <RowCol>
                            <TextFieldExt
                                fullWidth={true}
                                autoFocus={this.props.requiredEmail!=null}
                                useRequiredValidator={true}
                                validateOnChange={true}
                                minLengthNumber={6}
                                maxLengthNumber={30}
                                floatingLabelText="Login"
                                fieldValue={this.props.proposedLogin!=null? this.props.proposedLogin: ""}
                                onEnterKeyDown={()=> { this.passwordField.focus(); } }
                                ref={(c)=>{this.loginField=c}}/>
                        </RowCol>
                        <RowCol>
                            <TextFieldExt
                                fullWidth={true}
                                floatingLabelText="Password"
                                validateOnChange={true}
                                fieldValue=""
                                type="password"
                                minLengthNumber={6}
                                maxLengthNumber={30}
                                useRequiredValidator={true}
                                onEnterKeyDown={this.onRegister}
                                ref={(c)=>{this.passwordField=c}}/>

                        </RowCol>

                        <RowCol colStyle={{paddingTop: '20px', paddingBottom: '30px'}}>
                            <div style={{display:"block"}}>
                                <RaisedButton
                                    disabled={this.props.inProgress}
                                    label="Register"
                                    fullWidth={true}
                                    primary={true}
                                    className="right" onClick={this.onRegister}/>
                                {this.props.inProgress && <LinearProgress mode="indeterminate"/> }

                            </div>
                        </RowCol>
                        <RowCol horizontal="end">

                            Have an account? <FlatButton label="Login" onClick={this.props.onExitToLoginFunc}/>

                        </RowCol>
                    </Col>
                </Row> }


            </div>);
    }
}

const mapStateToProps = (state: ReduxState): any => {


    var errorDescription = state.registerState.registerError;
    var inProgress = state.registerState.webCall.webCallState == WebCallState.IN_PROGRESS;
    if (inProgress == undefined)
        inProgress = false;
    return {
        errorDescription: errorDescription,
        inProgress: inProgress,
        registerFailed: errorDescription != null,
        webCall: state.registerState.webCall,
        stillRequireEmailConfirmation: state.registerState.stillRequireEmailConfirmation,
        finishedWithSuccess: state.registerState.finishedWithSuccess,
        requiredEmail: state.registerState.requiredEmail,
        emailIsConfirmedByConfirmationLink: state.registerState.emailIsConfirmedByConfirmationLink


    }
};

const mapDispatchToProps = (dispatch): any => {
    return {
        onRegisterFunc: (email, login, pass, emailIsConfirmedByConfirmationLink) => {
            dispatch(registerUserAction(email, login, pass, emailIsConfirmedByConfirmationLink))
        },
        onExitToLoginFunc: () => {
            dispatch(REGISTER_EXIT_TO_LOGIN_PANEL.new({}));
        }

    }

};

/*
 export const RegisterPanel = (connect(
 mapStateToProps,
 mapDispatchToProps
 ))(WebCallAwareComponent(RegisterPanelInternal, false));
 */


export const RegisterPanel = connect(
    mapStateToProps,
    mapDispatchToProps
)(RegisterPanelInternal);


