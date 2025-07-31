import { format } from 'date-fns';
import type { JournalEntry, ChildProfile } from '@shared/schema';

export interface ExportData {
  entries: JournalEntry[];
  childProfiles: ChildProfile[];
  exportedAt: string;
  version: string;
}

export function exportToJSON(entries: JournalEntry[], childProfiles: ChildProfile[]): void {
  const exportData: ExportData = {
    entries,
    childProfiles,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `parenting-journal-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

export function exportToCSV(entries: JournalEntry[], childProfiles: ChildProfile[]): void {
  const headers = [
    'Date',
    'Title',
    'Content',
    'Mood',
    'AI Analyzed Mood',
    'Emotion Tags',
    'Child Name',
    'AI Feedback',
    'Developmental Insight',
    'Is Favorite',
    'Photos Count'
  ];

  const rows = entries.map(entry => {
    const childProfile = childProfiles.find(p => p.id === entry.childProfileId);
    
    return [
      format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      entry.title || '',
      entry.content.replace(/"/g, '""'), // Escape quotes for CSV
      entry.mood || '',
      entry.aiAnalyzedMood || '',
      entry.emotionTags?.join('; ') || '',
      childProfile?.name || '',
      entry.aiFeedback?.replace(/"/g, '""') || '',
      entry.developmentalInsight?.replace(/"/g, '""') || '',
      entry.isFavorite === 'true' ? 'Yes' : 'No',
      entry.photos?.length || '0'
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const dataBlob = new Blob([csvContent], { type: 'text/csv' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `parenting-journal-entries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

export function importFromJSON(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate the imported data structure
        if (!data.entries || !Array.isArray(data.entries)) {
          throw new Error('Invalid file format: missing entries array');
        }
        
        if (!data.childProfiles || !Array.isArray(data.childProfiles)) {
          throw new Error('Invalid file format: missing childProfiles array');
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function exportFavoritesToPDF(data: { entries: JournalEntry[], childProfiles: ChildProfile[] }): Promise<void> {
  // Import jsPDF dynamically
  const jsPDF = (await import('jspdf')).default;
  
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;
  
  // Title
  doc.setFontSize(20);
  doc.text('My Favorite Parenting Moments', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(12);
  doc.text(`Exported on ${format(new Date(), 'PPP')}`, 20, yPosition);
  yPosition += 20;
  
  for (const entry of data.entries) {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Entry header
    doc.setFontSize(14);
    doc.text(entry.title || 'Untitled Entry', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.text(format(new Date(entry.createdAt), 'PPP'), 20, yPosition);
    yPosition += 6;
    
    // Child name
    if (entry.childProfileId) {
      const child = data.childProfiles.find(p => p.id === entry.childProfileId);
      if (child) {
        doc.text(`About: ${child.name}`, 20, yPosition);
        yPosition += 6;
      }
    }
    
    // Mood
    if (entry.mood) {
      doc.text(`Mood: ${entry.mood}`, 20, yPosition);
      yPosition += 6;
    }
    
    // Content
    doc.setFontSize(11);
    const contentLines = doc.splitTextToSize(entry.content, 170);
    doc.text(contentLines, 20, yPosition);
    yPosition += contentLines.length * 5 + 10;
    
    // Add separator
    yPosition += 5;
  }
  
  // Save the PDF
  doc.save(`favorite-journal-entries-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function validateImportData(data: ExportData): boolean {
  // Basic validation
  if (!data.entries || !Array.isArray(data.entries)) return false;
  if (!data.childProfiles || !Array.isArray(data.childProfiles)) return false;
  
  // Validate entry structure
  for (const entry of data.entries) {
    if (!entry.id || !entry.content || !entry.createdAt) return false;
  }
  
  // Validate child profile structure
  for (const profile of data.childProfiles) {
    if (!profile.id || !profile.name || !profile.dateOfBirth) return false;
  }
  
  return true;
}