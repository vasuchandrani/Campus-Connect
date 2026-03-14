package com.campusconnect.campusconnectbackend.college.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CollegeSubscriptionRequestDto {

    @NotBlank
    private String planName;

    @NotNull
    private int amount;

    @NotNull
    private int durationInMonths;

    @NotBlank
    private String paymentId;

    @NotBlank
    private String orderId;

    private boolean isLimited = false;
}
