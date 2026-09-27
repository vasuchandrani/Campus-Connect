package com.campusconnect.campusconnectbackend.college.service.serviceImpl;

import com.campusconnect.campusconnectbackend.college.dto.res.CollegeSubscriptionResponseDto;
import com.campusconnect.campusconnectbackend.college.entity.CollegeSubscription;
import com.campusconnect.campusconnectbackend.college.repository.CollegeSubscriptionRepository;
import com.campusconnect.campusconnectbackend.college.service.CollegeSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollegeSubscriptionServiceImpl implements CollegeSubscriptionService {

    private final CollegeSubscriptionRepository collegeSubscriptionRepository;

    private CollegeSubscriptionResponseDto getDto(CollegeSubscription subscription) {
        CollegeSubscriptionResponseDto dto = new CollegeSubscriptionResponseDto();
        if (subscription == null) return dto;

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

    private List<CollegeSubscriptionResponseDto> getDtoList(List<CollegeSubscription> subscriptions) {
        List<CollegeSubscriptionResponseDto> response = new ArrayList<>();
        for (CollegeSubscription subscription : subscriptions) {
            CollegeSubscriptionResponseDto dto = getDto(subscription);
            response.add(dto);
        }
        return response;
    }

    @Override
    @Cacheable(value = "college_subscription", key = "#collegeId")
    public CollegeSubscriptionResponseDto getSubscription(Long collegeId) {
        CollegeSubscription subscription = collegeSubscriptionRepository.findActiveSubscription(collegeId, LocalDateTime.now()).orElse(
                new CollegeSubscription()
        );
        return getDto(subscription);
    }

    @Override
    @Cacheable(value = "college_subscription_history", key = "#collegeId")
    public List<CollegeSubscriptionResponseDto> getSubscriptionHistory(Long collegeId) {
        List<CollegeSubscription> subscriptions = collegeSubscriptionRepository.findAllByCollege_Id(collegeId);
        return getDtoList(subscriptions);
    }
}
