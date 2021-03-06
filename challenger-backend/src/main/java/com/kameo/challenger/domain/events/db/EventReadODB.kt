package com.kameo.challenger.domain.events.db

import com.kameo.challenger.domain.accounts.db.UserODB
import com.kameo.challenger.domain.challenges.db.ChallengeODB
import com.kameo.challenger.odb.api.IIdentity
import java.util.*
import javax.persistence.*
import javax.persistence.TemporalType.TIMESTAMP


@Entity
data class EventReadODB(@Id
                        /*@GeneratedValue(strategy = javax.persistence.GenerationType.AUTO)*/
                        override val id: Long = 0) : IIdentity {
    constructor (id: Long, userODB: UserODB, challengeODB: ChallengeODB, eventODB: EventODB) : this(id){
        this.challenge = challengeODB
        this.user = userODB
        this.event = eventODB
    }

    @ManyToOne
    @JoinColumn(updatable = false)
    lateinit var user: UserODB

    @ManyToOne
    @JoinColumn(updatable = false)
    lateinit var challenge: ChallengeODB

    @ManyToOne
    @JoinColumn(updatable = false)
    lateinit var event: EventODB

    @Temporal(TIMESTAMP)
    var read: Date? = null

}