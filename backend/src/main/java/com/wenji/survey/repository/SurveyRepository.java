package com.wenji.survey.repository;

import com.wenji.survey.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {
    
    @Query("SELECT s FROM Survey s LEFT JOIN FETCH s.questions q LEFT JOIN FETCH q.options WHERE s.id = :id")
    Survey findByIdWithQuestionsAndOptions(@Param("id") Long id);
    
    List<Survey> findByStatusOrderByCreatedAtDesc(Survey.Status status);
    
    List<Survey> findByIsTemplateTrueOrderByCreatedAtDesc();
    
    @Query("SELECT s FROM Survey s WHERE s.status = 'PUBLISHED' AND s.isTemplate = false ORDER BY s.createdAt DESC")
    List<Survey> findPublishedSurveys();
    
    @Query("SELECT COUNT(sr) FROM SurveyResponse sr WHERE sr.survey.id = :surveyId")
    long countResponsesBySurveyId(@Param("surveyId") Long surveyId);
    
    List<Survey> findByCreatedByOrderByCreatedAtDesc(Long createdBy);
}
