import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType, convertInchesToTwip } from 'docx';
import { jsPDF } from 'jspdf';
import { ParsedElement } from './textParser';

export async function generateWordDocument(
  elements: ParsedElement[],
  fontSize: number,
  fontFamily: string
): Promise<void> {
  const children: (Paragraph | Table)[] = [];
  
  for (const element of elements) {
    switch (element.type) {
      case 'heading1':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content,
                bold: true,
                size: (fontSize + 8) * 2,
                font: fontFamily,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          })
        );
        break;

      case 'heading2':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content,
                bold: true,
                size: (fontSize + 4) * 2,
                font: fontFamily,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
        break;

      case 'heading3':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content,
                bold: true,
                size: (fontSize + 2) * 2,
                font: fontFamily,
              }),
            ],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 },
          })
        );
        break;

      case 'paragraph':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content,
                size: fontSize * 2,
                font: fontFamily,
              }),
            ],
            spacing: { after: 120 },
          })
        );
        break;

      case 'empty-line':
        children.push(
          new Paragraph({
            children: [],
            spacing: { after: 120 },
          })
        );
        break;

      case 'bullet-list':
        if (element.items) {
          for (const item of element.items) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: item,
                    size: fontSize * 2,
                    font: fontFamily,
                  }),
                ],
                bullet: { level: 0 },
                spacing: { after: 60 },
              })
            );
          }
        }
        break;

      case 'numbered-list':
        if (element.items) {
          for (let idx = 0; idx < element.items.length; idx++) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${idx + 1}. ${element.items[idx]}`,
                    size: fontSize * 2,
                    font: fontFamily,
                  }),
                ],
                spacing: { after: 60 },
              })
            );
          }
        }
        break;

      case 'code-block':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content,
                size: (fontSize - 1) * 2,
                font: 'Courier New',
              }),
            ],
            spacing: { before: 120, after: 120 },
            shading: { fill: 'f5f5f5' },
          })
        );
        break;

      case 'blockquote':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content,
                size: fontSize * 2,
                font: fontFamily,
                italics: true,
              }),
            ],
            spacing: { before: 120, after: 120 },
            indent: { left: convertInchesToTwip(0.5) },
          })
        );
        break;

      case 'table':
        if (element.rows && element.rows.length > 0) {
          const tableRows = element.rows.map((row) => {
            return new TableRow({
              children: row.cells.map((cell) => {
                return new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell.content,
                          bold: cell.isHeader,
                          size: fontSize * 2,
                          font: fontFamily,
                        }),
                      ],
                      alignment: AlignmentType.LEFT,
                    }),
                  ],
                  shading: cell.isHeader ? { fill: 'e0e0e0' } : undefined,
                });
              }),
            });
          });

          children.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
              },
            })
          );
          
          // Add spacing after table
          children.push(new Paragraph({ children: [], spacing: { after: 120 } }));
        }
        break;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'aura-text-document.docx';
  link.click();
  URL.revokeObjectURL(url);
}

export function generatePDF(
  elements: ParsedElement[],
  fontSize: number,
  _fontFamily: string
): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  const lineHeight = fontSize * 0.5;

  const addNewPageIfNeeded = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  const setFont = (style: 'normal' | 'bold' | 'italic' = 'normal', size: number = fontSize) => {
    pdf.setFontSize(size);
    if (style === 'bold') {
      pdf.setFont('helvetica', 'bold');
    } else if (style === 'italic') {
      pdf.setFont('helvetica', 'italic');
    } else {
      pdf.setFont('helvetica', 'normal');
    }
  };

  for (const element of elements) {
    switch (element.type) {
      case 'heading1':
        addNewPageIfNeeded(lineHeight * 2);
        setFont('bold', fontSize + 6);
        pdf.text(element.content, margin, y);
        y += lineHeight * 2;
        break;

      case 'heading2':
        addNewPageIfNeeded(lineHeight * 1.8);
        setFont('bold', fontSize + 4);
        pdf.text(element.content, margin, y);
        y += lineHeight * 1.8;
        break;

      case 'heading3':
        addNewPageIfNeeded(lineHeight * 1.5);
        setFont('bold', fontSize + 2);
        pdf.text(element.content, margin, y);
        y += lineHeight * 1.5;
        break;

      case 'paragraph':
        setFont('normal', fontSize);
        const lines = pdf.splitTextToSize(element.content, contentWidth);
        for (const line of lines) {
          addNewPageIfNeeded(lineHeight);
          pdf.text(line, margin, y);
          y += lineHeight;
        }
        y += lineHeight * 0.5;
        break;

      case 'empty-line':
        y += lineHeight;
        break;

      case 'bullet-list':
        if (element.items) {
          setFont('normal', fontSize);
          for (const item of element.items) {
            const bulletLines = pdf.splitTextToSize(`• ${item}`, contentWidth - 5);
            for (let i = 0; i < bulletLines.length; i++) {
              addNewPageIfNeeded(lineHeight);
              pdf.text(bulletLines[i], margin + (i === 0 ? 0 : 5), y);
              y += lineHeight;
            }
          }
          y += lineHeight * 0.3;
        }
        break;

      case 'numbered-list':
        if (element.items) {
          setFont('normal', fontSize);
          for (let idx = 0; idx < element.items.length; idx++) {
            const numLines = pdf.splitTextToSize(`${idx + 1}. ${element.items[idx]}`, contentWidth - 5);
            for (let i = 0; i < numLines.length; i++) {
              addNewPageIfNeeded(lineHeight);
              pdf.text(numLines[i], margin + (i === 0 ? 0 : 5), y);
              y += lineHeight;
            }
          }
          y += lineHeight * 0.3;
        }
        break;

      case 'code-block':
        setFont('normal', fontSize - 1);
        pdf.setFillColor(245, 245, 245);
        const codeLines = element.content.split('\n');
        const codeHeight = codeLines.length * lineHeight + 4;
        addNewPageIfNeeded(codeHeight);
        pdf.rect(margin, y - 3, contentWidth, codeHeight, 'F');
        for (const codeLine of codeLines) {
          pdf.text(codeLine, margin + 2, y);
          y += lineHeight;
        }
        y += lineHeight * 0.5;
        break;

      case 'blockquote':
        setFont('italic', fontSize);
        pdf.setDrawColor(200);
        const quoteLines = pdf.splitTextToSize(element.content, contentWidth - 10);
        addNewPageIfNeeded(quoteLines.length * lineHeight + 4);
        pdf.line(margin, y - 3, margin, y + quoteLines.length * lineHeight);
        for (const quoteLine of quoteLines) {
          pdf.text(quoteLine, margin + 5, y);
          y += lineHeight;
        }
        y += lineHeight * 0.5;
        break;

      case 'table':
        if (element.rows && element.rows.length > 0) {
          setFont('normal', fontSize);
          const numCols = element.rows[0].cells.length;
          const colWidth = contentWidth / numCols;
          const cellPadding = 2;
          const cellHeight = lineHeight + 4;

          for (const row of element.rows) {
            addNewPageIfNeeded(cellHeight);
            
            for (let colIdx = 0; colIdx < row.cells.length; colIdx++) {
              const cell = row.cells[colIdx];
              const x = margin + colIdx * colWidth;
              
              // Draw cell background for headers
              if (cell.isHeader) {
                pdf.setFillColor(230, 230, 230);
                pdf.rect(x, y - lineHeight, colWidth, cellHeight, 'F');
                setFont('bold', fontSize);
              } else {
                setFont('normal', fontSize);
              }
              
              // Draw cell border
              pdf.setDrawColor(100);
              pdf.rect(x, y - lineHeight, colWidth, cellHeight, 'S');
              
              // Draw cell text
              const cellText = pdf.splitTextToSize(cell.content, colWidth - cellPadding * 2);
              pdf.text(cellText[0] || '', x + cellPadding, y - 2);
            }
            y += cellHeight;
          }
          y += lineHeight * 0.5;
        }
        break;
    }
  }

  pdf.save('aura-text-document.pdf');
}
