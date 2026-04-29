package com.wenji.survey.repository;

import com.wenji.survey.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    
    List<Answer> findByResponseId(Long responseId);
    
    List<Answer> findByQuestionId(Long questionId);
    
    @Query("SELECT a FROM Answer a WHERE a.response.survey.id = :surveyId")
    List<Answer> findBySurveyId(@Param("surveyId") Long surveyId);
    
    @Query("SELECT COUNT(a) FROM Answer a WHERE a.question.id = :questionId AND a.option.id = :optionId")
    long countByQuestionIdAndOptionId(@Param("questionId") Long questionId, @Param("optionId") Long optionId);
    
    @Query("SELECT COUNT(a) FROM Answer a WHERE a.question.id = :questionId AND a.ratingValue = :rating")
    long countByQuestionIdAndRatingValue(@Param("questionId") Long questionId, @Param("rating") Integer rating);
}
