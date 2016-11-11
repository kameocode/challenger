package com.kameo.challenger.config;

import com.kameo.challenger.ChallengerApplication;
import com.kameo.challenger.domain.accounts.AccountRestService;
import com.kameo.challenger.domain.challenges.ChallengeRestService;
import com.kameo.challenger.domain.events.EventGroupRestService;
import com.kameo.challenger.domain.reports.ReportRestService;
import com.kameo.challenger.domain.tasks.TaskRestService;
import com.kameo.challenger.utils.rest.annotations.WebResponseStatusFilter;
import io.swagger.jaxrs.config.BeanConfig;
import io.swagger.jaxrs.config.SwaggerConfigLocator;
import io.swagger.jaxrs.config.SwaggerContextService;
import io.swagger.jaxrs.listing.ApiListingResource;
import org.glassfish.jersey.server.ResourceConfig;
import org.springframework.stereotype.Component;

import javax.ws.rs.ApplicationPath;


@Component
@ApplicationPath(ServerConfig.vsPATH)
public class JerseyConfig extends ResourceConfig {


    public JerseyConfig() {
        register(ChallengeRestService.class);
        register(TaskRestService.class);
        register(EventGroupRestService.class);
        register(AccountRestService.class);
        register(ReportRestService.class);
        register(new WebResponseStatusFilter());


     /*   BeanConfig beanConfig = new BeanConfig();
        beanConfig.setVersion("1.0.2");
        beanConfig.setBasePath("http://localhost:9080/api");
        beanConfig.setResourcePackage("io.swagger.resources");
        beanConfig.setScan(true);
*/

        BeanConfig swaggerConfig = new BeanConfig();
        swaggerConfig.setBasePath(ServerConfig.vsPATH);
        SwaggerConfigLocator.getInstance().putConfig(SwaggerContextService.CONFIG_ID_DEFAULT, swaggerConfig);

        packages(ChallengerApplication.class.getPackage().getName(), ApiListingResource.class.getPackage().getName());


//register(MyContextResolver.class);

    }

}
