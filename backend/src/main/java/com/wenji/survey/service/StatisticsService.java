package com.wenji.survey.service;

import com.wenji.survey.dto.QuestionStatisticsDto;
import com.wenji.survey.dto.SurveyStatisticsDto;
import com.wenji.survey.entity.*;
import com.wenji.survey.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final SurveyRepository surveyRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    public SurveyStatisticsDto getSurveyStatistics(Long surveyId) {
        Survey survey = surveyRepository.findByIdWithQuestionsAndOptions(surveyId);
        if (survey == null) {
            survey = surveyRepository.findById(surveyId)
                    .orElseThrow(() -> new RuntimeException("问卷不存在"));
        }

        List<Question> questions = survey.getQuestions();
        if (questions.isEmpty()) {
            questions = questionRepository.findBySurveyIdWithOptions(surveyId);
        }

        long totalResponses = answerRepository.findBySurveyId(surveyId).stream()
                .map(a -> a.getResponse().getId())
                .distinct()
                .count();

        List<QuestionStatisticsDto> questionStats = questions.stream()
                .map(q -> calculateQuestionStatistics(q))
                .collect(Collectors.toList());

        return new SurveyStatisticsDto(totalResponses, questionStats);
    }

    private QuestionStatisticsDto calculateQuestionStatistics(Question question) {
        QuestionStatisticsDto dto = new QuestionStatisticsDto();
        dto.setQuestionId(question.getId());
        dto.setQuestionText(question.getText());
        dto.setQuestionType(question.getType().name());

        List<Answer> answers = answerRepository.findByQuestionId(question.getId());

        switch (question.getType()) {
            case SINGLE_CHOICE:
                dto.setOptionCounts(calculateOptionCounts(question, answers));
                break;
            case MULTIPLE_CHOICE:
                dto.setOptionCounts(calculateMultiOptionCounts(question, answers));
                break;
            case TEXT:
                dto.setTextAnswers(answers.stream()
                        .map(Answer::getTextValue)
                        .filter(v -> v != null && !v.trim().isEmpty())
                        .collect(Collectors.toList()));
                break;
            case RATING:
                Map<Integer, Long> ratingDist = new LinkedHashMap<>();
                for (int i = 1; i <= 5; i++) {
                    ratingDist.put(i, answerRepository.countByQuestionIdAndRatingValue(question.getId(), i));
                }
                dto.setRatingDistribution(ratingDist);
                
                double total = answers.stream()
                        .filter(a -> a.getRatingValue() != null)
                        .mapToLong(Answer::getRatingValue)
                        .sum();
                long count = answers.stream()
                        .filter(a -> a.getRatingValue() != null)
                        .count();
                dto.setRatingAverage(count > 0 ? total / (double) count : null);
                break;
        }

        return dto;
    }

    private Map<Long, Long> calculateOptionCounts(Question question, List<Answer> answers) {
        Map<Long, Long> counts = new LinkedHashMap<>();
        
        for (QuestionOption option : question.getOptions()) {
            counts.put(option.getId(), answerRepository.countByQuestionIdAndOptionId(question.getId(), option.getId()));
        }
        
        return counts;
    }

    private Map<Long, Long> calculateMultiOptionCounts(Question question, List<Answer> answers) {
        Map<Long, Long> counts = new LinkedHashMap<>();
        
        for (QuestionOption option : question.getOptions()) {
            counts.put(option.getId(), 0L);
        }
        
        for (Answer answer : answers) {
            if (answer.getOptionIds() != null && !answer.getOptionIds().isEmpty()) {
                String[] optionIds = answer.getOptionIds().split(",");
                for (String optId : optionIds) {
                    try {
                        Long id = Long.parseLong(optId.trim());
                        counts.compute(id, (k, v) -> v == null ? 1 : v + 1);
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        
        return counts;
    }
}
