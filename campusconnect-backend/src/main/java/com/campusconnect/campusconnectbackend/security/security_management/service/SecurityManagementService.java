package com.campusconnect.campusconnectbackend.security.security_management.service;

import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminAuth;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistAuth;
import com.campusconnect.campusconnectbackend.reviewer.service.ReviewerAuth;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ChangePasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ForgetPasswordRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.verification_code.service.VerificationCodeService;
import com.campusconnect.campusconnectbackend.security.verification_code.dto.VerifyCodeRequestDto;
import com.campusconnect.campusconnectbackend.student.service.StudentAuth;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityManagementService {

    private final VerificationCodeService verificationCodeService;
    private final StudentAuth studentAuth;
    private final CollegeAdminAuth collegeAdminAuth;
    private final JournalistAuth journalistAuth;
    private final ReviewerAuth reviewerAuth;

    private MessageResponseDto resetPassword(ForgetPasswordRequestDto request) {
        return
                switch (request.getRole()) {

                    case "STUDENT" -> studentAuth.resetPassword(request);

                    case "COLLEGE_ADMIN" -> collegeAdminAuth.resetPassword(request);

                    case "JOURNALIST" -> journalistAuth.resetPassword(request);

                    case "REVIEWER" -> reviewerAuth.resetPassword(request);

                    default -> throw new IllegalArgumentException("Invalid role");
                };
    }

    // verify email and reset password
    public MessageResponseDto verifyAndReset(ForgetPasswordRequestDto request) {

        String email = request.getEmail();
        String code  = request.getCode();

        // verify the code
        VerifyCodeRequestDto dto = new VerifyCodeRequestDto();
        dto.setEmail(email);
        dto.setCode(code);
        boolean isValid = verificationCodeService.verifyCode(dto);

        if (!isValid) {
            return new MessageResponseDto("Invalid verification code");
        }

        // after verified, change the password
        return resetPassword(request);
    }

    // change password
    public MessageResponseDto changePassword(Long currentUserId, ChangePasswordRequestDto request) {
        return
                switch (request.getRole()) {

                    case "STUDENT" -> studentAuth.changePassword(currentUserId, request);

                    case "COLLEGE_ADMIN" -> collegeAdminAuth.changePassword(currentUserId, request);

                    case "JOURNALIST" -> journalistAuth.changePassword(currentUserId, request);

                    case "REVIEWER" -> reviewerAuth.changePassword(currentUserId, request);

                    default -> throw new IllegalArgumentException("Invalid role");
                };
    }
}
