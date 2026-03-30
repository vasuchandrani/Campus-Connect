package com.campusconnect.campusconnectbackend.college_admin.dto.res;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class CollegeAdminDashboardStatsDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Min(0)
    private int clubs;

    @Min(0)
    private int students;

    @Min(0)
    private int journalist;

    @Min(0)
    private int publishedPapers;
}
