package com.campusconnect.campusconnectbackend.event.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EventService {

    List<EventResponseDto> getActiveEventsByCollege(Long collegeId);

    List<EventResponseDto> getFinishedEventsByCollege(Long collegeId);

    EventResponseDto getEvent(Long eventId);

    List<EventResponseDto> getTopEvents(Long collegeId);

    List<EventResponseDto> getTopEventsByClub(Long clubId);

    MessageResponseDto createEvent(EventRequestDto request, Long clubId, MultipartFile image);

    MessageResponseDto updateEvent(EventRequestDto request, Long eventId, Long clubId, MultipartFile image);

    MessageResponseDto deleteEvent(Long eventId, Long clubId);

    List<EventResponseDto> getActiveEventsByClub(Long clubId);

    List<EventResponseDto> getFinishedEventsByClub(Long clubId);

    List<EventResponseDto> getGlobalEvents();

    MessageResponseDto registerGlobalEvent(Long eventId, Long userId);

    MessageResponseDto unregisterGlobalEvent(Long eventId, Long userId);
}
