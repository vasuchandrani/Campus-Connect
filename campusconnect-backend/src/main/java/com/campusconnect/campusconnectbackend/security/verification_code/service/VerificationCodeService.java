package com.campusconnect.campusconnectbackend.security.verification_code.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailSenderService;
import com.campusconnect.campusconnectbackend.security.verification_code.dto.CodeRequestDto;
import com.campusconnect.campusconnectbackend.security.verification_code.entity.VerificationCode;
import com.campusconnect.campusconnectbackend.security.verification_code.dto.VerifyCodeRequestDto;
import com.campusconnect.campusconnectbackend.security.verification_code.repository.VerificationCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VerificationCodeService {

    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailSenderService emailSenderService;

    // generate and save the code
    public String getCode(String email) {
        try {
            // generate verification-code
            String code = String.valueOf(
                    100000 + new SecureRandom().nextInt(900000));

            // store the code
            VerificationCode verificationCode = new VerificationCode();
            verificationCode.setEmail(email);
            verificationCode.setCode(code);
            // set expiry time of code: 5-min
            verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(5));
            verificationCode.setVerified(false);

            // save in db
            verificationCodeRepository.save(verificationCode);

            return code;
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // send verification code to user
    @Transactional
    public MessageResponseDto sendCode(CodeRequestDto request) {
        try {
            String email = request.getEmail();
            // find code
            String code = getCode(email);

            // send email
            return emailSenderService.sendVerificationCode(email, code, request.getCodeFor());
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return new MessageResponseDto("Failed to send verification code, please try again.");
        }
    }

    // verify the code & email
    public boolean verifyCode(VerifyCodeRequestDto request) {
        try {
            String email = request.getEmail();
            String code = request.getCode();

            // find the code in db
            VerificationCode v_code =
                    verificationCodeRepository.findTopByEmailOrderByExpiresAtDesc(email).orElseThrow(
                            () -> new RuntimeException("Verification code not found, please try again.")
                    );

            // already used
            if (v_code.isVerified()) {
                return false;
            }
            // expired
            if (v_code.getExpiresAt().isBefore(LocalDateTime.now())) {
                return false;
            }
            // wrong code
            if (!v_code.getCode().equals(code)) {
                return false;
            }

            // mark as used
            v_code.setVerified(true);
            verificationCodeRepository.save(v_code);

            return true;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }
}