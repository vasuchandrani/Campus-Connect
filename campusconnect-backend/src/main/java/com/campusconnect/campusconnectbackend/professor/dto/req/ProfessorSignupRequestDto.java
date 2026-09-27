package com.campusconnect.campusconnectbackend.professor.dto.req;

import com.campusconnect.campusconnectbackend.dto.request.SignupRequestDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfessorSignupRequestDto implements SignupRequestDto {

    @Override
    public String getRole() {
        return "PROFESSOR";
    }

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotNull(message = "College is required")
    private Long collegeId;

    private String department;

    private String about;
}
