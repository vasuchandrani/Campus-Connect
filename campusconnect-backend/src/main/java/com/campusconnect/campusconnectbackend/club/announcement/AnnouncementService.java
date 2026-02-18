package com.campusconnect.campusconnectbackend.club.announcement;

import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.club_follower.ClubFollowerService;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.club.announcement.dto.req.AnnouncementPatchRequestDto;
import com.campusconnect.campusconnectbackend.club.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.club.announcement.dto.res.AnnouncementResponseDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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

    // get DTO
    private AnnouncementResponseDto getDto (Announcement a) {
        // create response dto
        AnnouncementResponseDto dto = new AnnouncementResponseDto();
        // map the data
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        dto.setClubName(a.getClub().getName());
        dto.setCreatedAt(a.getCreatedAt());

        return dto;
    }

    // get announcements of club -(get DTO list)
    private List<AnnouncementResponseDto> getDtoList(List<Announcement> announcements) {
        // create response
        List<AnnouncementResponseDto> response = new ArrayList<>();

        for (Announcement a : announcements) {
            AnnouncementResponseDto dto = getDto(a);
            response.add(dto);
        }
        return response;
    }

    // get all announcements of college
    public List<AnnouncementResponseDto> getAnnouncementsByCollege() {

        // find all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege();
        // find all announcements of college
        List<Announcement> announcements = announcementRepository.findAllByClubs(clubs);

        return getDtoList(announcements);
    }

    // get all announcements of club
    public List<AnnouncementResponseDto> getAnnouncements(Long clubId) {

        // find announcements
        List<Announcement> announcements = announcementRepository.findByClub_IdOrderByCreatedAtDesc(clubId);

        return getDtoList(announcements);
    }

    // get particular announcement
    public AnnouncementResponseDto getAnnouncementById(Long announcementId) {
        // find announcement
        Announcement announcement = announcementRepository.findById(announcementId).orElseThrow(
                () -> new RuntimeException("Announcement with id: " + announcementId + " not found")
        );

        return getDto(announcement);
    }

    // get all notifications
    public List<AnnouncementResponseDto> getNotifications() {

        // find all clubs followed by student
        List<Club> clubs = clubFollowerService.getFollowedClubs();
        // find all announcements of college
        List<Announcement> announcements = announcementRepository.findAllByClubs(clubs);

        return getDtoList(announcements);
    }


    /* Club-Member */

    // get latest 3 announcements
    public List<AnnouncementResponseDto> getLatestAnnouncements(Long clubId) {

        Pageable pageable = PageRequest.of(0, 3);
        // find announcements
        List<Announcement> announcements =  announcementRepository.findLatestByClubId(clubId, pageable);
        // create response
        List<AnnouncementResponseDto> response = new ArrayList<>();

        for (Announcement a : announcements) {
            AnnouncementResponseDto dto = getDto(a);
            response.add(dto);
        }
        return response;
    }

    // create new announcement
    @Transactional
    public boolean createAnnouncement(AnnouncementRequestDto request, Long clubId) {
        try {
            // create
            Announcement announcement = new Announcement();
            announcement.setTitle(request.getTitle());
            announcement.setContent(request.getContent());
            announcement.setClub(clubService.getClubById(clubId));

            // save in db
            announcementRepository.save(announcement);
            return true;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    // modify the announcement
    @Transactional
    public boolean updateAnnouncement(AnnouncementPatchRequestDto request, Long annId) {

        // get announcement
        Announcement ann = announcementRepository.findById(annId).orElseThrow(
                () -> new RuntimeException("Announcement with id: " + annId + " not found")
        );

        // update
        if (request.getTitle() != null) {
            ann.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            ann.setContent(request.getContent());
        }

        // save
        announcementRepository.save(ann);
        return true;
    }

    // delete the announcement
    @Transactional
    public boolean deleteAnnouncement(Long annId) {

        // find if exist
        if (!announcementRepository.existsById(annId)) {
            throw new RuntimeException("Announcement not found");
        }

        // delete
        announcementRepository.deleteById(annId);
        return true;
    }
}
