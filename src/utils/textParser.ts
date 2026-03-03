export type ElementType = 
  | 'paragraph' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3'
  | 'table' 
  | 'bullet-list' 
  | 'numbered-list'
  | 'code-block'
  | 'blockquote'
  | 'empty-line';

export interface TableCell {
  content: string;
  isHeader: boolean;
}

export interface TableRow {
  cells: TableCell[];
}

export interface ParsedElement {
  type: ElementType;
  content: string;
  rows?: TableRow[];
  items?: string[];
  level?: number;
  originalSpacing?: string;
}

export interface ParseOptions {
  removeAiMarks?: boolean;
  autoCorrect?: boolean;
}

// AI marks removal function
function removeAiMarks(text: string): string {
  if (!text) return '';
  
  let cleaned = text;
  
  // Remove markdown formatting marks
  cleaned = cleaned.replace(/\*\*\*(.*?)\*\*\*/g, '$1');
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.*?)__/g, '$1');
  cleaned = cleaned.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1');
  cleaned = cleaned.replace(/(?<!_)_([_\n]+)_(?!_)/g, '$1');
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove citation markers [1], [2], [source], [1, 2, 3], etc.
  cleaned = cleaned.replace(/\[\d+(?:\s*,\s*\d+)*\]/g, '');
  cleaned = cleaned.replace(/\[(?:source|citation|ref|note|see|ibid|web|link)(?:\s*\d*)?\]/gi, '');
  
  // Remove superscript numbers often used as citations
  cleaned = cleaned.replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+/g, '');
  
  // Remove footnote markers like ^[1] or ^1
  cleaned = cleaned.replace(/\^\[?\d+\]?/g, '');
  
  // Remove zero-width characters
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '');
  
  // Remove invisible Unicode characters
  cleaned = cleaned.replace(/[\u2060\u2061\u2062\u2063\u2064]/g, '');
  
  // Remove soft hyphens
  cleaned = cleaned.replace(/\u00AD/g, '');
  
  // Remove markdown link syntax but keep text: [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove markdown image syntax: ![alt](url) -> alt
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove markdown horizontal rules and repeated dash markers.
  cleaned = cleaned.replace(/^\s*[-*_]{3,}\s*$/gm, '');
  cleaned = cleaned.replace(/\s-{3,}\s/g, ' ');
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  
  // Remove AI role labels often pasted from chat transcripts.
  cleaned = cleaned.replace(/^\s*(assistant|ai|chatgpt|model)\s*:\s*/i, '');

  // Remove common AI prefixes/suffixes
  const aiPhrases = [
    /^Sure[,!]?\s*/i,
    /^Certainly[,!]?\s*/i,
    /^Of course[,!]?\s*/i,
    /^Absolutely[,!]?\s*/i,
    /^I(?:'d| would) be happy to\s*/i,
    /^Let me\s+(?:help|provide|show|explain)\s*/i,
    /^As an AI(?:\s+language model)?,?\s*/i,
    /^As a large language model,?\s*/i,
    /I hope this helps[!.]?\s*$/i,
    /Let me know if you (?:need|have|want)\s+.*$/i,
    /Is there anything else.*\??\s*$/i,
    /Feel free to ask.*$/i,
  ];
  
  aiPhrases.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Normalize spaces around punctuation only.
  cleaned = cleaned.replace(/\s+([,.;:!?])/g, '$1');
  cleaned = cleaned.replace(/([,.;:!?])(\S)/g, '$1 $2');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  cleaned = cleaned.replace(/\s+$/g, '');
  
  return cleaned;
}

// Auto correct function
function autoCorrectText(text: string): string {
  if (!text) return '';

  let corrected = text;

  const corrections: Array<[RegExp, string]> = [
    [/\bteh\b/gi, 'the'],
    [/\badn\b/gi, 'and'],
    [/\brecieve\b/gi, 'receive'],
    [/\bseperate\b/gi, 'separate'],
    [/\bdefinately\b/gi, 'definitely'],
    [/\boccured\b/gi, 'occurred'],
    [/\buntill\b/gi, 'until'],
    [/\bproffesional\b/gi, 'professional'],
    [/\bimmediatly\b/gi, 'immediately'],
    [/\bwich\b/gi, 'which'],
    [/\bthier\b/gi, 'their'],
  ];

  corrections.forEach(([pattern, replacement]) => {
    corrected = corrected.replace(pattern, replacement);
  });

  corrected = corrected.replace(/\s+([,.;:!?])/g, '$1');
  corrected = corrected.replace(/([,.;:!?])(\S)/g, '$1 $2');
  corrected = corrected.replace(/\s{2,}/g, ' ');

  corrected = corrected.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (match) => match.toUpperCase());

  return corrected;
}

// Check if entire line is AI disclaimer
function isAiDisclaimerLine(line: string): boolean {
  const normalized = line.trim().toLowerCase();
  
  const disclaimerPatterns = [
    /^as an ai/i,
    /^as a large language model/i,
    /^based on the provided/i,
    /^here (?:is|are|s) (?:your|the) (?:formatted|converted|cleaned|improved|revised)/i,
    /^below is (?:your|the)/i,
    /^i cannot provide/i,
    /^i can't provide/i,
    /^i do not have/i,
    /^i don't have/i,
    /^note:\s*as an ai/i,
    /^disclaimer:/i,
    /^please note that/i,
    /^i hope this helps/i,
    /^let me know if you/i,
    /^feel free to/i,
    /^is there anything else/i,
    /^sure[,!]?\s*here/i,
    /^certainly[,!]?\s*here/i,
    /^here is the (?:formatted|converted|table|document|text)/i,
    /^here's the (?:formatted|converted|table|document|text)/i,
    /^i've (?:created|formatted|converted|prepared)/i,
    /^i have (?:created|formatted|converted|prepared)/i,
  ];
  
  return disclaimerPatterns.some(pattern => pattern.test(normalized));
}

// Main clean content function - exported for translation use
export function cleanContent(text: string, shouldRemoveAiMarks: boolean, shouldAutoCorrect: boolean): string {
  let cleaned = text;
  if (shouldRemoveAiMarks) {
    cleaned = removeAiMarks(cleaned);
  }
  if (shouldAutoCorrect) {
    cleaned = autoCorrectText(cleaned);
  }
  return cleaned;
}

// Helper function to check if line is table separator
function isTableSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) return false;
  const cleaned = trimmed.replace(/\|/g, '').trim();
  return /^[-:\s]+$/.test(cleaned) && cleaned.length > 0;
}

// Helper function to check if line has table structure
function isTableLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.includes('|')) {
    const pipeCount = (trimmed.match(/\|/g) || []).length;
    if (pipeCount >= 1) return true;
  }
  return false;
}

// Parse a single table line
function parseTableLine(line: string, isHeader: boolean, shouldRemoveAiMarks: boolean, shouldAutoCorrect: boolean): TableRow {
  let trimmed = line.trim();
  
  // Remove leading/trailing pipes and split
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  
  const parts = trimmed.split('|');
  
  return {
    cells: parts.map(p => ({
      content: cleanContent(p.trim(), shouldRemoveAiMarks, shouldAutoCorrect),
      isHeader
    }))
  };
}

function isBulletPoint(line: string): boolean {
  const trimmed = line.trim();
  return /^[•\-\*▪▸►◆◇→●○■□▶]\s/.test(trimmed);
}

function isNumberedList(line: string): boolean {
  const trimmed = line.trim();
  return /^\d+[.\)]\s/.test(trimmed);
}

function isHeading(line: string): { level: number; content: string } | null {
  const trimmed = line.trim();
  
  // Markdown style headings: # ## ###
  const hashMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
  if (hashMatch) {
    return {
      level: hashMatch[1].length,
      content: hashMatch[2].replace(/\*\*/g, '') // Remove bold from heading
    };
  }
  
  // Bold text as heading (single line, short)
  if (/^\*\*[^*]+\*\*$/.test(trimmed) && trimmed.length < 100) {
    return {
      level: 2,
      content: trimmed.replace(/\*\*/g, '')
    };
  }
  
  return null;
}

function isCodeBlock(line: string): boolean {
  return line.trim().startsWith('```');
}

function isBlockquote(line: string): boolean {
  return line.trim().startsWith('>');
}

function preserveSpacing(line: string): string {
  // Count leading spaces/tabs for indentation preservation
  const leadingSpaces = line.match(/^(\s*)/)?.[1] || '';
  return leadingSpaces;
}

export function parseTextToElements(text: string, options: ParseOptions = {}): ParsedElement[] {
  const shouldRemoveAiMarks = options.removeAiMarks ?? false;
  const shouldAutoCorrect = options.autoCorrect ?? false;
  const lines = text.split('\n');
  const elements: ParsedElement[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Empty line - preserve for spacing
    if (trimmedLine === '') {
      elements.push({ 
        type: 'empty-line', 
        content: '',
        originalSpacing: preserveSpacing(line)
      });
      i++;
      continue;
    }

    // Skip AI disclaimer lines when option is enabled
    if (shouldRemoveAiMarks && isAiDisclaimerLine(trimmedLine)) {
      i++;
      continue;
    }
    
    // Code block detection
    if (isCodeBlock(line)) {
      const codeLines: string[] = [];
      i++; // Skip opening ```
      while (i < lines.length && !isCodeBlock(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      elements.push({
        type: 'code-block',
        content: shouldRemoveAiMarks ? removeAiMarks(codeLines.join('\n')) : codeLines.join('\n')
      });
      continue;
    }
    
    // Table detection
    if (isTableLine(line) && !isTableSeparatorLine(line)) {
      const tableRows: TableRow[] = [];
      
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        
        if (currentLine === '') break;
        
        if (isTableSeparatorLine(currentLine)) {
          // Mark previous row as header
          if (tableRows.length > 0) {
            tableRows[tableRows.length - 1].cells.forEach(cell => {
              cell.isHeader = true;
            });
          }
          i++;
          continue;
        }
        
        if (!isTableLine(currentLine)) break;
        
        const row = parseTableLine(currentLine, false, shouldRemoveAiMarks, shouldAutoCorrect);
        
        // Check if next line is separator to mark this as header
        if (i + 1 < lines.length && isTableSeparatorLine(lines[i + 1])) {
          row.cells.forEach(cell => {
            cell.isHeader = true;
          });
        }
        
        tableRows.push(row);
        i++;
      }
      
      if (tableRows.length > 0) {
        elements.push({
          type: 'table',
          content: '',
          rows: tableRows
        });
      }
      continue;
    }
    
    // Skip separator lines outside tables
    if (isTableSeparatorLine(line)) {
      i++;
      continue;
    }
    
    // Heading detection
    const heading = isHeading(line);
    if (heading) {
      const headingType = `heading${heading.level}` as ElementType;
      elements.push({
        type: headingType,
        content: cleanContent(heading.content, shouldRemoveAiMarks, shouldAutoCorrect),
        level: heading.level
      });
      i++;
      continue;
    }
    
    // Bullet list detection
    if (isBulletPoint(line)) {
      const items: string[] = [];
      while (i < lines.length && isBulletPoint(lines[i])) {
        const itemContent = lines[i].trim().replace(/^[•\-\*▪▸►◆◇→●○■□▶]\s*/, '');
        items.push(cleanContent(itemContent, shouldRemoveAiMarks, shouldAutoCorrect));
        i++;
      }
      elements.push({
        type: 'bullet-list',
        content: '',
        items
      });
      continue;
    }
    
    // Numbered list detection
    if (isNumberedList(line)) {
      const items: string[] = [];
      while (i < lines.length && isNumberedList(lines[i])) {
        const itemContent = lines[i].trim().replace(/^\d+[.\)]\s*/, '');
        items.push(cleanContent(itemContent, shouldRemoveAiMarks, shouldAutoCorrect));
        i++;
      }
      elements.push({
        type: 'numbered-list',
        content: '',
        items
      });
      continue;
    }
    
    // Blockquote detection
    if (isBlockquote(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && isBlockquote(lines[i])) {
        const quoteContent = lines[i].trim().replace(/^>\s*/, '');
        quoteLines.push(cleanContent(quoteContent, shouldRemoveAiMarks, shouldAutoCorrect));
        i++;
      }
      elements.push({
        type: 'blockquote',
        content: quoteLines.join('\n')
      });
      continue;
    }
    
    // Regular paragraph - preserve spacing
    const spacing = preserveSpacing(line);
    const rawWithoutIndent = line.slice(spacing.length);
    let content = rawWithoutIndent;
    
    content = cleanContent(content, shouldRemoveAiMarks, shouldAutoCorrect);
    
    // Preserve leading whitespace for indentation.
    if (spacing) {
      content = spacing + content;
    }
    
    elements.push({
      type: 'paragraph',
      content: content,
      originalSpacing: spacing
    });
    i++;
  }
  
  return elements;
}

export function getCleanTextForTranslation(text: string, options: ParseOptions = {}): string {
  const shouldRemoveAiMarks = options.removeAiMarks ?? false;
  const shouldAutoCorrect = options.autoCorrect ?? false;

  return text
    .split('\n')
    .filter((line) => !(shouldRemoveAiMarks && isAiDisclaimerLine(line.trim())))
    .map((line) => {
      if (!line.trim()) return '';
      return cleanContent(line, shouldRemoveAiMarks, shouldAutoCorrect);
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Check if text contains tables
export function hasTable(text: string): boolean {
  const lines = text.split('\n');
  let pipeCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (isTableLine(trimmed) && !isTableSeparatorLine(trimmed)) {
      pipeCount++;
      if (pipeCount >= 1) return true;
    }
    if (trimmed === '') pipeCount = 0;
  }
  return false;
}

// Extract table lines from text
export function extractTableLines(text: string): { tableLines: string[]; nonTableLines: string[] } {
  const lines = text.split('\n');
  const tableLines: string[] = [];
  const nonTableLines: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      inTable = false;
      nonTableLines.push(line);
      continue;
    }

    if (isTableLine(trimmed) && !isTableSeparatorLine(trimmed)) {
      inTable = true;
      tableLines.push(line);
    } else if (isTableSeparatorLine(trimmed) && inTable) {
      tableLines.push(line);
    } else if (inTable && !isTableLine(trimmed)) {
      inTable = false;
      nonTableLines.push(line);
    } else {
      nonTableLines.push(line);
    }
  }

  return { tableLines, nonTableLines };
}

// Convert table lines to structured format for translation
export function convertTableForTranslation(tableLines: string[]): string[][] {
  const rows: string[][] = [];

  for (const line of tableLines) {
    const trimmed = line.trim();
    if (isTableSeparatorLine(trimmed)) continue;

    let cleanLine = trimmed;
    if (cleanLine.startsWith('|')) cleanLine = cleanLine.slice(1);
    if (cleanLine.endsWith('|')) cleanLine = cleanLine.slice(0, -1);

    const cells = cleanLine.split('|').map(cell => cell.trim());
    rows.push(cells);
  }

  return rows;
}

// Convert translated rows back to table format
export function convertTranslatedTable(rows: string[][]): string {
  // Find max columns
  const maxCols = Math.max(...rows.map(row => row.length));

  // Build table string with proper pipe formatting
  const lines: string[] = [];

  rows.forEach((row, index) => {
    // Pad row with empty cells if needed
    const paddedRow = [...row];
    while (paddedRow.length < maxCols) {
      paddedRow.push('');
    }
    lines.push('| ' + paddedRow.map(cell => cell || ' ').join(' | ') + ' |');

    // Add separator after header row (first row)
    if (index === 0) {
      const separator = Array(maxCols).fill('---').join(' | ');
      lines.push('| ' + separator + ' |');
    }
  });

  return lines.join('\n');
}
