package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentRegisterRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentSignupRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.res.StudentResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.Student;
import com.campusconnect.campusconnectbackend.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentRepoService {

    private final StudentRepository studentRepository;
    private final StudentAuth studentAuth;
    private final EmailDispatcherService emailDispatcherService;
    private final AuthService authService;

    // get DTO
    private StudentResponseDto getDto(Student student) {
        // create dto
        StudentResponseDto dto = new StudentResponseDto();
        // map the data
        dto.setId(student.getId());
        dto.setStudentId(student.getStudentId());
        dto.setFullName(student.getFullName());
        dto.setEmail(student.getEmail());
        dto.setGender(student.getGender());
        dto.setDepartment(student.getDepartment());
        dto.setYear(student.getYear());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setVerified(student.isVerified());
        dto.setCollegeId(student.getCollege().getId());

        return dto;
    }

    // get DTO -list
    private List<StudentResponseDto> getDtoList(List<Student> students) {
        // create response
        List<StudentResponseDto> response = new ArrayList<>();

        for (Student student : students) {
            response.add(getDto(student));
        }
        return response;
    }

    // get student by id
    public Student getStudent(Long studentId) {
        return studentRepository.findStudentById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    // get student by email
    public Student getStudentByEmail (String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found!"));
    }

    // get count of student of college
    public int getStudentCountByCollege (Long collegeId) {
        return studentRepository.countByCollege_Id(collegeId);
    }

    // generate password
    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    // register multiple students
    public MessageResponseDto processExcel(MultipartFile file, Long collegeId) {

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            // collect info from each row and register student
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skip header
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String email    = row.getCell(0).getStringCellValue().trim();
                String name     = row.getCell(1).getStringCellValue().trim();
                String ID       = row.getCell(2).getStringCellValue().trim();
                String gender   = row.getCell(3).getStringCellValue().trim();
                String dept     = row.getCell(4).getStringCellValue().trim();
                int year        = (int) row.getCell(5).getNumericCellValue();
                String password = generatePassword();

                StudentSignupRequestDto dto = new StudentSignupRequestDto();
                dto.setId(ID);
                dto.setEmail(email);
                dto.setFullName(name);
                dto.setGender(gender);
                dto.setDepartment(dept);
                dto.setYear(year);
                dto.setPassword(password);
                dto.setCollegeId(collegeId);

                // save in db
                boolean isSaved = studentAuth.createStudentAccount(dto);
                // send mail
                boolean mailSent = emailDispatcherService.sendStudentRegistrationMail(email, password);

                if (!isSaved || !mailSent) {
                    return new MessageResponseDto("Student registration failed for " + name);
                }
            }
            return new MessageResponseDto("All Students registered successfully!");
        }
        catch (IOException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // register single student
    public MessageResponseDto registerStudent(StudentRegisterRequestDto request, Long collegeId) {

        // generate password
        String password = generatePassword();

        StudentSignupRequestDto dto = new StudentSignupRequestDto();
        dto.setId(request.getId());
        dto.setEmail(request.getEmail());
        dto.setFullName(request.getFullName());
        dto.setPassword(password);
        dto.setGender(request.getGender());
        dto.setDepartment(request.getDepartment());
        dto.setYear(request.getYear());
        dto.setCollegeId(collegeId);

        // save in db
        boolean isSaved = studentAuth.createStudentAccount(dto);
        // send mail
        boolean mailSent = emailDispatcherService.sendStudentRegistrationMail(request.getEmail(), password);

        if (!isSaved || !mailSent) {
            return new MessageResponseDto("Student registration failed for " + request.getFullName());
        }
        return new MessageResponseDto("Student registered successfully!");
    }

    // get all students of college
    public List<StudentResponseDto> getAllStudents() {
        // find college-id
        Long collegeId = authService.getCurrentCollegeId();
        // find all students
        List<Student> students = studentRepository.findAllByCollege_Id(collegeId);

        return getDtoList(students);
    }
}
