package com.campusconnect.campusconnectbackend.journalist.dto.res;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class JournalistStatResponseDto {

    @NotNull
    int draft;

    @NotNull
    int published;
}
