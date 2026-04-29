package com.wenji.survey.service;

import com.wenji.survey.entity.*;
import com.wenji.survey.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final SurveyRepository surveyRepository;
    private final QuestionRepository questionRepository;
    private final SurveyResponseRepository responseRepository;

    public byte[] exportToCsv(Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("问卷不存在"));

        List<Question> questions = questionRepository.findBySurveyIdWithOptions(surveyId);
        List<SurveyResponse> responses = responseRepository.findBySurveyIdOrderBySubmittedAt(surveyId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(buildHeaders(questions)))) {

            writer.write('\uFEFF');
            writer.flush();

            for (SurveyResponse response : responses) {
                List<String> row = new ArrayList<>();
                row.add(response.getId().toString());
                row.add(response.getSubmittedAt().toString());
                row.add(response.getUser() != null ? response.getUser().getUsername() : "匿名");

                for (Question question : questions) {
                    String answerText = getAnswerText(response, question);
                    row.add(answerText);
                }

                csvPrinter.printRecord(row);
            }

            csvPrinter.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("导出CSV失败", e);
        }
    }

    public byte[] exportToExcel(Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("问卷不存在"));

        List<Question> questions = questionRepository.findBySurveyIdWithOptions(surveyId);
        List<SurveyResponse> responses = responseRepository.findBySurveyIdOrderBySubmittedAt(surveyId);

        StringBuilder sb = new StringBuilder();
        
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<?mso-application progid=\"Excel.Sheet\"?>\n");
        sb.append("<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\" xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\">\n");
        sb.append("  <Worksheet ss:Name=\"结果数据\">\n");
        sb.append("    <Table>\n");

        sb.append("      <Row>\n");
        sb.append("        <Cell><Data ss:Type=\"String\">回复ID</Data></Cell>\n");
        sb.append("        <Cell><Data ss:Type=\"String\">提交时间</Data></Cell>\n");
        sb.append("        <Cell><Data ss:Type=\"String\">用户</Data></Cell>\n");
        for (Question q : questions) {
            sb.append("        <Cell><Data ss:Type=\"String\">").append(escapeXml(q.getText())).append("</Data></Cell>\n");
        }
        sb.append("      </Row>\n");

        for (SurveyResponse response : responses) {
            sb.append("      <Row>\n");
            sb.append("        <Cell><Data ss:Type=\"Number\">").append(response.getId()).append("</Data></Cell>\n");
            sb.append("        <Cell><Data ss:Type=\"String\">").append(response.getSubmittedAt()).append("</Data></Cell>\n");
            sb.append("        <Cell><Data ss:Type=\"String\">").append(response.getUser() != null ? response.getUser().getUsername() : "匿名").append("</Data></Cell>\n");
            
            for (Question question : questions) {
                String answerText = getAnswerText(response, question);
                sb.append("        <Cell><Data ss:Type=\"String\">").append(escapeXml(answerText)).append("</Data></Cell>\n");
            }
            
            sb.append("      </Row>\n");
        }

        sb.append("    </Table>\n");
        sb.append("  </Worksheet>\n");
        sb.append("</Workbook>\n");

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String[] buildHeaders(List<Question> questions) {
        List<String> headers = new ArrayList<>();
        headers.add("回复ID");
        headers.add("提交时间");
        headers.add("用户");
        for (Question q : questions) {
            headers.add(q.getText());
        }
        return headers.toArray(new String[0]);
    }

    private String getAnswerText(SurveyResponse response, Question question) {
        for (Answer answer : response.getAnswers()) {
            if (answer.getQuestion().getId().equals(question.getId())) {
                switch (question.getType()) {
                    case SINGLE_CHOICE:
                        if (answer.getOption() != null) {
                            return answer.getOption().getText();
                        }
                        return "";
                    case MULTIPLE_CHOICE:
                        if (answer.getOptionIds() != null && !answer.getOptionIds().isEmpty()) {
                            List<String> optionTexts = new ArrayList<>();
                            String[] optionIds = answer.getOptionIds().split(",");
                            for (String optId : optionIds) {
                                for (QuestionOption opt : question.getOptions()) {
                                    if (opt.getId().toString().equals(optId.trim())) {
                                        optionTexts.add(opt.getText());
                                        break;
                                    }
                                }
                            }
                            return String.join("; ", optionTexts);
                        }
                        return "";
                    case TEXT:
                        return answer.getTextValue() != null ? answer.getTextValue() : "";
                    case RATING:
                        return answer.getRatingValue() != null ? answer.getRatingValue() + "分" : "";
                }
            }
        }
        return "";
    }

    private String escapeXml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
