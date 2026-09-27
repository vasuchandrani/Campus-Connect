package com.campusconnect.campusconnectbackend.club.club_mentor.service;

import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.club.club_mentor.dto.ClubMentorDashboardDto;
import com.campusconnect.campusconnectbackend.club.club_mentor.dto.ClubPermissionSettingsDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;

import java.util.List;
import java.util.Map;

public interface ClubMentorDashboardService {

    ClubMentorDashboardDto getDashboardData(Long clubId, Long profId);

    // Announcements
    List<AnnouncementResponseDto> getPublishedAnnouncements(Long clubId, Long profId);
    List<AnnouncementResponseDto> getDraftAnnouncements(Long clubId, Long profId);
    List<AnnouncementResponseDto> getPendingAnnouncements(Long clubId, Long profId);
    MessageResponseDto saveAnnouncementDraft(Long clubId, AnnouncementRequestDto request, Long profId);
    MessageResponseDto publishAnnouncementDraft(Long clubId, Long annId, Long profId);
    MessageResponseDto deleteAnnouncementDraft(Long clubId, Long annId, Long profId);
    MessageResponseDto approveAnnouncement(Long clubId, Long annId, Long profId);
    MessageResponseDto rejectAnnouncement(Long clubId, Long annId, Long profId);

    // Events
    List<EventResponseDto> getPublishedEvents(Long clubId, Long profId);
    List<EventResponseDto> getFinishedEvents(Long clubId, Long profId);
    List<EventResponseDto> getDraftEvents(Long clubId, Long profId);
    List<EventResponseDto> getPendingEvents(Long clubId, Long profId);
    MessageResponseDto saveEventDraft(Long clubId, EventRequestDto request, Long profId);
    MessageResponseDto publishEventDraft(Long clubId, Long eventId, Long profId);
    MessageResponseDto deleteEventDraft(Long clubId, Long eventId, Long profId);
    MessageResponseDto approveEvent(Long clubId, Long eventId, Long profId);
    MessageResponseDto rejectEvent(Long clubId, Long eventId, Long profId);

    // Members & Teams (read-only)
    List<Map<String, Object>> getClubMembers(Long clubId, Long profId);
    List<Map<String, Object>> getClubTeams(Long clubId, Long profId);

    // Settings
    ClubPermissionSettingsDto getSettings(Long clubId, Long profId);
    MessageResponseDto updateSettings(Long clubId, ClubPermissionSettingsDto request, Long profId);
    MessageResponseDto deleteClubByMentor(Long clubId, Long profId);
}
