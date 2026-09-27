package com.campusconnect.campusconnectbackend.college.controller;

import com.campusconnect.campusconnectbackend.college.dto.res.CollegeResponseDto;
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
    public List<CollegeResponseDto> getAllColleges() {
        return collegeService.getAllColleges().stream()
                .map(c -> CollegeResponseDto.builder()
                        .id(c.getId())
                        .name(c.getCollegeName())
                        .collegeName(c.getCollegeName())
                        .domain(c.getDomain())
                        .collegeEmail(c.getCollegeEmail())
                        .collegePhone(c.getCollegePhone())
                        .logoUrl(c.getLogoUrl())
                        .website(c.getWebsite())
                        .about(c.getAbout())
                        .address(c.getAddress())
                        .isActive(c.isActive())
                        .build()
                )
                .toList();
    }
}
