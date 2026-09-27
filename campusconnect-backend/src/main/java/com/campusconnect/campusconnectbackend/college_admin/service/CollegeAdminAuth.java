package com.campusconnect.campusconnectbackend.college_admin.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.entity.CollegeSubscription;
import com.campusconnect.campusconnectbackend.college.entity.SubscriptionPlan;
import com.campusconnect.campusconnectbackend.college.entity.enums.SubscriptionStatus;
import com.campusconnect.campusconnectbackend.college.repository.CollegeSubscriptionRepository;
import com.campusconnect.campusconnectbackend.college.repository.SubscriptionPlanRepository;
import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.integrations.razorpay.service.GenerateInvoice;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ChangePasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.CollegeAdminProfileDto;
import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.college_admin.dto.req.CollegeAdminSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.college_admin.repository.CollegeAdminRepository;
import com.campusconnect.campusconnectbackend.college.repository.CollegeRepository;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ForgetPasswordRequestDto;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class CollegeAdminAuth {
    private final AuthenticationManager authenticationManager;
    private final CollegeAdminRepository collegeAdminRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final CollegeRepository collegeRepository;
    private final CollegeSubscriptionRepository collegeSubscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final GenerateInvoice generateInvoice;
    private final EmailDispatcherService emailDispatcherService;
    private final CloudinaryService cloudinaryService;
    private final com.campusconnect.campusconnectbackend.college.repository.DepartmentRepository departmentRepository;

    // college-admin signup
    @Transactional
    public AuthResponseDto store(CollegeAdminSignupRequestDto request) {
        var plan = request.getSubscription();
        if (plan == null) {
            return new AuthResponseDto(
                    null,
                    "Your subscription not found",
                    "/campus-connect/auth"
            );
        }

        // create college
        College college = new College();
        college.setName(request.getCollegeName());
        college.setDomain(request.getDomain());
        college.setAddress(request.getAddress());
        college.setWebsite(request.getWebsite());
        college.setAbout(request.getAboutCollege());
        college.setIsActive(true);
        college.setVerified(true);

        String collegeEmail = (request.getCollegeEmail() != null && !request.getCollegeEmail().isBlank())
                ? request.getCollegeEmail().trim()
                : (request.getEmail() != null ? request.getEmail().trim() : "");
        String collegePhone = (request.getCollegePhone() != null && !request.getCollegePhone().isBlank())
                ? request.getCollegePhone().trim()
                : (request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : "");

        college.setCollegeEmail(collegeEmail);
        college.setCollegePhone(collegePhone);

        // save college in db
        College savedCollege = collegeRepository.save(college);

        // create default "General" department
        com.campusconnect.campusconnectbackend.college.entity.Department generalDept =
                new com.campusconnect.campusconnectbackend.college.entity.Department(savedCollege, "General", "GEN");
        departmentRepository.save(generalDept);

        // create user-specified departments
        if (request.getDepartments() != null) {
            java.util.Set<String> addedNames = new java.util.HashSet<>();
            addedNames.add("general");

            for (String deptName : request.getDepartments()) {
                if (deptName != null) {
                    String trimmed = deptName.trim();
                    if (!trimmed.isBlank() && addedNames.add(trimmed.toLowerCase())) {
                        String code = generateCodeFromName(trimmed);
                        com.campusconnect.campusconnectbackend.college.entity.Department dept =
                                new com.campusconnect.campusconnectbackend.college.entity.Department(savedCollege, trimmed, code);
                        departmentRepository.save(dept);
                    }
                }
            }
        }

        // create college-admin
        CollegeAdmin admin = new CollegeAdmin();
        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setPhoneNumber(request.getPhoneNumber());
        admin.getUser().setVerified(true);

        admin.setCollege(savedCollege);
        // save college-admin in db
        CollegeAdmin savedAdmin = collegeAdminRepository.save(admin);

        // create college-subscription
        CollegeSubscription subscription = new CollegeSubscription();

        LocalDateTime now = LocalDateTime.now();
        int durationMonths = plan.getDurationInMonths() > 0 ? plan.getDurationInMonths() : 1;
        LocalDateTime endDate = now.plusMonths(durationMonths);

        String planName = (plan.getPlanName() != null && !plan.getPlanName().isBlank())
                ? plan.getPlanName().trim()
                : "Basic";

        SubscriptionPlan subscriptionPlan = subscriptionPlanRepository.findByPlanName(planName)
                .orElseGet(() -> {
                    SubscriptionPlan sp = new SubscriptionPlan();
                    sp.setPlanName(planName);
                    sp.setAmount(BigDecimal.valueOf(plan.getAmount()));
                    sp.setActive(true);
                    return subscriptionPlanRepository.save(sp);
                });

        subscription.setPlan(subscriptionPlan);
        subscription.setStartDate(now);
        subscription.setEndDate(endDate);
        subscription.setCollege(savedCollege);
        subscription.setAdminName(savedAdmin.getFullName());
        subscription.setAdminEmail(savedAdmin.getEmail());
        subscription.setPaymentId(plan.getPaymentId() != null ? plan.getPaymentId() : "pay_completed");
        subscription.setOrderId(plan.getOrderId() != null ? plan.getOrderId() : "order_completed");
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setInvoiceUrl("");

        // save subscription in db
        CollegeSubscription savedSubscription = collegeSubscriptionRepository.save(subscription);

        // link subscription back to college
        savedCollege.setCollegeSubscription(savedSubscription);
        collegeRepository.save(savedCollege);

        // generate invoice & send mail & upload to cloudinary safely
        try {
            MultipartFile invoice = generateInvoice.generateInvoice(savedSubscription);

            // send mail to college-admin
            try {
                emailDispatcherService.sendInvoiceMail(
                        savedAdmin.getEmail(),
                        savedAdmin.getFullName(),
                        savedSubscription.getPlanName(),
                        savedSubscription.getPaymentId(),
                        savedSubscription.getOrderId(),
                        savedSubscription.getAmount(),
                        invoice
                );
            } catch (Exception ex) {
                // Email failure should not rollback signup
            }

            // store invoice on cloudinary and get url
            try {
                String path = "Invoices" + savedCollege.getId();
                String invoiceUrl = cloudinaryService.uploadPdf(invoice, path);
                savedSubscription.setInvoiceUrl(invoiceUrl);
                collegeSubscriptionRepository.save(savedSubscription);
            } catch (Exception ex) {
                // Cloudinary failure should not rollback signup
            }
        } catch (Exception ex) {
            // Invoice generation failure should not rollback signup
        }

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                savedAdmin.getId(),
                "COLLEGE_ADMIN",
                savedAdmin.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "COLLEGE_ADMIN",
                "/campus-connect/college-admin/dashboard"
        );
    }

    // college-admin login
    public AuthResponseDto authenticate(LoginRequestDto request) {

        String compositeUsername = "COLLEGE_ADMIN:" + request.getEmail();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        compositeUsername,
                        request.getPassword()
                )
        );

        CollegeAdmin collegeAdmin = collegeAdminRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                collegeAdmin.getId(),
                "COLLEGE_ADMIN",
                collegeAdmin.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "COLLEGE_ADMIN",
                "/campus-connect/college-admin/dashboard"
        );
    }

    // reset password
    @Transactional
    public MessageResponseDto resetPassword(ForgetPasswordRequestDto request) {
        try {
            String email = request.getEmail();
            String password = request.getPassword();

            // find student
            CollegeAdmin admin = collegeAdminRepository.findByEmail(email).orElseThrow(
                    () -> new RuntimeException("User not found, Try again!")
            );

            // change password
            admin.setPasswordHash(passwordEncoder.encode(password));
            collegeAdminRepository.save(admin);

            return new MessageResponseDto("Your password changed successfully!");
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // get college-admin profile
    @Transactional(readOnly = true)
    public CollegeAdminProfileDto getProfile(Long collegeAdminId) {

        // find college-admin with user and college eagerly fetched
        CollegeAdmin admin = collegeAdminRepository.findByIdWithDetails(collegeAdminId)
                .or(() -> collegeAdminRepository.findById(collegeAdminId))
                .orElseThrow(() -> new RuntimeException("You are not logged in"));
        // find college
        College college = admin.getCollege();

        // create response
        CollegeAdminProfileDto profile = new CollegeAdminProfileDto();
        profile.setFullName(admin.getFullName());
        profile.setEmail(admin.getEmail());
        profile.setPhoneNumber(admin.getPhoneNumber());
        profile.setCollegeName(college != null ? college.getName() : "");
        profile.setDomain(college != null ? college.getDomain() : "");
        profile.setWebsite(college != null ? college.getWebsite() : "");
        profile.setCollegeAddress(college != null ? college.getAddress() : "");
        profile.setCollegeDescription(college != null ? college.getAbout() : "");

        return profile;
    }

    // update profile
    @Transactional
    public MessageResponseDto updateProfile(Long collegeAdminId, CollegeAdminProfileDto request) {

        // find college-admin
        CollegeAdmin admin = collegeAdminRepository.findById(collegeAdminId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );
        // find college
        College college = admin.getCollege();

        // overwrite all fields to update

        // college fields
        college.setName(request.getCollegeName());
        college.setDomain(request.getDomain());
        college.setWebsite(request.getWebsite());
        college.setAddress(request.getCollegeAddress());
        college.setAbout(request.getCollegeDescription());

        College savedCollege = collegeRepository.save(college);

        // admin fields
        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPhoneNumber(request.getPhoneNumber());
        admin.setCollege(savedCollege);

        collegeAdminRepository.save(admin);

        return new MessageResponseDto("Your profile has been updated successfully!");
    }

    // change password when provided old-password
    @Transactional
    public MessageResponseDto changePassword(Long currentUserId, ChangePasswordRequestDto request) {
        String oldPassword = request.getOldPassword();
        String newPassword = request.getNewPassword();

        // find college-admin
        CollegeAdmin admin = collegeAdminRepository.findById(currentUserId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // check old-password
        if (!passwordEncoder.matches(oldPassword, admin.getPasswordHash())) {
            return new MessageResponseDto("Your old-password is wrong!");
        }

        // update
        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        collegeAdminRepository.save(admin);

        return new MessageResponseDto("Your password changed successfully!");
    }

    public CollegeAdmin getCollegeAdminByEmail(String email) {

        return collegeAdminRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("College-admin not found, Try again!")
        );
    }

    private String generateCodeFromName(String name) {
        if (name == null || name.isBlank()) return "DEPT";
        String[] words = name.trim().split("\\s+");
        if (words.length == 1) {
            return name.substring(0, Math.min(name.length(), 4)).toUpperCase();
        }
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.equalsIgnoreCase("&") && !w.equalsIgnoreCase("and") && !w.equalsIgnoreCase("of") && !w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0)));
            }
        }
        return sb.length() > 0 ? sb.toString() : "DEPT";
    }
}
