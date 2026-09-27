package com.campusconnect.campusconnectbackend.college.service;

import com.campusconnect.campusconnectbackend.college.dto.req.DepartmentRequestDto;
import com.campusconnect.campusconnectbackend.college.dto.res.DepartmentResponseDto;
import com.campusconnect.campusconnectbackend.college.entity.Department;

import java.util.List;

public interface DepartmentService {

    List<DepartmentResponseDto> getDepartmentsByCollegeId(Long collegeId);

    List<DepartmentResponseDto> getDepartmentsForCurrentCollege();

    DepartmentResponseDto createDepartment(DepartmentRequestDto request);

    DepartmentResponseDto updateDepartment(Long id, DepartmentRequestDto request);

    void deleteDepartment(Long id);

    Department getOrCreateGeneralDepartment(Long collegeId);
}
