package com.campusconnect.campusconnectbackend.dto.response.college_admin;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CollegeAdminDashboardStatsDto {

    @Min(0)
    private int clubs;

    @Min(0)
    private int students;

    @Min(0)
    private int journalist;

    @Min(0)
    private int publishedPapers;
}
