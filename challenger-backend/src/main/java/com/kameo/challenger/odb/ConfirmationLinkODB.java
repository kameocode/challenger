package com.kameo.challenger.odb;

import com.kameo.challenger.odb.api.IIdentity;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

/**
 * Created by kmyczkowska on 2016-09-02.
 */
@Entity
@Data
@ToString(of= "id")
@NoArgsConstructor

public class ConfirmationLinkODB implements IIdentity {

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    long id;

    @NotNull
    String uid;

    @NotNull
    @Enumerated
    ConfirmationLinkType confirmationLinkType;

    String fieldLogin;
    String fieldPasswordHash;
    String fieldSalt;
    String email;
    Long challengeId;


    @Override
    public boolean isNew() {
        return getId()<0;
    }
}
