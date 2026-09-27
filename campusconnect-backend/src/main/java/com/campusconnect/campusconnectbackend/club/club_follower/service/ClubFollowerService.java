package com.campusconnect.campusconnectbackend.club.club_follower.service;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;

import java.util.List;

public interface ClubFollowerService {
    List<Club> getFollowedClubs(Long studentId);
    MessageResponseDto changeFollow(Long studentId, Long clubId, boolean follow);
    MessageResponseDto changeFollow(Long clubId, boolean follow);
    boolean isFollowing(Long clubId);
    int getFollowerCount(Long clubId);
}