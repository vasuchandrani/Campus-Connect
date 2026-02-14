package com.campusconnect.campusconnectbackend.mail_service.service;

import com.campusconnect.campusconnectbackend.mail_service.dto.club_verification.ClubVerificationDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.club_verification.ClubVerifiedDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.college_verification.CollegeVerificationDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.journalist.JournalistAssignmentDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.reviewer.ReviewerAssignmentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailDispatcherService {

    private final EmailSenderService emailSenderService;

    // college-admin
    // college-credentials are under scrutiny
    public boolean sendPaymentSuccessMail(CollegeVerificationDto request) {
        String html = emailSenderService
                .loadEmailTemplate("college_verification.html")
                .replace("{{PLAN_NAME}}", request.getPlanName());

        return emailSenderService.sendHtmlEmail(
                request.getEmail(),
                "Payment Successful – Campus-Connect",
                html
        );
    }
    // college is verified
    public boolean sendCollegeVerifiedMail(CollegeVerificationDto request) {
        String html = emailSenderService
                .loadEmailTemplate("college_verified.html");

        return emailSenderService.sendHtmlEmail(
                request.getEmail(),
                "College Verified Successfully – Campus-Connect",
                html
        );
    }

    // send a club-request mail to college-admin
    public boolean sendClubRequestToAdmin(ClubVerificationDto request) {
        String html = emailSenderService
                .loadEmailTemplate("club_registration_request.html")
                .replace("{{STUDENT_ID}}", String.valueOf(request.getStudentId()))
                .replace("{{CLUB_NAME}}", request.getClubName())
                .replace("{{ADMIN_DASHBOARD_LINK}}", request.getAdminDashboardLink());

        return emailSenderService.sendHtmlEmail(
                request.getAdminEmail(),
                "New Club Registration Request – Campus-Connect",
                html
        );
    }
    // send a club-approval mail to student
    public boolean sendClubApprovedToStudent(ClubVerifiedDto request) {
        String html = emailSenderService
                .loadEmailTemplate("club_approved.html")
                .replace("{{CLUB_NAME}}", request.getClubName())
                .replace("{{CLUB_DASHBOARD_LINK}}", request.getClubDashboardLink());

        return emailSenderService.sendHtmlEmail(
                request.getStudentEmail(),
                "Club Request Approved – Campus-Connect",
                html
        );
    }

    // send journalist-request-approval mail to student
    public boolean sendJournalistRequestAccepted(JournalistAssignmentDto request) {
        String html = emailSenderService
                .loadEmailTemplate("journalist_assigned.html")
                .replace("{{PASSWORD}}", request.getPassword())
                .replace("{{JOURNALIST_DASHBOARD_LINK}}", request.getDashboardLink());

        return emailSenderService.sendHtmlEmail(
                request.getEmail(),
                "Journalist Request Approved – Campus-Connect",
                html
        );
    }

    // send assigned as reviewer mail to prof
    public boolean sendReviewerAssigned(ReviewerAssignmentDto request) {
        String html = emailSenderService
                .loadEmailTemplate("reviewer_assigned.html")
                .replace("{{PASSWORD}}", request.getPassword())
                .replace("{{REVIEWER_DASHBOARD_LINK}}", request.getDashboardLink());

        return emailSenderService.sendHtmlEmail(
                request.getEmail(),
                "Reviewer Role Assigned – Campus-Connect",
                html
        );
    }
}