package com.campusconnect.campusconnectbackend.student.dto.res;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentDashboardStatsDto {

    @Min(0)
    private int joinedClubs;

    @Min(0)
    private int upcomingEvents;
}
