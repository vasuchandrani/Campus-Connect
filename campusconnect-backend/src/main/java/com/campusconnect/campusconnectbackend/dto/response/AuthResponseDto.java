package com.campusconnect.campusconnectbackend.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponseDto {

    private String token;
    private String role;
    private String redirectUrl;
    private String message;
    private Boolean success;

    public AuthResponseDto(String token, String role, String redirectUrl) {
        this.token = token;
        this.role = role;
        this.redirectUrl = redirectUrl;
        this.message = null;
        this.success = token != null;
    }

    public AuthResponseDto(String token, String role, String redirectUrl, String message, Boolean success) {
        this.token = token;
        this.role = role;
        this.redirectUrl = redirectUrl;
        this.message = message;
        this.success = success;
    }

    public static AuthResponseDto failure(String message) {
        return new AuthResponseDto(null, null, null, message, false);
    }
}
