package com.campusconnect.campusconnectbackend.college.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college.CollegeRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CollegeService {

    private final CollegeRepository collegeRepository;

    public CollegeService(CollegeRepository collegeRepository) {
        this.collegeRepository = collegeRepository;
    }

    public List<College> getAllColleges() {
        return new ArrayList<>(collegeRepository.findAll());
    }

    public College getCollegeByName (String collegeName) {
        return collegeRepository.findByName(collegeName).orElse(null);
    }
}
