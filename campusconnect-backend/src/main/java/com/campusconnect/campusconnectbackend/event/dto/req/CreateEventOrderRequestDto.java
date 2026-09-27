package com.campusconnect.campusconnectbackend.event.dto.req;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateEventOrderRequestDto {

    private Long eventId;

    private Long planId;
}
