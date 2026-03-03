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

export async function generatePDF(
  elements: ParsedElement[],
  fontSize: number,
  fontFamily: string
): Promise<void> {
  try {
    const html2canvas = (await import('html2canvas')).default;

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // A4 width at 96 DPI
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '48px 64px';
    container.style.fontFamily = fontFamily || 'Arial, sans-serif';
    container.style.color = '#1e293b';
    container.style.boxSizing = 'border-box';

    const escapeHtml = (unsafe: string) => {
      return (unsafe || '')
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    let htmlContent = '';
    const baseStyle = `font-family: ${fontFamily}; font-size: ${fontSize}pt; line-height: 1.6;`;

    elements.forEach((element, index) => {
      switch (element.type) {
        case 'heading1':
          htmlContent += `<h1 style="${baseStyle} font-size: ${fontSize + 8}pt; font-weight: 700; margin-bottom: 16px; margin-top: ${index === 0 ? '0' : '24px'}; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; color: #0f172a;">${escapeHtml(element.content)}</h1>`;
          break;
        case 'heading2':
          htmlContent += `<h2 style="${baseStyle} font-size: ${fontSize + 4}pt; font-weight: 600; margin-bottom: 12px; margin-top: ${index === 0 ? '0' : '20px'}; color: #0f172a;">${escapeHtml(element.content)}</h2>`;
          break;
        case 'heading3':
          htmlContent += `<h3 style="${baseStyle} font-size: ${fontSize + 2}pt; font-weight: 600; margin-bottom: 10px; margin-top: ${index === 0 ? '0' : '16px'}; color: #334155;">${escapeHtml(element.content)}</h3>`;
          break;
        case 'paragraph':
          htmlContent += `<p style="${baseStyle} margin-bottom: 8px; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(element.content) || '&nbsp;'}</p>`;
          break;
        case 'empty-line':
          htmlContent += `<div style="${baseStyle} height: ${fontSize}pt; min-height: 16px;">&nbsp;</div>`;
          break;
        case 'bullet-list':
          if (element.items) {
            htmlContent += `<ul style="${baseStyle} margin-left: 24px; margin-bottom: 12px; list-style-type: disc;">`;
            element.items.forEach(item => {
              htmlContent += `<li style="margin-bottom: 6px; color: #1e293b; padding-left: 4px;">${escapeHtml(item)}</li>`;
            });
            htmlContent += `</ul>`;
          }
          break;
        case 'numbered-list':
          if (element.items) {
            htmlContent += `<ol style="${baseStyle} margin-left: 24px; margin-bottom: 12px; list-style-type: decimal;">`;
            element.items.forEach(item => {
              htmlContent += `<li style="margin-bottom: 6px; color: #1e293b; padding-left: 4px;">${escapeHtml(item)}</li>`;
            });
            htmlContent += `</ol>`;
          }
          break;
        case 'code-block':
          htmlContent += `<pre style="font-family: 'Fira Code', 'Courier New', monospace; font-size: ${fontSize - 1}pt; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 12px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; color: #334155;"><code>${escapeHtml(element.content)}</code></pre>`;
          break;
        case 'blockquote':
          htmlContent += `<blockquote style="${baseStyle} border-left: 4px solid #94a3b8; margin-left: 0; margin-bottom: 12px; background-color: #f8fafc; padding: 12px 16px; border-radius: 0 6px 6px 0; font-style: italic; color: #475569;">${escapeHtml(element.content)}</blockquote>`;
          break;
        case 'table':
          if (element.rows && element.rows.length > 0) {
            htmlContent += `<div style="margin-bottom: 20px; overflow-x: auto; border-radius: 6px; border: 1px solid #e2e8f0;">
              <table style="width: 100%; border-collapse: collapse; font-family: ${fontFamily}; font-size: ${fontSize}pt; background-color: #ffffff;"><tbody>`;
            element.rows.forEach((row, rowIdx) => {
              const numRows = element.rows?.length || 0;
              const borderBottom = rowIdx === numRows - 1 ? 'none' : '1px solid #e2e8f0';
              const bg = row.cells[0]?.isHeader ? '#f1f5f9' : '#ffffff';
              htmlContent += `<tr style="border-bottom: ${borderBottom}; background-color: ${bg};">`;
              row.cells.forEach((cell, cellIdx) => {
                const borderRight = cellIdx === row.cells.length - 1 ? 'none' : '1px solid #e2e8f0';
                if (cell.isHeader) {
                  htmlContent += `<th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #0f172a; border-right: ${borderRight};">${escapeHtml(cell.content)}</th>`;
                } else {
                  htmlContent += `<td style="padding: 12px 16px; text-align: left; color: #1e293b; border-right: ${borderRight};">${escapeHtml(cell.content)}</td>`;
                }
              });
              htmlContent += `</tr>`;
            });
            htmlContent += `</tbody></table></div>`;
          }
          break;
      }
    });

    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Wait for fonts/styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(container, {
      scale: 2, // High quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Additional pages
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save('aura-text-document.pdf');
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('An error occurred while generating the PDF. Please try again.');
  }
}

