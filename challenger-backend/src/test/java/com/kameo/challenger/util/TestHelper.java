package com.kameo.challenger.util;


import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.kameo.challenger.domain.challenges.ChallengeODB;
import com.kameo.challenger.domain.challenges.ChallengeParticipantODB;
import com.kameo.challenger.domain.challenges.ChallengeStatus;
import com.kameo.challenger.logic.FakeDataLogic;
import com.kameo.challenger.odb.*;
import com.kameo.challenger.utils.MailService;
import com.kameo.challenger.utils.odb.AnyDAO;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.lang.invoke.MethodHandles;
import java.util.*;
import java.util.stream.Collectors;

/**
 * cucumber matchers:
 * quoted string  \"([^\"]*)\"
 * digit (\d+)
 */
public class TestHelper {
    public static Log log = LogFactory.getLog(MethodHandles.lookup().lookupClass());
    private final List<MailService.Message> messages = Lists.newArrayList();

    @Inject
    private AnyDAO anyDao;
    @Inject
    private FakeDataLogic fakeDataLogic;


    public List<UserODB> createUsers(String... logins) {
        return fakeDataLogic.createUsers(resolveLogins(logins));
    }

    public ChallengeODB createAcceptedChallenge(Iterator<UserODB> users) {
        return fakeDataLogic.createChallenge(users, ChallengeStatus.ACTIVE);
    }
    public ChallengeODB createAcceptedChallengeWithLabel(String label, Iterator<UserODB> users) {
        return fakeDataLogic.createChallengeWithLabel(label, users, ChallengeStatus.ACTIVE);
    }

    public ChallengeODB createPendingChallengeWithLabel(String label, Iterator<UserODB> users) {
        return fakeDataLogic.createChallengeWithLabel(label, users, ChallengeStatus.WAITING_FOR_ACCEPTANCE);
    }

    public ChallengeODB createPendingChallenge(Iterator<UserODB> users) {
        return fakeDataLogic.createChallenge(users, ChallengeStatus.WAITING_FOR_ACCEPTANCE);
    }

    public ChallengeODB createRejectedChallenge(Iterator<UserODB> users) {
        return fakeDataLogic.createChallenge(users, ChallengeStatus.REFUSED);
    }

    public UserODB myFriend() {
        return anyDao.streamAll(UserODB.class).where(u -> u.getLogin().equals("myFriend")).getOnlyValue();
    }

    public UserODB myself() {
        return anyDao.streamAll(UserODB.class).where(u -> u.getLogin().equals("myself")).getOnlyValue();
    }

    public Optional<UserODB> myselfOptional() {
        return anyDao.streamAll(UserODB.class).where(u -> u.getLogin().equals("myself")).findAny();
    }

    public ChallengeODB getActiveChallengeBetween(UserODB u1, UserODB u2) {

        return anyDao.streamAll(ChallengeParticipantODB.class)
              .where(c1->c1.getUser().equals(u1) && c1.getChallengeStatus()==ChallengeStatus.ACTIVE && c1.getChallenge().getChallengeStatus()==ChallengeStatus.ACTIVE)
              .join((c1, source) -> source.stream(ChallengeParticipantODB.class))
              .where(p->p.getOne().getChallenge().getId()==p.getTwo().getChallenge().getId()
                      && p.getOne().getId()!=p.getTwo().getId()
                      && p.getTwo().getChallengeStatus()==ChallengeStatus.ACTIVE).select(p->p.getOne().getChallenge()).findOne().get();


    }
    public ChallengeODB getChallengeBetween(UserODB u1, UserODB u2) {

        return anyDao.streamAll(ChallengeParticipantODB.class)
                     .where(c1->c1.getUser().equals(u1) )
                     .join((c1, source) -> source.stream(ChallengeParticipantODB.class))
                     .where(p->p.getOne().getChallenge().getId()==p.getTwo().getChallenge().getId()
                             && p.getOne().getId()!=p.getTwo().getId()
                             ).select(p->p.getOne().getChallenge()).findOne().get();


    }
    @Transactional
    public void clearSchema() {
        anyDao.getEm().createNativeQuery("TRUNCATE SCHEMA public AND COMMIT").executeUpdate();
        anyDao.getEm().clear();
        getSentMessagesList().clear();
    }

    @Transactional
    public void acceptAllTasks(long userId, List<TaskODB> collect) {
        for (TaskODB c : collect) {
            if (c.getUser().getId() != userId)
                throw new IllegalArgumentException();
            c.setTaskStatus(TaskStatus.accepted);
            anyDao.getEm().merge(c);
        }
    }

    public List<MailService.Message> getSentMessagesList() {
        return messages;
    }

    public UserODB resolveUserByLogin(String login) {
        String res = resolveLogin(login);
        try {

            UserODB user = anyDao.getOnlyOne(UserODB.class, p -> p.getLogin().equals(res));
            return user;
        } catch (NoSuchElementException ex) {
            throw new RuntimeException("More than one or zero users found with login '"+res+"'");
        }
    }

    public String[] resolveLogins(String ... logins) {
        return Arrays.stream(logins)
                     .map(s->resolveLogin(s))
                     .collect(Collectors.toList())
                     .toArray(new String[0]);
    }


    private String resolveLogin(String login) {
        login=login.trim();
        String res;
        if (Sets.newHashSet("me","mine","my","i","myself").contains(login.toLowerCase()))
            res="myself";
        else if (login.toLowerCase().equals("my friend"))
            res="myFriend";
        else res=login;
        return res;
    }

    public ChallengeODB resolveChallenge(String challenge) {
        return anyDao.getOnlyOne(ChallengeODB.class,cc->cc.getLabel().equals(challenge));
    }

    public TaskODB resolveTask(String arg1) {
        return anyDao.getOnlyOne(TaskODB.class,cc->cc.getLabel().equals(arg1));
    }


    Exception exception;

    public void pushException(Exception ex) {
        if (exception!=null)
            throw new IllegalArgumentException("More than one exception created and not checked");
        this.exception=ex;
    }

    public void popException() {
        if (exception==null)
            throw new IllegalArgumentException("No exception found");
        exception=null;
    }
}
