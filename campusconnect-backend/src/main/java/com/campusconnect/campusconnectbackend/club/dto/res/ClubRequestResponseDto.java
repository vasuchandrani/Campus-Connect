package com.campusconnect.campusconnectbackend.club.dto.res;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
public class ClubRequestResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long id;

    private String clubName;

    private String clubDescription;

    private LocalDateTime createdAt;

    private String studentName;
}
