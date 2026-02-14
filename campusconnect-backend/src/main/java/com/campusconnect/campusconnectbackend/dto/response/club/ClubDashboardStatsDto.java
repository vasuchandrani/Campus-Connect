package com.campusconnect.campusconnectbackend.dto.response.club;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubDashboardStatsDto {

    @Min(0)
    private int events;

    @Min(0)
    private int followers;

    @Min(0)
    private int members;

    @Min(0)
    private int teams;
}
