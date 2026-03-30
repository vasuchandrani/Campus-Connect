package com.campusconnect.campusconnectbackend.college.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.repository.CollegeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CollegeService {

    private final CollegeRepository collegeRepository;

    public List<College> getAllColleges() {
        return new ArrayList<>(collegeRepository.findAll());
    }

    public College getCollegeById(Long collegeId) {
        return collegeRepository.findById(collegeId).orElseThrow(
                () -> new RuntimeException("College not found")
        );
    }

}
