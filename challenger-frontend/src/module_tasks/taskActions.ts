import {TaskDTO, TaskProgressDTO, TaskApprovalDTO, createTaskDTOListKey, TaskDTOListForDay, TaskUserDTO} from "./TaskDTO";
import {ReduxState} from "../redux/ReduxState";
import {
    MODIFY_TASK_OPTIMISTIC,
    MODIFY_TASK_REQUEST,
    DELETE_TASK_OPTIMISTIC,
    MARK_TASK_DONE_OPTIMISTIC,
    TASK_PROGRESS_REQUEST,
    LOAD_TASKS_REQUEST_OLDWAY,
    LOAD_TASKS_RESPONSE_OLDWAY,
    CLOSE_TASK_OPTIMISTIC,
    LOAD_TASK_PROGRESSES_REQUEST,
    LOAD_TASK_PROGRESSES_RESPONSE, LOAD_TASKS_REQUEST_NEWWAY, LOAD_TASKS_RESPONSE_NEWWAY
} from "./taskActionTypes";
import {DISPLAY_REQUEST_IN_PROGRESS} from "../redux/actions/actions";
import {WebState} from "../logic/domain/Common";
import * as webCall from "./taskWebCalls";
import {authPromiseErr} from "../module_accounts/accountActions";
import {jwtTokensOfChallengeParticipants} from "../module_challenges/index";


export function updateTask(task: TaskDTO) {
    return function (dispatch, getState: ()=>ReduxState) {
        dispatch(MODIFY_TASK_OPTIMISTIC.new(task));
        dispatch(MODIFY_TASK_REQUEST.new(task));
        if (task.id <= 0) {
            webCall.createTask(task)
                .then((task: TaskDTO)=> {
                    dispatch(fetchTasks(getState().challenges.selectedChallengeId, getState().currentSelection.day));
                }).catch((reason)=>authPromiseErr(reason, dispatch));
        } else {
            webCall.updateTask(task)
                .then((task: TaskDTO)=> {
                    dispatch(fetchTasks(getState().challenges.selectedChallengeId, getState().currentSelection.day));
                }).catch((reason)=>authPromiseErr(reason, dispatch));
        }
        dispatch(displayInProgressWebRequestsIfAny());
    }
}

export function deleteTask(task: TaskDTO) {
    return function (dispatch, getState: ()=>ReduxState) {
        task.deleted = true;
        dispatch(DELETE_TASK_OPTIMISTIC.new(task));
        dispatch(MODIFY_TASK_REQUEST.new(task));
        webCall.deleteTask(task).then(()=> {
            dispatch(fetchTasks(getState().challenges.selectedChallengeId, getState().currentSelection.day));
        }).catch((reason)=>authPromiseErr(reason, dispatch));
        dispatch(displayInProgressWebRequestsIfAny());
    }
}

function displayInProgressWebRequestsIfAny() {
    return function (dispatch, getState: ()=>ReduxState) {
        setTimeout(() => {
            dispatch(DISPLAY_REQUEST_IN_PROGRESS.new({}));
        }, 500); // after half sec
    }
}

export function markTaskDoneOrUndone(caller: TaskUserDTO, challengeId: number, taskProgress: TaskProgressDTO) {
    return function (dispatch, getState: ()=>ReduxState) {
        var state: ReduxState = getState();
        var key: string = createTaskDTOListKey(challengeId, new Date(taskProgress.progressTime));


        var task: TaskDTOListForDay = getState().tasksState.tasksForDays[key];
        dispatch(MARK_TASK_DONE_OPTIMISTIC.new({challengeId, taskProgress}));
        dispatch(TASK_PROGRESS_REQUEST.new({challengeId, taskProgress}));

        webCall.updateTaskProgress(challengeId, taskProgress, caller.jwtToken)
            .then((tpRes: TaskProgressDTO)=> {

                // tpRes caused wrong date (previous day), cause response had zeroed hour
                dispatch(fetchTasks(challengeId, new Date(taskProgress.progressTime)));
            }).catch((reason)=>authPromiseErr(reason, dispatch));

        dispatch(displayInProgressWebRequestsIfAny());

    }
}

export function fetchTasksProgresses(challengeId: number, day: Date): any {
    return function (dispatch) {
        dispatch(LOAD_TASK_PROGRESSES_REQUEST.new({challengeId, day}));
        var key: string = createTaskDTOListKey(challengeId, day);

        webCall.loadTaskProgresses(challengeId, day, false).then(
            (taskProgresses: Array<TaskProgressDTO>)=> {

                var payload = {taskProgresses, challengeId, day, webState: WebState.FETCHED};
                // console.log(payload);
                // taskProgresses: TaskProgressDTO[], challengeId: number, day: Date}
                dispatch(LOAD_TASK_PROGRESSES_RESPONSE.new({payload}));

                dispatch(checkTasksNeedLoaading(challengeId, taskProgresses.map(tp=>tp.taskId)));
            }
        ).catch((reason)=>authPromiseErr(reason, dispatch));
    }
};
function checkTasksNeedLoaading(challengeId: number, taskIds: number[]): any {
    return function (dispatch, getState) {
        var state: ReduxState = getState();
        var newTaskIds = taskIds.map(taskId=> {
                var task = state.tasksState.allTasks[taskId];
                if (task == null)
                    return taskId;
                else return null;
            }
        ).filter(ta=>ta != null);
        dispatch(loadTasksNewWay(challengeId, newTaskIds));
    }
}

function loadTasksNewWay(challengeId: number, newTaskIds: number[]): any {
    return function (dispatch) {
        if (newTaskIds.length == 0)
            return;
        console.log("Task needs loading ", newTaskIds);
        dispatch(LOAD_TASKS_REQUEST_NEWWAY.new({challengeId}));
        webCall.loadTasksNewWay(challengeId, newTaskIds).then(
            (tasks: Array<TaskDTO>)=> {
                dispatch(LOAD_TASKS_RESPONSE_NEWWAY.new({tasks}));
            }
        ).catch((reason)=>authPromiseErr(reason, dispatch));
    }
}

export function fetchTasks(challengeId: number, day: Date): any {
    return function (dispatch) {
        console.log("fetch task progresses-start");
        dispatch(fetchTasksProgresses(challengeId, day));
        console.log("fetch task progresses-end");

        dispatch(LOAD_TASKS_REQUEST_OLDWAY.new({challengeId, day}));
        var key: string = createTaskDTOListKey(challengeId, day);

        webCall.loadTasks(challengeId, day).then(
            (taskList: Array<TaskDTO>)=> {
                var key: string = createTaskDTOListKey(challengeId, day);
                dispatch(LOAD_TASKS_RESPONSE_OLDWAY.new({
                    taskList: taskList,
                    challengeId: challengeId,
                    day: day,
                    lastUpdated: new Date(),
                    webState: WebState.FETCHED,
                    invalidTasksIds: []
                }))
            }
        ).catch((reason)=>authPromiseErr(reason, dispatch));
    }
};

export function fetchTasksWhenNeededAfterDelay(challengeId: number, day: Date, delay: number): any {
    return function (dispatch) {
        setTimeout(() => {
            dispatch(fetchTasksWhenNeeded(challengeId, day));
        }, delay); // 500 - after half sec
    }
};

export function fetchTasksWhenNeeded(challengeId: number, day: Date): any {
    return function (dispatch, getState: ()=>ReduxState) {
        var key: string = createTaskDTOListKey(challengeId, day);
        /* if (getState().tasksState.tasksForDays[key] != null)
         {
         console.log("TASK Is "+day+" "+WebState[getState().tasksState.tasksForDays[key].webState]);
         }*/
        if (getState().tasksState.tasksForDays[key] == null || getState().tasksState.tasksForDays[key].webState == WebState.NEED_REFETCH) {
            dispatch(fetchTasks(challengeId, day));
        }
    }
}

export function updateTaskStatus(challengeId: number, taskApproval: TaskApprovalDTO) {
    return function (dispatch, getState: ()=>ReduxState) {

        var state = getState();
        var day = state.currentSelection.day;
        var state = getState();
        var jwtTokensOfApprovingUsers = jwtTokensOfChallengeParticipants(state);
        webCall.updateTaskStatus(challengeId, taskApproval, jwtTokensOfApprovingUsers)
            .then((task: TaskDTO)=> {
                dispatch(fetchTasks(challengeId, day));
            }).catch((reason)=>authPromiseErr(reason, dispatch))
        dispatch(displayInProgressWebRequestsIfAny());
    }
}


export function onCloseTask(task: TaskDTO) {

    return function (dispatch, getState: ()=>ReduxState) {
        var state = getState();
        var jwtTokensOfApprovingUsers = jwtTokensOfChallengeParticipants(state);
        dispatch(CLOSE_TASK_OPTIMISTIC.new({task}));
        webCall.closeTask(task.challengeId, task, jwtTokensOfApprovingUsers)
            .catch((reason)=>authPromiseErr(reason, dispatch))
        dispatch(displayInProgressWebRequestsIfAny());
    }
}
