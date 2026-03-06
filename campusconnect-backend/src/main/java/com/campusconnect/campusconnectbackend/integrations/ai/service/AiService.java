package com.campusconnect.campusconnectbackend.integrations.ai.service;

import com.campusconnect.campusconnectbackend.integrations.ai.response_dto.HuggingFaceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate aiRestTemplate;

    @Value("${hf.model.url}")
    private String modelUrl;

    @Value("${hf.model.name}")
    private String modelName;

    // generate text
    public String generateText(String prompt) {

        Map<String, Object> requestBody = Map.of(
                "model", modelName,
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                ),
                "max_tokens", 500,
                "temperature", 0.7
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, headers);

        ResponseEntity<HuggingFaceResponse> response =
                aiRestTemplate.exchange(
                        modelUrl,
                        HttpMethod.POST,
                        entity,
                        HuggingFaceResponse.class
                );

        HuggingFaceResponse body = response.getBody();

        if (body == null || body.getChoices() == null || body.getChoices().isEmpty()) {
            throw new RuntimeException("Empty AI response");
        }

        return body.getChoices()
                .get(0)
                .getMessage()
                .getContent();
    }
}