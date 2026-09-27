package com.campusconnect.campusconnectbackend.announcement.repository;

import com.campusconnect.campusconnectbackend.announcement.entity.Announcement;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("""
        select a
        from Announcement a
        where a.club in :clubs
        order by a.createdAt desc
    """)
    List<Announcement> findAllByClubs(List<Club> clubs);

    List<Announcement> findByClub_IdOrderByCreatedAtDesc(Long clubId);

    @Query("""
        select a
        from Announcement a
        where a.club.id = :clubId
        order by a.createdAt desc
    """)
    List<Announcement> findLatestByClubId(
            Long clubId,
            Pageable pageable
    );

    @Query("""
        select a
        from Announcement a
        where a.club.id = :clubId
          and a.status <> com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.DRAFT
          and a.status <> com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.DELETED
          and (a.status = com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.PUBLISHED or a.state >= 2 or a.status is null)
        order by a.createdAt desc
    """)
    List<Announcement> findPublishedByClubId(Long clubId);

    @Query("""
        select a
        from Announcement a
        where a.club.id = :clubId
          and a.createdBy.id = :userId
          and a.status = com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.DRAFT
        order by a.createdAt desc
    """)
    List<Announcement> findDraftsByClubIdAndUserId(Long clubId, Long userId);

    @Query("""
        select a
        from Announcement a
        where a.club.id = :clubId
          and a.status <> com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.DRAFT
          and a.status <> com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.DELETED
          and (a.status = com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.APPROVED_BY_CLUB_ADMIN or a.state = 1)
        order by a.createdAt desc
    """)
    List<Announcement> findPendingByClubId(Long clubId);

    @Query("""
        select a
        from Announcement a
        where a.club.id = :clubId
          and a.status <> com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.DRAFT
          and a.status <> com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.DELETED
          and (a.status = com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.CREATED or a.status = com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.PENDING_APPROVAL or a.state = 0)
        order by a.createdAt desc
    """)
    List<Announcement> findPendingForClubAdmin(@Param("clubId") Long clubId);

    @Query("""
        select a
        from Announcement a
        where a.club.id = :clubId
          and a.createdBy.id = :userId
          and a.status <> com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.DRAFT
          and a.status <> com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.DELETED
          and a.status <> com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus.PUBLISHED
          and a.state < 3
        order by a.createdAt desc
    """)
    List<Announcement> findMyPendingByClubIdAndUserId(@Param("clubId") Long clubId, @Param("userId") Long userId);

    boolean existsById(Long annId);

    void deleteById(Long annId);
}
