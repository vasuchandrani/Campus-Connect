package com.campusconnect.campusconnectbackend.college_admin.dto.req;

import com.campusconnect.campusconnectbackend.college.dto.req.CollegeSubscriptionRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.SignupRequestDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CollegeAdminSignupRequestDto implements SignupRequestDto {

    @Override
    public String getRole() {
        return "COLLEGE_ADMIN";
    }

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Official college email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "College name is required")
    private String collegeName;

    @NotBlank(message = "College domain is required")
    private String domain;

    @NotBlank(message = "College address is required")
    private String address;

    @NotBlank(message = "College website is required")
    private String website;

    private String aboutCollege;

    private boolean isPaid = false;

    private CollegeSubscriptionRequestDto subscription;
}
