package com.campusconnect.campusconnectbackend.college.service;

import com.campusconnect.campusconnectbackend.college.dto.res.CollegeSubscriptionResponseDto;
import com.campusconnect.campusconnectbackend.college.entity.CollegeSubscription;
import com.campusconnect.campusconnectbackend.college.repository.CollegeSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CollegeSubscriptionService {

    private final CollegeSubscriptionRepository collegeSubscriptionRepository;

    // get DTO
    private CollegeSubscriptionResponseDto getDto(CollegeSubscription subscription) {
        // create dto
        CollegeSubscriptionResponseDto dto = new CollegeSubscriptionResponseDto();
        if (subscription == null) return dto;

        // map the data
        dto.setAmount(subscription.getAmount());
        dto.setPlanName(subscription.getPlanName());
        dto.setStartDate(subscription.getStartDate());
        dto.setEndDate(subscription.getEndDate());

        return dto;
    }


    public CollegeSubscriptionResponseDto getSubscription(Long currentCollegeId) {

        // find subscription
        CollegeSubscription subscription = collegeSubscriptionRepository.findByCollege_Id(currentCollegeId);

        return getDto(subscription);
    }
}
