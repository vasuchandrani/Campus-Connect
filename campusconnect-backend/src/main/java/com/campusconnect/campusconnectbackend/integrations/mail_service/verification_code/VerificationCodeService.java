package com.campusconnect.campusconnectbackend.integrations.mail_service.verification_code;

import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.email_verification.CodeRequestDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.email_verification.VerifyRequestDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailSenderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VerificationCodeService {

    private final VerificationCodeRepository repository;
    private final EmailSenderService emailSenderService;

    public boolean sendCode(CodeRequestDto request) {
        try {
            String email = request.getEmail();
            String role  = request.getRole();

            // generate verification-code
            String code = generateCode();

            // create verification-code obj
            VerificationCode verificationCode = new VerificationCode();
            verificationCode.setEmail(email);
            verificationCode.setCode(code);
            // set expiry time of code: 5-min
            verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(5));
            verificationCode.setVerified(false);

            // save in db
            repository.save(verificationCode);

            // send the email
            emailSenderService.sendVerificationCode(email, code, role);

            return true;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    public boolean verifyCode(VerifyRequestDto request) {

        String email = request.getEmail();
        String code = request.getCode();

        // find the code in db
        Optional<VerificationCode> v_code =
                repository.findTopByEmailOrderByExpiresAtDesc(email);

        // no code found
        if (v_code.isEmpty()) {
            return false;
        }

        VerificationCode verificationCode = v_code.get();

        // already used
        if (verificationCode.isVerified()) {
            return false;
        }
        // expired
        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }
        // wrong code
        if (!verificationCode.getCode().equals(code)) {
            return false;
        }

        // mark as used
        verificationCode.setVerified(true);
        repository.save(verificationCode);

        return true;
    }

    private String generateCode() {
        // generate 6-digit code
        return String.valueOf(
                100000 + new SecureRandom().nextInt(900000));
    }
}