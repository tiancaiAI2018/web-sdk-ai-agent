package com.example.agent.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openApi() {
        SecurityScheme bearer = new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")
            .description("RS256 JWT, 5 分钟过期, 从 POST /auth/token 拿");
        return new OpenAPI()
            .info(new Info()
                .title("Simple AI Agent API")
                .description("第三方前端 SDK 接入鉴权 + 流式对话 API。")
                .version("0.0.1"))
            .components(new Components()
                .addSecuritySchemes("bearer-jwt", bearer))
            .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}
