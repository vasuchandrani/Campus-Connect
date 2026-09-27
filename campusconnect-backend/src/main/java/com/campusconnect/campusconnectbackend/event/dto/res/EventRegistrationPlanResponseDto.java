package com.campusconnect.campusconnectbackend.event.dto.res;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class EventRegistrationPlanResponseDto {

    private Long id;

    private String planName;

    private String planDescription;

    private BigDecimal amount;

    private Integer maxSeats;

    private int currentRegistrations;
}
