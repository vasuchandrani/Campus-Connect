package com.campusconnect.campusconnectbackend.college.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college.CollegeRepository;
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

    public College getCollegeByName (String collegeName) {
        return collegeRepository.findByName(collegeName).orElse(null);
    }

    public College getCollegeById(Long collegeId) {
        return collegeRepository.findById(collegeId).orElse(null);
    }

}
