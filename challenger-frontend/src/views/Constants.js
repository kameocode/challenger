import * as React from "react";
import SvgIcon from "material-ui/SvgIcon";
import { Component } from "react";



const DiffHardIcon = (props) => {
    var wanted = {};
    if (props.className != undefined)
        wanted.className = props.className;
    if (props.style != undefined)
        wanted.style = props.style;
    return (
        <SvgIcon {...wanted} viewBox="0 0 90 90">
            <path d="M90 45a45 45 0 0 1-45 45A45 45 0 0 1 0 45 45 45 0 0 1 45 0a45 45 0 0 1 45 45z"/>
        </SvgIcon>
    );
};

const DiffSimpleIcon = (props) => {

    var wanted = {};
    if (props.className != undefined)
        wanted.className = props.className;
    if (props.style != undefined)
        wanted.style = props.style;
    return (
        <SvgIcon {...wanted} viewBox="0 0 90 90">
            <path d="M90 45a45 45 0 0 1-45 45A45 45 0 0 1 0 45 45 45 0 0 1 45 0a45 45 0 0 1 45 45z" fillOpacity=".388"/>
            <path d="M75 45a30 30 0 0 1-30 30 30 30 0 0 1-30-30 30 30 0 0 1 30-30 30 30 0 0 1 30 30z" fillOpacity=".1"/>
            <path d="M60 45a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15z"/>
        </SvgIcon>);
};

const DiffMediumIcon = (props) => {
    var wanted = {};
    if (props.className != undefined)
        wanted.className = props.className;
    if (props.style != undefined)
        wanted.style = props.style;
    return (
        <SvgIcon {...wanted} viewBox="0 0 90 90">
            <path d="M90 45a45 45 0 0 1-45 45A45 45 0 0 1 0 45 45 45 0 0 1 45 0a45 45 0 0 1 45 45z" fillOpacity=".388"/>
            <path d="M75 45a30 30 0 0 1-30 30 30 30 0 0 1-30-30 30 30 0 0 1 30-30 30 30 0 0 1 30 30z"/>
        </SvgIcon>
    );
};






export var ResizeAware = ComposedComponent => class extends React.Component {

    handleResize = (e) => {
        this.forceUpdate();
    };

    componentDidMount = () => {
        window.addEventListener('resize', this.handleResize);

    };

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.handleResize);
    };
    render() {
        return <ComposedComponent {...this.props}  />;
    }
};

export var HidableComponent = (ComposedComponent) => class extends React.Component {
    render() {
        if ((this.props.shouldHide!=null && this.props.shouldHide()) || this.props.hidden)
            return null;
        return <ComposedComponent {...this.props}  />;
    }
};



Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

Date.prototype.yy_mm_dd = function() {
    var mm = this.getMonth() + 1;
    var dd = this.getDate();
    return [this.getFullYear().toString().substr(2,2),  (mm<10)? "0"+mm: mm, (dd<10)? "0"+dd: dd].join('-');
};
Date.prototype.yyyy_mm_dd = function() {
    var mm = this.getMonth() + 1;
    var dd = this.getDate();
    return [this.getFullYear(),  (mm<10)? "0"+mm: mm, (dd<10)? "0"+dd: dd].join('-');
};
Date.prototype.yyyyxmmxdd = function() {
    var mm = this.getMonth() + 1;
    var dd = this.getDate();
    return [this.getFullYear(),  (mm<10)? "0"+mm: mm, (dd<10)? "0"+dd: dd].join('x');
};
Date.prototype.mm_dd = function() {
    var mm = this.getMonth() + 1;
    var dd = this.getDate();
    return [mm, dd].join('-');
};

Date.prototype.dayMonth3 = function () {
    var objDate = this;
    var locale = "en-us";
    var month = objDate.toLocaleString(locale, { month: "short" });
    return this.getDate() + " " + month;
}


export class Grid extends Component {}
export class Row extends Component {}
export class Col extends Component {}
export {
    DiffHardIcon as DiffHardIcon,
    DiffMediumIcon as DiffMediumIcon,
    DiffSimpleIcon as DiffSimpleIcon

}
