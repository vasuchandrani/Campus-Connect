package com.campusconnect.campusconnectbackend.dto.response;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponseDto {

    private final String token;
    private final String role;
    private final String redirectUrl;

    public AuthResponseDto(String token, String role, String redirectUrl) {
        this.token = token;
        this.role = role;
        this.redirectUrl = redirectUrl;
    }

}

