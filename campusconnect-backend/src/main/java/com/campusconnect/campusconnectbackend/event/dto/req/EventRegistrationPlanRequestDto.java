package com.campusconnect.campusconnectbackend.event.dto.req;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class EventRegistrationPlanRequestDto {

    private String planName;

    private String planDescription;

    private BigDecimal amount;

    private Integer maxSeats;
}
