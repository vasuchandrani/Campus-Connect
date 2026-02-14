package com.campusconnect.campusconnectbackend.club;

import com.campusconnect.campusconnectbackend.club.announcement.Announcement;
import com.campusconnect.campusconnectbackend.club.announcement.AnnouncementRepository;
import com.campusconnect.campusconnectbackend.club.club_member.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_member.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeam;
import com.campusconnect.campusconnectbackend.club.club_follower.ClubFollowerRepository;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamRepository;
import com.campusconnect.campusconnectbackend.dto.response.club.ClubListDto;
import com.campusconnect.campusconnectbackend.dto.response.club.YourClubListDto;
import com.campusconnect.campusconnectbackend.dto.response.club.club_card.*;
import com.campusconnect.campusconnectbackend.club.event.entity.Event;
import com.campusconnect.campusconnectbackend.club.event.repository.EventRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    // get club by id
    public Club getClubById(Long clubId) {
        return clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club with id " + clubId + " not found")
        );
    }

    // get all clubs joined by student
    public List<YourClubListDto> getYourClubsByCollege() {

        // find student-id
        Long studentId = authService.getCurrentUserId();
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
    public List<Club> getAllClubsByCollege() {
        // find college-id
        Long collegeId = authService.getCurrentCollegeId();
        return clubRepository.findAllByCollege_Id(collegeId);
    }

    // get all clubs of college (as DTO)
    public List<ClubListDto> getClubsByCollege() {

        // get college-id
        Long collegeId = authService.getCurrentCollegeId();
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
    public ClubDetailsResponseDto getClub(Long clubId) {

        // find club
        Club club = getClubById(clubId);

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
        int eventCnt      = eventRepository.countEventsByClub_IdAndStatus(clubId, "UPCOMING");
        int followerCnt   = clubFollowerRepository.countByClub_Id(clubId);

        // get club-admin details
        ClubAdminDto clubAdminDto = new ClubAdminDto();
        clubAdminDto.setId(clubAdmin.getId());
        clubAdminDto.setName(clubAdmin.getFullName());

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
            eventSummaryDto.setEventDate(event.getEventDate());
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
}
