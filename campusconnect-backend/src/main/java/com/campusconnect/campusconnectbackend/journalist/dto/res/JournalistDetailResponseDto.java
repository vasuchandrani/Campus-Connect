package com.campusconnect.campusconnectbackend.journalist.dto.res;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@RequiredArgsConstructor
public class JournalistDetailResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank
    String name;

    @NotBlank
    String CollegeName;
}
