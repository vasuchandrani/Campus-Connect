package com.campusconnect.campusconnectbackend.event.dto.req;

import com.campusconnect.campusconnectbackend.common.location.dto.LocationRequestDto;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.*;
import java.time.LocalDateTime;

@Getter
@Setter
public class EventRequestDto {

    @NotBlank(message = "Event title is required")
    private String title;

    private String description;

    // "OFFLINE" | "ONLINE"
    private String eventType;

    // Event visibility
    private boolean isPublic;

    // "FREE" | "PAID" | "PAID_FOR_GUEST"
    private String registrationPayment;

    // Registration window
    private LocalDateTime registrationStart;
    private LocalDateTime registrationEnd;

    // Event timing
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Structured location (address, city, state, country)
    private LocationRequestDto location;

    // Target audience filters
    private Long departmentId;
    private Integer batchYear;
    private String criteria;
    private String eligibility;

    // Prize info
    private Integer prizeMoney;

    // Speakers and Sponsors
    private List<EventSponsorRequestDto> sponsors;
    private List<EventSpeakerRequestDto> speakers;

    // Registration plans for PAID events
    private List<EventRegistrationPlanRequestDto> registrationPlans;

    // Dynamic registration form fields (jsonb)
    private Object selectedRegistrationFields;
    private Object customRegistrationFields;
}
