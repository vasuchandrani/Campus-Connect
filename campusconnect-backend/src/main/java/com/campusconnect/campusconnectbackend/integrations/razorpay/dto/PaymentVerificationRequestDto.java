package com.campusconnect.campusconnectbackend.integrations.razorpay.dto;

import com.campusconnect.campusconnectbackend.college_admin.dto.req.CollegeAdminSignupRequestDto;
import lombok.Data;

@Data
public class PaymentVerificationRequestDto {

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    private CollegeAdminSignupRequestDto signupData;
}