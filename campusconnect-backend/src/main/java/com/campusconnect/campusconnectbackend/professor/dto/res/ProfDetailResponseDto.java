package com.campusconnect.campusconnectbackend.professor.dto.res;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class ProfDetailResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String professorName;

    private String collegeName;

    private String departmentName;

    private Long departmentId;
}
