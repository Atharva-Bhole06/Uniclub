package com.uniclub.backend.controller;

import com.uniclub.backend.dto.ApiResponse;
import com.uniclub.backend.entity.AttendanceSession;
import com.uniclub.backend.entity.AttendanceSubmission;
import com.uniclub.backend.service.AttendanceService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/generate/{eventId}")
    public ResponseEntity<ApiResponse<AttendanceSession>> generateQR(
            @PathVariable Long eventId,
            @RequestBody GenerateQRRequest req) {
        try {
            AttendanceSession session = attendanceService.generateQR(eventId, req.getCustomFields());
            return ResponseEntity.ok(ApiResponse.ok("QR Generated successfully", session));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<AttendanceSession>> getSession(@PathVariable String sessionId) {
        try {
            AttendanceSession session = attendanceService.getSession(sessionId);
            return ResponseEntity.ok(ApiResponse.ok("Session fetched", session));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<ApiResponse<AttendanceSubmission>> submitAttendance(
            @PathVariable String sessionId,
            @RequestBody SubmitAttendanceRequest req) {
        try {
            // req.getStudentId() would ideally come from token, but for now we take it from body request or parameter
            AttendanceSubmission submission = attendanceService.submitAttendance(sessionId, req.getStudentId(), req.getResponses(), req.getRollNo(), req.getDivision());
            return ResponseEntity.ok(ApiResponse.ok("Attendance recorded", submission));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse<List<AttendanceSubmission>>> getAttendanceByEvent(@PathVariable Long eventId) {
        try {
            List<AttendanceSubmission> submissions = attendanceService.getSubmissionsByEvent(eventId);
            return ResponseEntity.ok(ApiResponse.ok("Attendance fetched", submissions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // DTOs
    @Data
    public static class GenerateQRRequest {
        private List<String> customFields;
    }

    @Data
    public static class SubmitAttendanceRequest {
        private Integer studentId;
        private Map<String, String> responses;
        private String rollNo;
        private String division;
    }
}
