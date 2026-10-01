package com.ats.model;

import jakarta.persistence.*;

@Entity
@Table(name="evaluations")
public class Evaluation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional=false) private Application application;
    private String interviewer;
    private Integer score;
    private String strengths;
    private String weaknesses;
    private String recommendation;

    public Evaluation(){}
    public Long getId(){return id;}
    public Application getApplication(){return application;}
    public void setApplication(Application v){application=v;}
    public String getInterviewer(){return interviewer;}
    public void setInterviewer(String v){interviewer=v;}
    public Integer getScore(){return score;}
    public void setScore(Integer v){score=v;}
    public String getStrengths(){return strengths;}
    public void setStrengths(String v){strengths=v;}
    public String getWeaknesses(){return weaknesses;}
    public void setWeaknesses(String v){weaknesses=v;}
    public String getRecommendation(){return recommendation;}
    public void setRecommendation(String v){recommendation=v;}
}
