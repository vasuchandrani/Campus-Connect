package com.campusconnect.campusconnectbackend.college.dto.res;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CollegeSubscriptionResponseDto {

    private String planName;

    private int amount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}
