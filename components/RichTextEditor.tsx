import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bold, List, ListOrdered, Heading2, Code } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  hideLabel?: boolean;
}

type FormatType = 'bold' | 'h2' | 'ul' | 'ol' | 'code';

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter product description...',
  minHeight = 'min-h-[300px]',
  label,
  hideLabel = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize editor on mount only
  useEffect(() => {
    setIsMounted(true);
    
    // Only set HTML if editorRef exists and value is not empty
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    }

    // Cleanup function
    return () => {
      setIsMounted(false);
      // Clear editor reference on unmount to prevent removeChild errors
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    };
  }, []);

  // Sync external value changes to editor (for editing existing products)
  useEffect(() => {
    if (editorRef.current && isMounted && !isEditing && value) {
      // Only update if content is actually different
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value, isMounted, isEditing]);

  const handleEditorChange = useCallback(() => {
    if (editorRef.current && isMounted) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange, isMounted]);

  const applyFormat = useCallback((format: FormatType) => {
    if (!isMounted || !editorRef.current) return;

    // Ensure editor has focus before applying format
    editorRef.current.focus();
    
    switch (format) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'h2':
        document.execCommand('formatBlock', false, 'h2');
        break;
      case 'code':
        document.execCommand('formatBlock', false, 'pre');
        break;
      case 'ul':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'ol':
        document.execCommand('insertOrderedList', false);
        break;
    }
    
    editorRef.current?.focus();
    handleEditorChange();
  }, [isMounted, handleEditorChange]);

  const ToolButton = ({ 
    icon: Icon, 
    title, 
    onClick, 
    isActive = false 
  }: { 
    icon: React.ComponentType<{ size: number }>;
    title: string;
    onClick: () => void;
    isActive?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded border transition ${
        isActive 
          ? 'bg-purple-100 border-purple-300 text-purple-700' 
          : 'border-gray-300 text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
    </button>
  );

  const handleFormatChange = useCallback((blockFormat: string) => {
    if (!isMounted || !editorRef.current) return;
    
    editorRef.current.focus();
    document.execCommand('formatBlock', false, blockFormat);
    handleEditorChange();
  }, [isMounted, handleEditorChange]);

  const handleSizeChange = useCallback((fontSize: string) => {
    if (!isMounted || !editorRef.current) return;
    
    editorRef.current.focus();
    document.execCommand('fontSize', false, fontSize);
    handleEditorChange();
  }, [isMounted, handleEditorChange]);

  return (
    <div className="space-y-2">
      {!hideLabel && <label className="text-sm font-medium text-gray-700">{label || 'Product Description'}</label>}
      
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 bg-gray-50 border border-gray-300 rounded-t-lg">
        <select 
          className="px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
          onChange={(e) => {
            if (e.target.value) {
              handleFormatChange(e.target.value);
              e.target.value = '';
            }
          }}
        >
          <option value="">Format</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="pre">Code</option>
        </select>

        <div className="w-px bg-gray-300"></div>

        <select 
          className="px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
          onChange={(e) => {
            if (e.target.value) {
              handleSizeChange(e.target.value);
              e.target.value = '';
            }
          }}
        >
          <option value="">Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Extra Large</option>
        </select>

        <div className="w-px bg-gray-300"></div>

        <ToolButton icon={Bold} title="Bold (Ctrl+B)" onClick={() => applyFormat('bold')} />

        <div className="w-px bg-gray-300"></div>

        <ToolButton icon={Heading2} title="Heading 2" onClick={() => applyFormat('h2')} />
        <ToolButton icon={List} title="Bullet List" onClick={() => applyFormat('ul')} />
        <ToolButton icon={ListOrdered} title="Numbered List" onClick={() => applyFormat('ol')} />

        <div className="w-px bg-gray-300"></div>

        <ToolButton icon={Code} title="Code Block" onClick={() => applyFormat('code')} />
      </div>

      {/* Editor Container */}
      <div className="relative">
        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorChange}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className={`w-full px-4 py-3 border ${
            isEditing ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-300'
          } rounded-b-lg focus:outline-none transition ${minHeight} bg-white prose prose-sm max-w-none overflow-auto`}
          style={{
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            outline: 'none'
          }}
          data-placeholder={placeholder}
        />
      </div>

      {/* Global styles for placeholder - injected once */}
      <style dangerouslySetInnerHTML={{
        __html: `
          div[data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
        `
      }} />
      {/* Help text */}
      <p className="text-xs text-gray-500 mt-2">
        💡 Tip: Use the toolbar above to format your text with bold, headings, lists, and code blocks!
      </p>
    </div>
  );
};

export default RichTextEditor;
