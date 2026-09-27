package com.campusconnect.campusconnectbackend.newspaper.repository;

import com.campusconnect.campusconnectbackend.newspaper.entity.GlobalNewsUpvote;
import com.campusconnect.campusconnectbackend.newspaper.entity.id.GlobalNewsUpvoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlobalNewsUpvoteRepository extends JpaRepository<GlobalNewsUpvote, GlobalNewsUpvoteId> {
    long countByIdGlobalNewsId(Long globalNewsId);
    boolean existsByIdGlobalNewsIdAndIdUserId(Long globalNewsId, Long userId);
    void deleteByIdGlobalNewsIdAndIdUserId(Long globalNewsId, Long userId);
}
