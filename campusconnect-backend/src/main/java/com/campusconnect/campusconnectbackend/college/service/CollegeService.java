package com.campusconnect.campusconnectbackend.college.service;

import com.campusconnect.campusconnectbackend.college.entity.College;

import java.util.List;

public interface CollegeService {

    List<College> getAllColleges();

    College getCollegeById(Long collegeId);
}
