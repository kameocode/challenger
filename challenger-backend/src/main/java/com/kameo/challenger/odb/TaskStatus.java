package com.kameo.challenger.odb;

import java.io.Serializable;

/**
 * Created by kmyczkowska on 2016-08-31.
 */
public enum TaskStatus implements Serializable {
    waiting_for_acceptance,
    accepted,
    rejected
}

