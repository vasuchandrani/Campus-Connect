package com.campusconnect.campusconnectbackend.student.dto.res;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class StudentDashboardStatsDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Min(0)
    private int joinedClubs;

    @Min(0)
    private int upcomingEvents;
}
