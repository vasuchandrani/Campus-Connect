package com.campusconnect.campusconnectbackend.club.dto.res;

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
