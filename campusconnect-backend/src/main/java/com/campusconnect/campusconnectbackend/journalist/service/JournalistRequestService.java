package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.req.JournalistRequestDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistReqResponseDto;

import java.util.List;

public interface JournalistRequestService {
    MessageResponseDto createJournalistRequest(JournalistRequestDto requestDto);
    List<JournalistReqResponseDto> getJournalistRequests(Long collegeId);
    JournalistReqResponseDto getJournalistRequest(Long journalistRequestId);
    MessageResponseDto acceptJournalistRequest(Long journalistRequestId);
    MessageResponseDto rejectJournalistRequest(Long journalistRequestId);
}
