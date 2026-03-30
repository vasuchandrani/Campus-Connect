package com.campusconnect.campusconnectbackend.journalist.dto.res;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@RequiredArgsConstructor
public class JournalistStatResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    int draft;

    @NotNull
    int published;
}
