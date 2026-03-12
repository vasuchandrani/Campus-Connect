package com.campusconnect.campusconnectbackend.security.verification_code.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyCodeRequestDto {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String code;
}
