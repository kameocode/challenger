import React, {Component} from "react";
import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import IconButton from "material-ui/IconButton/IconButton";
import FontIcon from "material-ui/FontIcon";
import {ChallengeStatus} from "./Constants";
import Divider from "material-ui/Divider";
import {changeChallengeAction, incrementDayAction} from "../redux/actions/actions";
const menuIconStyle = {fontSize: '15px', textAlign: 'center', lineHeight: '24px', height: '24px'};


class ChallengeMenuNaviBar extends React.Component {
    constructor(props) {
        super(props);
    }


    calculateChallengeStatusIcon(challengeDTO) {
        var iconText;
        switch (challengeDTO.challengeStatus) {
            case ChallengeStatus.ACTIVE:
                iconText = null;
                break;
            case ChallengeStatus.WAITING_FOR_ACCEPTANCE:
                if (challengeDTO.firstUserId == challengeDTO.myId)
                    iconText = "fa-hourglass";
                else
                    iconText = "fa-question";
                break;
            case ChallengeStatus.REFUSED:
                iconText = "fa-cancel";
                break;
            case ChallengeStatus.INACIVE:
                throw "Not supported here";
                break;
        }
        if (iconText != undefined)
            return <FontIcon
                style={menuIconStyle}
                className={"fa " + iconText + " cyan-text"}/>
        else return null;

    }


    calculateTitle(challengeId) {
       var rres =this.props.visibleChallengesDTO.visibleChallenges.find(ch=>ch.id==challengeId);
       return rres!=undefined? rres.label: "<not set>";
    }


    render() {
        var rows = [];


        return ( <div>

            <IconButton  onClick={()=>this.props.onIncrementDayFunc(-1)}> <FontIcon
                className="fa fa-caret-left white-text"

            /></IconButton>
            {""+this.props.day.toISOString().slice(0, 10)}
            <IconButton  onClick={()=>this.props.onIncrementDayFunc(1)}> <FontIcon
                className="fa fa-caret-right white-text"


            /></IconButton>
            {this.calculateTitle(this.props.visibleChallengesDTO.selectedChallengeId)}

            <IconMenu style={this.props.style}

                      iconButtonElement={<IconButton> <FontIcon
                          className="fa fa-reorder white-text"/></IconButton>}
                      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                      targetOrigin={{horizontal: 'left', vertical: 'top'}}
            >

                {
                    this.props.visibleChallengesDTO.visibleChallenges.map(
                        ch =>
                            <MenuItem key={ch.id}
                                      rightIcon={this.calculateChallengeStatusIcon(ch)}
                                      onTouchTap={()=>this.props.onChangeChallenge(ch.id)}
                                      primaryText={ch.label}/>)
                }
                {this.props.visibleChallengesDTO.visibleChallenges.length > 0 &&
                <Divider />
                }
                <MenuItem
                    leftIcon={<FontIcon
                        style={menuIconStyle}
                        className={"fa fa-plus-circle cyan-text"}/>}

                    primaryText="Create new challenge"/>
            </IconMenu></div>);
    }

}

const mapStateToProps = (state) => {
    return {
        visibleChallengesDTO: state.visibleChallengesDTO,
        day: state.mainReducer.day
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        onChangeChallenge: (challengeId) => {
            dispatch(changeChallengeAction(challengeId))
        },
        onIncrementDayFunc: (amount) => {
            dispatch(incrementDayAction(amount))
        }
    }
}
import { connect } from 'react-redux'
const Ext = connect(mapStateToProps, mapDispatchToProps)(ChallengeMenuNaviBar)
export default Ext;