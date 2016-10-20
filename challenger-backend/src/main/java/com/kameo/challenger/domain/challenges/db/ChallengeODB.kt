package com.kameo.challenger.domain.challenges.db

import com.google.common.collect.Lists
import com.kameo.challenger.domain.accounts.db.UserODB
import com.kameo.challenger.odb.api.IIdentity
import javax.persistence.*
import javax.persistence.Entity

@Entity
data class ChallengeODB(@Id
                        @GeneratedValue(strategy = javax.persistence.GenerationType.AUTO)
                        override var id: Long = 0) : IIdentity {

    var label: String? = null

    @ManyToOne(targetEntity = UserODB::class)
    lateinit var createdBy: UserODB

    @Enumerated
    lateinit var challengeStatus: ChallengeStatus

    @OneToMany(mappedBy = "challenge")
    var participants: List<ChallengeParticipantODB> = Lists.newArrayList<ChallengeParticipantODB>()
}