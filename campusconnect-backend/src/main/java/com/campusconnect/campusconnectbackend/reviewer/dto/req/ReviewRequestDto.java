package com.campusconnect.campusconnectbackend.reviewer.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequestDto {

    @NotBlank
    private String feedback;
}
