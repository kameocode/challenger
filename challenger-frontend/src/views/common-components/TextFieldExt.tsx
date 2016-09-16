import * as React from "react";
import TextField from "material-ui/TextField";


interface Props {
    floatingLabelText: string,
    type? :string,
    fieldValue: string
}
interface State {
    fieldValue: string
}
export default class TextFieldExt extends React.Component<Props,State> {
    state = { fieldValue: this.props.fieldValue };
    static defaultProps = {
        type:"text",
        fieldValue:""
    };


    handleFieldChange = (event) => {
        this.setState({fieldValue: event.target.value});
    }

    render() {
        return (<TextField
            floatingLabelText={this.props.floatingLabelText}
            onChange={this.handleFieldChange}
            type={this.props.type}
            defaultValue={this.state.fieldValue}

        />);
    }
}