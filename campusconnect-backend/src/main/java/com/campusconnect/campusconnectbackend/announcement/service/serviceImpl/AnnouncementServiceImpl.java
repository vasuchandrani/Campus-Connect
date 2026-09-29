package com.campusconnect.campusconnectbackend.announcement.service.serviceImpl;

import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementPatchRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.announcement.entity.Announcement;
import com.campusconnect.campusconnectbackend.announcement.repository.AnnouncementRepository;
import com.campusconnect.campusconnectbackend.announcement.service.AnnouncementService;
import com.campusconnect.campusconnectbackend.club.club_follower.service.ClubFollowerService;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ClubService clubService;
    private final ClubFollowerService clubFollowerService;
    private final RedisTemplate<Object, Object> redisTemplate;
    private final AuthService authService;

    // get DTO
    private AnnouncementResponseDto getDto (Announcement a) {
        AnnouncementResponseDto dto = new AnnouncementResponseDto();
        if (a == null)  return dto;

        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        if (a.getClub() != null) {
            dto.setClubName(a.getClub().getName());
        }
        dto.setCreatedAt(a.getCreatedAt());

        return dto;
    }

    // get DTO -list
    private List<AnnouncementResponseDto> getDtoList(List<Announcement> announcements) {
        List<AnnouncementResponseDto> response = new ArrayList<>();
        if (announcements != null) {
            for (Announcement a : announcements) {
                response.add(getDto(a));
            }
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

    @Override
    @Cacheable(
            value = "announcements",
            key = "'college_' + #collegeId",
            sync = true
    )
    public List<AnnouncementResponseDto> getAnnouncementsByCollege(Long collegeId) {
        List<Club> clubs = clubService.getAllClubsByCollege(collegeId);
        List<Announcement> announcements = announcementRepository.findAllByClubs(clubs);
        return getDtoList(announcements);
    }

    @Override
    @Cacheable(
            value = "announcements",
            key = "'club_' + #clubId",
            sync = true
    )
    public List<AnnouncementResponseDto> getAnnouncements(Long clubId) {
        List<Announcement> announcements = announcementRepository.findByClub_IdOrderByCreatedAtDesc(clubId);
        return getDtoList(announcements);
    }

    @Override
    public AnnouncementResponseDto getAnnouncementById(Long announcementId) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement with id: " + announcementId + " not found"));
        return getDto(announcement);
    }

    @Override
    @Cacheable(
            value = "notifications",
            key = "'college_' + @authService.getCurrentCollegeId() + '_student_' + #studentId"
    )
    public List<AnnouncementResponseDto> getNotifications(Long studentId) {
        List<Club> clubs = clubFollowerService.getFollowedClubs(studentId);
        List<Announcement> announcements = announcementRepository.findAllByClubs(clubs);
        return getDtoList(announcements);
    }

    @Override
    @Cacheable(
            value = "latest_announcements",
            key = "'club_' + #clubId",
            sync = true
    )
    public List<AnnouncementResponseDto> getLatestAnnouncements(Long clubId) {
        Pageable pageable = PageRequest.of(0, 3);
        List<Announcement> announcements = announcementRepository.findLatestByClubId(clubId, pageable);
        return getDtoList(announcements);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "announcements", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "announcements", key = "'club_' + #clubId"),
            @CacheEvict(value = "latest_announcements", key = "'club_' + #clubId"),
    })
    public MessageResponseDto createAnnouncement(AnnouncementRequestDto request, Long clubId) {
        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        
        com.campusconnect.campusconnectbackend.club.entity.Club club = clubService.getClubById(clubId);
        announcement.setClub(club);
        announcement.setCollege(club.getCollege());
        
        announcement.setCreatedBy(authService.getCurrentUser());
        
        String role = authService.getCurrentRole();
        boolean isClubAdmin = "CLUB_ADMIN".equals(role);
        String permission = club.getAnnouncementPermission();

        if (isClubAdmin) {
            if ("ADMIN_ONLY".equalsIgnoreCase(permission) || "DIRECT".equalsIgnoreCase(permission)) {
                announcement.setStatus(com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.PUBLISHED);
                announcement.setState(3);
            } else {
                announcement.setStatus(com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.CREATED);
                announcement.setState(1); // waiting for mentor approval
            }
        } else {
            if ("DIRECT".equalsIgnoreCase(permission)) {
                announcement.setStatus(com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.PUBLISHED);
                announcement.setState(3);
            } else {
                announcement.setStatus(com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.CREATED);
                announcement.setState(0); // waiting for admin approval
            }
        }

        announcementRepository.save(announcement);

        Long collegeId = announcement.getClub().getCollege().getId();
        evictNotificationsByCollege(collegeId);

        return new MessageResponseDto("Announcement created successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "announcements", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "announcements", key = "'club_' + #clubId"),
            @CacheEvict(value = "latest_announcements", key = "'club_' + #clubId"),
    })
    public MessageResponseDto updateAnnouncement(AnnouncementPatchRequestDto request, Long annId, Long clubId) {
        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new RuntimeException("Announcement with id: " + annId + " not found"));

        if (request.getTitle() != null) {
            ann.setTitle(request.getTitle());
        }

        if (request.getContent() != null) {
            ann.setContent(request.getContent());
        }

        announcementRepository.save(ann);

        Long collegeId = ann.getClub().getCollege().getId();
        evictNotificationsByCollege(collegeId);

        return new MessageResponseDto("Announcement updated successfully");
    }

    @Override
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
