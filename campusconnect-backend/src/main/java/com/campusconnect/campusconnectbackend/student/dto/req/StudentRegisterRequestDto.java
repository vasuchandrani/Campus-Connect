package com.campusconnect.campusconnectbackend.student.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentRegisterRequestDto {

    @NotBlank(message = "Student id is required")
    private String id;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank
    private String gender;

    @NotBlank(message = "Department is required")
    private String department;

    private int year;
}
