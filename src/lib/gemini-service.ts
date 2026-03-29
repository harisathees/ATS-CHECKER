import { GoogleGenAI } from "@google/genai";

export interface ResumeData {
  document_type: string;
  is_resume?: boolean;
  message?: string;
  industry?: string;
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
  };
  ats_analysis?: {
    score: number;
    formatting_score?: number;
    keywords_score?: number;
    impact_score?: number;
    skills_alignment_score?: number;
    issues: string[];
    recommendations: string[];
    keyword_matches: string[];
    missing_keywords: string[];
  };
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
}

export interface ATSAnalysisResult {
  success: boolean;
  data?: ResumeData;
  error?: string;
  raw_text?: string;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async processResumeWithGemini(
    base64Data: string,
    fileType: string,
    fileName: string
  ): Promise<ATSAnalysisResult> {
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11

      const prompt = `
        FIRST: Determine if this document is actually a resume or CV. Look for:
        - Personal contact information (name, email, phone)
        - Work experience or employment history
        - Education background
        - Skills or qualifications
        - Professional summary or objective
        
        If this is NOT a resume/CV (e.g., it's a letter, invoice, article, etc.), return:
        {
          "document_type": "not_resume",
          "is_resume": false,
          "message": "This document does not appear to be a resume or CV. Please upload a resume document for analysis."
        }

        If this IS a resume/CV, analyze it and extract information in the following structured format:

        RESUME ANALYSIS:
        Extract all sections and provide ATS compatibility analysis.

        Return the data in JSON format with this structure:
        {
          "document_type": "resume",
          "is_resume": true,
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
                "duration": "Duration (e.g., 2020-2022)",
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
            ]
          },
          "ats_analysis": {
            "score": 85,
            "issues": ["issue1", "issue2"],
            "recommendations": ["recommendation1", "recommendation2"],
            "keyword_matches": ["keyword1", "keyword2"],
            "missing_keywords": ["missing1", "missing2"]
          },
          "pro_suggestions": {
            "categories": [
              {
                "category": "Header Optimization",
                "priority": "High",
                "suggestions": [
                  "Move contact information to the very top of the resume",
                  "Use a professional email format (firstname.lastname@email.com)",
                  "Include a professional LinkedIn URL",
                  "Add a location that matches job requirements"
                ],
                "impact": "Improves ATS parsing by 25%"
              },
              {
                "category": "Experience Section",
                "priority": "High",
                "suggestions": [
                  "Use action verbs at the beginning of each bullet point",
                  "Include quantifiable achievements with numbers and percentages",
                  "Add industry-specific keywords naturally",
                  "Keep bullet points to 1-2 lines maximum"
                ],
                "impact": "Increases keyword matching by 40%"
              },
              {
                "category": "Skills Section",
                "priority": "Medium",
                "suggestions": [
                  "Create separate sections for technical and soft skills",
                  "Include proficiency levels (Beginner, Intermediate, Expert)",
                  "Add emerging technologies relevant to your field",
                  "Use industry-standard skill names"
                ],
                "impact": "Boosts skill recognition by 30%"
              },
              {
                "category": "Education & Certifications",
                "priority": "Medium",
                "suggestions": [
                  "Add graduation dates in MM/YYYY format",
                  "Include relevant certifications with expiration dates",
                  "List education in reverse chronological order",
                  "Add GPA if above 3.5"
                ],
                "impact": "Enhances qualification matching by 20%"
              },
              {
                "category": "Formatting & Structure",
                "priority": "High",
                "suggestions": [
                  "Use standard fonts (Arial, Calibri, Times New Roman)",
                  "Remove graphics, tables, and complex formatting",
                  "Use simple bullet points instead of custom symbols",
                  "Ensure consistent date formatting throughout"
                ],
                "impact": "Improves parsing accuracy by 35%"
              },
              {
                "category": "Keyword Optimization",
                "priority": "Critical",
                "suggestions": [
                  "Add missing industry keywords identified in analysis",
                  "Include job title variations",
                  "Add technology stack keywords",
                  "Include soft skills that match job requirements"
                ],
                "impact": "Increases ATS score by 15-25 points"
              }
            ],
            "summary": {
              "total_categories": 6,
              "total_suggestions": 24,
              "potential_score_increase": 25
            }
          }
        }

        IMPORTANT DATE VALIDATION RULES:
        - Current date is ${currentYear}-${currentMonth
          .toString()
          .padStart(2, "0")}
        - "Present" or "Current" in dates is valid and should not be flagged as future
        - "Dec 2024 to present" is valid if we're in 2024
        - Only flag dates as future if they are clearly beyond the current date
        - Consider month abbreviations (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)

        ATS Analysis Guidelines:
        - Score: 0-100 based on ATS compatibility
        - Issues: List specific problems found, but be careful with date validation
        - Recommendations: Provide actionable improvement suggestions
        - Keywords: Extract relevant technical and industry keywords
        - Missing keywords: Suggest important keywords that could be added

        Pro Suggestions Guidelines:
        - Only provide if document is confirmed to be a resume/CV
        - Analyze the resume and provide specific, actionable suggestions for each category
        - Prioritize suggestions based on their impact on ATS compatibility
        - Focus on practical, implementable changes
        - Consider industry best practices and current ATS requirements
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

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });

      const responseText = response.text || "";
      let structuredData: ResumeData;
      try {
        // Try to parse JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structuredData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No valid JSON found");
        }
      } catch (parseError) {
        // Fallback parsing with default pro suggestions
        structuredData = {
          document_type: "resume",
          is_resume: true,
          header: {
            name: "Extracted from document",
            email: "",
            phone: "",
            location: "",
          },
          sections: {
            experience: [],
            education: [],
            skills: {
              technical: [],
              soft: [],
            },
          },
          ats_analysis: {
            score: 50,
            issues: ["Unable to parse structured data"],
            recommendations: ["Please check the document format"],
            keyword_matches: [],
            missing_keywords: [],
          },
          pro_suggestions: {
            categories: [
              {
                category: "Header Optimization",
                priority: "High",
                suggestions: [
                  "Move contact information to the very top of the resume",
                  "Use a professional email format",
                  "Include a professional LinkedIn URL",
                ],
                impact: "Improves ATS parsing by 25%",
              },
              {
                category: "Experience Section",
                priority: "High",
                suggestions: [
                  "Use action verbs at the beginning of each bullet point",
                  "Include quantifiable achievements",
                  "Add industry-specific keywords naturally",
                ],
                impact: "Increases keyword matching by 40%",
              },
            ],
            summary: {
              total_categories: 2,
              total_suggestions: 6,
              potential_score_increase: 15,
            },
          },
        };
      }

      return {
        success: true,
        data: structuredData,
        raw_text: responseText,
      };
    } catch (error) {
      console.error("Error processing resume:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        raw_text: "",
      };
    }
  }

  async analyzeATSCompatibility(
    resumeData: ResumeData,
    jobKeywords: string[] = []
  ): Promise<ATSAnalysisResult> {
    try {
      const prompt = `
        You are an expert in Applicant Tracking Systems (ATS) and resume parsing.
        
        Your task is to analyze the given resume or CV data for ATS compatibility and provide a detailed evaluation.
        
        ====================
        Resume Data:
        ${JSON.stringify(resumeData, null, 2)}
        ====================
        
        Job Description Keywords (if provided): ${jobKeywords.join(", ")}
        
        Please perform a comprehensive analysis and return the following in JSON format under a key called "ats_analysis":
        
        1. **ATS Compatibility Score** (0-100): A numeric score based on how well the resume follows ATS best practices (formatting, structure, keyword usage, section naming, etc.).
        
        2. **Structural Completeness Check**:
           - Confirm presence of key sections:
             - Contact Information
             - Professional Summary or Objective
             - Work Experience
             - Skills
             - Education
             - Certifications (if available)
           - Note if any major section is missing.
        
        3. **Formatting Issues** (if any):
           - Usage of tables, columns, graphics, images, or non-standard fonts
           - File type concerns (PDF vs DOCX)
           - Unscannable content (e.g., in headers/footers)
        
        4. **Keyword Matching Analysis**:
           - Highlight which job-related keywords are present
           - Identify important missing keywords
           - Provide a match percentage based on provided job keywords
        
        5. **Detected Issues**:
           - List all potential ATS-blocking or ATS-confusing elements
        
        6. **Actionable Recommendations**:
           - Give specific and practical suggestions to improve ATS compatibility
           - Tailor suggestions based on detected formatting or content issues
           - Highlight enhancements in keyword optimization
        
        7. **Summary Verdict**:
           - Clear final judgment: "ATS-Friendly", "Moderately ATS-Compatible", or "Not ATS-Compatible"
           - Brief reasoning based on the overall analysis
        
        Make sure your analysis is accurate, concise, and informative. Return only the JSON with the "ats_analysis" section updated accordingly.
        `;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: prompt }],
      });

      console.log("Response: ", response);

      let enhancedData: ResumeData;
      try {
        const responseText = response.text || "";
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          enhancedData = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: enhance existing data
          enhancedData = {
            ...resumeData,
            ats_analysis: {
              ...resumeData.ats_analysis,
              score: Math.min(100, (resumeData.ats_analysis?.score || 50) + 5),
              recommendations: [
                ...(resumeData.ats_analysis?.recommendations || []),
                "Consider tailoring keywords to specific job postings",
              ],
              issues: resumeData.ats_analysis?.issues || [],
              keyword_matches: resumeData.ats_analysis?.keyword_matches || [],
              missing_keywords: resumeData.ats_analysis?.missing_keywords || [],
            },
          };
        }
      } catch (parseError) {
        enhancedData = resumeData;
      }

      return {
        success: true,
        data: enhancedData,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
