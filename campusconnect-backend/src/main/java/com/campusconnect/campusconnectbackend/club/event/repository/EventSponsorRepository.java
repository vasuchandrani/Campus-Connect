package com.campusconnect.campusconnectbackend.club.event.repository;

import com.campusconnect.campusconnectbackend.club.event.entity.EventSponsor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventSponsorRepository extends JpaRepository<EventSponsor, Long> {
    List<EventSponsor> findAllByEvent_Id(Long eventId);

    void deleteAllByEvent_Id(Long eventId);
}
