package com.campusconnect.campusconnectbackend.event.repository;

import com.campusconnect.campusconnectbackend.event.entity.EventSpeaker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventSpeakerRepository extends JpaRepository<EventSpeaker, Long> {
    List<EventSpeaker> findAllByEvent_Id(Long eventId);

    void deleteAllByEvent_Id(Long eventId);

    boolean existsByEvent_Id(Long eventId);
}
