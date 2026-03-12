package com.campusconnect.campusconnectbackend.security.verification_code.controller;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.verification_code.service.VerificationCodeService;
import com.campusconnect.campusconnectbackend.security.verification_code.dto.VerifyCodeRequestDto;
import com.campusconnect.campusconnectbackend.security.verification_code.dto.CodeRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campus-connect/security")
@RequiredArgsConstructor
public class VerificationCodeController {

    private final VerificationCodeService verificationCodeService;

    @PostMapping("/send-code")
    public MessageResponseDto sendVerificationCode(@RequestBody CodeRequestDto request) {
        return verificationCodeService.sendCode(request);
    }

    @PostMapping("/verify-code")
    public MessageResponseDto verifyCode(@RequestBody VerifyCodeRequestDto request) {
        if (verificationCodeService.verifyCode(request)) {
            return new MessageResponseDto("Code verified successfully");
        }
        return new MessageResponseDto("Code verification failed, please try again");
    }
}
