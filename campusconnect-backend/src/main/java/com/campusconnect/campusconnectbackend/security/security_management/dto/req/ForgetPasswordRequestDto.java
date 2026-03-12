package com.campusconnect.campusconnectbackend.security.security_management.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgetPasswordRequestDto {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password; // new

    @NotBlank
    private String code;

    @NotBlank
    private String role;
}
