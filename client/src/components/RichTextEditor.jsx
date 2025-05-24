import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import PropTypes from 'prop-types';

const RichTextEditor = ({ value, onChange, placeholder, maxLength }) => {
  const editorRef = useRef(null);

  const handleEditorChange = (content) => {
    // 移除HTML标签以计算纯文本长度
    const plainText = content.replace(/<[^>]+>/g, '');
    
    if (plainText.length <= maxLength) {
      onChange(content);
    } else {
      // 如果超出长度限制，回退到上一个有效内容
      editorRef.current.setContent(value);
    }
  };

  return (
    <Editor
      apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
      onInit={(evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={handleEditorChange}
      init={{
        height: 300,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        placeholder: placeholder,
        max_chars: maxLength,
        setup: (editor) => {
          editor.on('keyup', () => {
            const content = editor.getContent();
            const plainText = content.replace(/<[^>]+>/g, '');
            if (plainText.length > maxLength) {
              editor.setContent(value);
            }
          });
        }
      }}
    />
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number
};

RichTextEditor.defaultProps = {
  value: '',
  placeholder: 'What\'s happening?',
  maxLength: 280
};

export default RichTextEditor; 