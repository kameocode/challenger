package com.kameo.challenger.web.rest;


import com.google.common.collect.Sets;
import lombok.Data;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import javax.inject.Inject;
import java.util.Set;

@RequestScope
@Component
@Lazy
@Data
public class MultiUserChallengerSess {
    Set<Long> userIds;

    @Inject
    ChallengerSess challengerSess;

    public Set<Long> getUserIds() {
        if (userIds==null)
            return Sets.newHashSet(challengerSess.getUserId());
        return userIds;
    }
}