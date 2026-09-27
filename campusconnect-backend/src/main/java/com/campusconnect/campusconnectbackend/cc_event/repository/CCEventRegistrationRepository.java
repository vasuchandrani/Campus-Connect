package com.campusconnect.campusconnectbackend.cc_event.repository;

import com.campusconnect.campusconnectbackend.cc_event.entity.CCEventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CCEventRegistrationRepository extends JpaRepository<CCEventRegistration, Long> {
    boolean existsByEventIdAndUserId(Long eventId, Long userId);
    Optional<CCEventRegistration> findByEventIdAndUserId(Long eventId, Long userId);
    long countByEventId(Long eventId);
}
