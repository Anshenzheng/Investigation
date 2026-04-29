package com.wenji.survey.service;

import com.wenji.survey.dto.*;
import com.wenji.survey.entity.*;
import com.wenji.survey.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurveyResponseService {

    private final SurveyResponseRepository responseRepository;
    private final AnswerRepository answerRepository;
    private final SurveyRepository surveyRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final UserRepository userRepository;

    @Transactional
    public void submitSurvey(Long surveyId, SurveySubmitRequest request, Long userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("问卷不存在"));

        if (survey.getStatus() != Survey.Status.PUBLISHED) {
            throw new RuntimeException("问卷未发布或已关闭");
        }

        if (!survey.getIsAnonymous() && userId == null) {
            throw new RuntimeException("此问卷需要登录后才能填写");
        }

        if (userId != null && responseRepository.existsBySurveyIdAndUserId(surveyId, userId)) {
            throw new RuntimeException("您已经提交过此问卷");
        }

        List<Question> questions = questionRepository.findBySurveyIdWithOptions(surveyId);
        
        for (Question q : questions) {
            if (q.getRequired()) {
                AnswerSubmitRequest answer = request.getAnswers().stream()
                        .filter(a -> a.getQuestionId().equals(q.getId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("请回答题目: " + q.getText()));
                
                if (isAnswerEmpty(answer)) {
                    throw new RuntimeException("请回答题目: " + q.getText());
                }
            }
        }

        SurveyResponse response = new SurveyResponse();
        response.setSurvey(survey);
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            response.setUser(user);
        }
        response = responseRepository.save(response);

        for (AnswerSubmitRequest answerRequest : request.getAnswers()) {
            Question question = questionRepository.findById(answerRequest.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("题目不存在"));

            Answer answer = new Answer();
            answer.setResponse(response);
            answer.setQuestion(question);
            answer.setQuestionType(Question.QuestionType.valueOf(answerRequest.getQuestionType()));
            answer.setTextValue(answerRequest.getTextValue());
            
            if (answerRequest.getOptionId() != null) {
                QuestionOption option = optionRepository.findById(answerRequest.getOptionId()).orElse(null);
                answer.setOption(option);
            }
            
            if (answerRequest.getOptionIds() != null && !answerRequest.getOptionIds().isEmpty()) {
                answer.setOptionIds(answerRequest.getOptionIds().stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(",")));
            }
            
            answer.setRatingValue(answerRequest.getRatingValue());
            
            answerRepository.save(answer);
        }
    }

    private boolean isAnswerEmpty(AnswerSubmitRequest answer) {
        return switch (Question.QuestionType.valueOf(answer.getQuestionType())) {
            case SINGLE_CHOICE -> answer.getOptionId() == null;
            case MULTIPLE_CHOICE -> answer.getOptionIds() == null || answer.getOptionIds().isEmpty();
            case TEXT -> answer.getTextValue() == null || answer.getTextValue().trim().isEmpty();
            case RATING -> answer.getRatingValue() == null;
        };
    }

    public List<SurveyResponse> getResponsesByUser(Long userId) {
        return responseRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }

    public List<SurveyResponse> getResponsesBySurvey(Long surveyId) {
        return responseRepository.findBySurveyIdOrderBySubmittedAt(surveyId);
    }

    public long countResponsesBySurvey(Long surveyId) {
        return responseRepository.countBySurveyId(surveyId);
    }
}
