package com.campusconnect.campusconnectbackend.college.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollegeResponseDto {

    private Long id;
    private String name;
    private String collegeName;
    private String domain;
    private String collegeEmail;
    private String collegePhone;
    private String logoUrl;
    private String website;
    private String about;
    private String address;
    private boolean isActive;
}
