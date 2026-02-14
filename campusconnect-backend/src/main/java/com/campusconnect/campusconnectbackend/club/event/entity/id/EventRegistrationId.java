package com.campusconnect.campusconnectbackend.club.event.entity.id;


import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
public class EventRegistrationId implements Serializable {

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "student_id")
    private Long studentId;
}
