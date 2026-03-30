package com.campusconnect.campusconnectbackend.event.repository;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findEventByClub_Id(Long clubId);

    Optional<Event> findEventById(Long id);

    /* By College */

    @Query("""
        SELECT e
        FROM Event e
        WHERE e.club IN :clubs
          AND e.startTime <= :now
          AND e.endTime >= :now
        ORDER BY e.startTime ASC
    """)
    List<Event> findLiveEvents(
            @Param("clubs") List<Club> clubs,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    @Query("""
        SELECT e
        FROM Event e
        WHERE e.club IN :clubs
          AND e.startTime > :now
        ORDER BY e.startTime ASC
    """)
    List<Event> findUpcomingEvents(
            @Param("clubs") List<Club> clubs,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    @Query("""
        SELECT e
        FROM Event e
        WHERE e.club IN :clubs
          AND (
                (e.startTime <= :now AND e.endTime >= :now)
             OR (e.startTime > :now)
          )
        ORDER BY e.startTime ASC
    """)
    List<Event> findActiveEventsByCollege(@Param("clubs") List<Club> clubs, @Param("now") LocalDateTime now);

    @Query("""
        SELECT e
        FROM Event e
        WHERE e.club IN :clubs
          AND e.endTime < :now
        ORDER BY e.endTime DESC
    """)
    List<Event> findFinishedEventsByCollege(@Param("clubs") List<Club> clubs, @Param("now") LocalDateTime now);

    @Query("""
        SELECT COUNT(e)
        FROM Event e
        WHERE e.club IN :clubs
          AND (
                (e.startTime <= :now AND e.endTime >= :now)
             OR (e.startTime > :now)
          )
    """)
    int countActiveEventsByCollege(@Param("clubs") List<Club> clubs,
                                   @Param("now") LocalDateTime now);


    /* By Club */

    @Query("""
        SELECT e
        FROM Event e
        WHERE e.club.id = :clubId
          AND e.startTime <= :now
          AND e.endTime >= :now
        ORDER BY e.startTime ASC
    """)
    List<Event> findLiveEventsByClub(
            @Param("clubId") Long clubId,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    @Query("""
        SELECT e
        FROM Event e
        WHERE e.club.id = :clubId
          AND e.startTime > :now
        ORDER BY e.startTime ASC
    """)
    List<Event> findUpcomingEventsByClub(
            @Param("clubId") Long clubId,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(e)
        FROM Event e
        WHERE e.club.id = :clubId
          AND (
                (e.startTime <= :now AND e.endTime >= :now)
             OR (e.startTime > :now)
          )
    """)
    int countActiveEventsByClub(@Param("clubId") Long clubId,
                                @Param("now") LocalDateTime now);

    @Query("""
        SELECT e
        FROM Event e
        WHERE e.club.id = :clubId
          AND (
                (e.startTime <= :now AND e.endTime >= :now)
             OR (e.startTime > :now)
          )
        ORDER BY e.startTime ASC
    """)
    List<Event> findActiveEventsByClub(@Param("clubId") Long clubId, @Param("now") LocalDateTime now);

    @Query("""
        SELECT e
        FROM Event e
        WHERE e.club.id = :clubId
          AND e.endTime < :now
        ORDER BY e.endTime DESC
    """)
    List<Event> findFinishedEventsByClub(@Param("clubId") Long clubId, @Param("now") LocalDateTime now);
}