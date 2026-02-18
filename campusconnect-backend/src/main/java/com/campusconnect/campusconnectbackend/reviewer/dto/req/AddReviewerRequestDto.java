package com.campusconnect.campusconnectbackend.reviewer.dto.req;

import com.campusconnect.campusconnectbackend.dto.request.SignupRequestDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddReviewerRequestDto implements SignupRequestDto {

    @Override
    public String getRole() {
        return "REVIEWER";
    }

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}
