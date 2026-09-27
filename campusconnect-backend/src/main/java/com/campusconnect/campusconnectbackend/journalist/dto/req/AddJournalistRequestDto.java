package com.campusconnect.campusconnectbackend.journalist.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddJournalistRequestDto {

    @NotBlank(message = "Student email is required")
    @Email(message = "Invalid email format")
    private String email;
}
