package com.campusconnect.campusconnectbackend.college.service;

import com.campusconnect.campusconnectbackend.college.dto.res.CollegeSubscriptionResponseDto;

import java.util.List;

public interface CollegeSubscriptionService {
    CollegeSubscriptionResponseDto getSubscription(Long collegeId);
    List<CollegeSubscriptionResponseDto> getSubscriptionHistory(Long collegeId);
}
