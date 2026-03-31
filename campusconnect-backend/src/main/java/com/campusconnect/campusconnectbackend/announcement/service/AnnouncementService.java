package com.campusconnect.campusconnectbackend.announcement.service;

import com.campusconnect.campusconnectbackend.announcement.repository.AnnouncementRepository;
import com.campusconnect.campusconnectbackend.announcement.entity.Announcement;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.club_follower.service.ClubFollowerService;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementPatchRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;

import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ClubService clubService;
    private final ClubFollowerService clubFollowerService;
    private final RedisTemplate<Object, Object> redisTemplate;
    private final AuthService authService;

    // get DTO
    private AnnouncementResponseDto getDto (Announcement a) {
        // create response dto
        AnnouncementResponseDto dto = new AnnouncementResponseDto();
        if (a == null)  return dto;

        // map the data
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        dto.setClubName(a.getClub().getName());
        dto.setCreatedAt(a.getCreatedAt());

        return dto;
    }

    // get DTO -list
    private List<AnnouncementResponseDto> getDtoList(List<Announcement> announcements) {
        // create response
        List<AnnouncementResponseDto> response = new ArrayList<>();

        for (Announcement a : announcements) {
            AnnouncementResponseDto dto = getDto(a);
            response.add(dto);
        }
        return response;
    }

    // eviction method for clear notifications cache
    private void evictNotificationsByCollege(Long collegeId) {

        String pattern = "campusconnect::notifications::college_" + collegeId + "_student_*";

        List<String> keysToDelete = new ArrayList<>();
        redisTemplate.executeWithStickyConnection(connection -> {
            try (Cursor<byte[]> cursor = connection.keyCommands().scan(
                    ScanOptions.scanOptions()
                            .match(pattern)
                            .count(100)
                            .build()
            )) {
                while (cursor.hasNext()) {
                    keysToDelete.add(new String(cursor.next()));
                }
            } catch (Exception e) {
                throw new RuntimeException("Error while scanning Redis keys", e);
            }
            return null;
        });

        if (!keysToDelete.isEmpty()) {
            redisTemplate.delete(keysToDelete);
        }
    }

    // get all announcement of college
    @Cacheable(
            value = "announcements",
            key = "'college_' + #collegeId",
            sync = true
    )
    public List<AnnouncementResponseDto> getAnnouncementsByCollege(Long collegeId) {

        List<Club> clubs = clubService.getAllClubsByCollege(collegeId);

        List<Announcement> announcements =
                announcementRepository.findAllByClubs(clubs);

        return getDtoList(announcements);
    }

    // get all announcement of club
    @Cacheable(
            value = "announcements",
            key = "'club_' + #clubId",
            sync = true
    )
    public List<AnnouncementResponseDto> getAnnouncements(Long clubId) {

        List<Announcement> announcements =
                announcementRepository.findByClub_IdOrderByCreatedAtDesc(clubId);

        return getDtoList(announcements);
    }

    // get particular announcement
    public AnnouncementResponseDto getAnnouncementById(Long announcementId) {

        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() ->
                        new RuntimeException("Announcement with id: "
                                + announcementId + " not found"));

        return getDto(announcement);
    }


    // get notifications
    @Cacheable(
            value = "notifications",
            key = "'college_' + @authService.getCurrentCollegeId() + '_student_' + #studentId"
    )
    public List<AnnouncementResponseDto> getNotifications(Long studentId) {

        List<Club> clubs = clubFollowerService.getFollowedClubs(studentId);

        List<Announcement> announcements =
                announcementRepository.findAllByClubs(clubs);

        return getDtoList(announcements);
    }

    /* Club-Member */

    // latest announcements for a club
    @Cacheable(
            value = "latest_announcements",
            key = "'club_' + #clubId",
            sync = true
    )
    public List<AnnouncementResponseDto> getLatestAnnouncements(Long clubId) {

        Pageable pageable = PageRequest.of(0, 3);

        List<Announcement> announcements =
                announcementRepository.findLatestByClubId(clubId, pageable);

        return getDtoList(announcements);
    }

    // create new announcement
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "announcements", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "announcements", key = "'club_' + #clubId"),
            @CacheEvict(value = "latest_announcements", key = "'club_' + #clubId"),
    })
    public MessageResponseDto createAnnouncement(AnnouncementRequestDto request, Long clubId) {

        // create announcement
        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setClub(clubService.getClubById(clubId));
        // save in db
        announcementRepository.save(announcement);

        // get collegeId
        Long collegeId = announcement.getClub().getCollege().getId();
        // manually clear only particular college notifications
        evictNotificationsByCollege(collegeId);

        return new MessageResponseDto("Announcement created successfully");
    }

    // modify the announcement
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "announcements", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "announcements", key = "'club_' + #clubId"),
            @CacheEvict(value = "latest_announcements", key = "'club_' + #clubId"),
    })
    public MessageResponseDto updateAnnouncement(AnnouncementPatchRequestDto request, Long annId, Long clubId) {

        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() ->
                        new RuntimeException("Announcement with id: " + annId + " not found"));

        if (request.getTitle() != null) {
            ann.setTitle(request.getTitle());
        }

        if (request.getContent() != null) {
            ann.setContent(request.getContent());
        }

        announcementRepository.save(ann);

        // get collegeId
        Long collegeId = ann.getClub().getCollege().getId();
        // manually clear only particular college notifications
        evictNotificationsByCollege(collegeId);

        return new MessageResponseDto("Announcement updated successfully");
    }

    // delete the announcement
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "announcements", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "announcements", key = "'club_' + #clubId"),
            @CacheEvict(value = "latest_announcements", key = "'club_' + #clubId"),
    })
    public MessageResponseDto deleteAnnouncement(Long annId, Long clubId) {

        Announcement announcement = announcementRepository.findById(annId).orElseThrow(
                () -> new RuntimeException("Announcement not found")
        );

        evictNotificationsByCollege(announcement.getClub().getCollege().getId());

        announcementRepository.delete(announcement);

        return new MessageResponseDto("Announcement deleted successfully");
    }
}