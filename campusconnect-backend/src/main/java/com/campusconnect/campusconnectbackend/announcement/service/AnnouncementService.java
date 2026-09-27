package com.campusconnect.campusconnectbackend.announcement.service;

import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementPatchRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;

import java.util.List;

public interface AnnouncementService {

    List<AnnouncementResponseDto> getAnnouncementsByCollege(Long collegeId);

    List<AnnouncementResponseDto> getAnnouncements(Long clubId);

    AnnouncementResponseDto getAnnouncementById(Long announcementId);

    List<AnnouncementResponseDto> getNotifications(Long studentId);

    List<AnnouncementResponseDto> getLatestAnnouncements(Long clubId);

    MessageResponseDto createAnnouncement(AnnouncementRequestDto request, Long clubId);

    MessageResponseDto updateAnnouncement(AnnouncementPatchRequestDto request, Long annId, Long clubId);

    MessageResponseDto deleteAnnouncement(Long annId, Long clubId);
}