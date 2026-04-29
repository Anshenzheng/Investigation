package com.wenji.survey.service;

import com.wenji.survey.dto.*;
import com.wenji.survey.entity.*;
import com.wenji.survey.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final UserRepository userRepository;
    private final SurveyResponseRepository responseRepository;

    public List<SurveySummaryDto> getPublicSurveys() {
        List<Survey> surveys = surveyRepository.findPublishedSurveys();
        return surveys.stream()
                .map(this::toSurveySummaryDto)
                .collect(Collectors.toList());
    }

    public List<SurveySummaryDto> getTemplates() {
        List<Survey> surveys = surveyRepository.findByIsTemplateTrueOrderByCreatedAtDesc();
        return surveys.stream()
                .map(this::toSurveySummaryDto)
                .collect(Collectors.toList());
    }

    public SurveyDto getSurveyById(Long id) {
        Survey survey = surveyRepository.findByIdWithQuestionsAndOptions(id);
        if (survey == null) {
            survey = surveyRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("问卷不存在"));
        }
        return toSurveyDto(survey);
    }

    public List<SurveySummaryDto> getAllSurveys() {
        List<Survey> surveys = surveyRepository.findAll();
        return surveys.stream()
                .map(this::toSurveySummaryDto)
                .collect(Collectors.toList());
    }

    public List<SurveySummaryDto> getSurveysByCreator(Long userId) {
        List<Survey> surveys = surveyRepository.findByCreatedByOrderByCreatedAtDesc(userId);
        return surveys.stream()
                .map(this::toSurveySummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SurveyDto createSurvey(SurveyCreateRequest request, Long creatorId) {
        Survey survey = new Survey();
        survey.setTitle(request.getTitle());
        survey.setDescription(request.getDescription());
        survey.setStatus(Survey.Status.DRAFT);
        survey.setIsAnonymous(request.getIsAnonymous());
        survey.setDeadline(request.getDeadline());
        survey.setIsTemplate(request.getIsTemplate() != null && request.getIsTemplate());
        survey.setCreatedBy(creatorId);

        survey = surveyRepository.save(survey);

        if (request.getQuestions() != null) {
            for (int i = 0; i < request.getQuestions().size(); i++) {
                QuestionCreateRequest qc = request.getQuestions().get(i);
                Question question = createQuestion(qc, survey, i);
                survey.getQuestions().add(question);
            }
        }

        return toSurveyDto(survey);
    }

    @Transactional
    public SurveyDto updateSurvey(Long id, SurveyCreateRequest request) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("问卷不存在"));

        survey.setTitle(request.getTitle());
        survey.setDescription(request.getDescription());
        survey.setIsAnonymous(request.getIsAnonymous());
        survey.setDeadline(request.getDeadline());
        survey.setIsTemplate(request.getIsTemplate() != null && request.getIsTemplate());

        survey.getQuestions().clear();
        if (request.getQuestions() != null) {
            for (int i = 0; i < request.getQuestions().size(); i++) {
                QuestionCreateRequest qc = request.getQuestions().get(i);
                Question question = createQuestion(qc, survey, i);
                survey.getQuestions().add(question);
            }
        }

        survey = surveyRepository.save(survey);
        return toSurveyDto(survey);
    }

    private Question createQuestion(QuestionCreateRequest request, Survey survey, int order) {
        Question question = new Question();
        question.setSurvey(survey);
        question.setText(request.getText());
        question.setType(Question.QuestionType.valueOf(request.getType()));
        question.setRequired(request.getRequired());
        question.setOrderIndex(order);

        question = questionRepository.save(question);

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            for (int i = 0; i < request.getOptions().size(); i++) {
                OptionCreateRequest oc = request.getOptions().get(i);
                QuestionOption option = new QuestionOption();
                option.setQuestion(question);
                option.setText(oc.getText());
                option.setOrderIndex(i);
                optionRepository.save(option);
                question.getOptions().add(option);
            }
        }

        return question;
    }

    @Transactional
    public void deleteSurvey(Long id) {
        surveyRepository.deleteById(id);
    }

    @Transactional
    public SurveyDto publishSurvey(Long id) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("问卷不存在"));
        
        if (survey.getQuestions().isEmpty()) {
            throw new RuntimeException("问卷至少需要一个题目才能发布");
        }
        
        survey.setStatus(Survey.Status.PUBLISHED);
        survey = surveyRepository.save(survey);
        return toSurveyDto(survey);
    }

    @Transactional
    public SurveyDto closeSurvey(Long id) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("问卷不存在"));
        
        survey.setStatus(Survey.Status.CLOSED);
        survey = surveyRepository.save(survey);
        return toSurveyDto(survey);
    }

    @Transactional
    public SurveyDto copySurvey(Long sourceId, String newTitle, Long creatorId) {
        Survey source = surveyRepository.findByIdWithQuestionsAndOptions(sourceId);
        if (source == null) {
            source = surveyRepository.findById(sourceId)
                    .orElseThrow(() -> new RuntimeException("源问卷不存在"));
        }

        Survey newSurvey = new Survey();
        newSurvey.setTitle(newTitle);
        newSurvey.setDescription(source.getDescription());
        newSurvey.setStatus(Survey.Status.DRAFT);
        newSurvey.setIsAnonymous(source.getIsAnonymous());
        newSurvey.setDeadline(source.getDeadline());
        newSurvey.setIsTemplate(false);
        newSurvey.setCreatedBy(creatorId);

        newSurvey = surveyRepository.save(newSurvey);

        for (Question sourceQuestion : source.getQuestions()) {
            Question newQuestion = new Question();
            newQuestion.setSurvey(newSurvey);
            newQuestion.setText(sourceQuestion.getText());
            newQuestion.setType(sourceQuestion.getType());
            newQuestion.setRequired(sourceQuestion.getRequired());
            newQuestion.setOrderIndex(sourceQuestion.getOrderIndex());
            newQuestion = questionRepository.save(newQuestion);

            for (QuestionOption sourceOption : sourceQuestion.getOptions()) {
                QuestionOption newOption = new QuestionOption();
                newOption.setQuestion(newQuestion);
                newOption.setText(sourceOption.getText());
                newOption.setOrderIndex(sourceOption.getOrderIndex());
                optionRepository.save(newOption);
            }
        }

        return toSurveyDto(newSurvey);
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

    private SurveyDto toSurveyDto(Survey survey) {
        List<QuestionDto> questionDtos = survey.getQuestions().stream()
                .map(this::toQuestionDto)
                .collect(Collectors.toList());

        String createdByName = "未知";
        try {
            User user = userRepository.findById(survey.getCreatedBy()).orElse(null);
            if (user != null) {
                createdByName = user.getUsername();
            }
        } catch (Exception ignored) {}

        long responseCount = surveyRepository.countResponsesBySurveyId(survey.getId());

        return new SurveyDto(
                survey.getId(),
                survey.getTitle(),
                survey.getDescription(),
                survey.getStatus().name(),
                survey.getIsAnonymous(),
                survey.getDeadline(),
                survey.getIsTemplate(),
                responseCount,
                survey.getCreatedAt(),
                survey.getUpdatedAt(),
                survey.getCreatedBy(),
                createdByName,
                questionDtos
        );
    }

    private QuestionDto toQuestionDto(Question question) {
        List<QuestionOptionDto> optionDtos = question.getOptions().stream()
                .map(opt -> new QuestionOptionDto(opt.getId(), opt.getText(), opt.getOrderIndex()))
                .collect(Collectors.toList());

        return new QuestionDto(
                question.getId(),
                question.getText(),
                question.getType().name(),
                question.getRequired(),
                question.getOrderIndex(),
                optionDtos
        );
    }
}
