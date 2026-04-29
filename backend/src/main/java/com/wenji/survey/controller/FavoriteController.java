package com.wenji.survey.controller;

import com.wenji.survey.dto.SurveySummaryDto;
import com.wenji.survey.security.JwtService;
import com.wenji.survey.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<SurveySummaryDto>> getFavorites(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        List<SurveySummaryDto> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(favorites);
    }

    @PostMapping
    public ResponseEntity<Void> addFavorite(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Long> request) {
        Long userId = extractUserId(authHeader);
        Long surveyId = request.get("surveyId");
        favoriteService.addFavorite(userId, surveyId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{surveyId}")
    public ResponseEntity<Void> removeFavorite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long surveyId) {
        Long userId = extractUserId(authHeader);
        favoriteService.removeFavorite(userId, surveyId);
        return ResponseEntity.ok().build();
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}
