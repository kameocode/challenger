package com.kameo.challenger.domain.challenges;

import com.google.common.collect.Lists;
import com.kameo.challenger.config.ServerConfig;
import com.kameo.challenger.domain.accounts.AccountDAO;
import com.kameo.challenger.domain.accounts.db.UserODB;
import com.kameo.challenger.domain.challenges.IChallengeRestService.VisibleChallengesDTO.ChallengeDTO;
import com.kameo.challenger.domain.challenges.db.ChallengeStatus;
import com.kameo.challenger.web.rest.ChallengerSess;
import lombok.val;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;

import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Path(ServerConfig.restPath)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ChallengeRestService implements IChallengeRestService {
    private final ChallengerSess session;
    private final AccountDAO accountDAO;
    private final ChallengeDAO challengeDao;

    @Inject
    public ChallengeRestService(ChallengeDAO challengeDao, ChallengerSess session, AccountDAO accountDAO) {
        this.challengeDao = challengeDao;
        this.session = session;
        this.accountDAO = accountDAO;
    }

    @NotNull
    @GET
    @Path("challenges")
    public VisibleChallengesDTO getVisibleChallenges() {
        long callerId = session.getUserId();
        ChallengeDAO.ChallengeInfoDTO cinfo = challengeDao
                .getVisibleChallenges(callerId);
        VisibleChallengesDTO res =
                new VisibleChallengesDTO(cinfo.getDefaultChallengeId());
        res.getVisibleChallenges().addAll(cinfo.getVisibleChallenges().stream()
                                               .map(VisibleChallengesDTO.ChallengeDTO.Companion::fromODB)
                                               .map(c -> {
                                                   c.setCallerId(callerId);
                                                   return c;
                                               })
                                               .sorted((o1, o2) -> o1.getLabel().compareTo(o2.getLabel()))
                                               .collect(Collectors.toList()));
        return res;
    }

    @NotNull
    @Override
    @PUT
    @Path("challenges")
    public ChallengeDTO createChallenge(@NotNull ChallengeDTO challengeDTO) {
        if (challengeDTO.getUserLabels().length == 0)
            throw new IllegalArgumentException("No user labels provided");
        final List<UserODB> users = accountDAO
                .getUsersForLabels(Lists.newArrayList(challengeDTO.getUserLabels()).stream().map(UserLabelDTO::getLabel).collect(Collectors.toList()));
        val challengeOdb = ChallengeDTO.toODB(challengeDTO, users);
        val cb = challengeDao.createNewChallenge(session.getUserId(), challengeOdb);
        return ChallengeDTO.fromODB(cb);
    }

    @Override
    @POST
    @Path("challenges/{challengeId}/acceptance")
    public void acceptChallenge(@PathParam("challengeId") long challengeId, boolean accepted) {
        long callerId = session.getUserId();
        challengeDao.updateChallengeState(callerId, challengeId, (accepted) ? ChallengeStatus.ACTIVE : ChallengeStatus.REFUSED);
    }

    @NotNull
    @Override
    @POST
    @Path("challenges/{challengeId}")
    public ChallengeDTO updateChallenge(@PathParam("challengeId") long challengeId, @NotNull ChallengeDTO challengeDTO) {
        long calllerId = session.getUserId();
        if (challengeId != challengeDTO.getId())
            throw new IllegalArgumentException();
        final List<UserODB> users = accountDAO
                .getUsersForLabels(Lists.newArrayList(challengeDTO.getUserLabels()).stream().map(UserLabelDTO::getLabel).collect(Collectors.toList()));
        val challengeOdb = ChallengeDTO.toODB(challengeDTO, users);
        return ChallengeDTO.fromODB(challengeDao.updateChallenge(calllerId, challengeOdb));
    }

    @Override
    @DELETE
    @Path("challenges/{challengeId}")
    public boolean deleteChallenge(@PathParam("challengeId") long challengeId) {
        long callerId = session.getUserId();
        return challengeDao.deleteChallenge(callerId, challengeId);
    }
}
