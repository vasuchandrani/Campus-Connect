package com.campusconnect.campusconnectbackend.college.service;

import com.campusconnect.campusconnectbackend.college.dto.res.CollegeSubscriptionResponseDto;
import com.campusconnect.campusconnectbackend.college.entity.CollegeSubscription;
import com.campusconnect.campusconnectbackend.college.repository.CollegeSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
        dto.setAdminName(subscription.getAdminName());
        dto.setAdminEmail(subscription.getAdminEmail());
        dto.setPaymentId(subscription.getPaymentId());
        dto.setOrderId(subscription.getOrderId());
        dto.setInvoiceUrl(subscription.getInvoiceUrl());

        return dto;
    }

    // get DTO -list
    private List<CollegeSubscriptionResponseDto> getDtoList(List<CollegeSubscription> subscriptions) {

        // create response
        List<CollegeSubscriptionResponseDto> response = new ArrayList<>();

        for (CollegeSubscription subscription : subscriptions) {
            CollegeSubscriptionResponseDto dto = getDto(subscription);
            response.add(dto);
        }
        return response;
    }

    // get subscription
    @Cacheable(value = "college_subscription", key = "#collegeId")
    public CollegeSubscriptionResponseDto getSubscription(Long collegeId) {

        // find subscription
        CollegeSubscription subscription = collegeSubscriptionRepository.findActiveSubscription(collegeId, LocalDateTime.now()).orElse(
                new CollegeSubscription()
        );

        return getDto(subscription);
    }

    @Cacheable(value = "college_subscription_history", key = "#collegeId")
    public List<CollegeSubscriptionResponseDto> getSubscriptionHistory(Long collegeId) {

        // find all subscriptions
        List<CollegeSubscription> subscriptions = collegeSubscriptionRepository.findAllByCollege_Id(collegeId);

        return getDtoList(subscriptions);
    }
}
