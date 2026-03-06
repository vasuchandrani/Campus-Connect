package com.campusconnect.campusconnectbackend.club.dto.req;

import com.campusconnect.campusconnectbackend.club.event.dto.req.EventWinnerRequestDto;
import lombok.Getter;
import lombok.Setter;

import java.util.*;

@Getter
@Setter
public class SaveOverviewRequestDto {

    private String overview;

    private List<EventWinnerRequestDto> winners;
}
