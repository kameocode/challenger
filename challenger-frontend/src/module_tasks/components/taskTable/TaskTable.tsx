import * as React from "react";
import {ReduxState, connect} from "../../../redux/ReduxState";
import {Table, TableBody, TableRow, TableRowColumn} from "material-ui/Table";
import Paper from "material-ui/Paper";
import DifficultyIconButton from "./DifficultyIconButton";
import TaskCheckbox from "./ChallengeTableCheckbox";
import {TaskDTO, TaskProgressDTO, TaskUserDTO, TaskType} from "../../TaskDTO";
import {markTaskDoneOrUndone, onCloseTask} from "../../taskActions";
import {OPEN_EDIT_TASK} from "../../taskActionTypes";
import {ResizeAware} from "../../../views/Constants";
import {TaskLabel} from "../TaskLabel";
import {SHOW_TASK_EVENTS} from "../../../module_events/eventActionTypes";
import {makeGetTasksForUserAndDay, makeBusyTasksSelectorForUserAndDay} from "../../taskSelectors";
import {jwtTokenOfUserWithId} from "../../../module_challenges/challengeSelectors";

const styles = {
    icon: {
        width: '50px',
        padding: '0px'
    },
    label: {
        padding: '5px'
    },
    taskType: {
        width: '40px',
        padding: '0px',
        color: 'grey',
        fontSize: '11px',
        borderLeft:'5px solid white'
    },

};
interface Props {
    challengeId: number
    user: TaskUserDTO,
    userIsAuthorized: boolean,
    no: number,
    showAuthorizeFuncIfNeeded: (eventTarget: EventTarget, userId: number)=>Promise<boolean>
}

interface ReduxProps {
    currentDate: Date,
    today: Date,
    tasksList: Array<TaskDTO>,
    busy: boolean,
    userIsLogged: boolean
}


interface ReduxPropsFunc {
    onTaskCheckedStateChangedFunc: (caller: TaskUserDTO, challengeId: number, taskProgress: TaskProgressDTO)=>void;
    onEditTask: (task: TaskDTO)=>void;
    onShowTaskEvents: (task: TaskDTO, no: number, toggle: boolean) => void;
    onCloseTask: (task: TaskDTO)=>void;
}


class TaskTableInternal extends React.Component<Props & ReduxProps & ReduxPropsFunc, void> {

    constructor(props) {
        super(props);


    }



    handleResize = (e) => {
        this.forceUpdate();
    };

    onTaskCheckedStateChangedFunc = (taskDTO) => {
        var taskProgressDTO = {
            taskId: taskDTO.id,
            done: taskDTO.done,
            progressTime: this.props.currentDate.getTime()
        };
        this.props.onTaskCheckedStateChangedFunc(this.props.user, this.props.challengeId, taskProgressDTO);
    };

    isDateFromFuture() {
        if (this.props.currentDate > new Date())
            return true;
        return false;
    }


    render() {
        var height = Math.max(300, Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 300) + "px";
        var other = {minHeight: height, height: height, overflowY: "auto", overflowX: "none"};

        //TODO delay wyszarzenie jesli call nie wrocil
        if (this.props.busy) {
            Object.assign(other, {opacity: "0.4"});
        }


        return (<Paper style={{padding: '10px', display: "inline-block"}}>
                <div style={other}>

                    {this.props.tasksList.length == 0 &&
                    <div style={{padding: '10px',fontSize: '18px', color: "#BBB"}}>No tasks have been added or is visible for specified day</div>
                    }
                    <Table selectable={false}
                           fixedHeader={true}>
                        <TableBody displayRowCheckbox={false}>
                            { this.props.tasksList.map(task =>
                                <TableRow key={task.id}>
                                    <TableRowColumn style={styles.icon}>
                                        <DifficultyIconButton
                                            no={this.props.no}
                                            task={task}
                                            userIsLogged={this.props.userIsLogged}
                                            onEditTask={this.props.onEditTask}
                                            onShowTaskEvents={this.props.onShowTaskEvents}
                                            showTooltip={true}
                                            onCloseTask={this.props.onCloseTask}
                                        />
                                    </TableRowColumn>
                                    <TableRowColumn style={styles.label}>
                                        <TaskLabel
                                            no={this.props.no}
                                            taskDTO={task}
                                            user={this.props.user}
                                        />
                                    </TableRowColumn>
                                    <TableRowColumn style={styles.taskType}>
                                        {task.taskType == TaskType.onetime ?
                                            new Date(task.dueDate).dayMonth3()
                                            : task.taskType}
                                    </TableRowColumn>
                                    <TableRowColumn style={{width: '45px', padding: '10px'}}>
                                        {!this.isDateFromFuture() &&
                                        <TaskCheckbox
                                            no={this.props.no}
                                            userId={this.props.user.id}
                                            taskDTO={task}
                                            showAuthorizeFuncIfNeeded={this.props.showAuthorizeFuncIfNeeded}
                                            onTaskCheckedStateChangedFunc={this.onTaskCheckedStateChangedFunc}
                                            authorized={this.props.userIsAuthorized}
                                        />
                                        }
                                    </TableRowColumn>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>


                </div>
            </Paper>

        );
    }
}
const mapStateToProps = () => {
    // component instance selectors
    const tasksForUserAndDay = makeGetTasksForUserAndDay();
    const busyTasksSelectorForUserAndDay = makeBusyTasksSelectorForUserAndDay();


    // real mapStateToProps function
    const mapStateToPropsInternal = (state: ReduxState, ownprops: Props): ReduxProps => {

        var tasksLists = tasksForUserAndDay(state, ownprops.user.id);
        var userIsLogged=jwtTokenOfUserWithId(state,ownprops.user.id)!=null;
        return {
            userIsLogged: userIsLogged,
            currentDate: state.currentSelection.day,
            today: state.currentSelection.today, // in order to force refresh on invisible checkboxes
            tasksList: tasksLists,
            busy: busyTasksSelectorForUserAndDay(state, tasksLists)
        }
    }
    return mapStateToPropsInternal
}


const mapDispatchToProps = (dispatch): ReduxPropsFunc => {
    return {
        onTaskCheckedStateChangedFunc: (caller: TaskUserDTO, challengeId: number, taskProgress: TaskProgressDTO)=> {
            dispatch(markTaskDoneOrUndone(caller, challengeId, taskProgress));
        },
        onEditTask: (task: TaskDTO) => {
            dispatch(OPEN_EDIT_TASK.new(task))
        },
        onShowTaskEvents: (task: TaskDTO, no: number, toggle: boolean) => {
            dispatch(SHOW_TASK_EVENTS.new({task, no, toggle}))
        },
        onCloseTask: (task: TaskDTO) => {
            dispatch(onCloseTask(task));
        }

    }
};


export const TaskTable = connect(mapStateToProps as any, mapDispatchToProps)(ResizeAware(TaskTableInternal)) as React.ComponentClass<Props>;

