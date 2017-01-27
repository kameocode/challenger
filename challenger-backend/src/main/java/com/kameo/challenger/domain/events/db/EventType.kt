package com.kameo.challenger.domain.events.db


enum class EventType {
    POST,
    CREATE_TASK,
    UPDATE_TASK,
    ACCEPT_TASK,
    REJECT_TASK,
    CHECKED_TASK,
    UNCHECKED_TASK,
    DELETE_TASK,
    CLOSE_TASK,
    ACCEPT_CHALLENGE,
    REJECT_CHALLENGE,
    REMOVE_CHALLENGE,   //GLOBAL
    UPDATE_CHALLENGE,
    INVITE_USER_TO_CHALLENGE,
    REMOVE_USER_FROM_CHALLENGE,
    REMOVE_ME_FROM_CHALLENGE  //GLOBAL
}