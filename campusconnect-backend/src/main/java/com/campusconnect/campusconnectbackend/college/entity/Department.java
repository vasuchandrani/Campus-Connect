package com.campusconnect.campusconnectbackend.college.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
        name = "departments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "college_department_name_uk",
                        columnNames = {"college_id", "department_name"}
                )
        }
)
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @Column(name = "department_name", length = 100, nullable = false)
    private String name;

    @Column(name = "code", length = 20)
    private String code;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Department(College college, String name, String code) {
        this.college = college;
        this.name = name;
        this.code = code;
    }
}
