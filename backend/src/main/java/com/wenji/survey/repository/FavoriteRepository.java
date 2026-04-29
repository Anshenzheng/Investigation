package com.wenji.survey.repository;

import com.wenji.survey.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<Favorite> findByUserIdAndSurveyId(Long userId, Long surveyId);
    
    boolean existsByUserIdAndSurveyId(Long userId, Long surveyId);
    
    void deleteByUserIdAndSurveyId(Long userId, Long surveyId);
    
    @Query("SELECT f.survey.id FROM Favorite f WHERE f.user.id = :userId")
    List<Long> findSurveyIdsByUserId(@Param("userId") Long userId);
}
