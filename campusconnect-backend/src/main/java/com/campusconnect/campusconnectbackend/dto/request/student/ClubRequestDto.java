package com.campusconnect.campusconnectbackend.dto.request.student;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubRequestDto {

    @NotBlank(message = "club name is require")
    private String clubName;

    @NotBlank(message = "club description is require")
    private String clubDescription;
}
