package com.campusconnect.campusconnectbackend.club.club_mentor.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class ClubPermissionSettingsDto implements Serializable {
    private String announcementPermission; // MENTOR_REQUIRED | ADMIN_ONLY | DIRECT
    private String eventPermission;        // MENTOR_REQUIRED | ADMIN_ONLY | DIRECT
}
