package com.campusconnect.campusconnectbackend.club.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HandOverRequestDto {

    @Email
    @NotBlank
    private String newAdminEmail;

    @NotBlank
    private String verificationCode;
}
