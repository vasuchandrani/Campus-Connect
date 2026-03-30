package com.campusconnect.campusconnectbackend.security.security_management.dto.res;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class ClubProfileDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String clubName;

    private String clubDescription;

    private String logoUrl;

    private String website;
}
