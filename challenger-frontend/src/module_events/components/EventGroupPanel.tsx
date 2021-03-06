import * as React from "react";
import Paper from "material-ui/Paper";
import TextFieldExt from "../../views/common-components/TextFieldExt";
import {FlatButton, FontIcon} from "material-ui";
import {copy, ReduxState} from "../../redux/ReduxState";
import {eventsSelector, displaySeletectedEventGroupSelector} from "../eventSelectors";
import {EXPAND_EVENTS_WINDOW, SHOW_TASK_EVENTS, TOGGLE_EVENT_ACTIONS_VISIBILITY} from "../eventActionTypes";
import {connect} from "react-redux";
import {sendEvent, loadPreviousEventsAction} from "../eventActions";
import {EventType, DateDiscrimUI, DisplayedEventUI} from "../EventDTO";
import {TaskDTO} from "../../module_tasks/TaskDTO";
import Chip from "material-ui/Chip";
import {getColorSuperlightenForUser} from "../../views/common-components/Colors";
import * as CSSTransitionGroup from 'react-addons-css-transition-group'

interface Props {
    authorId: number
}
interface ReduxProps {
    displayedEvents: Array<DisplayedEventUI | DateDiscrimUI>,
    eventWindowVisible: boolean,
    expandedEventWindow: boolean,
    task?: TaskDTO,
    no?: number,
    eventActionsVisible: boolean,
    canBeMore: boolean

}
interface PropsFunc {
    onPostEventFunc: (authorId: number, post: string) => void
    onExpandFunc: () => void
    onCompressFunc: () => void
    onTaskCloseFunc: () => void
    onToggleActionsVisibilityFunc: () =>void
    onLoadPreviousEvents:()=>void
}



class EventGroupPanelInternal extends React.Component<Props & ReduxProps & PropsFunc, { justClicked: boolean}> {
    private postField: TextFieldExt;
    private shouldScrollToBottom: boolean;

    constructor(props) {
        super(props);
        this.state = {
            justClicked: false
        }
        this.shouldScrollToBottom = null;
    }

    onPostSubmit = () => {
        var postText = this.postField.state.fieldValue;
        if (postText.length > 0) {
            this.state.justClicked = true;
            this.props.onPostEventFunc(this.props.authorId, postText);
            this.postField.clear();

        }
    }

    componentDidMount() {
        // first time scroll to bottom without animation
        if (this.shouldScrollToBottom == null) {
            var elem: any = $("#eventGroupChatContent")
            elem.scrollTop(elem.prop("scrollHeight"));
            this.shouldScrollToBottom = true;
        }
    }

    componentWillUpdate() {
        var elem = $("#eventGroupChatContent")
        var isScrolledToBottom: boolean = elem[0].scrollHeight - elem.scrollTop() - elem.outerHeight() < 1;
        this.shouldScrollToBottom = isScrolledToBottom;
    }

    componentDidUpdate() {
        var elem: any = $("#eventGroupChatContent")
        var diff = elem[0].scrollHeight - elem.scrollTop() - elem.outerHeight();
        if (this.shouldScrollToBottom) {
            if (this.state.justClicked) {
                // we want animation for small height differences only (like 1 post)
                elem.animate({scrollTop: elem.prop("scrollHeight")}, 1000);
                this.state.justClicked = false;
            } else
                elem.scrollTop(elem.prop("scrollHeight"));
        }
    }

    renderPost = (ev: DisplayedEventUI | DateDiscrimUI) => {

        var p=this.renderPostInternal(ev);

        return  <CSSTransitionGroup
            key={ev.id}
            transitionName="universal"
            transitionAppear={true}
            transitionAppearTimeout={1000}
            transitionEnter={false}
            transitionLeave={false}>
            {p}
        </CSSTransitionGroup>
    }
    renderPostInternal = (ev: DisplayedEventUI | DateDiscrimUI) => {
        if (ev.kind == 'DateDiscrimUI') {//ev instanceof DateDiscrim) {
            var ddisc = ev as DateDiscrimUI;
            return <div key={ddisc.title}  style={{fontSize:"10px", marginTop:'10px', borderRight:
             '10px solid transparent',marginRight:'20px', boxSizing: "border-box", borderBottom: "1px solid #ddd", width:"100%"}}>{ddisc.title}</div>;
        } else {//if (ev instanceof DisplayedEventUI) {
            var dd = ev as DisplayedEventUI;

            var taskLabel = null;
            if (dd.task != null && this.props.task == null) { // it it's filtered by the task then label will be redundant information
                taskLabel = " [" + dd.task.label + "]";
            }

            if (dd.eventType == EventType.POST)
                return <div  key={dd.id}><span style={{marginRight:"5px"}}>{dd.authorLabel}:</span>{taskLabel} {dd.postContent} {dd.isNew && "*"} </div>;
            else return <div key={dd.id}><i> {dd.postContent} {dd.isNew && "*"} </i></div>;
        }
    }


    renderTaskName = () => {
        if (this.props.task != null)
            return this.props.task.label
        else
            return "";
    }

    render() {
        if (!this.props.eventWindowVisible)
            return null;
        //elem.scrollTop = elem.scrollHeight;

        var st = {width: "400px", height: "600px", position: "fixed", bottom: 0, right: 0, padding: "15px"}
        if (!this.props.expandedEventWindow) {
            st = copy(st).and({height: "228px"})
        }

        return <Paper style={st}>
            <div style={{display: "block", clear: "both"}}>

                <div style={{position:"absolute",left:"4px",top:"4px", verticalAlign:"center", display:"flex"}}>
                    {this.props.task != null &&
                    <Chip className="clickableChip" style={{backgroundColor: getColorSuperlightenForUser(this.props.no), flexBasis: 'min-content', minWidth: '40px'}}>
                        <div style={{display:"block"}}>
                            {this.renderTaskName()}
                            {this.props.task != null &&
                            <span style={{float: "right", marginLeft: "10px"}}>
                                 <FontIcon className="fa fa-close" style={{ cursor: "pointer", marginRight:'2px', fontSize: "12px"}} onClick={this.props.onTaskCloseFunc}/>
                            </span>
                            }

                        </div>

                    </Chip> }

                    <Chip className="clickableChip" style={{backgroundColor: "#eeeeee", flexBasis: 'min-content', minWidth: '40px'}}>
                        <div style={{display:"block"}}>
                            Actions
                            <span style={{float: "right", marginLeft: "10px"}}>
                                 <FontIcon className={this.props.eventActionsVisible?"fa fa-eye":"fa fa-eye-slash"}
                                           style={{ cursor: "pointer", marginRight:'2px', fontSize: "12px"}} onClick={this.props.onToggleActionsVisibilityFunc}/>
                            </span>

                        </div>
                    </Chip>


                </div>
                <div style={{position:"absolute",right:"10px",top:"10px", fontSize:'10px', height:'26px'}}>
                    {this.props.expandedEventWindow
                        ?
                        <FontIcon className="fa fa-compress" style={{ cursor: "pointer", fontSize:'15px', marginRight:'9px'}} onClick={this.props.onCompressFunc}/>
                        :
                        <FontIcon className="fa fa-expand" style={{ cursor: "pointer", fontSize:'15px', marginRight:'9px'}} onClick={this.props.onExpandFunc}/> }
                </div>
            </div>

            <div style={{display:"flex", flexDirection:"column", justifyContent: "space-between", height:"100%"}}>
                <div id="eventGroupChatContent" style={{  overflowY:"auto", marginTop:'40px'}}>

                    {this.props.canBeMore &&
                        <div
                            className="cyan-text"
                            style={{fontSize:'12px', cursor:"pointer" }}
                            onClick={this.props.onLoadPreviousEvents}>
                            Load previous posts...
                        </div>}


                    {
                        this.props.displayedEvents.map(p =>
                            this.renderPost(p)
                        )
                    }
                </div>
                <div style={{display:"flex", minHeight:'35px', marginTop:'5px'}}>
                    <TextFieldExt
                        name="sendPost"
                        style={{width:"100%"}}
                        ref={(c)=>{this.postField=c}}
                        onEnterKeyDown={this.onPostSubmit}
                    />
                    <FlatButton
                        primary={true} label="Post"
                        onClick={this.onPostSubmit}
                    />
                </div>
            </div>
        </Paper>
    }
}


const mapStateToProps = (state: ReduxState, ownProps: Props): ReduxProps => {

    return {
        canBeMore: displaySeletectedEventGroupSelector(state)!=null?  displaySeletectedEventGroupSelector(state).canBeMore : false,
        displayedEvents: eventsSelector(state),
        eventWindowVisible: state.eventsState.eventWindowVisible,
        expandedEventWindow: state.eventsState.expandedEventWindow,
        task: state.eventsState.selectedTask,
        no: state.eventsState.selectedNo,
        eventActionsVisible: state.eventsState.eventActionsVisible
    }
};


const mapDispatchToProps = (dispatch, ownProps: Props): PropsFunc => {
    return {
        onPostEventFunc: (authorId: number, content: string) => {
            dispatch(sendEvent(authorId, content))
        },
        onCompressFunc: () => {
            dispatch(EXPAND_EVENTS_WINDOW.new({expanded: false}))
        },
        onExpandFunc: () => {
            dispatch(EXPAND_EVENTS_WINDOW.new({expanded: true}))
        },
        onTaskCloseFunc: () => {
            dispatch(SHOW_TASK_EVENTS.new({task: null, no: null, toggle: false}))
        },
        onToggleActionsVisibilityFunc: () => {
            dispatch(TOGGLE_EVENT_ACTIONS_VISIBILITY.new({}))
        },
        onLoadPreviousEvents: () => {
            dispatch(loadPreviousEventsAction());
        }
    }
};

export const EventGroupPanel = connect(mapStateToProps, mapDispatchToProps)(EventGroupPanelInternal);