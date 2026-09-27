package com.campusconnect.campusconnectbackend.professor.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfRequestDto {

    @NotBlank
    private String feedback;
}
