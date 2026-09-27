package com.campusconnect.campusconnectbackend.professor.dto.res;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class ProfStatsResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private int pendingReviews;

    @NotNull
    private int reviewed;

    @NotNull
    private int mentoredClubs;

    @NotNull
    private int myResearches;
}
