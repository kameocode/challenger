package com.kameo.challenger.domain.challenges

import com.google.common.base.Strings
import com.google.common.collect.Lists
import com.kameo.challenger.domain.accounts.AccountDAO
import com.kameo.challenger.domain.accounts.ConfirmationLinkDAO
import com.kameo.challenger.domain.challenges.db.ChallengeODB
import com.kameo.challenger.domain.challenges.db.ChallengeParticipantODB
import com.kameo.challenger.domain.challenges.db.ChallengeStatus
import com.kameo.challenger.domain.challenges.db.ChallengeStatus.*
import com.kameo.challenger.domain.events.EventGroupDAO
import com.kameo.challenger.domain.events.EventGroupDAO.ChallengeInviteRemoveUserEventInfo
import com.kameo.challenger.domain.events.db.EventODB
import com.kameo.challenger.domain.events.db.EventReadODB
import com.kameo.challenger.domain.events.db.EventType.*
import com.kameo.challenger.utils.odb.AnyDAONew
import com.kameo.challenger.utils.odb.EntityHelper
import com.kameo.challenger.utils.odb.newapi.unaryPlus
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.*
import javax.inject.Inject


@Component
@Transactional
open class ChallengeDAO(@Inject val anyDaoNew: AnyDAONew,
                        @Inject val accountDao: AccountDAO,
                        @Inject val eventGroupDAO: EventGroupDAO) {


    open fun createNewChallenge(userId: Long, cb: ChallengeODB): ChallengeODB {
        val challengeCreator = anyDaoNew.reload(cb.participants.find { it.user.id == userId }!!.user)
        for (cp in cb.participants) {
            // creator has accepted challenge by default
            cp.challengeStatus =
                    if (cp.user.id == userId)
                        ChallengeStatus.ACTIVE
                    else
                        ChallengeStatus.WAITING_FOR_ACCEPTANCE
            if (cp.user.id==userId)
                cp.lastSeen=Date()
        }


        val cpToSendEmails = cb.participants
                .filter { it.user.isNew() }
                .map {
                    it.user = accountDao.getOrCreateUserForEmail(it.user.email)
                    it
                }
        if (Strings.isNullOrEmpty(cb.label)) {
            cb.label = cb.participants.map { it.user.getLoginOrEmail() }.joinToString { it }.toLowerCase()
        }
        cb.challengeStatus =  if (cb.participants.size==1) ChallengeStatus.ACTIVE else ChallengeStatus.WAITING_FOR_ACCEPTANCE

        cb.createdBy = challengeCreator
        anyDaoNew.em.persist(cb)
        for (cp in cb.participants) {
            anyDaoNew.em.persist(cp)
            if (cpToSendEmails.contains(cp)) {
                accountDao.createAndSendChallengeConfirmationLink(cb, cp)
            }
        }
        cb.participants.filter { it.user.id != userId }.forEach {
            eventGroupDAO.createChallengeEventAfterServerAction(userId, cb, INVITE_USER_TO_CHALLENGE, ChallengeInviteRemoveUserEventInfo(it.user))
        }


        return cb

    }

    class ChallengeInfoDTO {
        var defaultChallengeId: Long? = null
            internal set

        var visibleChallenges: List<ChallengeODB> = Lists.newArrayList<ChallengeODB>()
            internal set
    }

    open fun getVisibleChallenges(callerId: Long): ChallengeInfoDTO {
        val res = ChallengeInfoDTO()

        val challengeParticipantsForThisUser = anyDaoNew.getAll(ChallengeParticipantODB::class, {
            it get ChallengeParticipantODB::user eqId callerId
            and {
                or { it get ChallengeParticipantODB::challengeStatus eq ChallengeStatus.WAITING_FOR_ACCEPTANCE }
                or { it get ChallengeParticipantODB::challengeStatus eq ChallengeStatus.ACTIVE }
            }
            it get ChallengeParticipantODB::challenge get ChallengeODB::challengeStatus notEq ChallengeStatus.REMOVED
        })


        res.visibleChallenges = challengeParticipantsForThisUser.map { it.challenge }
        res.visibleChallenges.forEach { EntityHelper.initializeCollection(it.participants) }



        res.defaultChallengeId = calculateLastSeenChallengeId(challengeParticipantsForThisUser, res.visibleChallenges)
        return res
    }


    private fun calculateLastSeenChallengeId(challengeParticipantsForThisUser: List<ChallengeParticipantODB>,
                                             visibleChallenges: List<ChallengeODB>): Long? {
        if (!visibleChallenges.isEmpty()) {
            val challengeToLastSeen = mutableMapOf<ChallengeODB, Date>()
            for (cp in challengeParticipantsForThisUser) {
                challengeToLastSeen.put(cp.challenge, cp.lastSeen ?: Date(0))
            }
            return visibleChallenges.filter{ ch-> challengeParticipantsForThisUser.any{it.challengeStatus==ACTIVE && it.challenge.id==ch.id} }.sortedByDescending {
                challengeToLastSeen[it]
            }.firstOrNull()?.id
        }
        return null
    }


    open fun updateChallengeState(callerId: Long, challengeId: Long, status: ChallengeStatus) {
        if (status != ChallengeStatus.ACTIVE && status != ChallengeStatus.REFUSED)
            throw IllegalArgumentException()
        var challenge=anyDaoNew.find(ChallengeODB::class, challengeId)
        if (challenge.challengeStatus==REMOVED)
            throw IllegalArgumentException("Challenge is deleted");
        val waitingParticipation = anyDaoNew.getOne(ChallengeParticipantODB::class) {
            it get ChallengeParticipantODB::challenge eqId challengeId
            it get ChallengeParticipantODB::user eqId callerId
            it get ChallengeParticipantODB::challengeStatus eq ChallengeStatus.WAITING_FOR_ACCEPTANCE
        }
        waitingParticipation.challengeStatus = status
        if (status == ACTIVE)
            waitingParticipation.lastSeen = Date()

        anyDaoNew.em.merge(waitingParticipation)

        // set state to active only if everybody answered
        val stillWaiting = anyDaoNew.exists(ChallengeParticipantODB::class) {
            it get ChallengeParticipantODB::challenge eqId challengeId
            it get ChallengeParticipantODB::challengeStatus eq ChallengeStatus.WAITING_FOR_ACCEPTANCE
        }

        if (!stillWaiting) {
            challenge.challengeStatus=ACTIVE
            anyDaoNew.merge(challenge)
        }

        eventGroupDAO.createChallengeEventAfterServerAction(callerId, waitingParticipation.challenge, when (status) {
            ACTIVE -> ACCEPT_CHALLENGE
            REFUSED -> REJECT_CHALLENGE
            else -> throw IllegalArgumentException()
        })

    }


    open fun deleteChallenge(callerId: Long, challengeId: Long): Boolean {

        val challengeODB = anyDaoNew.find(ChallengeODB::class, challengeId)
        if (challengeODB.createdBy.id != callerId) {
            throw IllegalArgumentException("No permissions to delete")
        }
        challengeODB.challengeStatus = ChallengeStatus.REMOVED
        anyDaoNew.merge(challengeODB)


        eventGroupDAO.createChallengeEventAfterServerAction(callerId, challengeODB, REMOVE_CHALLENGE)

        return true
    }

    open fun updateChallenge(callerId: Long, challenge: ChallengeODB): ChallengeODB {
        val challengeODB = anyDaoNew.find(ChallengeODB::class, challenge.id)
        if (challengeODB.createdBy.id != callerId) {
            throw IllegalArgumentException("No permissions to modify")
        }

        val challengeChanged = !challenge.label.equals(challengeODB.label)
        challengeODB.label = challenge.label
        anyDaoNew.merge(challengeODB)


        // adding new participants
        challenge.participants.filter {
            !challengeODB.participants.filter { it.challengeStatus != REMOVED }.map { it.user.id }.contains(it.user.id)
        }.forEach {
            //TODO email verification?>
            if (it.user.isNew()) {
                it.user = accountDao.getOrCreateUserForEmail(it.user.email)
            }
            anyDaoNew.em.persist(it)
            accountDao.createAndSendChallengeConfirmationLink(challengeODB, it)
            eventGroupDAO.createChallengeEventAfterServerAction(callerId, challengeODB, INVITE_USER_TO_CHALLENGE, ChallengeInviteRemoveUserEventInfo(it.user))
        }

        // deleting existing participants
        challengeODB.participants.filter {
            !challenge.participants.map { it.user.id }.contains(it.user.id)
        }.forEach {

            it.challengeStatus = REMOVED
            anyDaoNew.merge(it)
            eventGroupDAO.createChallengeEventAfterServerAction(callerId, challengeODB, REMOVE_USER_FROM_CHALLENGE, ChallengeInviteRemoveUserEventInfo(it.user))



            eventGroupDAO.createGlobalEventAfterServerAction(callerId, challengeODB, REMOVE_ME_FROM_CHALLENGE, ChallengeInviteRemoveUserEventInfo(it.user), recipients = it.user);

        }


        if (challengeChanged)
            eventGroupDAO.createChallengeEventAfterServerAction(callerId, challengeODB, UPDATE_CHALLENGE)
        return challengeODB
    }
}