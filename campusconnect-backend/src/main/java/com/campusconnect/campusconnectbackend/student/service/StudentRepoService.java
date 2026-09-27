package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentRegisterRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.res.StudentResponseDto;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StudentRepoService {
    void evictStudentResearchCaches(Long studentId);
    Student getStudent(Long studentId);
    Student getStudentByEmail(String email);
    int getStudentCountByCollege(Long collegeId);
    List<StudentResponseDto> getAllStudents(Long collegeId);
    MessageResponseDto processExcel(MultipartFile file, Long collegeId);
    MessageResponseDto registerStudent(StudentRegisterRequestDto request, Long collegeId);
    MessageResponseDto removeStudent(Long studentId);
    MessageResponseDto toggleStudentStatus(Long studentId, Long collegeId);
}
