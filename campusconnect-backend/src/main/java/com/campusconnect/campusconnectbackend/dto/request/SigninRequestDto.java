package com.campusconnect.campusconnectbackend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SigninRequestDto {

    private String email;
    private String password;
    private String role;
}
