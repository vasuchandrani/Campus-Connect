package com.campusconnect.campusconnectbackend.exceptionhandling;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ApiError {
    public LocalDateTime time;
    public String error;
    public HttpStatus status;

    public ApiError(String error, HttpStatus status) {
        this.time = LocalDateTime.now();
        this.error = error;
        this.status = status;
    }
}
