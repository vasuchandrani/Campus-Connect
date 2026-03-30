package com.campusconnect.campusconnectbackend.announcement.dto.req;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class AnnouncementPatchRequestDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String title;

    private String content;
}
