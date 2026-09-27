package com.campusconnect.campusconnectbackend.event.repository;

import com.campusconnect.campusconnectbackend.event.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    boolean existsByEvent_IdAndStudent_Id(Long eventId, Long studentId);

    void deleteByEvent_IdAndStudent_Id(Long eventId, Long studentId);

    int countByEvent_Id(Long eventId);

    int countByEventRegistrationPlan_Id(Long planId);

    @Query("""
    SELECT er FROM EventRegistration er
    JOIN FETCH er.student s
    JOIN FETCH er.event e
    WHERE e.id = :eventId
""")
    List<EventRegistration> findByEventIdWithStudent(@Param("eventId") Long eventId);
}
