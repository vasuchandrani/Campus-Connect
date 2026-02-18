package com.campusconnect.campusconnectbackend.mail_service.service;

import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

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
    public void sendVerificationCode(String email, String code, String role) {
        try {
            // create message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            // set
            helper.setFrom("Campus-Connect <campusconnector.team@gmail.com>");
            helper.setTo(email);
            helper.setSubject("Your Campus-Connect Verification Code");

            // load template
            String htmlContent = null;
            if (role.equals("COLLEGE_ADMIN")) {
                htmlContent = loadEmailTemplate("college_admin_verification.html")
                        .replace("{{CODE}}", code);
            }
            else if (role.equals("STUDENT")) {
                htmlContent = loadEmailTemplate("student_verification.html")
                        .replace("{{CODE}}", code);
            }

            helper.setText(Objects.requireNonNullElse(htmlContent, "<p>Sorry,</p>" +
                    "<p>We couldn’t process your request. Please resend the code request and try again.</p>"), true);

            // send mail
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }
}
