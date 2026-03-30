package com.campusconnect.campusconnectbackend.integrations.mail_service.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailSenderService {

    private final Resend resend;
    private final ResourceLoader resourceLoader;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${resend.from.email}")
    private String fromEmail;

    @Value("${resend.api.key}")
    private String apiKey;

    // Load HTML template
    public String loadEmailTemplate(String templateName) {

        try {

            Resource resource =
                    resourceLoader.getResource("classpath:templates/email_templates/" + templateName);

            if (!resource.exists()) {
                throw new RuntimeException("Template not found: " + templateName);
            }

            try (InputStream is = resource.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to load email template: " + templateName, e);
        }
    }

    // Send HTML Email (SDK)
    public boolean sendHtmlEmail(String to, String subject, String htmlContent) {

        try {

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .html(htmlContent)
                    .build();

            CreateEmailResponse response =
                    resend.emails().send(params);

            log.info("Email sent successfully. ID: {}", response.getId());

            return true;

        } catch (ResendException e) {

            log.error("Email sending failed", e);
            return false;
        }
    }

    // Send verification code email
    public MessageResponseDto sendVerificationCode(
            String email,
            String code,
            String codeFor
    ) {

        if(email == null || email.isBlank())
            throw new IllegalArgumentException("Email cannot be empty");

        if(code == null || code.isBlank())
            throw new IllegalArgumentException("Verification code cannot be empty");

        if(codeFor == null || codeFor.isBlank())
            codeFor = "Email Verification";

        try {

            String htmlContent =
                    loadEmailTemplate("verification_code.html")
                            .replace("{{CODE}}", code)
                            .replace("{{VERIFICATION_FOR}}", codeFor);

            boolean sent =
                    sendHtmlEmail(
                            email,
                            "Campus-Connect " + codeFor,
                            htmlContent
                    );

            if(sent)
                return new MessageResponseDto("Verification code sent successfully");

            return new MessageResponseDto("Failed to send verification code");

        } catch (Exception e) {

            log.error("Verification email failed", e);
            return new MessageResponseDto("Failed to send verification code");
        }
    }

    // Send email with attachment (REST API)
    public boolean sendHtmlEmailWithAttachment(
            String to,
            String subject,
            String htmlContent,
            MultipartFile attachment
    ) {

        try {

            String url = "https://api.resend.com/emails";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();

            body.put("from", fromEmail);
            body.put("to", List.of(to));
            body.put("subject", subject);
            body.put("html", htmlContent);

            if (attachment != null && !attachment.isEmpty()) {

                Map<String, Object> file = new HashMap<>();

                file.put("filename", attachment.getOriginalFilename());
                file.put(
                        "content",
                        Base64.getEncoder().encodeToString(attachment.getBytes())
                );

                body.put("attachments", List.of(file));
            }

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(url, request, String.class);

            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {

            log.error("Email with attachment failed", e);
            return false;
        }
    }
}