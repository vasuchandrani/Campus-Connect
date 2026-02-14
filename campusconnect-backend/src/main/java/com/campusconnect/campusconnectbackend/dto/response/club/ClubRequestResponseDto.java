package com.campusconnect.campusconnectbackend.dto.response.club;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ClubRequestResponseDto {

    private long id;

    private String clubName;

    private String clubDescription;

    private LocalDateTime createdAt;

    private String studentName;
}
