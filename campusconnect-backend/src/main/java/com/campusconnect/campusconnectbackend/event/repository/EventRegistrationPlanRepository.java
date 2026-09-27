package com.campusconnect.campusconnectbackend.event.repository;

import com.campusconnect.campusconnectbackend.event.entity.EventRegistrationPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRegistrationPlanRepository extends JpaRepository<EventRegistrationPlan, Long> {

    List<EventRegistrationPlan> findAllByEvent_Id(Long eventId);

    void deleteAllByEvent_Id(Long eventId);

    boolean existsByEvent_Id(Long eventId);
}
