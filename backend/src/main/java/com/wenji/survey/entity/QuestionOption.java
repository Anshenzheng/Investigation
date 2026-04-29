package com.wenji.survey.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "question_options")
public class QuestionOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private String text;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
