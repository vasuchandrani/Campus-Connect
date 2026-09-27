package com.campusconnect.campusconnectbackend.professor.dto.res;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
public class ProfResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 2L;

    @NotNull
    private Long id;

    @NotBlank
    private String fullName;

    @NotBlank
    private String email;

    @NotNull
    private LocalDateTime createdAt;

    @NotNull
    private Long collegeId;

    private String about;

    private String department;

    private Long departmentId;

    private int mentoredClubsCount;

    private int reviewedPapersCount;

    @JsonProperty("name")
    public String getName() {
        return fullName;
    }
}
