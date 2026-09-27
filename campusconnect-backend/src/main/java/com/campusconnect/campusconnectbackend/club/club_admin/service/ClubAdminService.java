package com.campusconnect.campusconnectbackend.club.club_admin.service;

import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.req.AddMemberRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;

import java.util.List;

public interface ClubAdminService {
    MessageResponseDto addMember(Long clubId, AddMemberRequestDto request);
    MessageResponseDto removeMember(Long clubId, Long studentId);

    List<AnnouncementResponseDto> getPublishedAnnouncements(Long clubId);
    List<AnnouncementResponseDto> getDraftAnnouncements(Long clubId);
    List<AnnouncementResponseDto> getPendingAnnouncements(Long clubId);
    MessageResponseDto saveAnnouncementDraft(Long clubId, AnnouncementRequestDto request);
    MessageResponseDto publishAnnouncementDraft(Long clubId, Long annId);
    MessageResponseDto deleteAnnouncementDraft(Long clubId, Long annId);
    MessageResponseDto approveAnnouncement(Long clubId, Long annId);
    MessageResponseDto rejectAnnouncement(Long clubId, Long annId);

    List<EventResponseDto> getPublishedEvents(Long clubId);
    List<EventResponseDto> getFinishedEvents(Long clubId);
    List<EventResponseDto> getDraftEvents(Long clubId);
    List<EventResponseDto> getPendingEvents(Long clubId);
    MessageResponseDto saveEventDraft(Long clubId, EventRequestDto request);
    MessageResponseDto publishEventDraft(Long clubId, Long eventId);
    MessageResponseDto deleteEventDraft(Long clubId, Long eventId);
    MessageResponseDto approveEvent(Long clubId, Long eventId);
    MessageResponseDto rejectEvent(Long clubId, Long eventId);
}