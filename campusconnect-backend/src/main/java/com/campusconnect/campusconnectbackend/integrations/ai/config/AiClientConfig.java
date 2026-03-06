package com.campusconnect.campusconnectbackend.integrations.ai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AiClientConfig {

    @Value("${hf.api.key}")
    private String apiKey;

    @Bean
    public RestTemplate aiRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        restTemplate.getInterceptors().add((request, body, execution) -> {

            HttpHeaders headers = request.getHeaders();

            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            return execution.execute(request, body);
        });

        return restTemplate;
    }
}