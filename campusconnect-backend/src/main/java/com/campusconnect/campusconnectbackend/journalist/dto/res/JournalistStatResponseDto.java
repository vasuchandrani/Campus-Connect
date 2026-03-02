package com.campusconnect.campusconnectbackend.journalist.dto.res;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class JournalistStatResponseDto {
    int draft;
    int published;
}
