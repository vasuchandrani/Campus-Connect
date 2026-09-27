package com.campusconnect.campusconnectbackend.professor.dto.req;

import com.campusconnect.campusconnectbackend.dto.request.SignupRequestDto;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddProfRequestDto implements SignupRequestDto {

    @Override
    public String getRole() {
        return "PROFESSOR";
    }

    @NotBlank(message = "Full name is required")
    @JsonAlias({"name", "professorName"})
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String department;

    private Long departmentId;

    private String about;

    public void setName(String name) {
        if (this.fullName == null || this.fullName.isBlank()) {
            this.fullName = name;
        }
    }
}
