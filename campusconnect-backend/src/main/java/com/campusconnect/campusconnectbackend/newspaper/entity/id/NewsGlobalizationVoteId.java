package com.campusconnect.campusconnectbackend.newspaper.entity.id;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class NewsGlobalizationVoteId implements Serializable {

    private Long newsId;
    private Long adminId;
}
