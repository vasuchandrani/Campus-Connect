package com.campusconnect.campusconnectbackend.integrations.mail_service.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

@Slf4j
@Service
@AllArgsConstructor
public class EmailSenderService {

    private final JavaMailSender mailSender;
    private ResourceLoader resourceLoader;

    // load html template
    public String loadEmailTemplate(String templateName) {
        try {
            Resource resource = resourceLoader.getResource("classpath:templates/email_templates/" + templateName);

            if (!resource.exists()) {
                throw new RuntimeException("Template not found: " + templateName);
            }

            try (InputStream is = resource.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to load email template: " + templateName, e);
        }
    }

    // send mail
    public boolean sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            // create message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            // set
            helper.setFrom("Campus-Connect <campusconnector.team@gmail.com>");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // send mail
            mailSender.send(message);

            return true;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    // send verification-code
    public MessageResponseDto sendVerificationCode(String email, String code, String codeFor) {

        if(email == null || email.isBlank())
            throw new IllegalArgumentException("Email cannot be empty");

        if(code == null || code.isBlank())
            throw new IllegalArgumentException("Verification code cannot be empty");

        if(codeFor == null || codeFor.isBlank())
            codeFor = "Email Verification";

        try {
            // create message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            // set
            helper.setFrom("Campus-Connect <campusconnector.team@gmail.com>");
            helper.setTo(email);
            helper.setSubject("Campus-Connect " + codeFor);

            // load template
            String htmlContent = loadEmailTemplate("verification_code.html")
                    .replace("{{CODE}}", code)
                    .replace("{{VERIFICATION_FOR}}", codeFor);

            helper.setText(htmlContent, true);

            // send mail
            mailSender.send(message);

            return new MessageResponseDto("Verification code sent successfully");
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return new MessageResponseDto("Failed to send verification code, please try again.");
        }
    }

    public boolean sendHtmlEmailWithAttachment(
            String to,
            String subject,
            String htmlContent,
            MultipartFile attachment
    ) {
        try {

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("Campus-Connect <campusconnector.team@gmail.com>");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            if (attachment != null) {
                helper.addAttachment(
                        Objects.requireNonNull(attachment.getOriginalFilename()),
                        attachment
                );
            }

            mailSender.send(message);

            return true;

        } catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }
}
