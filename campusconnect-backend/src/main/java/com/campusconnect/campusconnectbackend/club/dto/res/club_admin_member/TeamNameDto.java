package com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class TeamNameDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String name;

    private String description;
}
