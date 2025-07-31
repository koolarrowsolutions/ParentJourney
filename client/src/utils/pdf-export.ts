import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import type { JournalEntry, ChildProfile } from '@shared/schema';

export interface PDFExportOptions {
  entry: JournalEntry;
  childProfile?: ChildProfile;
}

export interface BatchPDFExportOptions {
  entries: JournalEntry[];
  childProfiles: ChildProfile[];
  title?: string;
}

export async function exportEntryToPDF({ entry, childProfile }: PDFExportOptions): Promise<void> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = 30;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ParentJourney - Journal Entry', margin, yPosition);
  yPosition += 20;

  // Date
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const entryDate = format(new Date(entry.createdAt), 'MMMM dd, yyyy - h:mm a');
  pdf.text(`Date: ${entryDate}`, margin, yPosition);
  yPosition += 15;

  // Child name (if available)
  if (childProfile) {
    pdf.text(`Child: ${childProfile.name}`, margin, yPosition);
    yPosition += 15;
  }

  // Entry title (if available)
  if (entry.title) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Title: ${entry.title}`, margin, yPosition);
    yPosition += 15;
  }

  // Mood (if available)
  if (entry.mood) {
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Mood: ${entry.mood}`, margin, yPosition);
    yPosition += 15;
  }

  // Emotion tags (if available)
  if (entry.emotionTags && entry.emotionTags.length > 0) {
    pdf.text(`Emotions: ${entry.emotionTags.join(', ')}`, margin, yPosition);
    yPosition += 15;
  }

  yPosition += 10;

  // Journal content
  pdf.setFont('helvetica', 'bold');
  pdf.text('Journal Entry:', margin, yPosition);
  yPosition += 10;

  pdf.setFont('helvetica', 'normal');
  const contentLines = pdf.splitTextToSize(entry.content, contentWidth);
  
  for (let i = 0; i < contentLines.length; i++) {
    if (yPosition > 270) { // Near bottom of page
      pdf.addPage();
      yPosition = 30;
    }
    pdf.text(contentLines[i], margin, yPosition);
    yPosition += 7;
  }

  // AI Feedback (if available)
  if (entry.aiFeedback) {
    yPosition += 15;
    if (yPosition > 250) { // Near bottom of page
      pdf.addPage();
      yPosition = 30;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Reflection:', margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    const feedbackLines = pdf.splitTextToSize(entry.aiFeedback, contentWidth);
    
    for (let i = 0; i < feedbackLines.length; i++) {
      if (yPosition > 270) { // Near bottom of page
        pdf.addPage();
        yPosition = 30;
      }
      pdf.text(feedbackLines[i], margin, yPosition);
      yPosition += 7;
    }
  }

  // Developmental Insight (if available)
  if (entry.developmentalInsight) {
    yPosition += 15;
    if (yPosition > 250) { // Near bottom of page
      pdf.addPage();
      yPosition = 30;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('Developmental Insight:', margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    const insightLines = pdf.splitTextToSize(entry.developmentalInsight, contentWidth);
    
    for (let i = 0; i < insightLines.length; i++) {
      if (yPosition > 270) { // Near bottom of page
        pdf.addPage();
        yPosition = 30;
      }
      pdf.text(insightLines[i], margin, yPosition);
      yPosition += 7;
    }
  }

  // Generate filename
  const dateStr = format(new Date(entry.createdAt), 'yyyy-MM-dd');
  const childName = childProfile ? `_${childProfile.name.replace(/\s+/g, '_')}` : '';
  const filename = `Parenting_Journal_${dateStr}${childName}.pdf`;

  // Save the PDF
  pdf.save(filename);
}

export async function exportFavoritesToPDF({ entries, childProfiles, title = 'Favorite Journal Entries' }: BatchPDFExportOptions): Promise<void> {
  if (entries.length === 0) {
    throw new Error('No entries to export');
  }

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = 30;

  // Title page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ParentJourney', margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(18);
  pdf.text(title, margin, yPosition);
  yPosition += 20;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const exportDate = format(new Date(), 'MMMM dd, yyyy');
  pdf.text(`Exported on: ${exportDate}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Total Entries: ${entries.length}`, margin, yPosition);
  yPosition += 30;

  // Table of contents
  pdf.setFont('helvetica', 'bold');
  pdf.text('Contents:', margin, yPosition);
  yPosition += 15;

  pdf.setFont('helvetica', 'normal');
  entries.forEach((entry, index) => {
    const entryDate = format(new Date(entry.createdAt), 'MMM dd, yyyy');
    const childProfile = childProfiles.find(p => p.id === entry.childProfileId);
    const childName = childProfile ? ` - ${childProfile.name}` : '';
    const title = entry.title ? entry.title : 'Untitled Entry';
    
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.text(`${index + 1}. ${title} (${entryDate})${childName}`, margin, yPosition);
    yPosition += 8;
  });

  // Individual entries
  entries.forEach((entry, index) => {
    pdf.addPage();
    yPosition = 30;

    const childProfile = childProfiles.find(p => p.id === entry.childProfileId);
    
    // Entry header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Entry ${index + 1}`, margin, yPosition);
    yPosition += 15;

    // Date
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const entryDate = format(new Date(entry.createdAt), 'MMMM dd, yyyy - h:mm a');
    pdf.text(`Date: ${entryDate}`, margin, yPosition);
    yPosition += 15;

    // Child name (if available)
    if (childProfile) {
      pdf.text(`Child: ${childProfile.name}`, margin, yPosition);
      yPosition += 15;
    }

    // Entry title (if available)
    if (entry.title) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Title: ${entry.title}`, margin, yPosition);
      yPosition += 15;
    }

    // Mood and emotions
    if (entry.mood || (entry.emotionTags && entry.emotionTags.length > 0)) {
      pdf.setFont('helvetica', 'normal');
      if (entry.mood) {
        pdf.text(`Mood: ${entry.mood}`, margin, yPosition);
        yPosition += 10;
      }
      if (entry.emotionTags && entry.emotionTags.length > 0) {
        pdf.text(`Emotions: ${entry.emotionTags.join(', ')}`, margin, yPosition);
        yPosition += 15;
      }
    }

    yPosition += 10;

    // Journal content
    pdf.setFont('helvetica', 'bold');
    pdf.text('Journal Entry:', margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    const contentLines = pdf.splitTextToSize(entry.content, contentWidth);
    
    for (let i = 0; i < contentLines.length; i++) {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.text(contentLines[i], margin, yPosition);
      yPosition += 7;
    }

    // AI Feedback (if available)
    if (entry.aiFeedback) {
      yPosition += 15;
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Reflection:', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      const feedbackLines = pdf.splitTextToSize(entry.aiFeedback, contentWidth);
      
      for (let i = 0; i < feedbackLines.length; i++) {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(feedbackLines[i], margin, yPosition);
        yPosition += 7;
      }
    }
  });

  // Generate filename
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const filename = `ParentJourney_Favorites_${dateStr}.pdf`;

  // Save the PDF
  pdf.save(filename);
}