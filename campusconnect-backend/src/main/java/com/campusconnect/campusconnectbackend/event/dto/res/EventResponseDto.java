package com.campusconnect.campusconnectbackend.event.dto.res;

import com.campusconnect.campusconnectbackend.common.location.dto.LocationResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.*;
import java.time.LocalDateTime;

@Getter
@Setter
public class EventResponseDto {

    private Long id;

    private String title;

    private String description;

    private String image;

    // Event type and hosting
    private String eventType;
    private String hostedBy;
    private boolean isPublic;

    // Payment
    private String registrationPayment;

    // Timing
    private LocalDateTime registrationStart;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationEnd;

    // Location — backward-compatible string + full object
    private String location;
    private LocationResponseDto locationDetails;

    // Club info
    private String clubName;

    private LocalDateTime createAt;

    // Registration status
    private boolean isRegister;
    private int registrationsCount;

    // Approval and status
    private int state;
    private String status;

    // Target audience
    private Long departmentId;
    private String departmentName;
    private Integer batchYear;
    private String criteria;
    private String eligibility;

    // Prize and participation
    private Integer prizeMoney;
    private int participation;

    // Overview
    private String overview;

    // Media
    private List<String> images;

    // Related entities
    private List<EventSponsorResponseDto> sponsors;
    private List<EventSpeakerResponseDto> speakers;
    private List<EventWinnerResponseDto> winners;
    private List<EventRegistrationPlanResponseDto> registrationPlans;

    // Dynamic registration fields
    private Object selectedRegistrationFields;
    private Object customRegistrationFields;

    // Global event flag
    private boolean isGlobal = false;

    // Created by info
    private Long createdById;
    private String createdByName;
}
