package com.campusconnect.campusconnectbackend.dto.request.student;

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

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "First name is required")
    private String collegeName;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Year is required")
    private int year;
}