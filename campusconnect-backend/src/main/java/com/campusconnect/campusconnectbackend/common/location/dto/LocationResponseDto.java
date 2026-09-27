package com.campusconnect.campusconnectbackend.common.location.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationResponseDto {

    private Long id;
    private String address;
    private String city;
    private String state;
    private String country;
}
