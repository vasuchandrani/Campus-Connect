package com.campusconnect.campusconnectbackend.mail_service.controller;

import com.campusconnect.campusconnectbackend.mail_service.dto.club_verification.ClubVerificationDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.club_verification.ClubVerifiedDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.college_verification.CollegeVerificationDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.email_verification.CodeRequestDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.email_verification.VerifyRequestDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.journalist.JournalistAssignmentDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.reviewer.ReviewerAssignmentDto;
import com.campusconnect.campusconnectbackend.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.mail_service.verification_code.VerificationCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campus-connect/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailDispatcherService emailDispatcherService;
    private final VerificationCodeService verificationCodeService;

    // send email verification code to
    // college-admin and student while sign-up
    @PostMapping("/send-code")
    public boolean sendEmail(@RequestBody CodeRequestDto request) {
        return verificationCodeService.sendCode(request);
    }
    // verify the code
    @PostMapping("/verify-code")
    public boolean sendEmail(@RequestBody VerifyRequestDto request) {
        return verificationCodeService.verifyCode(request);
    }

    // send college-verification mail or
    // college-verified mail to college-admin
    @PostMapping("/college-verification-mail")
    public boolean sendEmail(@RequestBody CollegeVerificationDto request) {

        // team approve the college
        if (request.getPlanName() == null) {
            return emailDispatcherService.sendCollegeVerifiedMail(request);
        }
        // college-admin choose a subscription plan and pay
        else {
            return emailDispatcherService.sendPaymentSuccessMail(request);
        }
    }

    // send a club-request mail to college-admin -for testing
    @PostMapping("/club-request-mail")
    public boolean sendEmail(@RequestBody ClubVerificationDto request) {
        return emailDispatcherService.sendClubRequestToAdmin(request);
    }
    // send a club-approval mail to student -for testing
    @PostMapping("/club-approved-mail")
    public boolean sendMail(@RequestBody ClubVerifiedDto request) {
        return emailDispatcherService.sendClubApprovedToStudent(request);
    }

    // send journalist-request-approval mail to student -for testing
    @PostMapping("/journalist-mail")
    public boolean sendMailToJournalist(@RequestBody JournalistAssignmentDto request) {
        return emailDispatcherService.sendJournalistRequestAccepted(request);
    }

    // send assigned as reviewer mail to prof -for testing
    @PostMapping("/reviewer-mail")
    public boolean sendMailToReviewer(@RequestBody ReviewerAssignmentDto request) {
        return emailDispatcherService.sendReviewerAssigned(request);
    }
}