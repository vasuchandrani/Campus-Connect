package com.campusconnect.campusconnectbackend.journalist.entity;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.student.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "journalist_request")
public class JournalistRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String why;

    @Column(nullable = false)
    private String experience;

    @Column(nullable = false)
    private String portfolioLink;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "college_id")
    private College college;
}