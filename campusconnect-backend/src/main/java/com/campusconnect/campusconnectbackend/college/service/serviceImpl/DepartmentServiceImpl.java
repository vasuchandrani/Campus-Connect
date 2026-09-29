package com.campusconnect.campusconnectbackend.college.service.serviceImpl;

import com.campusconnect.campusconnectbackend.college.dto.req.DepartmentRequestDto;
import com.campusconnect.campusconnectbackend.college.dto.res.DepartmentResponseDto;
import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.entity.Department;
import com.campusconnect.campusconnectbackend.college.repository.CollegeRepository;
import com.campusconnect.campusconnectbackend.college.repository.DepartmentRepository;
import com.campusconnect.campusconnectbackend.college.service.DepartmentService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CollegeRepository collegeRepository;
    private final AuthService authService;

    @Override
    @Transactional
    public List<DepartmentResponseDto> getDepartmentsByCollegeId(Long collegeId) {
        if (collegeId == null) {
            return List.of();
        }

        List<Department> departments = departmentRepository.findByCollege_IdOrderByNameAsc(collegeId);

        // Auto-bootstrap "General" department if none exists for this college
        if (departments.isEmpty()) {
            College college = collegeRepository.findById(collegeId).orElse(null);
            if (college != null) {
                Department general = new Department(college, "General", "GEN");
                departmentRepository.save(general);
                departments = List.of(general);
            }
        }

        return departments.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public List<DepartmentResponseDto> getDepartmentsForCurrentCollege() {
        Long collegeId = authService.getCurrentCollegeId();
        if (collegeId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to resolve current college");
        }
        return getDepartmentsByCollegeId(collegeId);
    }

    @Override
    @Transactional
    public DepartmentResponseDto createDepartment(DepartmentRequestDto request) {
        Long collegeId = authService.getCurrentCollegeId();
        if (collegeId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized operation");
        }

        College college = collegeRepository.findById(collegeId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "College not found")
        );

        String trimmedName = request.getName() != null ? request.getName().trim() : "";
        if (trimmedName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department name cannot be blank");
        }

        if (departmentRepository.existsByCollege_IdAndNameIgnoreCase(collegeId, trimmedName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Department with this name already exists in your college");
        }

        String code = (request.getCode() != null && !request.getCode().isBlank())
                ? request.getCode().trim().toUpperCase()
                : generateCodeFromName(trimmedName);

        Department department = new Department(college, trimmedName, code);
        Department saved = departmentRepository.save(department);

        return toDto(saved);
    }

    @Override
    @Transactional
    public DepartmentResponseDto updateDepartment(Long id, DepartmentRequestDto request) {
        Long collegeId = authService.getCurrentCollegeId();
        Department department = departmentRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found with id: " + id)
        );

        if (!Objects.equals(department.getCollege().getId(), collegeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Department does not belong to your college");
        }

        String trimmedName = request.getName() != null ? request.getName().trim() : "";
        if (trimmedName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department name cannot be blank");
        }

        if ("General".equalsIgnoreCase(department.getName()) && !"General".equalsIgnoreCase(trimmedName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Default 'General' department cannot be renamed");
        }

        // Check unique constraint if name changed
        if (!department.getName().equalsIgnoreCase(trimmedName)) {
            if (departmentRepository.existsByCollege_IdAndNameIgnoreCase(collegeId, trimmedName)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Another department already exists with this name");
            }
            department.setName(trimmedName);
        }

        if (request.getCode() != null && !request.getCode().isBlank()) {
            department.setCode(request.getCode().trim().toUpperCase());
        }

        Department saved = departmentRepository.save(department);
        return toDto(saved);
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        Long collegeId = authService.getCurrentCollegeId();
        Department department = departmentRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found with id: " + id)
        );

        if (!Objects.equals(department.getCollege().getId(), collegeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Department does not belong to your college");
        }

        if ("General".equalsIgnoreCase(department.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Default 'General' department cannot be deleted");
        }

        departmentRepository.delete(department);
    }

    @Override
    @Transactional
    public Department getOrCreateGeneralDepartment(Long collegeId) {
        Optional<Department> existing = departmentRepository.findByCollege_IdAndNameIgnoreCase(collegeId, "General");
        if (existing.isPresent()) {
            return existing.get();
        }

        College college = collegeRepository.findById(collegeId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "College not found with id: " + collegeId)
        );

        Department general = new Department(college, "General", "GEN");
        return departmentRepository.save(general);
    }

    private DepartmentResponseDto toDto(Department dept) {
        return DepartmentResponseDto.builder()
                .id(dept.getId())
                .name(dept.getName())
                .code(dept.getCode())
                .collegeId(dept.getCollege() != null ? dept.getCollege().getId() : null)
                .collegeName(dept.getCollege() != null ? dept.getCollege().getCollegeName() : null)
                .build();
    }

    private String generateCodeFromName(String name) {
        if (name == null || name.isBlank()) return "DEPT";
        String[] words = name.trim().split("\\s+");
        if (words.length == 1) {
            return name.substring(0, Math.min(name.length(), 4)).toUpperCase();
        }
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.equalsIgnoreCase("&") && !w.equalsIgnoreCase("and") && !w.equalsIgnoreCase("of") && !w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0)));
            }
        }
        return sb.length() > 0 ? sb.toString() : "DEPT";
    }
}
