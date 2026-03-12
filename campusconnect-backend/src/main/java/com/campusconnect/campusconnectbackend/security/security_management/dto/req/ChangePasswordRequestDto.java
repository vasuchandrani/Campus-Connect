package com.campusconnect.campusconnectbackend.security.security_management.dto.req;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequestDto {

    private String oldPassword;

    private String newPassword;

    private String role;
}
