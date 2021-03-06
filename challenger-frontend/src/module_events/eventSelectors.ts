import {Selector, createSelector} from "reselect";
import {ReduxState} from "../redux/ReduxState";
import {EventGroupDTO, DateDiscrimUI, DisplayedEventUI, EventType, EventDTO, EventGroupSynchDTO} from "./EventDTO";
import {selectedChallengeParticipantsSelector, ChallengeParticipantDTO} from "../module_challenges/index";
import {TaskDTO, allTasksSelector} from "../module_tasks/index";
import {loggedUserSelector} from "../module_accounts/accountSelectors";
import {AccountDTO} from "../module_accounts/AccountDTO";

export const displaySeletectedEventGroupSelector: Selector<ReduxState,EventGroupSynchDTO> = (state: ReduxState): EventGroupSynchDTO =>
    state.eventsState.eventGroups.find(eg=>eg.challengeId == state.challenges.selectedChallengeId)

const displayTaskSelector: Selector<ReduxState,TaskDTO> = (state: ReduxState): TaskDTO => state.eventsState.selectedTask


const eventActionsVisibleSelector: Selector<ReduxState,boolean> = (state: ReduxState): boolean => state.eventsState.eventActionsVisible



export const eventsSelector: Selector<ReduxState,Array<DisplayedEventUI | DateDiscrimUI>> = createSelector(
    loggedUserSelector,
    selectedChallengeParticipantsSelector,
    displaySeletectedEventGroupSelector,
    eventActionsVisibleSelector,
    allTasksSelector,
    displayTaskSelector,

    (account: AccountDTO, challengeParticipants: Array<ChallengeParticipantDTO>, eventGroups: EventGroupSynchDTO, eventActionsVisible: boolean, allTasks: Array<TaskDTO>, filteredTask?: TaskDTO) => {

        if (eventGroups == null || eventGroups.events == null)
            return [];

        var accountId=account!=null? account.id: null;
        var events: Array<DisplayedEventUI> = eventGroups.events
            .filter(p=> (filteredTask == null || p.taskId == filteredTask.id) && (eventActionsVisible || (p.eventType != EventType.UNCHECKED_TASK && p.eventType!=EventType.CHECKED_TASK)))
            .sort((a, b)=> {
                if (a.readDate != null && b.readDate != null) return a.readDate - b.readDate;
                else if (a.readDate != null)
                    return -1;
                else if (b.readDate != null)
                    return 1;
                else return a.id - b.id;

            }).map(p=> {

                var cp=challengeParticipants.find(cp=>cp.id == p.authorId);



                return {
                    kind: 'DisplayedEventUI',
                    id: p.id,
                    authorId: p.authorId,
                    eventType: p.eventType,
                    // maybe should be taken with explicitely spcified challengeId

                    // mode that to selector
                    authorOrdinal: cp!=null? cp.ordinal : -1,
                    authorLabel: cp!=null? cp.label : "<user deleted>",
                    postContent: p.content,
                    isNew: p.readDate == null && p.authorId!=accountId,
                    sentDate: new Date(p.sentDate),
                    readDate: p.readDate != null ? new Date(p.readDate) : null,
                    task: p.taskId != null ? allTasks[p.taskId] : null
                }
            }).filter(p=>p != null)

        const arr: Array<DisplayedEventUI | DateDiscrimUI> = [];
        var lastDateDiscrim = null;
        events.forEach(t => {
            var checkDate = t.readDate != null ? t.readDate : t.sentDate;
            checkDate.setFullYear(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
            if (lastDateDiscrim == null || lastDateDiscrim.date.yy_mm_dd() != checkDate.yy_mm_dd()) {
                var isToday = new Date().yy_mm_dd() == checkDate.yy_mm_dd();
                var yd = new Date();
                yd.setDate(yd.getDate() - 1);
                var isYesterday = yd.toDateString() == checkDate.toDateString();

                var title;
                if (isToday)
                    title = "Today";
                else if (isYesterday)
                    title = "Yesterday";
                else title = checkDate.dayMonth3();//yy_mm_dd();

                lastDateDiscrim = {kind: 'DateDiscrimUI', date: checkDate, id: checkDate.getTime(), title: title}
                arr.push(lastDateDiscrim as DateDiscrimUI)
            }

            arr.push(t as DisplayedEventUI)
        })
        return arr;

    }
)
