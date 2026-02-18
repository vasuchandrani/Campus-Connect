package com.campusconnect.campusconnectbackend.club.announcement.dto.req;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnouncementPatchRequestDto {

    private String title;

    private String content;
}
