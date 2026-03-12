package com.campusconnect.campusconnectbackend.security.security_management.controller;

import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ChangePasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ForgetPasswordRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.security_management.service.SecurityManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campus-connect/security")
@RequiredArgsConstructor
public class SecurityManagementController {

    private final SecurityManagementService passwordManagementService;
    private final AuthService authService;

    // reset password -(forget password)
    @PatchMapping("/reset-pwd")
    public MessageResponseDto resetPassword(@RequestBody ForgetPasswordRequestDto request) {
        return passwordManagementService.verifyAndReset(request);
    }

    // change password
    @PatchMapping("/change-pwd")
    public MessageResponseDto changePassword(@RequestBody ChangePasswordRequestDto request) {
        return passwordManagementService.changePassword(authService.getCurrentUserId(), request);
    }
}
