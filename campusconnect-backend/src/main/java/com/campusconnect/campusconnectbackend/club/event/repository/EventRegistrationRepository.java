package com.campusconnect.campusconnectbackend.club.event.repository;

import com.campusconnect.campusconnectbackend.club.event.entity.EventRegistration;
import com.campusconnect.campusconnectbackend.club.event.entity.id.EventRegistrationId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, EventRegistrationId> {
    boolean existsByEvent_IdAndStudent_Id(Long eventId, Long studentId);

    void deleteByEvent_IdAndStudent_Id(Long eventId, Long studentId);

    int countByEvent_Id(Long eventId);
}
