package com.campusconnect.campusconnectbackend.integrations.razorpay.controller;

import com.campusconnect.campusconnectbackend.integrations.razorpay.dto.CreateOrderRequestDto;
import com.campusconnect.campusconnectbackend.integrations.razorpay.dto.PaymentVerificationRequestDto;
import com.campusconnect.campusconnectbackend.integrations.razorpay.service.PaymentService;
import com.campusconnect.campusconnectbackend.integrations.razorpay.service.PaymentVerificationService;
import com.razorpay.Order;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campus-connect/college-admin")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentVerificationService verificationService;

    public PaymentController(PaymentService paymentService,
                             PaymentVerificationService verificationService) {
        this.paymentService = paymentService;
        this.verificationService = verificationService;
    }

    @PostMapping("/create-order")
    public String createOrder(@RequestBody CreateOrderRequestDto request) throws Exception {

        Order order = paymentService.createOrder(request);

        return order.toString();
    }

    @PostMapping("/verify")
    public boolean verifyPayment(@RequestBody PaymentVerificationRequestDto request) throws Exception {

        return verificationService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );
    }
}