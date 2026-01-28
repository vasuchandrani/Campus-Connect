package com.campusconnect.campusconnectbackend.exceptionhandling;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // User not found
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<?> handleUsernameNotFound(UsernameNotFoundException ex) {
        return new ResponseEntity<>(
                new ApiError("Username not found: " + ex.getMessage(), HttpStatus.NOT_FOUND),
                HttpStatus.NOT_FOUND
        );
    }

    // Invalid login credentials
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        return new ResponseEntity<>(
                new ApiError("Invalid username or password", HttpStatus.UNAUTHORIZED),
                HttpStatus.UNAUTHORIZED
        );
    }

    // Access denied
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(
                new ApiError("Access denied: " + ex.getMessage(), HttpStatus.FORBIDDEN),
                HttpStatus.FORBIDDEN
        );
    }

    // JWT expired
    @ExceptionHandler(io.jsonwebtoken.ExpiredJwtException.class)
    public ResponseEntity<?> handleExpiredJwt(io.jsonwebtoken.ExpiredJwtException ex) {
        return new ResponseEntity<>(
                new ApiError("JWT token has expired", HttpStatus.UNAUTHORIZED),
                HttpStatus.UNAUTHORIZED
        );
    }

    // Invalid JWT
    @ExceptionHandler(io.jsonwebtoken.MalformedJwtException.class)
    public ResponseEntity<?> handleMalformedJwt(io.jsonwebtoken.MalformedJwtException ex) {
        return new ResponseEntity<>(
                new ApiError("Invalid JWT token", HttpStatus.BAD_REQUEST),
                HttpStatus.BAD_REQUEST
        );
    }

    // Missing request parameter
    @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
    public ResponseEntity<?> handleMissingParams(
            org.springframework.web.bind.MissingServletRequestParameterException ex) {

        return new ResponseEntity<>(
                new ApiError("Missing request parameter: " + ex.getParameterName(), HttpStatus.BAD_REQUEST),
                HttpStatus.BAD_REQUEST
        );
    }

    // Invalid parameter type
    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<?> handleTypeMismatch(
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex) {

        return new ResponseEntity<>(
                new ApiError("Invalid value for parameter: " + ex.getName(), HttpStatus.BAD_REQUEST),
                HttpStatus.BAD_REQUEST
        );
    }

    // Malformed JSON
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleInvalidJson() {
        return new ResponseEntity<>(
                new ApiError("Malformed JSON request body", HttpStatus.BAD_REQUEST),
                HttpStatus.BAD_REQUEST
        );
    }

    // Validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex) {

        String errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return new ResponseEntity<>(
                new ApiError("Validation failed: " + errors, HttpStatus.BAD_REQUEST),
                HttpStatus.BAD_REQUEST
        );
    }

    // Entity not found
    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<?> handleEntityNotFound(jakarta.persistence.EntityNotFoundException ex) {
        return new ResponseEntity<>(
                new ApiError(ex.getMessage(), HttpStatus.NOT_FOUND),
                HttpStatus.NOT_FOUND
        );
    }

    // Duplicate / constraint violation
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation() {
        return new ResponseEntity<>(
                new ApiError("Duplicate or invalid data entry", HttpStatus.CONFLICT),
                HttpStatus.CONFLICT
        );
    }

    // Transaction failure
    @ExceptionHandler(org.springframework.transaction.TransactionSystemException.class)
    public ResponseEntity<?> handleTransactionException() {
        return new ResponseEntity<>(
                new ApiError("Database transaction failed", HttpStatus.INTERNAL_SERVER_ERROR),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    // Invalid HTTP method
    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<?> handleMethodNotSupported(
            org.springframework.web.HttpRequestMethodNotSupportedException ex) {

        return new ResponseEntity<>(
                new ApiError("HTTP method not supported: " + ex.getMethod(), HttpStatus.METHOD_NOT_ALLOWED),
                HttpStatus.METHOD_NOT_ALLOWED
        );
    }

    // Fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception ex) {
        return new ResponseEntity<>(
                new ApiError("Something went wrong: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
