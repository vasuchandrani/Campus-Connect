package com.campusconnect.campusconnectbackend.student.dto.req;

import com.campusconnect.campusconnectbackend.dto.request.SignupRequestDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentSignupRequestDto implements SignupRequestDto {

    @Override
    public String getRole() {
        return "STUDENT";
    }

    @NotBlank(message = "Student id is required")
    private String id;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank
    private String gender;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "College is required")
    private Long collegeId;

    @NotBlank(message = "Department is required")
    private String department;

    private int year;
}