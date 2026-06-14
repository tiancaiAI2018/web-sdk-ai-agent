package com.example.agent.dict;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DictConfig {


    @Bean
    public DictMatcher dictMatcher() {
        return new DictMatcher();
    }
}