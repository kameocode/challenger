//import * as Rx from 'rxjs/Rx'; /*   "rxjs": "^5.0.0-beta.12"*/
import {VisibleChallengesDTO} from "../module_challenges/ChallengeDTO";
import {TaskDTO, TaskProgressDTO, TaskApprovalDTO} from "../module_tasks/TaskDTO";
import {RegisterResponseDTO} from "../module_accounts/RegisterResponseDTO";
import {EventGroupDTO} from "./domain/EventGroupDTO";
import {EventDTO} from "./domain/EventDTO";



$(function() {
    $.ajaxSetup({
        error: function(jqXHR, exception) {

            console.log("Error "+jqXHR.status+" "+jqXHR.responseText);


            /*        if (jqXHR.status === 0) {
             alert('Not connect.\n Verify Network.');
             } else if (jqXHR.status == 404) {
             alert('Requested page not found. [404]');
             } else if (jqXHR.status == 500) {
             alert('Internal Server Error [500].');
             } else if (jqXHR.status == 401) {
             console.log("UNAUTHORIZED [401]");
             } else if (exception === 'parsererror') {
             alert('Requested JSON parse failed.');
             } else if (exception === 'timeout') {
             alert('Time out error.');
             } else if (exception === 'abort') {
             alert('Ajax request aborted.');
             } else {
             alert('Uncaught Error.\n' + jqXHR.responseText);
             }*/
        }
    });
});

class AjaxWrapper {
    baseUrl: string;
    webToken: string;


    login(login: string, pass: string): JQueryPromise<string> {
        return $.ajax({
            url: this.baseUrl + "/newToken",
            type: 'POST',
            data: {
                'login': login,
                'pass': pass
            },
        });
    }

    register(email: string, login: string, pass: string): JQueryPromise<RegisterResponseDTO> {
        return $.ajax({
            url: this.baseUrl + "/accounts/register",
            type: 'POST',
            contentType:  "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({
                'email':email,
                'login': login,
                'pass': pass
            })
        });
    }

    renewToken(login: string, jwtToken: string) {
        return $.ajax({
            url: this.baseUrl + "/renewToken",
            headers: {
                "Authorization": "Bearer " + jwtToken
            },
        });
    }

    loadVisibleChallenges(callbackData: (VisibleChallengesDTO)=>(void)) {
        $.ajax({
            url: this.baseUrl + "/challenge/visibleChallenges",
            headers: {
                "Authorization": "Bearer " + this.webToken
            }
        }).then(data=>callbackData(data));
    }



    //not used
    loadIconFromServer(iconId: number, callbackData: (string)=>void) {
        $.ajax({
            url: this.baseUrl + "/newAvatar/" + iconId,
            cache: false,
            success:
                (data)=>callbackData(data)

        });
    }

   yymmdd(d: Date):string {
        var mm = d.getMonth() + 1; // getMonth() is zero-based
        var dd = d.getDate();

        return [d.getFullYear().toString().substr(2,2),  mm, dd].join('-'); // padding
    };


    loadTasks(challengeId: number, date: Date) {

        var formattedDate = date.yy_mm_dd();//date.toISOString().slice(0, 10);
        return $.ajax({
            url: this.baseUrl+ "/tasks"+"/"+challengeId +"/"+formattedDate ,
            headers: {
                "Authorization": "Bearer " + this.webToken
            }
        });
    }


    updateTask(task, callback) {
        $.ajax({
            url: this.baseUrl+ "/updateTask",
            data: JSON.stringify(task),

            contentType:  "application/json; charset=utf-8",
            dataType: "json",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + this.webToken
            }
        }).then(function (updatedTask) {
            callback(updatedTask);
        });
    }

    changeTaskStatus(task, callback) {
        $.ajax({
            url: this.baseUrl+ "/changeTaskStatus",
            data: JSON.stringify(task),

            contentType:  "application/json; charset=utf-8",
            dataType: "json",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + this.webToken
            }
        }).then(function (updatedTask) {
            callback(updatedTask);
        });
    }



    updateTaskProgress(taskProgress: TaskProgressDTO, callback: (taskProgress:TaskProgressDTO)=>void) {
        $.ajax({
            url: this.baseUrl+ "/updateTaskProgress",
            data: JSON.stringify(taskProgress),

            contentType:  "application/json; charset=utf-8",
            dataType: "json",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + this.webToken
            }
        }).then(function (updatedTaskProgress) {
            callback(taskProgress);
        });
    }

    updateTaskStatus(taskStatus: TaskApprovalDTO, jwtTokens :Array<String>, callback: (task:TaskDTO)=>void) {
        $.ajax({
            url: this.baseUrl+ "/updateTaskStatus",
            data: JSON.stringify(taskStatus),

            contentType:  "application/json; charset=utf-8",
            dataType: "json",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + jwtTokens.join(" ")
            }
        }).then(function (task) {
            callback(task);
        });
    }
    loadPostsForChallenge(challengeId: number): JQueryPromise<EventGroupDTO> {
        return $.ajax({
            url: this.baseUrl + "/events/challenge/"+challengeId,
            headers: {
                "Authorization": "Bearer " + this.webToken
            }
        });
    }

    loadPostsForTask(task: TaskDTO) {
       return $.ajax({
            url: this.baseUrl + "/events/"+task.id,
            headers: {
                "Authorization": "Bearer " + this.webToken
            }
        });
    }


    sendEvent(event: EventDTO):  JQueryPromise<EventDTO>  {
        return $.ajax({
            url: this.baseUrl+ "/events/sendEvent",
            data: JSON.stringify(event),
            contentType:  "application/json; charset=utf-8",
            dataType: "json",
            type: "POST",
            headers: {
                "Authorization": "Bearer " + this.webToken
            }
        });
    }



}
const ajaxWrapper=new AjaxWrapper();
export default ajaxWrapper;