import { ParsedElement } from '../utils/textParser';

interface PreviewPanelProps {
  elements: ParsedElement[];
  fontSize: number;
  fontFamily: string;
  isConverted: boolean;
}

function PreviewPanel({ elements, fontSize, fontFamily, isConverted }: PreviewPanelProps) {
  if (!isConverted || elements.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-gray-400 font-medium mb-2">Document Preview</h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Paste your AI text and enable real-time preview to see formatted output here.
          </p>
        </div>
      </div>
    );
  }

  const renderElement = (element: ParsedElement, index: number) => {
    const baseStyle: React.CSSProperties = {
      fontFamily: fontFamily,
      fontSize: `${fontSize}pt`,
      lineHeight: '1.5',
      color: '#000000',
    };

    switch (element.type) {
      case 'heading1':
        return (
          <h1
            key={index}
            style={{ 
              ...baseStyle, 
              fontSize: `${fontSize + 8}pt`,
              fontWeight: 'bold',
              marginBottom: '12px',
              marginTop: index === 0 ? '0' : '16px',
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
              fontWeight: 'bold',
              marginBottom: '10px',
              marginTop: index === 0 ? '0' : '14px',
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
              fontWeight: 'bold',
              marginBottom: '8px',
              marginTop: index === 0 ? '0' : '12px',
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
              marginBottom: '4px',
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
              minHeight: '12px',
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
              marginLeft: '20px',
              marginBottom: '8px',
              listStyleType: 'disc',
              paddingLeft: '10px',
            }}
          >
            {element.items?.map((item, idx) => (
              <li 
                key={idx} 
                style={{ 
                  marginBottom: '4px',
                  color: '#000000',
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
              marginLeft: '20px',
              marginBottom: '8px',
              listStyleType: 'decimal',
              paddingLeft: '10px',
            }}
          >
            {element.items?.map((item, idx) => (
              <li 
                key={idx} 
                style={{ 
                  marginBottom: '4px',
                  color: '#000000',
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
              fontFamily: 'Courier New, monospace',
              fontSize: `${fontSize - 1}pt`,
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '8px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              color: '#333333',
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
              borderLeft: '4px solid #ccc',
              paddingLeft: '16px',
              marginLeft: '0',
              marginBottom: '8px',
              backgroundColor: '#fafafa',
              padding: '12px 12px 12px 20px',
              borderRadius: '0 4px 4px 0',
              fontStyle: 'italic',
              color: '#555555',
            }}
          >
            {element.content}
          </blockquote>
        );

      case 'table':
        if (!element.rows || element.rows.length === 0) return null;
        return (
          <div key={index} style={{ marginBottom: '16px', overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: fontFamily,
                fontSize: `${fontSize}pt`,
              }}
            >
              <tbody>
                {element.rows.map((row, rowIdx) => (
                  <tr 
                    key={rowIdx}
                    style={{
                      backgroundColor: row.cells[0]?.isHeader ? '#f0f0f0' : '#ffffff',
                    }}
                  >
                    {row.cells.map((cell, cellIdx) => (
                      cell.isHeader ? (
                        <th
                          key={cellIdx}
                          style={{
                            border: '1px solid #333333',
                            padding: '8px 12px',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            backgroundColor: '#e8e8e8',
                            color: '#000000',
                          }}
                        >
                          {cell.content}
                        </th>
                      ) : (
                        <td
                          key={cellIdx}
                          style={{
                            border: '1px solid #333333',
                            padding: '8px 12px',
                            textAlign: 'left',
                            color: '#000000',
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
      className="h-[600px] overflow-y-auto bg-gray-700"
      style={{ padding: '8px' }}
    >
      {/* Document paper simulation */}
      <div 
        style={{
          backgroundColor: '#ffffff',
          minHeight: '100%',
          padding: '40px 50px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          fontFamily: fontFamily,
        }}
      >
        {elements.map((element, index) => renderElement(element, index))}
      </div>
    </div>
  );
}

export default PreviewPanel;
