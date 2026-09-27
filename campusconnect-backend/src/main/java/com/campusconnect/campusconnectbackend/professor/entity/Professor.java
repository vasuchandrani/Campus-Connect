package com.campusconnect.campusconnectbackend.professor.entity;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.user.entity.User;
import com.campusconnect.campusconnectbackend.user.entity.enums.Gender;
import com.campusconnect.campusconnectbackend.user.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "professors",
        indexes = {
                @Index(
                        name = "professor_college_idx",
                        columnList = "college_id"
                )
        }
)
public class Professor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private com.campusconnect.campusconnectbackend.college.entity.Department department;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "about", columnDefinition = "TEXT")
    private String about;

    @Column(name = "portfolio_link", columnDefinition = "TEXT")
    private String portfolioLink;

    public User getUser() {
        if (this.user == null) {
            this.user = new User();
            this.user.setRole(UserRole.PROFESSOR);
            this.user.setProfilePic("");
            this.user.setGender(Gender.OTHER);
        }
        return this.user;
    }

    public String getEmail() {
        return user != null ? user.getEmail() : null;
    }

    public void setEmail(String email) {
        getUser().setEmail(email);
    }

    public String getPasswordHash() {
        return user != null ? user.getPassword() : null;
    }

    public void setPasswordHash(String password) {
        getUser().setPassword(password);
    }
}
