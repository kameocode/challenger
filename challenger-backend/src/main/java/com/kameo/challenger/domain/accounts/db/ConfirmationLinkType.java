package com.kameo.challenger.domain.accounts.db;

import java.io.Serializable;

public enum ConfirmationLinkType implements Serializable {
    EMAIL_CONFIRMATION,
    CHALLENGE_CONTRACT_CONFIRMATION,
    PASSWORD_RESET
}