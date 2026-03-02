package com.campusconnect.campusconnectbackend.reviewer.dto.res;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewerStatsResponseDto {

    @NotNull
    private int pendingReviews;

    @NotNull
    private int reviewed;
}
