package com.campusconnect.campusconnectbackend.dto.response.club;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubListDto {
    private Long id;

    private String name;

    private String description;

    private String logoUrl;
}
