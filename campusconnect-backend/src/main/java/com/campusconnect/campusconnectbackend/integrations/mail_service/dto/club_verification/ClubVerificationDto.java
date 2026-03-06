package com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubVerificationDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String adminEmail;

    @NotBlank(message = "Email is required")
    private String studentId;

    @NotBlank(message = "Club-name is required")
    private String clubName;

    @NotBlank(message = "Admin-dashboard link is required")
    private String adminDashboardLink;
}
