package com.campusconnect.campusconnectbackend.dto.request.announcement;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnouncementPatchRequestDto {

    private String title;

    private String content;
}
