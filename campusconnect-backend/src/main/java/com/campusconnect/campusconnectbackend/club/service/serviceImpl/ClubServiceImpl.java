package com.campusconnect.campusconnectbackend.club.service.serviceImpl;

import com.campusconnect.campusconnectbackend.announcement.entity.Announcement;
import com.campusconnect.campusconnectbackend.announcement.repository.AnnouncementRepository;
import com.campusconnect.campusconnectbackend.club.club_follower.repository.ClubFollowerRepository;
import com.campusconnect.campusconnectbackend.club.club_member.entity.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_member.repository.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeam;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamRepository;
import com.campusconnect.campusconnectbackend.club.dto.req.HandOverRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubListDto;
import com.campusconnect.campusconnectbackend.club.dto.res.YourClubListDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.*;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.club.service.ClubMemberManagementService;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.entity.Event;
import com.campusconnect.campusconnectbackend.event.repository.EventRepository;
import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.ClubProfileDto;
import com.campusconnect.campusconnectbackend.security.verification_code.dto.VerifyCodeRequestDto;
import com.campusconnect.campusconnectbackend.security.verification_code.service.VerificationCodeService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ClubServiceImpl implements ClubService {

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final AuthService authService;
    private final ClubTeamRepository clubTeamRepository;
    private final ClubFollowerRepository clubFollowerRepository;
    private final com.campusconnect.campusconnectbackend.club.club_follower.service.ClubFollowerService clubFollowerService;
    private final EventRepository eventRepository;
    private final AnnouncementRepository announcementRepository;
    private final CloudinaryService cloudinaryService;
    private final StudentRepoService studentRepoService;
    private final VerificationCodeService verificationCodeService;
    private final ClubMemberManagementService clubMemberManagementService;
    private final RedisTemplate<Object, Object> redisTemplate;

    @Override
    public void evictJoinedClubsByCollege(Long collegeId) {
        try {
            String pattern = "campusconnect::joined_clubs::college_" + collegeId + "_student_*";
            Set<Object> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            // Redis error should not block club operations
        }
    }

    @Override
    public Club getClubById(Long clubId) {
        return clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club with id " + clubId + " not found")
        );
    }

    @Override
    @Cacheable(value = "joined_clubs", key = "'college_' + @authService.getCurrentCollegeId() + '_student_' + #studentId")
    public List<YourClubListDto> getYourClubsByCollege(Long studentId) {
        List<Club> clubs = clubMemberRepository.findJoinedClubs(studentId);
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
        return yourClubList;
    }

    @Override
    public List<Club> getAllClubsByCollege(Long collegeId) {
        return clubRepository.findAllByCollege_Id(collegeId);
    }

    @Override
    @Cacheable(value = "clubs", key = "'college_' + #collegeId", sync = true)
    public List<ClubListDto> getClubsByCollege(Long collegeId) {
        List<Club> clubs = clubRepository.findAllByCollege_Id(collegeId);
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

    @Override
    @Cacheable(value = "club_details", key = "#clubId", sync = true)
    public ClubDetailsResponseDto getClub(Long clubId) {
        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club with id " + clubId + " not found")
        );

        Student clubAdmin = club.getAdmin();
        if (clubAdmin == null) {
            clubAdmin = clubMemberRepository.findStudentByClubAndRole(clubId, "ADMIN").orElse(null);
        }

        Boolean isFollowed = false;
        try {
            isFollowed = clubFollowerService.isFollowing(clubId);
        } catch (Exception ignored) {
            isFollowed = false;
        }

        int clubMemberCnt = clubMemberRepository.countByClub_Id(clubId);
        int teamCnt = clubTeamRepository.countByClub_Id(clubId);
        int eventCnt = eventRepository.countActiveEventsByClub(clubId, LocalDateTime.now());
        int followerCnt = clubFollowerService.getFollowerCount(clubId);

        ClubAdminDto clubAdminDto = new ClubAdminDto();
        if (clubAdmin != null) {
            clubAdminDto.setId(clubAdmin.getId());
            clubAdminDto.setName(clubAdmin.getFullName());
            clubAdminDto.setImage("");
        } else {
            clubAdminDto.setId(0L);
            clubAdminDto.setName("Club Administrator");
            clubAdminDto.setImage("");
        }

        List<TeamCardDto> teams = new ArrayList<>();
        Set<ClubTeam> teamSet = clubTeamRepository.findByClub_Id(clubId);

        for (ClubTeam t : teamSet) {
            TeamCardDto teamCardDto = new TeamCardDto();
            teamCardDto.setId(t.getId());
            teamCardDto.setName(t.getName());
            teamCardDto.setDescription(t.getDescription());
            teams.add(teamCardDto);
        }

        List<ClubMemberDto> members = new ArrayList<>(getClubMembers(clubId));

        List<Event> clubEvents = new ArrayList<>(eventRepository.findEventByClub_Id(clubId));
        List<EventSummaryDto> events = new ArrayList<>();

        for (Event event : clubEvents) {
            EventSummaryDto eventSummaryDto = new EventSummaryDto();
            eventSummaryDto.setId(event.getId());
            eventSummaryDto.setTitle(event.getTitle());
            eventSummaryDto.setDescription(event.getDescription());
            eventSummaryDto.setImage(event.getCoverImage());
            eventSummaryDto.setStartTime(event.getStartTime());
            eventSummaryDto.setEndTime(event.getEndTime());
            events.add(eventSummaryDto);
        }

        List<Announcement> clubAnnouncements = new ArrayList<>(announcementRepository.findByClub_IdOrderByCreatedAtDesc(clubId));
        List<AnnouncementSummaryDto> announcements = new ArrayList<>();

        for (Announcement a : clubAnnouncements) {
            AnnouncementSummaryDto announcementSummaryDto = new AnnouncementSummaryDto();
            announcementSummaryDto.setId(a.getId());
            announcementSummaryDto.setTitle(a.getTitle());
            announcementSummaryDto.setContent(a.getContent());
            announcementSummaryDto.setCreatedAt(a.getCreatedAt());
            announcements.add(announcementSummaryDto);
        }

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

    @Override
    @Cacheable(value = "club_members", key = "#clubId", sync = true)
    public List<ClubMemberDto> getClubMembers(Long clubId) {
        List<ClubMember> members = clubMemberRepository.findClubMemberByClub_Id(clubId);
        List<ClubMemberDto> response = new ArrayList<>();

        for (ClubMember member : members) {
            Student student = member.getStudent();
            ClubMemberDto dto = new ClubMemberDto();
            dto.setStudentName(student != null ? student.getFullName() : "");
            dto.setStudentId(student != null ? student.getId() : null);
            dto.setRole(member.getRole() != null ? member.getRole().name() : "MEMBER");
            response.add(dto);
        }
        return response;
    }

    @Override
    public int getClubsCountByCollege(Long collegeId) {
        return clubRepository.countByCollege_Id(collegeId);
    }

    @Override
    @Cacheable(value = "club_profile", key = "#clubId", sync = true)
    public ClubProfileDto getClubProfile(Long clubId) {
        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club not found!")
        );

        ClubProfileDto profile = new ClubProfileDto();
        profile.setClubName(club.getName());
        profile.setClubDescription(club.getDescription());
        profile.setLogoUrl(club.getLogoUrl());
        profile.setWebsite(club.getWebsite());
        return profile;
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_profile", key = "#clubId"),
            @CacheEvict(value = "club_details", key = "#clubId"),
            @CacheEvict(value = "clubs", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto modifyClubProfile(Long clubId, ClubProfileDto request, MultipartFile image) {
        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club not found!")
        );

        if (image != null) {
            String path = "clubs/" + clubId;
            String imageUrl = cloudinaryService.uploadImage(image, path);
            club.setLogoUrl(imageUrl);
        }

        club.setName(request.getClubName());
        club.setDescription(request.getClubDescription());
        club.setWebsite(request.getWebsite());

        evictJoinedClubsByCollege(authService.getCurrentCollegeId());
        clubRepository.save(club);

        return new MessageResponseDto("Club Profile updated successfully!");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "clubs", key = "'college_' + #collegeId"),
            @CacheEvict(value = "club_details", key = "#clubId"),
            @CacheEvict(value = "club_teams", key = "#clubId"),
            @CacheEvict(value = "club_team_names", key = "#clubId"),
            @CacheEvict(value = "club_members", key = "#clubId"),
            @CacheEvict(value = "club_profile", key = "#clubId"),
            @CacheEvict(value = "club_dashboard_stats", key = "#clubId"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true)
    })
    public MessageResponseDto deleteClub(Long clubId, Long collegeId) {
        try {
            if (!clubRepository.existsById(clubId)) {
                return new MessageResponseDto("Club not found!");
            }
            clubRepository.deleteById(clubId);
            evictJoinedClubsByCollege(collegeId);
            return new MessageResponseDto("Club deleted successfully!");
        } catch (Exception e) {
            return new MessageResponseDto("Club could not be deleted!, Try again later.");
        }
    }

    @Override
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

        Long adminId = authService.getCurrentUserId();
        Student admin = studentRepoService.getStudent(adminId);

        VerifyCodeRequestDto dto = new VerifyCodeRequestDto();
        dto.setEmail(admin.getEmail());
        dto.setCode(request.getVerificationCode());
        boolean isValid = verificationCodeService.verifyCode(dto);

        if (!isValid) {
            return new MessageResponseDto("Invalid verification code");
        }

        ClubMember currentAdmin = clubMemberRepository.findClubMemberByClub_IdAndStudent_Id(clubId, adminId);
        if (currentAdmin == null) {
            return new MessageResponseDto("Club member not found!");
        }
        currentAdmin.setRole("MEMBER");
        clubMemberRepository.save(currentAdmin);

        Student newAdmin = studentRepoService.getStudentByEmail(request.getNewAdminEmail());
        ClubMember member = clubMemberRepository.findClubMemberByClub_IdAndStudent_Id(clubId, newAdmin.getId());

        if (member == null) {
            clubMemberManagementService.addClubMember(club, newAdmin, "ADMIN");
        } else {
            member.setRole("ADMIN");
            clubMemberRepository.save(member);
        }

        evictJoinedClubsByCollege(collegeId);
        return new MessageResponseDto("You Handover the leadership to" + newAdmin.getFullName() + "successfully!");
    }
}
