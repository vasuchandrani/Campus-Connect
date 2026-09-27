package com.campusconnect.campusconnectbackend.college_admin.entity;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.user.entity.User;
import com.campusconnect.campusconnectbackend.user.entity.enums.Gender;
import com.campusconnect.campusconnectbackend.user.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "college_admins",
        indexes = {
                @Index(
                        name = "college_admin_college_idx",
                        columnList = "college_id"
                )
        }
)
public class CollegeAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "phone_number", nullable = false, unique = true)
    private String phoneNumber;

    public User getUser() {
        if (this.user == null) {
            this.user = new User();
            this.user.setRole(UserRole.COLLEGE_ADMIN);
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

    public LocalDateTime getCreatedAt() {
        return user != null ? user.getCreatedAt() : null;
    }
}
