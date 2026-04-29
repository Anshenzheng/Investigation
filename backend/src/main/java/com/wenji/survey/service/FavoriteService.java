package com.wenji.survey.service;

import com.wenji.survey.dto.SurveySummaryDto;
import com.wenji.survey.entity.*;
import com.wenji.survey.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addFavorite(Long userId, Long surveyId) {
        if (favoriteRepository.existsByUserIdAndSurveyId(userId, surveyId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("问卷不存在"));

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setSurvey(survey);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long userId, Long surveyId) {
        favoriteRepository.deleteByUserIdAndSurveyId(userId, surveyId);
    }

    public List<SurveySummaryDto> getUserFavorites(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return favorites.stream()
                .map(f -> toSurveySummaryDto(f.getSurvey()))
                .collect(Collectors.toList());
    }

    public boolean isFavorite(Long userId, Long surveyId) {
        return favoriteRepository.existsByUserIdAndSurveyId(userId, surveyId);
    }

    private SurveySummaryDto toSurveySummaryDto(Survey survey) {
        String createdByName = "未知";
        try {
            User user = userRepository.findById(survey.getCreatedBy()).orElse(null);
            if (user != null) {
                createdByName = user.getUsername();
            }
        } catch (Exception ignored) {}

        long responseCount = surveyRepository.countResponsesBySurveyId(survey.getId());

        return new SurveySummaryDto(
                survey.getId(),
                survey.getTitle(),
                survey.getDescription(),
                survey.getStatus().name(),
                survey.getIsAnonymous(),
                survey.getDeadline(),
                survey.getIsTemplate(),
                responseCount,
                survey.getCreatedAt(),
                createdByName
        );
    }
}
