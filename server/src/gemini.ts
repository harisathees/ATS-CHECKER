import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// ── Types ──────────────────────────────────────────────────────────────
export interface ResumeData {
  document_type: string;
  is_resume?: boolean;
  message?: string;
  header?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  sections?: {
    summary?: string;
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
      achievements: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      gpa?: string;
    }>;
    skills: {
      technical: string[];
      soft: string[];
      languages?: string[];
    };
    certifications?: Array<{
      name: string;
      issuer: string;
      year: string;
    }>;
    projects?: Array<{
      name: string;
      description: string;
      technologies: string[];
      link?: string;
    }>;
  };
  ats_analysis?: {
    score: number;
    formatting_score: number;
    keywords_score: number;
    impact_score: number;
    skills_alignment_score: number;
    issues: string[];
    recommendations: string[];
    keyword_matches: string[];
    missing_keywords: string[];
  };
  industry?: string;
  pro_suggestions?: {
    categories: Array<{
      category: string;
      priority: "Critical" | "High" | "Medium" | "Low";
      suggestions: string[];
      impact: string;
    }>;
    summary: {
      total_categories: number;
      total_suggestions: number;
      potential_score_increase: number;
    };
  };
  improved_resume?: string;
}

export interface ScoreBreakdown {
  overall_score: number;
  formatting: number;
  keywords: number;
  impact: number;
  skills_alignment: number;
}

// ── Resume Parsing ─────────────────────────────────────────────────────
export async function parseResume(
  base64Data: string,
  fileType: string,
  industry?: string
): Promise<ResumeData> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const industryContext = industry
    ? `The target industry is "${industry}". Adjust scoring, keyword analysis, and suggestions to be specific to this industry.`
    : `Detect the most likely target industry from the resume content (e.g. Software Engineering, Cybersecurity, Data Science, Finance, Marketing, Healthcare, etc.) and include it in your response.`;

  const prompt = `
    FIRST: Determine if this document is actually a resume or CV. Look for:
    - Personal contact information (name, email, phone)
    - Work experience or employment history
    - Education background
    - Skills or qualifications
    - Professional summary or objective
    
    If this is NOT a resume/CV, return:
    {
      "document_type": "not_resume",
      "is_resume": false,
      "message": "This document does not appear to be a resume or CV. Please upload a resume document for analysis."
    }

    If this IS a resume/CV, analyze it comprehensively. ${industryContext}

    Return JSON with this exact structure:
    {
      "document_type": "resume",
      "is_resume": true,
      "industry": "detected or specified industry",
      "header": {
        "name": "Full Name",
        "email": "email@example.com",
        "phone": "phone number",
        "location": "city, state",
        "linkedin": "linkedin url if present",
        "website": "personal website if present"
      },
      "sections": {
        "summary": "professional summary if present",
        "experience": [
          {
            "title": "Job Title",
            "company": "Company Name",
            "duration": "Start - End",
            "description": "Job description",
            "achievements": ["achievement 1", "achievement 2"]
          }
        ],
        "education": [
          {
            "degree": "Degree Name",
            "institution": "Institution Name",
            "year": "Graduation Year",
            "gpa": "GPA if mentioned"
          }
        ],
        "skills": {
          "technical": ["skill1", "skill2"],
          "soft": ["soft skill1", "soft skill2"],
          "languages": ["language1", "language2"]
        },
        "certifications": [
          {
            "name": "Certification Name",
            "issuer": "Issuing Organization",
            "year": "Year obtained"
          }
        ],
        "projects": [
          {
            "name": "Project Name",
            "description": "Project description",
            "technologies": ["tech1", "tech2"],
            "link": "project link if any"
          }
        ]
      },
      "ats_analysis": {
        "score": 78,
        "formatting_score": 85,
        "keywords_score": 70,
        "impact_score": 65,
        "skills_alignment_score": 80,
        "issues": ["issue1", "issue2"],
        "recommendations": ["rec1", "rec2"],
        "keyword_matches": ["keyword1", "keyword2"],
        "missing_keywords": ["missing1", "missing2"]
      },
      "pro_suggestions": {
        "categories": [
          {
            "category": "Category Name",
            "priority": "High",
            "suggestions": ["suggestion1", "suggestion2"],
            "impact": "Impact description"
          }
        ],
        "summary": {
          "total_categories": 6,
          "total_suggestions": 24,
          "potential_score_increase": 25
        }
      }
    }

    SCORING GUIDELINES:
    - overall score (0-100): weighted average of sub-scores
    - formatting_score (0-100): ATS-friendly formatting, section structure, font usage, consistency
    - keywords_score (0-100): industry-relevant keywords density and placement
    - impact_score (0-100): action verbs, quantifiable achievements, metrics
    - skills_alignment_score (0-100): skills match with industry standards

    DATE VALIDATION:
    - Current date is ${currentYear}-${String(currentMonth).padStart(2, "0")}
    - "Present" or "Current" in dates is valid
    - Only flag dates clearly beyond the current date as issues

    Provide at least 5-6 pro_suggestions categories with 3-4 suggestions each.
  `;

  const contents = [
    { text: prompt },
    {
      inlineData: {
        mimeType:
          fileType === "application/pdf" ? "application/pdf" : "image/jpeg",
        data: base64Data,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });

  const responseText = response.text || "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse Gemini response");
}

// ── Resume Rewriting ───────────────────────────────────────────────────
export async function rewriteResume(
  resumeData: ResumeData,
  industry?: string
): Promise<string> {
  const prompt = `
    You are a professional resume writer and ATS optimization expert.
    
    Given this resume data:
    ${JSON.stringify(resumeData, null, 2)}
    
    ${industry ? `Target industry: ${industry}` : ""}
    
    Rewrite this resume to be ATS-optimized. Rules:
    - Use strong action verbs (Led, Developed, Implemented, Designed, Optimized)
    - Add quantifiable metrics where possible
    - Remove fluff and generic statements
    - Optimize keyword placement for ATS systems
    - Maintain professional tone
    - Keep it concise (1-2 pages worth of content)
    - Use standard section headings that ATS systems recognize
    
    Return the improved resume as a well-formatted text document (not JSON).
    Use clear section headings with === underlines.
    Use bullet points with - for list items.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: prompt }],
  });

  return response.text || "Unable to generate improved resume.";
}

// ── Job Matching ───────────────────────────────────────────────────────
export async function matchJob(
  resumeData: ResumeData,
  jobDescription: string
): Promise<{
  match_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  analysis: {
    strengths: string[];
    gaps: string[];
    recommendations: string[];
    overall_fit: string;
  };
}> {
  const prompt = `
    You are an expert ATS system and recruiter.
    
    Compare this resume against the job description and provide a detailed match analysis.
    
    RESUME DATA:
    ${JSON.stringify(resumeData, null, 2)}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    Return a JSON object with this exact structure:
    {
      "match_score": 75,
      "matched_keywords": ["keyword1", "keyword2"],
      "missing_keywords": ["missing1", "missing2"],
      "analysis": {
        "strengths": ["strength1", "strength2"],
        "gaps": ["gap1", "gap2"],
        "recommendations": ["rec1", "rec2"],
        "overall_fit": "A brief assessment of overall fit for this role"
      }
    }
    
    Scoring: 0-100 based on skill match, experience alignment, keyword overlap, and qualification fit.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: prompt }],
  });

  const responseText = response.text || "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse job match response");
}

// ── AI Chat ────────────────────────────────────────────────────────────
export async function chat(
  message: string,
  resumeData: ResumeData | null,
  chatHistory: Array<{ role: string; message: string }>
): Promise<string> {
  const resumeContext = resumeData
    ? `
    The user has uploaded a resume. Here is their resume data for context:
    ${JSON.stringify(resumeData, null, 2)}
    
    Use this resume data to provide personalized, actionable advice.
    `
    : "The user has not uploaded a resume yet. Provide general career and resume advice.";

  const historyContext =
    chatHistory.length > 0
      ? `Previous conversation:\n${chatHistory
        .slice(-10)
        .map((m) => `${m.role}: ${m.message}`)
        .join("\n")}`
      : "";

  const prompt = `
    You are an AI Career Coach and Resume Expert embedded in an ATS Resume Checkerligence System.
    
    ${resumeContext}
    ${historyContext}
    
    User's message: "${message}"
    
    Rules:
    - Be professional, insightful, and actionable
    - NO generic advice - be specific to their resume and situation
    - If they ask about improving their resume, reference specific sections from their data
    - If they ask about skills, compare against industry standards
    - If they ask about job readiness, assess based on their experience and skills
    - Keep responses concise but comprehensive (2-4 paragraphs max)
    - Use bullet points for lists
    - If the user asks you to rewrite something, provide the improved version directly
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: prompt }],
  });

  return response.text || "I apologize, I was unable to generate a response. Please try again.";
}
