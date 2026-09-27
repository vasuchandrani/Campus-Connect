package com.campusconnect.campusconnectbackend.college.entity;

import com.campusconnect.campusconnectbackend.common.location.entity.Location;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "college_registration_requests")
public class CollegeRegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "college_name", nullable = false)
    private String collegeName;

    @Column(name = "college_email", nullable = false)
    private String collegeEmail;

    @Column(name = "college_phone", nullable = false)
    private String collegePhone;

    @Column(name = "admin_name", nullable = false)
    private String adminName;

    @Column(name = "admin_email", nullable = false)
    private String adminEmail;

    @Column(name = "admin_phone", nullable = false)
    private String adminPhone;

    @Column(name = "about", columnDefinition = "TEXT")
    private String about;

    @Column(name = "domain")
    private String domain;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "website")
    private String website;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Backward compatibility helper
    public String getName() {
        return collegeName;
    }

    public void setName(String name) {
        this.collegeName = name;
    }
}
