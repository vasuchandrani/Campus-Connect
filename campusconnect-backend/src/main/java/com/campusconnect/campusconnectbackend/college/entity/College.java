package com.campusconnect.campusconnectbackend.college.entity;

import com.campusconnect.campusconnectbackend.common.location.entity.Location;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "colleges")
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", unique = true)
    private CollegeSubscription collegeSubscription;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @JsonIgnore
    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Department> departments = new java.util.ArrayList<>();

    @Column(name = "college_name", nullable = false)
    private String collegeName;

    @Column(name = "college_email", nullable = false)
    private String collegeEmail;

    @Column(name = "college_phone", nullable = false)
    private String collegePhone;

    @Column(name = "about", columnDefinition = "TEXT")
    private String about;

    @Column(name = "domain", nullable = false, unique = true)
    private String domain;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "website")
    private String website;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper getter to maintain backward compatibility where getName() was called
    public String getName() {
        return collegeName;
    }

    public void setName(String name) {
        this.collegeName = name;
    }

    public String getAddress() {
        return location != null ? location.getAddress() : null;
    }

    public void setAddress(String address) {
        if (this.location == null) {
            this.location = new Location();
            this.location.setCity("Unknown");
            this.location.setState("Unknown");
            this.location.setCountry("Unknown");
        }
        this.location.setAddress(address);
    }

    public boolean isVerified() {
        return isActive;
    }

    public void setVerified(boolean verified) {
        this.isActive = verified;
    }

    public void setIsActive(boolean active) {
        this.isActive = active;
    }
}
