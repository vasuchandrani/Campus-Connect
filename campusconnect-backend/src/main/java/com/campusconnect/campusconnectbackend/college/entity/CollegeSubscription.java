package com.campusconnect.campusconnectbackend.college.entity;

import com.campusconnect.campusconnectbackend.college.College;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "college_subscription")
public class CollegeSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "college_id", nullable = false, unique = true)
    private College college;

    @Column(name = "plan_name", nullable = false)
    private String planName;

    @Column(name = "amount", nullable = false)
    private int amount;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;
}
