package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.student.Student;
import com.campusconnect.campusconnectbackend.student.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student getStudentByEmail (String email) {
        return studentRepository.findByEmail(email).orElseThrow();
    }

}
