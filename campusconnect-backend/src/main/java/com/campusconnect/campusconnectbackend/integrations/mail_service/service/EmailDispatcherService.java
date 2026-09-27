package com.campusconnect.campusconnectbackend.integrations.mail_service.service;

import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification.ClubVerificationDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification.ClubVerifiedDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.college_verification.CollegeVerificationDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.journalist.JournalistAssignmentDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.professor.ProfessorAssignmentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
        String password = request.getPassword() != null ? request.getPassword() : "";
        String html = emailSenderService
                .loadEmailTemplate("club_approved.html")
                .replace("{{CLUB_NAME}}", request.getClubName())
                .replace("{{PASSWORD}}", password)
                .replace("{{CLUB_DASHBOARD_LINK}}", request.getClubDashboardLink());

        return emailSenderService.sendHtmlEmail(
                request.getStudentEmail(),
                "Club Request Approved – Campus-Connect",
                html
        );
    }

    // send club-member credentials mail
    public boolean sendClubMemberAssigned(String email, String clubName, String role, String password, String dashboardLink) {
        if (email == null || email.isBlank()) {
            return false;
        }
        String pass = password != null ? password : "";
        String link = dashboardLink != null ? dashboardLink : "/campus-connect/student/dashboard";

        String html = emailSenderService
                .loadEmailTemplate("club_approved.html")
                .replace("{{CLUB_NAME}}", clubName)
                .replace("{{PASSWORD}}", pass)
                .replace("{{CLUB_DASHBOARD_LINK}}", link);

        return emailSenderService.sendHtmlEmail(
                email.trim(),
                "Club Member Access Granted – " + clubName,
                html
        );
    }

    // send club-mentor credentials mail
    public boolean sendClubMentorAssigned(String email, String professorName, String clubName, String password, String dashboardLink) {
        if (email == null || email.isBlank()) {
            return false;
        }
        String profName = (professorName != null && !professorName.isBlank()) ? professorName : "Professor";
        String pass = password != null ? password : "";
        String link = dashboardLink != null ? dashboardLink : "/campus-connect/professor/dashboard";

        String html = emailSenderService
                .loadEmailTemplate("club_mentor_assigned.html")
                .replace("{{PROFESSOR_NAME}}", profName)
                .replace("{{CLUB_NAME}}", clubName != null ? clubName : "Campus Club")
                .replace("{{PASSWORD}}", pass)
                .replace("{{MENTOR_DASHBOARD_LINK}}", link);

        return emailSenderService.sendHtmlEmail(
                email.trim(),
                "Faculty Club Mentor Appointment & Credentials – " + (clubName != null ? clubName : "Campus-Connect"),
                html
        );
    }

    // send journalist-request-approval mail to student
    public boolean sendJournalistRequestAccepted(JournalistAssignmentDto request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return false;
        }

        String email = request.getEmail().trim();
        String password = request.getPassword() != null ? request.getPassword() : "";
        String dashboardLink = request.getDashboardLink() != null ? request.getDashboardLink() : "/campus-connect/journalist/dashboard";

        String html = emailSenderService
                .loadEmailTemplate("journalist_assigned.html")
                .replace("{{PASSWORD}}", password)
                .replace("{{JOURNALIST_DASHBOARD_LINK}}", dashboardLink);

        return emailSenderService.sendHtmlEmail(
                email,
                "Journalist Request Approved – Campus-Connect",
                html
        );
    }

    // send mail to student of registration
    public boolean sendStudentRegistrationMail(String studentEmail, String tempPassword) {

        String html = emailSenderService
                .loadEmailTemplate("student_registered.html")
                .replace("{{EMAIL}}", studentEmail)
                .replace("{{PASSWORD}}", tempPassword)
                .replace("{{LOGIN_URL}}", "https://campus-connect.in/login");

        return emailSenderService.sendHtmlEmail(
                studentEmail,
                "Your Campus-Connect Student Account Is Ready",
                html
        );
    }


    // send assigned as professor mail to prof
    public boolean sendProfessorAssigned(ProfessorAssignmentDto request) {
        String html = emailSenderService
                .loadEmailTemplate("professor_assigned.html")
                .replace("{{PASSWORD}}", request.getPassword())
                .replace("{{PROFESSOR_DASHBOARD_LINK}}", request.getDashboardLink());

        return emailSenderService.sendHtmlEmail(
                request.getEmail(),
                "Professor Role Assigned – Campus-Connect",
                html
        );
    }

    public void sendInvoiceMail(
            String email,
            String adminName,
            String planName,
            String paymentId,
            String orderId,
            int amount,
            MultipartFile invoiceFile
    ) {

        String html = emailSenderService
                .loadEmailTemplate("payment_invoice.html")
                .replace("{{ADMIN_NAME}}", adminName)
                .replace("{{PLAN_NAME}}", planName)
                .replace("{{PAYMENT_ID}}", paymentId)
                .replace("{{ORDER_ID}}", orderId)
                .replace("{{AMOUNT}}", String.valueOf(amount));

        emailSenderService.sendHtmlEmailWithAttachment(
                email,
                "Payment Invoice – Campus-Connect",
                html,
                invoiceFile
        );
    }
}