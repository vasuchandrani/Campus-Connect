package com.campusconnect.campusconnectbackend.club.event.repository;

import com.campusconnect.campusconnectbackend.club.event.entity.EventWinner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventWinnerRepository extends JpaRepository<EventWinner, Long> {
    List<EventWinner> findAllByEvent_Id(Long eventId);

    void deleteAllByEvent_Id(Long eventId);
}
