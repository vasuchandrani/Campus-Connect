package com.campusconnect.campusconnectbackend.security.security_management.dto.res;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfessorProfileDto {

    private String fullName;

    private String email;

    private String department;

    private Long departmentId;
}
