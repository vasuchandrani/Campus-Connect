package com.campusconnect.campusconnectbackend.security.verification_code.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CodeRequestDto {

    @NotBlank
    @Email
    private String email;

    private String codeFor = "EMAIL_VERIFICATION";
}
