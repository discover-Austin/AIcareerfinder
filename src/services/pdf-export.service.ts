import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { FullAnalysis, CareerSuggestion } from '../models/personality-test.model';

@Injectable({
  providedIn: 'root',
})
export class PdfExportService {
  /**
   * Export career analysis to PDF
   */
  async exportAnalysisToPDF(
    analysis: FullAnalysis,
    personalityProfile: string,
    userName?: string
  ): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Helper function to add page if needed
    const checkAndAddPage = (neededHeight: number = 15) => {
      if (yPosition + neededHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrapping
    const addWrappedText = (
      text: string,
      x: number,
      maxWidth: number,
      fontSize: number = 10,
      isBold: boolean = false
    ) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        checkAndAddPage();
        pdf.text(line, x, yPosition);
        yPosition += lineHeight;
      });
    };

    // Header with gradient background (simulated with rectangle)
    pdf.setFillColor(79, 70, 229); // Indigo
    pdf.rect(0, 0, pageWidth, 50, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Career Path Analysis', pageWidth / 2, 20, { align: 'center' });

    // User name
    if (userName) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Report for: ${userName}`, pageWidth / 2, 32, { align: 'center' });
    }

    // Date
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 40, {
      align: 'center',
    });

    // Reset text color and position
    pdf.setTextColor(0, 0, 0);
    yPosition = 60;

    // 1. Personality Archetype Section
    checkAndAddPage(25);
    pdf.setFillColor(240, 240, 255);
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, 'F');

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Your Personality Archetype', margin + 5, yPosition + 5);

    yPosition += 15;
    pdf.setFontSize(14);
    pdf.setTextColor(79, 70, 229);
    pdf.text(analysis.archetype.name, margin + 5, yPosition);

    yPosition += 10;
    pdf.setTextColor(0, 0, 0);
    addWrappedText(analysis.archetype.description, margin + 5, pageWidth - 2 * margin - 10, 10);

    yPosition += 5;

    // 2. Strengths Section
    checkAndAddPage(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(34, 139, 34); // Green
    pdf.text('Your Strengths', margin, yPosition);
    pdf.setTextColor(0, 0, 0);

    yPosition += 10;

    analysis.strengths.forEach((strength, index) => {
      checkAndAddPage(15);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${strength.name}`, margin + 5, yPosition);
      yPosition += 6;

      addWrappedText(strength.description, margin + 10, pageWidth - 2 * margin - 15, 9, false);
      yPosition += 3;
    });

    // 3. Growth Areas Section
    checkAndAddPage(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 140, 0); // Orange
    pdf.text('Areas for Growth', margin, yPosition);
    pdf.setTextColor(0, 0, 0);

    yPosition += 10;

    analysis.growthAreas.forEach((area, index) => {
      checkAndAddPage(15);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${area.name}`, margin + 5, yPosition);
      yPosition += 6;

      addWrappedText(area.description, margin + 10, pageWidth - 2 * margin - 15, 9, false);
      yPosition += 3;
    });

    // 4. Career Suggestions Section
    checkAndAddPage(20);
    pdf.addPage();
    yPosition = margin;

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(79, 70, 229);
    pdf.text('Recommended Career Paths', margin, yPosition);
    pdf.setTextColor(0, 0, 0);

    yPosition += 15;

    analysis.suggestions.forEach((career: CareerSuggestion, index: number) => {
      // Each career starts on a new page for readability
      if (index > 0) {
        pdf.addPage();
        yPosition = margin;
      }

      // Career title with background
      pdf.setFillColor(245, 245, 250);
      pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 12, 'F');

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(79, 70, 229);
      pdf.text(`${index + 1}. ${career.career}`, margin, yPosition + 3);
      pdf.setTextColor(0, 0, 0);

      yPosition += 15;

      // Description
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Overview:', margin, yPosition);
      yPosition += 6;
      addWrappedText(career.description, margin + 5, pageWidth - 2 * margin - 10, 9, false);
      yPosition += 3;

      // Why it fits
      checkAndAddPage(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Why This Fits You:', margin, yPosition);
      yPosition += 6;
      addWrappedText(career.reasoning, margin + 5, pageWidth - 2 * margin - 10, 9, false);
      yPosition += 3;

      // Required Skills
      checkAndAddPage(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Required Skills:', margin, yPosition);
      yPosition += 6;

      career.requiredSkills.forEach((skill: string) => {
        checkAndAddPage();
        pdf.setFont('helvetica', 'normal');
        pdf.text(`• ${skill}`, margin + 5, yPosition);
        yPosition += 5;
      });

      yPosition += 3;

      // Day in the Life
      checkAndAddPage(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('A Day in the Life:', margin, yPosition);
      yPosition += 6;
      addWrappedText(career.dayInTheLife, margin + 5, pageWidth - 2 * margin - 10, 9, false);
      yPosition += 3;

      // Suggested First Steps
      checkAndAddPage(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Suggested First Steps:', margin, yPosition);
      yPosition += 6;

      career.suggestedFirstSteps.forEach((step: string) => {
        checkAndAddPage(8);
        pdf.setFont('helvetica', 'normal');
        const stepLines = pdf.splitTextToSize(`• ${step}`, pageWidth - 2 * margin - 10);
        stepLines.forEach((line: string) => {
          checkAndAddPage();
          pdf.text(line, margin + 5, yPosition);
          yPosition += 5;
        });
      });
    });

    // Footer on last page
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      'Generated by AI Career Path Finder - Powered by AI',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Save the PDF
    const fileName = `Career_Analysis_${userName ? userName.replace(/\s+/g, '_') : 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Export a single career suggestion to PDF
   */
  async exportCareerToPDF(career: CareerSuggestion, archetypeName: string, userName?: string): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(career.career, margin, yPosition);
    yPosition += 15;

    // User and date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (userName) {
      pdf.text(`For: ${userName} (${archetypeName})`, margin, yPosition);
      yPosition += 7;
    }
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 12;

    // Description
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overview:', margin, yPosition);
    yPosition += 7;

    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(career.description, pageWidth - 2 * margin);
    descLines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Required Skills
    pdf.setFont('helvetica', 'bold');
    pdf.text('Required Skills:', margin, yPosition);
    yPosition += 7;

    pdf.setFont('helvetica', 'normal');
    career.requiredSkills.forEach((skill: string) => {
      pdf.text(`• ${skill}`, margin + 5, yPosition);
      yPosition += 6;
    });

    // Save
    pdf.save(`${career.career.replace(/\s+/g, '_')}_Career_Guide.pdf`);
  }
}
