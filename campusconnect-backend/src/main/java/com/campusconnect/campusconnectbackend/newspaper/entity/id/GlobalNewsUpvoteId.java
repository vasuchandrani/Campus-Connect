package com.campusconnect.campusconnectbackend.newspaper.entity.id;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GlobalNewsUpvoteId implements Serializable {

    private Long globalNewsId;
    private Long userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GlobalNewsUpvoteId that = (GlobalNewsUpvoteId) o;
        return Objects.equals(globalNewsId, that.globalNewsId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(globalNewsId, userId);
    }
}
