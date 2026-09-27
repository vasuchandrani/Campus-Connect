package com.campusconnect.campusconnectbackend.college.controller;

import com.campusconnect.campusconnectbackend.college.dto.req.DepartmentRequestDto;
import com.campusconnect.campusconnectbackend.college.dto.res.DepartmentResponseDto;
import com.campusconnect.campusconnectbackend.college.service.DepartmentService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/campus-connect")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    // Public lookup for registration forms when college is selected
    @GetMapping("/colleges/{collegeId}/departments")
    public List<DepartmentResponseDto> getCollegeDepartments(@PathVariable Long collegeId) {
        return departmentService.getDepartmentsByCollegeId(collegeId);
    }

    // Authenticated lookup for current logged-in user's college
    @GetMapping("/departments")
    public List<DepartmentResponseDto> getMyCollegeDepartments() {
        return departmentService.getDepartmentsForCurrentCollege();
    }

    // College Admin management endpoints
    @PostMapping({"/departments", "/admin/departments"})
    @ResponseStatus(HttpStatus.CREATED)
    public DepartmentResponseDto createDepartment(@Valid @RequestBody DepartmentRequestDto request) {
        return departmentService.createDepartment(request);
    }

    @PutMapping({"/departments/{id}", "/admin/departments/{id}"})
    public DepartmentResponseDto updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequestDto request
    ) {
        return departmentService.updateDepartment(id, request);
    }

    @DeleteMapping({"/departments/{id}", "/admin/departments/{id}"})
    public MessageResponseDto deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return new MessageResponseDto("Department deleted successfully");
    }
}
