package com.campusconnect.campusconnectbackend.club.dto.req;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApproveClubReqDto {

    @NotNull(message = "Faculty mentor ID is required to approve a club")
    private Long mentorId;
}
