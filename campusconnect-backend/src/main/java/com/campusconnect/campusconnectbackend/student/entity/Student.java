package com.campusconnect.campusconnectbackend.student.entity;

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
        name = "students",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "college_student_uk",
                        columnNames = {"college_id", "student_id"}
                )
        },
        indexes = {
                @Index(
                        name = "students_college_batch_idx",
                        columnList = "college_id, batch_year"
                ),
                @Index(
                        name = "students_college_department_idx",
                        columnList = "college_id, department"
                )
        }
)
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // student's college-id
    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private com.campusconnect.campusconnectbackend.college.entity.Department departmentEntity;

    @Column(name = "batch_year", nullable = false)
    private int batchYear;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Transient
    private boolean isActive = true;

    public User getUser() {
        if (this.user == null) {
            this.user = new User();
            this.user.setRole(UserRole.STUDENT);
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

    public String getGender() {
        return user != null && user.getGender() != null ? user.getGender().name() : null;
    }

    public void setGender(String gender) {
        if (gender != null) {
            try {
                getUser().setGender(Gender.valueOf(gender.toUpperCase()));
            } catch (Exception ignored) {
                getUser().setGender(Gender.OTHER);
            }
        }
    }

    public int getYear() {
        return batchYear;
    }

    public void setYear(int year) {
        this.batchYear = year;
    }

    public boolean isVerified() {
        return user != null && user.isVerified();
    }

    public void setVerified(boolean verified) {
        getUser().setVerified(verified);
    }

    public LocalDateTime getCreatedAt() {
        return user != null ? user.getCreatedAt() : null;
    }
}