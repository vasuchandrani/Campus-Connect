package com.campusconnect.campusconnectbackend.mail_service.dto.college_verification;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CollegeVerificationDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String planName;
}
