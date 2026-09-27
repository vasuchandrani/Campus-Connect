package com.campusconnect.campusconnectbackend.event.controller;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.req.CreateEventOrderRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.req.VerifyEventPaymentDto;
import com.campusconnect.campusconnectbackend.event.entity.Event;
import com.campusconnect.campusconnectbackend.event.entity.EventRegistration;
import com.campusconnect.campusconnectbackend.event.entity.EventRegistrationPlan;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventRegistrationPayment;
import com.campusconnect.campusconnectbackend.event.entity.enums.RegistrationStatus;
import com.campusconnect.campusconnectbackend.event.repository.EventRegistrationPlanRepository;
import com.campusconnect.campusconnectbackend.event.repository.EventRegistrationRepository;
import com.campusconnect.campusconnectbackend.event.repository.EventRepository;
import com.campusconnect.campusconnectbackend.integrations.razorpay.service.PaymentService;
import com.campusconnect.campusconnectbackend.integrations.razorpay.service.PaymentVerificationService;
import com.campusconnect.campusconnectbackend.integrations.razorpay.dto.CreateOrderRequestDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.repository.StudentRepository;
import com.razorpay.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/campus-connect/events")
@RequiredArgsConstructor
public class EventPaymentController {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventRegistrationPlanRepository eventRegistrationPlanRepository;
    private final PaymentService paymentService;
    private final PaymentVerificationService paymentVerificationService;
    private final AuthService authService;
    private final StudentRepository studentRepository;

    @Value("${razorpay.api.key}")
    private String razorpayKey;

    /**
     * Create a Razorpay order for a PAID event registration.
     * Returns order details for the frontend to open Razorpay checkout.
     */
    @PostMapping("/{eventId}/payment/create-order")
    public Map<String, Object> createOrder(
            @PathVariable Long eventId,
            @RequestBody CreateEventOrderRequestDto request
    ) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        // Check if already registered
        Long studentId = authService.getCurrentUserId();
        if (eventRegistrationRepository.existsByEvent_IdAndStudent_Id(eventId, studentId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already registered for this event");
        }

        // For FREE events, no payment needed
        if (event.getRegistrationPayment() == EventRegistrationPayment.FREE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This is a free event. Use the free registration endpoint.");
        }

        // Get registration plan
        EventRegistrationPlan plan = eventRegistrationPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration plan not found"));

        // Check if plan belongs to this event
        if (!plan.getEvent().getId().equals(eventId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plan does not belong to this event");
        }

        // Check max seats
        if (plan.getMaxSeats() != null) {
            int currentRegistrations = eventRegistrationRepository.countByEventRegistrationPlan_Id(plan.getId());
            if (currentRegistrations >= plan.getMaxSeats()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "No seats available for this plan");
            }
        }

        // Create Razorpay order
        CreateOrderRequestDto orderRequest = new CreateOrderRequestDto();
        orderRequest.setAmount(plan.getAmount().longValue());
        orderRequest.setCurrency("INR");

        Order order = paymentService.createOrder(orderRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.get("id"));
        response.put("amount", order.get("amount"));
        response.put("currency", order.get("currency"));
        response.put("key", razorpayKey);
        response.put("eventId", eventId);
        response.put("planId", plan.getId());
        response.put("planName", plan.getPlanName());

        return response;
    }

    /**
     * Verify Razorpay payment and complete the event registration.
     */
    @PostMapping("/{eventId}/payment/verify")
    public MessageResponseDto verifyPayment(
            @PathVariable Long eventId,
            @RequestBody VerifyEventPaymentDto request
    ) throws Exception {
        // Verify payment signature
        paymentVerificationService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        // Get student
        Long userId = authService.getCurrentUserId();
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // Check if already registered
        if (eventRegistrationRepository.existsByEvent_IdAndStudent_Id(eventId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already registered for this event");
        }

        // Get event and plan
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        EventRegistrationPlan plan = null;
        if (request.getPlanId() != null) {
            plan = eventRegistrationPlanRepository.findById(request.getPlanId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration plan not found"));
        }

        // Create registration
        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setStudent(student);
        registration.setEventRegistrationPlan(plan);
        registration.setRegistrationData(request.getRegistrationData());
        registration.setStatus(RegistrationStatus.PAYMENT_COMPLETED);

        eventRegistrationRepository.save(registration);

        return new MessageResponseDto("Payment verified and registration completed successfully");
    }

    /**
     * Register for a FREE event (no payment required).
     */
    @PostMapping("/{eventId}/register-free")
    public MessageResponseDto registerFreeEvent(
            @PathVariable Long eventId,
            @RequestBody(required = false) Map<String, Object> registrationData
    ) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (event.getRegistrationPayment() != EventRegistrationPayment.FREE
                && event.getRegistrationPayment() != EventRegistrationPayment.PAID_FOR_GUEST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This is a paid event. Use the payment flow.");
        }

        Long userId = authService.getCurrentUserId();
        if (eventRegistrationRepository.existsByEvent_IdAndStudent_Id(eventId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already registered for this event");
        }

        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setStudent(student);
        registration.setStatus(RegistrationStatus.REGISTERED);

        if (registrationData != null) {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            registration.setRegistrationData(mapper.valueToTree(registrationData));
        }

        eventRegistrationRepository.save(registration);

        return new MessageResponseDto("Successfully registered for the event");
    }
}
