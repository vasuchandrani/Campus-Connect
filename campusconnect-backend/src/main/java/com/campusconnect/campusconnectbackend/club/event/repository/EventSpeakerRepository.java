package com.campusconnect.campusconnectbackend.club.event.repository;

import com.campusconnect.campusconnectbackend.club.event.entity.EventSpeaker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventSpeakerRepository extends JpaRepository<EventSpeaker, Long> {
    List<EventSpeaker> findAllByEvent_Id(Long eventId);

    void deleteAllByEvent_Id(Long eventId);
}
