package com.campusconnect.campusconnectbackend.club.club_follower.controller;

import com.campusconnect.campusconnectbackend.club.club_follower.service.ClubFollowerService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/campus-connect/clubs")
@RequiredArgsConstructor
public class ClubFollowerController {

    private final ClubFollowerService clubFollowerService;

    @PostMapping(value = "/{clubId}/follow", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.ALL_VALUE})
    public MessageResponseDto changeFollow(
            @PathVariable Long clubId,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        boolean follow = true;
        if (body != null && body.containsKey("follow")) {
            Object val = body.get("follow");
            if (val instanceof Boolean b) {
                follow = b;
            } else if (val != null) {
                follow = Boolean.parseBoolean(val.toString());
            }
        }
        return clubFollowerService.changeFollow(clubId, follow);
    }

    @GetMapping("/{clubId}/is-following")
    public Map<String, Object> isFollowing(@PathVariable Long clubId) {
        return Map.of(
                "clubId", clubId,
                "isFollowed", clubFollowerService.isFollowing(clubId),
                "followerCount", clubFollowerService.getFollowerCount(clubId)
        );
    }
}
