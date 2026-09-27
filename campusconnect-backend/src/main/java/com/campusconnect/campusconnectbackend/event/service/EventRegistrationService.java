package com.campusconnect.campusconnectbackend.event.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;

public interface EventRegistrationService {
    MessageResponseDto registerStudent(Long eventId);
    MessageResponseDto unRegisterStudent(Long eventId);
    byte[] generateExcel(Long eventId);
}