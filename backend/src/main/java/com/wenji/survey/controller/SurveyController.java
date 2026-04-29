package com.wenji.survey.controller;

import com.wenji.survey.dto.*;
import com.wenji.survey.security.JwtService;
import com.wenji.survey.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;
    private final SurveyResponseService responseService;
    private final FavoriteService favoriteService;
    private final JwtService jwtService;

    @GetMapping("/public")
    public ResponseEntity<List<SurveySummaryDto>> getPublicSurveys() {
        List<SurveySummaryDto> surveys = surveyService.getPublicSurveys();
        return ResponseEntity.ok(surveys);
    }

    @GetMapping("/templates")
    public ResponseEntity<List<SurveySummaryDto>> getTemplates() {
        List<SurveySummaryDto> templates = surveyService.getTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SurveyDto> getSurvey(@PathVariable Long id) {
        SurveyDto survey = surveyService.getSurveyById(id);
        return ResponseEntity.ok(survey);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Void> submitSurvey(
            @PathVariable Long id,
            @Valid @RequestBody SurveySubmitRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Long userId = extractUserId(authHeader);
        responseService.submitSurvey(id, request, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/thankyou")
    public ResponseEntity<String> thankyouPage(@PathVariable Long id) {
        return ResponseEntity.ok("感谢您的参与！");
    }

    private Long extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                return jwtService.extractUserId(token);
            } catch (Exception ignored) {}
        }
        return null;
    }
}
