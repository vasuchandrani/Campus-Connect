package com.campusconnect.campusconnectbackend.integrations.razorpay.service;

import com.campusconnect.campusconnectbackend.integrations.razorpay.dto.CreateOrderRequestDto;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RazorpayClient razorpayClient;

    public Order createOrder(CreateOrderRequestDto request) throws Exception {

        JSONObject options = new JSONObject();

        options.put("amount", request.getAmount() * 100);
        options.put("currency", request.getCurrency());
        options.put("receipt", "cc_order_" + System.currentTimeMillis());

        return razorpayClient.orders.create(options);
    }
}