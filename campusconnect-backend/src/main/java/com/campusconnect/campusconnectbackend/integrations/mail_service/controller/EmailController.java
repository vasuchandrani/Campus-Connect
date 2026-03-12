package com.campusconnect.campusconnectbackend.integrations.mail_service.controller;

import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification.ClubVerificationDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification.ClubVerifiedDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.college_verification.CollegeVerificationDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.journalist.JournalistAssignmentDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.reviewer.ReviewerAssignmentDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.security.verification_code.service.VerificationCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campus-connect/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailDispatcherService emailDispatcherService;
    private final VerificationCodeService verificationCodeService;

    // send college-verification mail or
    // college-verified mail to college-admin - testing
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