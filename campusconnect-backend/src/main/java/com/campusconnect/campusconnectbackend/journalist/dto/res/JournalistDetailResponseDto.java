package com.campusconnect.campusconnectbackend.journalist.dto.res;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class JournalistDetailResponseDto {

    @NotBlank
    String name;

    @NotBlank
    String CollegeName;
}
