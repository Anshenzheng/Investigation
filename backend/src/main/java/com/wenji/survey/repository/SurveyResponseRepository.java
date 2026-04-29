package com.wenji.survey.repository;

import com.wenji.survey.entity.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {
    
    List<SurveyResponse> findByUserIdOrderBySubmittedAtDesc(Long userId);
    
    List<SurveyResponse> findBySurveyIdOrderBySubmittedAt(Long surveyId);
    
    @Query("SELECT COUNT(sr) FROM SurveyResponse sr WHERE sr.survey.id = :surveyId")
    long countBySurveyId(@Param("surveyId") Long surveyId);
    
    @Query("SELECT COUNT(sr) > 0 FROM SurveyResponse sr WHERE sr.survey.id = :surveyId AND sr.user.id = :userId")
    boolean existsBySurveyIdAndUserId(@Param("surveyId") Long surveyId, @Param("userId") Long userId);
}
