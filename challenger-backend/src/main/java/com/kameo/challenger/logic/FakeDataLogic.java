package com.kameo.challenger.logic;


import com.google.common.collect.Lists;
import com.kameo.challenger.domain.challenges.ChallengeODB;
import com.kameo.challenger.domain.challenges.ChallengeParticipantODB;
import com.kameo.challenger.domain.challenges.ChallengeStatus;
import com.kameo.challenger.odb.*;
import com.kameo.challenger.utils.DateUtil;
import com.kameo.challenger.utils.PasswordUtil;
import com.kameo.challenger.utils.odb.AnyDAO;
import org.apache.commons.lang.time.DateUtils;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.util.*;


@Component
@Transactional
public class FakeDataLogic implements CommandLineRunner {

    public static Data data = new Data();
    @Inject
    private AnyDAO anyDao;

    private void approveTaskForCreator(TaskODB task) {
        TaskApprovalODB ta = new TaskApprovalODB();
        ta.setTask(task);
        ta.setUser(task.getCreatedByUser());
        ta.setTaskStatus(TaskStatus.accepted);
        anyDao.getEm().merge(ta);
    }
    @Override
    public void run(String... strings) throws Exception {
        if (anyDao.streamAll(UserODB.class).findFirst().isPresent())
            return;


        createUsers();


        EntityManager em = anyDao.getEm();

        ChallengeODB contract1 = new ChallengeODB();

        contract1.setLabel("kami vs jack");
        contract1.setChallengeStatus(ChallengeStatus.ACTIVE);
        contract1.setCreatedBy(data.userKami);
        em.persist(contract1);
        ChallengeParticipantODB cp=new ChallengeParticipantODB();
        cp.setUser(data.userKami);
        cp.setChallenge(contract1);
        cp.setChallengeStatus(ChallengeStatus.ACTIVE);
        em.persist(cp);
        cp=new ChallengeParticipantODB();
        cp.setUser(data.userJack);
        cp.setChallenge(contract1);
        cp.setChallengeStatus(ChallengeStatus.ACTIVE);
        em.persist(cp);

        TaskODB ac1 = new TaskODB();
        ac1.setUser(data.userJack);
        ac1.setCreatedByUser(data.userKami);
        ac1.setChallenge(contract1);
        ac1.setLabel("Test action - createdByKami");
        ac1.setTaskStatus(TaskStatus.waiting_for_acceptance);
        ac1.setDifficulty(1);
        ac1.setIcon("fa-car");
        ac1.setTaskType(TaskType.daily);
        em.persist(ac1);
        approveTaskForCreator(ac1);


        TaskODB ac11 = new TaskODB();
        ac11.setUser(data.userJack);
        ac11.setCreatedByUser(data.userJack);
        ac11.setChallenge(contract1);
        ac11.setLabel("Test action - createdByJack");
        ac11.setTaskStatus(TaskStatus.waiting_for_acceptance);
        ac11.setDifficulty(1);
        ac11.setIcon("fa-star");
        ac11.setTaskType(TaskType.daily);
        em.persist(ac11);
        approveTaskForCreator(ac11);

        TaskODB ac2 = new TaskODB();
        ac2.setUser(data.userJack);
        ac2.setCreatedByUser(data.userKami);
        ac2.setChallenge(contract1);
        ac2.setLabel("Play with puzzle");
        ac2.setTaskStatus(TaskStatus.accepted);
        ac2.setDifficulty(0);
        ac2.setIcon("fa-puzzle-piece");
        ac2.setTaskType(TaskType.monthly);
        em.persist(ac2);
        approveTaskForCreator(ac2);

        TaskODB ac3 = new TaskODB();
        ac3.setUser(data.userJack);
        ac3.setCreatedByUser(data.userKami);
        ac3.setChallenge(contract1);
        ac3.setLabel("Ride a bike");
        ac3.setTaskStatus(TaskStatus.accepted);
        ac3.setDifficulty(1);
        ac3.setIcon("fa-bicycle");
        ac3.setTaskType(TaskType.weekly);
        em.persist(ac3);
        approveTaskForCreator(ac3);


        TaskODB ac4 = new TaskODB();
        ac4.setUser(data.userKami);
        ac4.setCreatedByUser(data.userJack);
        ac4.setChallenge(contract1);
        ac4.setLabel("Ride a bike");
        ac4.setTaskStatus(TaskStatus.accepted);
        ac4.setDifficulty(1);
        ac4.setIcon("fa-bicycle");
        ac4.setTaskType(TaskType.daily);
        em.persist(ac4);
        approveTaskForCreator(ac4);

        TaskProgressODB tp=new TaskProgressODB();
        tp.setDone(true);
        tp.setProgressTime(DateUtil.getMidnight(new Date()));
        tp.setTask(ac4);
        em.persist(tp);


        TaskODB ac5 = new TaskODB();
        ac5.setUser(data.userKami);
        ac5.setCreatedByUser(data.userJack);
        ac5.setChallenge(contract1);
        ac5.setLabel("Buy a present");
        ac5.setTaskStatus(TaskStatus.accepted);
        ac5.setDifficulty(2);
        ac5.setIcon("fa-shopping-basket");
        ac5.setTaskType(TaskType.onetime);
        ac5.setDueDate(DateUtils.addDays(new Date(),10));
        em.persist(ac5);
        approveTaskForCreator(ac5);


        TaskODB ac6 = new TaskODB();
        ac6.setUser(data.userKami);
        ac6.setCreatedByUser(data.userJack);
        ac6.setChallenge(contract1);
        ac6.setLabel("Pay bills");
        ac6.setTaskStatus(TaskStatus.waiting_for_acceptance);
        ac6.setDifficulty(2);
        ac6.setIcon("fa-heart");
        ac6.setTaskType(TaskType.monthly);
        em.persist(ac6);
        approveTaskForCreator(ac6);

        ChallengeODB contract2 = new ChallengeODB();
        contract2.setLabel("kami vs milena");
        contract2.setChallengeStatus(ChallengeStatus.WAITING_FOR_ACCEPTANCE);
        contract2.setCreatedBy(data.userKami);
        em.persist(contract2);
        cp=new ChallengeParticipantODB();
        cp.setUser(data.userKami);
        cp.setChallenge(contract2);
        cp.setChallengeStatus(ChallengeStatus.ACTIVE);
        em.persist(cp);
        cp=new ChallengeParticipantODB();
        cp.setUser(data.userMilena);
        cp.setChallenge(contract2);
        cp.setChallengeStatus(ChallengeStatus.WAITING_FOR_ACCEPTANCE);
        em.persist(cp);

        ChallengeODB contract3 = new ChallengeODB();
        contract3.setLabel("kiwi vs kami vs jack");
        contract3.setCreatedBy(data.userKiwi);
        contract3.setChallengeStatus(ChallengeStatus.WAITING_FOR_ACCEPTANCE);
        em.persist(contract3);
        cp=new ChallengeParticipantODB();
        cp.setUser(data.userKiwi);
        cp.setChallenge(contract3);
        cp.setChallengeStatus(ChallengeStatus.ACTIVE);
        em.persist(cp);
        cp=new ChallengeParticipantODB();
        cp.setUser(data.userKami);
        cp.setChallenge(contract3);
        cp.setChallengeStatus(ChallengeStatus.WAITING_FOR_ACCEPTANCE);
        em.persist(cp);
        cp=new ChallengeParticipantODB();
        cp.setUser(data.userJack);
        cp.setChallenge(contract3);
        cp.setChallengeStatus(ChallengeStatus.WAITING_FOR_ACCEPTANCE);
        em.persist(cp);


        TaskODB ac7 = new TaskODB();
        ac7.setUser(data.userKami);
        ac7.setCreatedByUser(data.userKiwi);
        ac7.setChallenge(contract3);
        ac7.setLabel("Pay bills");
        ac7.setTaskStatus(TaskStatus.waiting_for_acceptance);
        ac7.setDifficulty(2);
        ac7.setIcon("fa-heart");
        ac7.setTaskType(TaskType.monthly);
        em.persist(ac7);
        approveTaskForCreator(ac7);

    }

    private void createUsers() {
        UserODB u = new UserODB();
        u.setLogin("kami");
        u.setEmail("kami@email.em");
        u.setUserStatus(UserStatus.ACTIVE);
        u.setSalt(PasswordUtil.createSalt());
        u.setPasswordHash(PasswordUtil.getPasswordHash("kamipass", u.getSalt()));
        data.userKami = u;
        anyDao.getEm().persist(u);

        u = new UserODB();
        u.setLogin("jack");
        u.setEmail("jack@email.em");
        u.setUserStatus(UserStatus.ACTIVE);
        u.setSalt(PasswordUtil.createSalt());
        u.setPasswordHash(PasswordUtil.getPasswordHash("jackpass", u.getSalt()));
        anyDao.getEm().persist(u);
        data.userJack = u;


        u = new UserODB();
        u.setLogin("milena");
        u.setEmail("milena@email.em");
        u.setUserStatus(UserStatus.ACTIVE);
        u.setSalt(PasswordUtil.createSalt());
        u.setPasswordHash(PasswordUtil.getPasswordHash("milenapass", u.getSalt()));
        anyDao.getEm().persist(u);
        data.userMilena = u;

        u = new UserODB();
        u.setLogin("kiwi");
        u.setEmail("kiwi@email.em");
        u.setUserStatus(UserStatus.ACTIVE);
        u.setSalt(PasswordUtil.createSalt());
        u.setPasswordHash(PasswordUtil.getPasswordHash("kiwiapass", u.getSalt()));
        anyDao.getEm().persist(u);
        data.userKiwi = u;


    }

    public void clearSchema() {
        anyDao.getEm().createNativeQuery("TRUNCATE SCHEMA public AND COMMIT").executeUpdate();
        anyDao.getEm().clear();
    }


    public List<UserODB> createUsers(String... logins) {
        List<UserODB> res = Lists.newArrayList();
        for (String login : logins) {
            Optional<UserODB> us = anyDao.getOne(UserODB.class, u -> u.getLogin().equals(login));
            if (us.isPresent()) {
                res.add(us.get());
                continue;
            }
            UserODB u = new UserODB();
            u.setLogin(login);
            u.setEmail(login + "@email.em");
            u.setSalt(PasswordUtil.createSalt());
            u.setPasswordHash(PasswordUtil.getPasswordHash(login + "pass", u.getSalt()));
            u.setUserStatus(UserStatus.ACTIVE);
            anyDao.getEm().persist(u);
            res.add(u);
        }
        return res;
    }

    public void createUsersWithChallenge(String u1, String u2) {
        Iterator<UserODB> users = createUsers(u1, u2).iterator();
        createChallenge(users, ChallengeStatus.ACTIVE);
    }



    public ChallengeODB createChallenge(Iterator<UserODB> users, ChallengeStatus status) {
        ChallengeODB contract1 = new ChallengeODB();

        contract1.setParticipants(Lists.newArrayList());
        contract1.setChallengeStatus(status);
        ArrayList<UserODB> userODBs = Lists.newArrayList(users);
        contract1.setCreatedBy(userODBs.get(0));
        anyDao.getEm().persist(contract1);
        int i=0;
        for (UserODB u: userODBs) {
            ChallengeParticipantODB cp=new ChallengeParticipantODB();
            cp.setChallenge(contract1);
            cp.setUser(u);
            cp.setChallengeStatus(status);
            if (i++==0)
                cp.setChallengeStatus(ChallengeStatus.ACTIVE);
            contract1.getParticipants().add(cp);
            anyDao.getEm().persist(cp);
        }

        return contract1;
    }

    public ChallengeODB createChallengeWithLabel(String label, Iterator<UserODB> users, ChallengeStatus status) {
        ChallengeODB contract1 = new ChallengeODB();
        contract1.setLabel(label);
        contract1.setParticipants(Lists.newArrayList());
        contract1.setChallengeStatus(status);
        ArrayList<UserODB> userODBs = Lists.newArrayList(users);
        contract1.setCreatedBy(userODBs.get(0));
        anyDao.getEm().persist(contract1);
        int i=0;
        for (UserODB u: userODBs) {
            ChallengeParticipantODB cp=new ChallengeParticipantODB();
            cp.setChallenge(contract1);
            cp.setUser(u);
            cp.setChallengeStatus(status);
            if (i++==0)
                cp.setChallengeStatus(ChallengeStatus.ACTIVE);
            contract1.getParticipants().add(cp);
            anyDao.getEm().persist(cp);
        }
        return contract1;
    }



    public static class Data {
        UserODB userJack, userKami, userMilena, userKiwi;
    }


}
