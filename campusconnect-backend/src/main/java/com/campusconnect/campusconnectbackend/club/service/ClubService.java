package com.campusconnect.campusconnectbackend.club.service;

import com.campusconnect.campusconnectbackend.announcement.entity.Announcement;
import com.campusconnect.campusconnectbackend.announcement.repository.AnnouncementRepository;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.club.club_member.repository.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_member.entity.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeam;
import com.campusconnect.campusconnectbackend.club.club_follower.repository.ClubFollowerRepository;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamRepository;
import com.campusconnect.campusconnectbackend.club.dto.req.HandOverRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.*;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubListDto;
import com.campusconnect.campusconnectbackend.club.dto.res.YourClubListDto;
import com.campusconnect.campusconnectbackend.event.entity.Event;
import com.campusconnect.campusconnectbackend.event.repository.EventRepository;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.ClubProfileDto;
import com.campusconnect.campusconnectbackend.security.verification_code.dto.VerifyCodeRequestDto;
import com.campusconnect.campusconnectbackend.security.verification_code.service.VerificationCodeService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final AuthService authService;
    private final ClubTeamRepository clubTeamRepository;
    private final ClubFollowerRepository clubFollowerRepository;
    private final EventRepository eventRepository;
    private final AnnouncementRepository announcementRepository;
    private final CloudinaryService cloudinaryService;
    private final StudentRepoService studentRepoService;
    private final VerificationCodeService verificationCodeService;
    private final ClubMemberManagementService clubMemberManagementService;
    private final RedisTemplate<Object, Object> redisTemplate;

    // eviction method for clear joined-clubs cache
    public void evictJoinedClubsByCollege(Long collegeId) {
        try {
            String pattern = "campusconnect::joined_clubs::college_" + collegeId + "_student_*";

            List<String> keysToDelete = new ArrayList<>();

            redisTemplate.executeWithStickyConnection(connection -> {
                try (Cursor<byte[]> cursor = connection.keyCommands().scan(
                        ScanOptions.scanOptions()
                                .match(pattern)
                                .count(100)
                                .build()
                )) {
                    while (cursor.hasNext()) {
                        keysToDelete.add(
                                new String(cursor.next(), StandardCharsets.UTF_8)
                        );
                    }
                }
                return null;
            });

            System.out.println(keysToDelete);

            if (!keysToDelete.isEmpty()) {
                redisTemplate.delete(keysToDelete);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    // get club by id (for backend-use)
    public Club getClubById(Long clubId) {
        return clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club with id " + clubId + " not found")
        );
    }

    // get all clubs joined by student
    @Cacheable(value = "joined_clubs", key = "'college_' + @authService.getCurrentCollegeId() + '_student_' + #studentId")
    public List<YourClubListDto> getYourClubsByCollege(Long studentId) {

        // find joined clubs
        List<Club> clubs =  clubMemberRepository.findJoinedClubs(studentId);
        // create response
        List<YourClubListDto> yourClubList = new ArrayList<>();

        for (Club club : clubs) {

            String role = clubMemberRepository.findRoleByClubIdAndStudentId(club.getId(), studentId).orElse("You are not authorized");

            YourClubListDto yourClub = new YourClubListDto();
            yourClub.setId(club.getId());
            yourClub.setName(club.getName());
            yourClub.setDescription(club.getDescription());
            yourClub.setLogoUrl(club.getLogoUrl());
            yourClub.setRole(role);

            yourClubList.add(yourClub);
        }
        return  yourClubList;
    }

    // get all clubs of college (for backend)
    public List<Club> getAllClubsByCollege(Long collegeId) {
        return clubRepository.findAllByCollege_Id(collegeId);
    }

    // get all clubs of college (as DTO)
    @Cacheable(value = "clubs", key = "'college_' + #collegeId", sync = true)
    public List<ClubListDto> getClubsByCollege(Long collegeId) {

        // find clubs
        List<Club> clubs = clubRepository.findAllByCollege_Id(collegeId);
        // create response
        List<ClubListDto> clubListDtoList = new ArrayList<>();

        for (Club club : clubs) {
            ClubListDto clubListDto = new ClubListDto();
            clubListDto.setId(club.getId());
            clubListDto.setName(club.getName());
            clubListDto.setDescription(club.getDescription());
            clubListDto.setLogoUrl(club.getLogoUrl());
            clubListDtoList.add(clubListDto);
        }
        return clubListDtoList;
    }

    // get particular-club
    @Cacheable(value = "club_details", key = "#clubId", sync = true)
    public ClubDetailsResponseDto getClub(Long clubId) {

        // find club
        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club with id " + clubId + " not found")
        );

        // find club-admin
        Student clubAdmin = clubMemberRepository.findStudentByClubAndRole(clubId, "ADMIN").orElseThrow(
                () -> new RuntimeException("Club Admin not found")
        );

        // is student follower?
        Boolean isFollowed = null;
        if (authService.getCurrentRole().equals("STUDENT")) {
            isFollowed = clubFollowerRepository.existsByClub_IdAndStudent_Id(clubId, authService.getCurrentUserId());
        }

        // get count details
        int clubMemberCnt = clubMemberRepository.countByClub_Id(clubId);
        int teamCnt       = clubTeamRepository.countByClub_Id(clubId);
        int eventCnt      = eventRepository.countActiveEventsByClub(clubId, LocalDateTime.now());
        int followerCnt   = clubFollowerRepository.countByClub_Id(clubId);

        // get club-admin details
        ClubAdminDto clubAdminDto = new ClubAdminDto();
        clubAdminDto.setId(clubAdmin.getId());
        clubAdminDto.setName(clubAdmin.getFullName());
        clubAdminDto.setImage("");

        // get all club-teams details
        List<TeamCardDto> teams = new ArrayList<>();
        Set<ClubTeam> teamSet = club.getTeams();

        for(ClubTeam t : teamSet){
            TeamCardDto teamCardDto = new TeamCardDto();
            teamCardDto.setId(t.getId());
            teamCardDto.setName(t.getName());
            teamCardDto.setDescription(t.getDescription());
            teams.add(teamCardDto);
        }

        // get all club-members details
        List<ClubMemberDto> members = new ArrayList<>(getClubMembers(clubId));

        // get all events of club
        List<Event> clubEvents = new ArrayList<>(eventRepository.findEventByClub_Id(clubId));
        List<EventSummaryDto> events = new ArrayList<>();

        for (Event event : clubEvents){
            EventSummaryDto eventSummaryDto = new EventSummaryDto();
            eventSummaryDto.setId(event.getId());
            eventSummaryDto.setTitle(event.getTitle());
            eventSummaryDto.setDescription(event.getDescription());
            eventSummaryDto.setImage(event.getImage());
            eventSummaryDto.setStartTime(event.getStartTime());
            eventSummaryDto.setEndTime(event.getEndTime());
            eventSummaryDto.setLocation(event.getLocation());
            events.add(eventSummaryDto);
        }

        // get all announcements of club
        List<Announcement> clubAnnouncements = new ArrayList<>(announcementRepository.findByClub_IdOrderByCreatedAtDesc(clubId));
        List<AnnouncementSummaryDto> announcements = new ArrayList<>();

        for (Announcement a : clubAnnouncements){
            AnnouncementSummaryDto announcementSummaryDto = new AnnouncementSummaryDto();
            announcementSummaryDto.setId(a.getId());
            announcementSummaryDto.setTitle(a.getTitle());
            announcementSummaryDto.setContent(a.getContent());
            announcementSummaryDto.setCreatedAt(a.getCreatedAt());
            announcements.add(announcementSummaryDto);
        }

        // create club-details object
        ClubDetailsResponseDto dto = new ClubDetailsResponseDto();
        dto.setClubName(club.getName());
        dto.setDescription(club.getDescription());
        dto.setMemberCount(clubMemberCnt);
        dto.setTeamCount(teamCnt);
        dto.setEventCount(eventCnt);
        dto.setFollowerCount(followerCnt);
        dto.setLogoUrl(club.getLogoUrl());
        dto.setClubAdmin(clubAdminDto);
        dto.setTeams(teams);
        dto.setMembers(members);
        dto.setEvents(events);
        dto.setAnnouncements(announcements);
        dto.setFollowed(isFollowed);

        return dto;
    }

    // get all members of club
    @Cacheable(value = "club_members", key = "#clubId", sync = true)
    public List<ClubMemberDto> getClubMembers(Long clubId) {
        // find members
        List<ClubMember> members =  clubMemberRepository.findClubMemberByClub_Id(clubId);
        // create response
        List<ClubMemberDto> response = new ArrayList<>();

        for (ClubMember member : members) {
            Student student = member.getStudent();

            ClubMemberDto dto = new ClubMemberDto();
            dto.setStudentName(student.getFullName());
            dto.setStudentId(member.getId().getStudentId());
            dto.setRole(member.getRole());

            response.add(dto);
        }
        return response;
    }

    /* College-Admin */

    // get count of clubs in college
    public int getClubsCountByCollege(Long collegeId) {
        return clubRepository.countByCollege_Id(collegeId);
    }

    // get club profile
    @Cacheable(value = "club_profile", key = "#clubId", sync = true)
    public ClubProfileDto getClubProfile(Long clubId) {

        // find club
        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club not found!")
        );

        // create response
        ClubProfileDto profile = new ClubProfileDto();
        profile.setClubName(club.getName());
        profile.setClubDescription(club.getDescription());
        profile.setLogoUrl(club.getLogoUrl());
        profile.setWebsite(club.getWebsite());

        return profile;
    }

    // modify club profile
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_profile", key = "#clubId"),
            @CacheEvict(value = "club_details", key = "#clubId"),
            @CacheEvict(value = "clubs", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto modifyClubProfile(Long clubId, ClubProfileDto request, MultipartFile image) {

        // find club
        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club not found!")
        );

        // upload image on cloudinary
        if (image != null) {
            String path = "clubs/" + clubId;
            String imageUrl = cloudinaryService.uploadImage(image, path);
            club.setLogoUrl(imageUrl);
        }

        // overwrite all fields to update
        club.setName(request.getClubName());
        club.setDescription(request.getClubDescription());
        club.setWebsite(request.getWebsite());

        // manually clear only particular college joined-clubs
        evictJoinedClubsByCollege(authService.getCurrentCollegeId());

        clubRepository.save(club);

        return new MessageResponseDto("Club Profile updated successfully!");
    }

    // delete club
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "clubs", key = "'college_' + #collegeId"),
            @CacheEvict(value = "club_details", key = "#clubId"),
            @CacheEvict(value = "club_teams", key = "#clubId"),
            @CacheEvict(value = "club_team_names", key = "#clubId"),
            @CacheEvict(value = "club_members", key = "#clubId"),
            @CacheEvict(value = "club_profile", key = "#clubId"),
            @CacheEvict(value = "club_dashboard_stats", key = "#clubId"),
            @CacheEvict(value = "college_dashboard_stats", key = "#collegeId")
    })
    public MessageResponseDto deleteClub(Long clubId, Long collegeId) {
        try {
            if (!clubRepository.existsById(clubId)) {
                return new  MessageResponseDto("Club not found!");
            }
            // delete
            clubRepository.deleteById(clubId);
            // manually clear only particular college joined-clubs
            evictJoinedClubsByCollege(collegeId);

            return new MessageResponseDto("Club deleted successfully!");
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return new MessageResponseDto("Club could not be deleted!, Try again later.");
        }
    }

    // verify the verification code and handover leadership
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_members", key = "#clubId"),
            @CacheEvict(value = "club_profile", key = "#clubId"),
            @CacheEvict(value = "club_details", key = "#clubId"),
    })
    public MessageResponseDto handOver(Long clubId, Long collegeId, HandOverRequestDto request) {

        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club not found!")
        );

        // find current admin
        Long adminId = authService.getCurrentUserId();
        Student admin = studentRepoService.getStudent(adminId);

        // verify the code
        VerifyCodeRequestDto dto = new VerifyCodeRequestDto();
        dto.setEmail(admin.getEmail());
        dto.setCode(request.getVerificationCode());
        boolean isValid = verificationCodeService.verifyCode(dto);

        if (!isValid) {
            return new MessageResponseDto("Invalid verification code");
        }

        // change role of current-admin
        ClubMember currentAdmin = clubMemberRepository.findClubMemberByClub_IdAndStudent_Id(clubId, adminId);
        if (currentAdmin == null) {
            return new MessageResponseDto("Club member not found!");
        }
        currentAdmin.setRole("MEMBER");
        clubMemberRepository.save(currentAdmin);

        // find new-admin
        Student newAdmin = studentRepoService.getStudentByEmail(request.getNewAdminEmail());
        ClubMember member = clubMemberRepository.findClubMemberByClub_IdAndStudent_Id(clubId, newAdmin.getId());

        if (member == null) { // if new-admin is not a club-member
            clubMemberManagementService.addClubMember(club, newAdmin, "ADMIN");
        }
        else { // new-admin is already club-member
            member.setRole("ADMIN");
            clubMemberRepository.save(member);
        }
        // manually clear only particular college joined-clubs
        evictJoinedClubsByCollege(collegeId);

        return new MessageResponseDto("You Handover the leadership to" + newAdmin.getFullName() + "successfully!");
    }
}
