package com.campusconnect.campusconnectbackend.college.service.serviceImpl;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.repository.CollegeRepository;
import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollegeServiceImpl implements CollegeService {

    private final CollegeRepository collegeRepository;

    @Override
    public List<College> getAllColleges() {
        return new ArrayList<>(collegeRepository.findAll());
    }

    @Override
    public College getCollegeById(Long collegeId) {
        return collegeRepository.findById(collegeId).orElseThrow(
                () -> new RuntimeException("College not found")
        );
    }
}
