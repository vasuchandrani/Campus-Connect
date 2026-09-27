package com.campusconnect.campusconnectbackend.newspaper.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "newspaper_images",
        indexes = {
                @Index(name = "newspaper_images_newspaper_idx", columnList = "newspaper_id")
        }
)
public class NewsPaperImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "newspaper_id", nullable = false)
    private NewsPaper newsPaper;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;
}
