package com.campusconnect.campusconnectbackend.security.security_management.dto.res;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CollegeAdminProfileDto {

    private String fullName;

    private String email;

    private String phoneNumber;

    private String collegeName;

    private String domain;

    private String website;

    private String collegeAddress;

    private String collegeDescription;
}
