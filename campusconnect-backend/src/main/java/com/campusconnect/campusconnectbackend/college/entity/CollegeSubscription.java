package com.campusconnect.campusconnectbackend.college.entity;

import com.campusconnect.campusconnectbackend.college.entity.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "college_subscriptions")
public class CollegeSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne(mappedBy = "collegeSubscription", fetch = FetchType.LAZY)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    @Column(name = "admin_name", nullable = false)
    private String adminName;

    @Column(name = "admin_email", nullable = false)
    private String adminEmail;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "payment_id", nullable = false)
    private String paymentId;

    @Column(name = "invoice_url")
    private String invoiceUrl = "";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public SubscriptionPlan getPlan() {
        if (this.plan == null) {
            this.plan = new SubscriptionPlan();
            this.plan.setPlanName("FREE");
            this.plan.setAmount(java.math.BigDecimal.ZERO);
        }
        return this.plan;
    }

    public String getPlanName() {
        return plan != null ? plan.getPlanName() : "FREE";
    }

    public void setPlanName(String planName) {
        getPlan().setPlanName(planName);
    }

    public int getAmount() {
        return plan != null && plan.getAmount() != null ? plan.getAmount().intValue() : 0;
    }

    public void setAmount(int amount) {
        getPlan().setAmount(java.math.BigDecimal.valueOf(amount));
    }
}
