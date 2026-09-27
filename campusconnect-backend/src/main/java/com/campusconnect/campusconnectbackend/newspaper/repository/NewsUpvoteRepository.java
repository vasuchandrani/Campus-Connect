package com.campusconnect.campusconnectbackend.newspaper.repository;

import com.campusconnect.campusconnectbackend.newspaper.entity.NewsUpvote;
import com.campusconnect.campusconnectbackend.newspaper.entity.id.NewsUpvoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsUpvoteRepository extends JpaRepository<NewsUpvote, NewsUpvoteId> {
    long countByIdNewsId(Long newsId);
    boolean existsByIdNewsIdAndIdUserId(Long newsId, Long userId);
    void deleteByIdNewsIdAndIdUserId(Long newsId, Long userId);
}
