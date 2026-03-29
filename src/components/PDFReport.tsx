import React from "react";
import { ResumeData } from "@/lib/gemini-service";

interface PDFReportProps {
  data: ResumeData;
}

export function PDFReport({ data }: PDFReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#059669"; // green-600
    if (score >= 60) return "#D97706"; // yellow-600
    return "#DC2626"; // red-600
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return "✅";
    if (score >= 60) return "⚠️";
    return "❌";
  };

  if (!data.is_resume) {
    return (
      <div className="pdf-report">
        <div className="pdf-header">
          <h1>Resume ATS Analysis Report</h1>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
        <div className="pdf-error">
          <h2>❌ Document Type Error</h2>
          <p>
            {data.message ||
              "This document does not appear to be a resume or CV."}
          </p>
          <p>
            Please upload a resume or CV document for ATS compatibility
            analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-report">
      {/* Header */}
      <div className="pdf-header">
        <h1>Resume ATS Analysis Report</h1>
        <p>Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Contact Information */}
      {data?.header?.name && (
        <div className="pdf-section">
          <h2>Contact Information</h2>
          <div className="pdf-contact">
            <p>
              <strong>Name:</strong> {data.header.name}
            </p>
            <p>
              <strong>Email:</strong> {data.header.email}
            </p>
            <p>
              <strong>Phone:</strong> {data.header.phone}
            </p>
            <p>
              <strong>Location:</strong> {data.header.location}
            </p>
            {data.header.linkedin && (
              <p>
                <strong>LinkedIn:</strong> {data.header.linkedin}
              </p>
            )}
            {data.header.website && (
              <p>
                <strong>Website:</strong> {data.header.website}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ATS Score */}
      <div className="pdf-section">
        <h2>ATS Compatibility Score</h2>
        <div className="pdf-score">
          <div className="score-display">
            <span className="score-icon">
              {getScoreIcon(data?.ats_analysis?.score || 0)}
            </span>
            <span
              className="score-value"
              style={{ color: getScoreColor(data?.ats_analysis?.score || 0) }}
            >
              {data?.ats_analysis?.score || 0}/100
            </span>
          </div>
          <div className="score-bar">
            <div
              className="score-fill"
              style={{
                width: `${data?.ats_analysis?.score || 0}%`,
                backgroundColor: getScoreColor(data?.ats_analysis?.score || 0),
              }}
            ></div>
          </div>
          <p className="score-label">
            {(data?.ats_analysis?.score || 0) >= 80
              ? "Excellent"
              : (data?.ats_analysis?.score || 0) >= 60
              ? "Good"
              : (data?.ats_analysis?.score || 0) >= 40
              ? "Fair"
              : "Needs Improvement"}
          </p>
        </div>
      </div>

      {/* Issues and Recommendations */}
      <div className="pdf-section">
        <div className="pdf-grid">
          <div className="pdf-column">
            <h3>❌ Issues Found</h3>
            {(data?.ats_analysis?.issues?.length || 0) > 0 ? (
              <ul className="pdf-list">
                {data?.ats_analysis?.issues?.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            ) : (
              <p>No major issues found!</p>
            )}
          </div>
          <div className="pdf-column">
            <h3>💡 Recommendations</h3>
            {(data?.ats_analysis?.recommendations?.length || 0) > 0 ? (
              <ul className="pdf-list">
                {data?.ats_analysis?.recommendations?.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            ) : (
              <p>No specific recommendations at this time.</p>
            )}
          </div>
        </div>
      </div>

      {/* Keyword Analysis */}
      <div className="pdf-section">
        <div className="pdf-grid">
          <div className="pdf-column">
            <h3>
              ✅ Keywords Found (
              {data?.ats_analysis?.keyword_matches?.length || 0})
            </h3>
            {(data?.ats_analysis?.keyword_matches?.length || 0) > 0 ? (
              <div className="pdf-keywords">
                {data?.ats_analysis?.keyword_matches?.map((keyword, index) => (
                  <span key={index} className="keyword-found">
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p>No keywords detected</p>
            )}
          </div>
          <div className="pdf-column">
            <h3>
              ⚠️ Missing Keywords (
              {data?.ats_analysis?.missing_keywords?.length || 0})
            </h3>
            {(data?.ats_analysis?.missing_keywords?.length || 0) > 0 ? (
              <div className="pdf-keywords">
                {data?.ats_analysis?.missing_keywords?.map((keyword, index) => (
                  <span key={index} className="keyword-missing">
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p>No missing keywords identified</p>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      {data?.sections?.skills && (
        <div className="pdf-section">
          <h2>Skills Analysis</h2>
          <div className="pdf-skills">
            {data.sections.skills.technical?.length > 0 && (
              <div className="skill-category">
                <h4>Technical Skills</h4>
                <div className="skill-tags">
                  {data.sections.skills.technical.map((skill, index) => (
                    <span key={index} className="skill-tag technical">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.sections.skills.soft?.length > 0 && (
              <div className="skill-category">
                <h4>Soft Skills</h4>
                <div className="skill-tags">
                  {data.sections.skills.soft.map((skill, index) => (
                    <span key={index} className="skill-tag soft">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.sections.skills.languages &&
              data.sections.skills.languages.length > 0 && (
                <div className="skill-category">
                  <h4>Languages</h4>
                  <div className="skill-tags">
                    {data.sections.skills.languages.map((language, index) => (
                      <span key={index} className="skill-tag language">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pdf-footer">
        <p>Report generated by ATS Resume Checker</p>
        <p>
          For more information, visit:
          https://github.com/mahfuzurrahman01/ATS-resume-checker
        </p>
      </div>

      <style jsx>{`
        .pdf-report {
          font-family: "Arial", sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          color: #333;
          line-height: 1.6;
        }

        .pdf-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }

        .pdf-header h1 {
          color: #1e40af;
          font-size: 28px;
          margin: 0 0 10px 0;
          font-weight: bold;
        }

        .pdf-header p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .pdf-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }

        .pdf-section h2 {
          color: #1e40af;
          font-size: 20px;
          margin: 0 0 15px 0;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }

        .pdf-section h3 {
          color: #374151;
          font-size: 16px;
          margin: 0 0 10px 0;
        }

        .pdf-section h4 {
          color: #4b5563;
          font-size: 14px;
          margin: 0 0 8px 0;
        }

        .pdf-contact p {
          margin: 5px 0;
          font-size: 14px;
        }

        .pdf-score {
          text-align: center;
          margin: 20px 0;
        }

        .score-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .score-icon {
          font-size: 24px;
        }

        .score-value {
          font-size: 32px;
          font-weight: bold;
        }

        .score-bar {
          width: 100%;
          height: 20px;
          background-color: #f3f4f6;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .score-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .score-label {
          font-size: 16px;
          font-weight: bold;
          color: #6b7280;
          margin: 0;
        }

        .pdf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .pdf-column {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }

        .pdf-list {
          margin: 0;
          padding-left: 20px;
        }

        .pdf-list li {
          margin-bottom: 8px;
          font-size: 14px;
        }

        .pdf-keywords {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .keyword-found {
          background-color: #dcfce7;
          color: #166534;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          border: 1px solid #bbf7d0;
        }

        .keyword-missing {
          background-color: #fef3c7;
          color: #92400e;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          border: 1px solid #fde68a;
        }

        .pdf-skills {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .skill-category {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
        }

        .skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-tag {
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .skill-tag.technical {
          background-color: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .skill-tag.soft {
          background-color: #f3e8ff;
          color: #7c3aed;
          border: 1px solid #c4b5fd;
        }

        .skill-tag.language {
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .pdf-error {
          text-align: center;
          background-color: #fef2f2;
          border: 2px solid #fecaca;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .pdf-error h2 {
          color: #dc2626;
          margin: 0 0 15px 0;
        }

        .pdf-error p {
          color: #6b7280;
          margin: 5px 0;
        }

        .pdf-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }

        .pdf-footer p {
          margin: 5px 0;
        }

        @media print {
          .pdf-report {
            max-width: none;
            margin: 0;
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}
