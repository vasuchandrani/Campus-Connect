package com.campusconnect.campusconnectbackend.club.event.dto.res;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventWinnerResponseDto {

    private Long id;

    private String name;

    private String email;

    private Long eventId;
}
