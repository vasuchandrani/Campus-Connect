package com.campusconnect.campusconnectbackend.integrations.razorpay.controller;

import com.campusconnect.campusconnectbackend.integrations.razorpay.dto.CreateOrderRequestDto;
import com.campusconnect.campusconnectbackend.integrations.razorpay.dto.PaymentVerificationRequestDto;
import com.campusconnect.campusconnectbackend.integrations.razorpay.service.PaymentService;
import com.campusconnect.campusconnectbackend.integrations.razorpay.service.PaymentVerificationService;
import com.razorpay.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/campus-connect/college-admin")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentVerificationService verificationService;

    @Value("${razorpay.api.key}")
    private String razorpayKey;

    @PostMapping("/create-order")
    public Map<String, Object> createOrder(@RequestBody CreateOrderRequestDto request) throws Exception {

        Order order = paymentService.createOrder(request);

        Map<String, Object> response = new HashMap<>();

        response.put("orderId", order.get("id"));
        response.put("amount", order.get("amount"));
        response.put("currency", order.get("currency"));
        response.put("key", razorpayKey);

        return response;
    }

    @PostMapping("/verify")
    public boolean verifyPayment(@RequestBody PaymentVerificationRequestDto request) throws Exception {

        verificationService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );
        return true;
    }
}