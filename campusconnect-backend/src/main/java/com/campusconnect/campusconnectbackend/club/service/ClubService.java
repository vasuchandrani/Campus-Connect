package com.campusconnect.campusconnectbackend.club.service;

import com.campusconnect.campusconnectbackend.club.dto.req.HandOverRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubListDto;
import com.campusconnect.campusconnectbackend.club.dto.res.YourClubListDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubDetailsResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubMemberDto;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.ClubProfileDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ClubService {

    void evictJoinedClubsByCollege(Long collegeId);

    Club getClubById(Long clubId);

    List<YourClubListDto> getYourClubsByCollege(Long studentId);

    List<Club> getAllClubsByCollege(Long collegeId);

    List<ClubListDto> getClubsByCollege(Long collegeId);

    ClubDetailsResponseDto getClub(Long clubId);

    List<ClubMemberDto> getClubMembers(Long clubId);

    int getClubsCountByCollege(Long collegeId);

    ClubProfileDto getClubProfile(Long clubId);

    MessageResponseDto modifyClubProfile(Long clubId, ClubProfileDto request, MultipartFile image);

    MessageResponseDto deleteClub(Long clubId, Long collegeId);

    MessageResponseDto handOver(Long clubId, Long collegeId, HandOverRequestDto request);
}
