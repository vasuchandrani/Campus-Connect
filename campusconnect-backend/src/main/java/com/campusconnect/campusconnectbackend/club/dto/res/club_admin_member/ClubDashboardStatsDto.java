package com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class ClubDashboardStatsDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Min(0)
    private int events;

    @Min(0)
    private int followers;

    @Min(0)
    private int members;

    @Min(0)
    private int teams;
}
