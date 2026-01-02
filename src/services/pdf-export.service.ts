import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { FullAnalysis, CareerSuggestion } from '../models/personality-test.model';
import { PDF_LAYOUT, PDF_COLORS, PDF_FONT_SIZES, PDF_FONTS } from '../config/pdf.constants';

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
    let yPosition = PDF_LAYOUT.MARGIN;

    // Helper function to add page if needed
    const checkAndAddPage = (neededHeight: number = PDF_LAYOUT.MIN_SPACE_BEFORE_PAGE) => {
      if (yPosition + neededHeight > pageHeight - PDF_LAYOUT.MARGIN) {
        pdf.addPage();
        yPosition = PDF_LAYOUT.MARGIN;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrapping
    const addWrappedText = (
      text: string,
      x: number,
      maxWidth: number,
      fontSize: number = PDF_FONT_SIZES.BODY,
      isBold: boolean = false
    ): void => {
      pdf.setFontSize(fontSize);
      pdf.setFont(PDF_FONTS.FAMILY, isBold ? PDF_FONTS.WEIGHT.BOLD : PDF_FONTS.WEIGHT.NORMAL);

      const lines: string[] = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        checkAndAddPage();
        pdf.text(line, x, yPosition);
        yPosition += PDF_LAYOUT.LINE_HEIGHT;
      });
    };

    // Header with gradient background (simulated with rectangle)
    pdf.setFillColor(PDF_COLORS.PRIMARY.r, PDF_COLORS.PRIMARY.g, PDF_COLORS.PRIMARY.b);
    pdf.rect(0, 0, pageWidth, PDF_LAYOUT.HEADER_HEIGHT, 'F');

    // Title
    pdf.setTextColor(PDF_COLORS.WHITE.r, PDF_COLORS.WHITE.g, PDF_COLORS.WHITE.b);
    pdf.setFontSize(PDF_FONT_SIZES.TITLE);
    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
    pdf.text('AI Career Path Analysis', pageWidth / 2, 20, { align: 'center' });

    // User name
    if (userName) {
      pdf.setFontSize(PDF_FONT_SIZES.HEADER);
      pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.NORMAL);
      pdf.text(`Report for: ${userName}`, pageWidth / 2, 32, { align: 'center' });
    }

    // Date
    pdf.setFontSize(PDF_FONT_SIZES.BODY);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 40, {
      align: 'center',
    });

    // Reset text color and position
    pdf.setTextColor(PDF_COLORS.BLACK.r, PDF_COLORS.BLACK.g, PDF_COLORS.BLACK.b);
    yPosition = 60;

    // 1. Personality Archetype Section
    checkAndAddPage(25);
    pdf.setFillColor(PDF_COLORS.BACKGROUND_LIGHT.r, PDF_COLORS.BACKGROUND_LIGHT.g, PDF_COLORS.BACKGROUND_LIGHT.b);
    pdf.rect(PDF_LAYOUT.MARGIN, yPosition - 5, pageWidth - 2 * PDF_LAYOUT.MARGIN, 20, 'F');

    pdf.setFontSize(PDF_FONT_SIZES.SUBSECTION);
    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
    pdf.text('Your Personality Archetype', PDF_LAYOUT.MARGIN + 5, yPosition + 5);

    yPosition += 15;
    pdf.setFontSize(PDF_FONT_SIZES.HEADER);
    pdf.setTextColor(PDF_COLORS.PRIMARY.r, PDF_COLORS.PRIMARY.g, PDF_COLORS.PRIMARY.b);
    pdf.text(analysis.archetype.name, PDF_LAYOUT.MARGIN + 5, yPosition);

    yPosition += 10;
    pdf.setTextColor(PDF_COLORS.BLACK.r, PDF_COLORS.BLACK.g, PDF_COLORS.BLACK.b);
    addWrappedText(analysis.archetype.description, PDF_LAYOUT.MARGIN + 5, pageWidth - 2 * PDF_LAYOUT.MARGIN - 10, PDF_FONT_SIZES.BODY);

    yPosition += 5;

    // 2. Strengths Section
    checkAndAddPage(PDF_LAYOUT.SECTION_HEADER_SPACE);
    pdf.setFontSize(PDF_FONT_SIZES.HEADER);
    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
    pdf.setTextColor(PDF_COLORS.SUCCESS.r, PDF_COLORS.SUCCESS.g, PDF_COLORS.SUCCESS.b);
    pdf.text('Your Strengths', PDF_LAYOUT.MARGIN, yPosition);
    pdf.setTextColor(PDF_COLORS.BLACK.r, PDF_COLORS.BLACK.g, PDF_COLORS.BLACK.b);

    yPosition += 10;

    analysis.strengths.forEach((strength, index) => {
      checkAndAddPage(PDF_LAYOUT.LIST_ITEM_SPACE);
      pdf.setFontSize(PDF_FONT_SIZES.SUBHEADER);
      pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
      pdf.text(`${index + 1}. ${strength.name}`, PDF_LAYOUT.MARGIN + 5, yPosition);
      yPosition += 6;

      addWrappedText(strength.description, PDF_LAYOUT.MARGIN + 10, pageWidth - 2 * PDF_LAYOUT.MARGIN - 15, PDF_FONT_SIZES.SMALL, false);
      yPosition += 3;
    });

    // 3. Growth Areas Section
    checkAndAddPage(PDF_LAYOUT.SECTION_HEADER_SPACE);
    pdf.setFontSize(PDF_FONT_SIZES.HEADER);
    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
    pdf.setTextColor(PDF_COLORS.WARNING.r, PDF_COLORS.WARNING.g, PDF_COLORS.WARNING.b);
    pdf.text('Areas for Growth', PDF_LAYOUT.MARGIN, yPosition);
    pdf.setTextColor(PDF_COLORS.BLACK.r, PDF_COLORS.BLACK.g, PDF_COLORS.BLACK.b);

    yPosition += 10;

    analysis.growthAreas.forEach((area, index) => {
      checkAndAddPage(PDF_LAYOUT.LIST_ITEM_SPACE);
      pdf.setFontSize(PDF_FONT_SIZES.SUBHEADER);
      pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
      pdf.text(`${index + 1}. ${area.name}`, PDF_LAYOUT.MARGIN + 5, yPosition);
      yPosition += 6;

      addWrappedText(area.description, PDF_LAYOUT.MARGIN + 10, pageWidth - 2 * PDF_LAYOUT.MARGIN - 15, PDF_FONT_SIZES.SMALL, false);
      yPosition += 3;
    });

    // 4. Career Suggestions Section
    checkAndAddPage(PDF_LAYOUT.SECTION_HEADER_SPACE);
    pdf.addPage();
    yPosition = PDF_LAYOUT.MARGIN;

    pdf.setFontSize(PDF_FONT_SIZES.SECTION_TITLE);
    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
    pdf.setTextColor(PDF_COLORS.PRIMARY.r, PDF_COLORS.PRIMARY.g, PDF_COLORS.PRIMARY.b);
    pdf.text('Recommended Career Paths', PDF_LAYOUT.MARGIN, yPosition);
    pdf.setTextColor(PDF_COLORS.BLACK.r, PDF_COLORS.BLACK.g, PDF_COLORS.BLACK.b);

    yPosition += 15;

    analysis.suggestions.forEach((career: CareerSuggestion, index: number) => {
      // Each career starts on a new page for readability
      if (index > 0) {
        pdf.addPage();
        yPosition = PDF_LAYOUT.MARGIN;
      }

      // Career title with background
      pdf.setFillColor(PDF_COLORS.BACKGROUND_VERY_LIGHT.r, PDF_COLORS.BACKGROUND_VERY_LIGHT.g, PDF_COLORS.BACKGROUND_VERY_LIGHT.b);
      pdf.rect(PDF_LAYOUT.MARGIN - 5, yPosition - 5, pageWidth - 2 * PDF_LAYOUT.MARGIN + 10, 12, 'F');

      pdf.setFontSize(PDF_FONT_SIZES.HEADER);
      pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
      pdf.setTextColor(PDF_COLORS.PRIMARY.r, PDF_COLORS.PRIMARY.g, PDF_COLORS.PRIMARY.b);
      pdf.text(`${index + 1}. ${career.career}`, PDF_LAYOUT.MARGIN, yPosition + 3);
      pdf.setTextColor(PDF_COLORS.BLACK.r, PDF_COLORS.BLACK.g, PDF_COLORS.BLACK.b);

      yPosition += 15;

      // Description
      pdf.setFontSize(PDF_FONT_SIZES.BODY);
      pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
      pdf.text('Overview:', PDF_LAYOUT.MARGIN, yPosition);
      yPosition += 6;
      addWrappedText(career.description, PDF_LAYOUT.MARGIN + 5, pageWidth - 2 * PDF_LAYOUT.MARGIN - 10, PDF_FONT_SIZES.SMALL, false);
      yPosition += 3;

      // Why it fits
      checkAndAddPage(PDF_LAYOUT.SECTION_HEADER_SPACE);
      pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
      pdf.text('Why This Fits You:', PDF_LAYOUT.MARGIN, yPosition);
      yPosition += 6;
      addWrappedText(career.reasoning, PDF_LAYOUT.MARGIN + 5, pageWidth - 2 * PDF_LAYOUT.MARGIN - 10, PDF_FONT_SIZES.SMALL, false);
      yPosition += 3;

      // Required Skills
      checkAndAddPage(PDF_LAYOUT.SECTION_HEADER_SPACE);
      pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
      pdf.text('Required Skills:', PDF_LAYOUT.MARGIN, yPosition);
      yPosition += 6;

      career.requiredSkills.forEach((skill: string) => {
        checkAndAddPage();
        pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.NORMAL);
        pdf.text(`• ${skill}`, PDF_LAYOUT.MARGIN + 5, yPosition);
        yPosition += 5;
      });

      yPosition += 3;

      // Day in the Life
      checkAndAddPage(PDF_LAYOUT.SECTION_HEADER_SPACE);
      pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
      pdf.text('A Day in the Life:', PDF_LAYOUT.MARGIN, yPosition);
      yPosition += 6;
      addWrappedText(career.dayInTheLife, PDF_LAYOUT.MARGIN + 5, pageWidth - 2 * PDF_LAYOUT.MARGIN - 10, PDF_FONT_SIZES.SMALL, false);
      yPosition += 3;

      // Suggested First Steps
      checkAndAddPage(PDF_LAYOUT.SECTION_HEADER_SPACE);
      pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
      pdf.text('Suggested First Steps:', PDF_LAYOUT.MARGIN, yPosition);
      yPosition += 6;

      career.suggestedFirstSteps.forEach((step: string) => {
        checkAndAddPage(8);
        pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.NORMAL);
        const stepLines: string[] = pdf.splitTextToSize(`• ${step}`, pageWidth - 2 * PDF_LAYOUT.MARGIN - 10);
        stepLines.forEach((line: string) => {
          checkAndAddPage();
          pdf.text(line, PDF_LAYOUT.MARGIN + 5, yPosition);
          yPosition += 5;
        });
      });
    });

    // Footer on last page
    pdf.setFontSize(PDF_FONT_SIZES.FOOTER);
    pdf.setTextColor(PDF_COLORS.GRAY.r, PDF_COLORS.GRAY.g, PDF_COLORS.GRAY.b);
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
    let yPosition = PDF_LAYOUT.MARGIN;

    // Title
    pdf.setFontSize(PDF_FONT_SIZES.SECTION_TITLE);
    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
    pdf.text(career.career, PDF_LAYOUT.MARGIN, yPosition);
    yPosition += 15;

    // User and date
    pdf.setFontSize(PDF_FONT_SIZES.BODY);
    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.NORMAL);
    if (userName) {
      pdf.text(`For: ${userName} (${archetypeName})`, PDF_LAYOUT.MARGIN, yPosition);
      yPosition += PDF_LAYOUT.LINE_HEIGHT;
    }
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, PDF_LAYOUT.MARGIN, yPosition);
    yPosition += 12;

    // Description
    pdf.setFontSize(PDF_FONT_SIZES.SUBHEADER);
    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
    pdf.text('Overview:', PDF_LAYOUT.MARGIN, yPosition);
    yPosition += PDF_LAYOUT.LINE_HEIGHT;

    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.NORMAL);
    const descLines: string[] = pdf.splitTextToSize(career.description, pageWidth - 2 * PDF_LAYOUT.MARGIN);
    descLines.forEach((line: string) => {
      pdf.text(line, PDF_LAYOUT.MARGIN, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Required Skills
    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.BOLD);
    pdf.text('Required Skills:', PDF_LAYOUT.MARGIN, yPosition);
    yPosition += PDF_LAYOUT.LINE_HEIGHT;

    pdf.setFont(PDF_FONTS.FAMILY, PDF_FONTS.WEIGHT.NORMAL);
    career.requiredSkills.forEach((skill: string) => {
      pdf.text(`• ${skill}`, PDF_LAYOUT.MARGIN + 5, yPosition);
      yPosition += 6;
    });

    // Save
    pdf.save(`${career.career.replace(/\s+/g, '_')}_Career_Guide.pdf`);
  }
}
