package com.campusconnect.campusconnectbackend.club.club_member.service;

import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubDashboardStatsDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;

import java.util.List;

public interface ClubMemberService {
    String getMyRole(Long clubId, Long studentId);
    int getJoinedClubCount(Long studentId);
    ClubDashboardStatsDto getStats(Long clubId);

    List<AnnouncementResponseDto> getPublishedAnnouncements(Long clubId);
    List<AnnouncementResponseDto> getMyPendingAnnouncements(Long clubId, Long userId);
    List<AnnouncementResponseDto> getMyDraftAnnouncements(Long clubId, Long userId);
    MessageResponseDto saveAnnouncementDraft(Long clubId, AnnouncementRequestDto request, Long userId);
    MessageResponseDto publishAnnouncementDraft(Long clubId, Long annId, Long userId);
    MessageResponseDto deleteAnnouncementDraft(Long clubId, Long annId, Long userId);

    List<EventResponseDto> getPublishedEvents(Long clubId);
    List<EventResponseDto> getFinishedEvents(Long clubId);
    List<EventResponseDto> getMyPendingEvents(Long clubId, Long userId);
    List<EventResponseDto> getMyDraftEvents(Long clubId, Long userId);
    MessageResponseDto saveEventDraft(Long clubId, EventRequestDto request, Long userId);
    MessageResponseDto publishEventDraft(Long clubId, Long eventId, Long userId);
    MessageResponseDto deleteEventDraft(Long clubId, Long eventId, Long userId);
}