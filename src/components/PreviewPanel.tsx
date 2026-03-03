import { ParsedElement } from '../utils/textParser';
import { FileSearch } from 'lucide-react';

interface PreviewPanelProps {
  elements: ParsedElement[];
  fontSize: number;
  fontFamily: string;
  isConverted: boolean;
}

function PreviewPanel({ elements, fontSize, fontFamily, isConverted }: PreviewPanelProps) {
  if (!isConverted || elements.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center p-8 bg-slate-900/30">
        <div className="text-center flex flex-col items-center max-w-sm">
          <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-slate-700/50">
            <FileSearch className="w-8 h-8 text-sky-400 opacity-80" />
          </div>
          <h3 className="text-slate-200 font-semibold mb-3 text-lg">Document Preview</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Paste your AI-generated text and enable real-time preview to see your formatted, professional document output here.
          </p>
        </div>
      </div>
    );
  }

  const renderElement = (element: ParsedElement, index: number) => {
    const baseStyle: React.CSSProperties = {
      fontFamily: fontFamily,
      fontSize: `${fontSize}pt`,
      lineHeight: '1.6',
      color: '#1e293b', // slate-800 instead of harsh black
    };

    switch (element.type) {
      case 'heading1':
        return (
          <h1
            key={index}
            style={{ 
              ...baseStyle, 
              fontSize: `${fontSize + 8}pt`,
              fontWeight: '700',
              marginBottom: '16px',
              marginTop: index === 0 ? '0' : '24px',
              color: '#0f172a', // slate-900
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '8px',
            }}
          >
            {element.content}
          </h1>
        );

      case 'heading2':
        return (
          <h2
            key={index}
            style={{ 
              ...baseStyle, 
              fontSize: `${fontSize + 4}pt`,
              fontWeight: '600',
              marginBottom: '12px',
              marginTop: index === 0 ? '0' : '20px',
              color: '#0f172a',
            }}
          >
            {element.content}
          </h2>
        );

      case 'heading3':
        return (
          <h3
            key={index}
            style={{ 
              ...baseStyle, 
              fontSize: `${fontSize + 2}pt`,
              fontWeight: '600',
              marginBottom: '10px',
              marginTop: index === 0 ? '0' : '16px',
              color: '#334155', // slate-700
            }}
          >
            {element.content}
          </h3>
        );

      case 'paragraph':
        return (
          <p
            key={index}
            style={{
              ...baseStyle,
              marginBottom: '8px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          >
            {element.content || '\u00A0'}
          </p>
        );

      case 'empty-line':
        return (
          <div 
            key={index} 
            style={{ 
              ...baseStyle,
              height: `${fontSize}pt`,
              minHeight: '16px',
            }} 
          >
            &nbsp;
          </div>
        );

      case 'bullet-list':
        return (
          <ul 
            key={index} 
            style={{ 
              ...baseStyle,
              marginLeft: '24px',
              marginBottom: '12px',
              listStyleType: 'disc',
            }}
          >
            {element.items?.map((item, idx) => (
              <li 
                key={idx} 
                style={{ 
                  marginBottom: '6px',
                  color: '#1e293b',
                  paddingLeft: '4px',
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        );

      case 'numbered-list':
        return (
          <ol 
            key={index} 
            style={{ 
              ...baseStyle,
              marginLeft: '24px',
              marginBottom: '12px',
              listStyleType: 'decimal',
            }}
          >
            {element.items?.map((item, idx) => (
              <li 
                key={idx} 
                style={{ 
                  marginBottom: '6px',
                  color: '#1e293b',
                  paddingLeft: '4px',
                }}
              >
                {item}
              </li>
            ))}
          </ol>
        );

      case 'code-block':
        return (
          <pre
            key={index}
            style={{
              fontFamily: '"Fira Code", "Courier New", monospace',
              fontSize: `${fontSize - 1}pt`,
              backgroundColor: '#f8fafc', // slate-50
              border: '1px solid #e2e8f0', // slate-200
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '12px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              color: '#334155', // slate-700
            }}
          >
            <code>{element.content}</code>
          </pre>
        );

      case 'blockquote':
        return (
          <blockquote
            key={index}
            style={{
              ...baseStyle,
              borderLeft: '4px solid #94a3b8', // slate-400
              marginLeft: '0',
              marginBottom: '12px',
              backgroundColor: '#f8fafc', // slate-50
              padding: '12px 16px',
              borderRadius: '0 6px 6px 0',
              fontStyle: 'italic',
              color: '#475569', // slate-600
            }}
          >
            {element.content}
          </blockquote>
        );

      case 'table':
        if (!element.rows || element.rows.length === 0) return null;
        return (
          <div key={index} style={{ marginBottom: '20px', overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: fontFamily,
                fontSize: `${fontSize}pt`,
                backgroundColor: '#ffffff',
              }}
            >
              <tbody>
                {element.rows.map((row, rowIdx) => (
                  <tr 
                    key={rowIdx}
                    style={{
                      borderBottom: rowIdx === (element.rows?.length ?? 0) - 1 ? 'none' : '1px solid #e2e8f0',
                      backgroundColor: row.cells[0]?.isHeader ? '#f1f5f9' : '#ffffff', // slate-100 for header
                    }}
                  >
                    {row.cells.map((cell, cellIdx) => (
                      cell.isHeader ? (
                        <th
                          key={cellIdx}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#0f172a',
                            borderRight: cellIdx === row.cells.length - 1 ? 'none' : '1px solid #e2e8f0',
                          }}
                        >
                          {cell.content}
                        </th>
                      ) : (
                        <td
                          key={cellIdx}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            color: '#1e293b',
                            borderRight: cellIdx === row.cells.length - 1 ? 'none' : '1px solid #e2e8f0',
                          }}
                        >
                          {cell.content}
                        </td>
                      )
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="h-[600px] overflow-y-auto bg-slate-900/50 p-4 sm:p-8"
    >
      {/* Document paper simulation */}
      <div 
        className="mx-auto max-w-[850px] transition-all duration-300"
        style={{
          backgroundColor: '#ffffff',
          minHeight: '100%',
          padding: '48px 64px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
          borderRadius: '4px',
          fontFamily: fontFamily,
        }}
      >
        {elements.map((element, index) => renderElement(element, index))}
      </div>
    </div>
  );
}

export default PreviewPanel;
