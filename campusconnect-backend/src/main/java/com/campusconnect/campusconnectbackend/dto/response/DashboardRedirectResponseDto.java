package com.campusconnect.campusconnectbackend.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardRedirectResponseDto {

    private final String role;
    private final String redirectUrl;

    public DashboardRedirectResponseDto(String role, String redirectUrl) {
        this.role = role;
        this.redirectUrl = redirectUrl;
    }
}