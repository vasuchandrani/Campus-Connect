package com.campusconnect.campusconnectbackend.student.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubDashboardLoginRequestDto {

    @NotBlank(message = "Password is required")
    private String password;
}
