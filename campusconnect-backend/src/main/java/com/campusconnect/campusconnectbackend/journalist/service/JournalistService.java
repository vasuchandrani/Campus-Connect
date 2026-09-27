package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistDetailResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistStatResponseDto;

import java.util.List;

public interface JournalistService {

    int getJournalistsCountByCollege(Long collegeId);

    void evictJournalistCaches(Long journalistId);

    List<JournalistResponseDto> getJournalists(Long collegeId);

    MessageResponseDto removeJournalist(Long journalistId);

    MessageResponseDto addJournalistByEmail(String email, Long collegeId, Long adminUserId);

    JournalistStatResponseDto getStat(Long journalistId);

    JournalistDetailResponseDto getDetails(Long journalistId);

    MessageResponseDto toggleJournalistActive(Long journalistId);
}