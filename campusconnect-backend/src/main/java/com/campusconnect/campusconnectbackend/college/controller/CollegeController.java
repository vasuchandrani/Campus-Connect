package com.campusconnect.campusconnectbackend.college.controller;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/campus-connect")
@RequiredArgsConstructor
public class CollegeController {

    private final CollegeService collegeService;

    @GetMapping("/colleges")
    public List<College> getAllColleges(){
        return collegeService.getAllColleges();
    }
}
