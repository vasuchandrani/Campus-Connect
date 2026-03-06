package com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubVerifiedDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String studentEmail;

    @NotBlank(message = "Club-name is required")
    private String clubName;

    @NotBlank(message = "Club-dashboard link is required")
    private String clubDashboardLink;
}
