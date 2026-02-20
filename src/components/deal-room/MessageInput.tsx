"use client";

import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, FileText, AlertCircle } from 'lucide-react';
import { useCantonAuth } from '@/lib/auth-context';
import { hasPermission } from '@/lib/auth/rbac';
import { useMessages } from '@/hooks/use-deals';

interface MessageInputProps {
  dealId: string;
}

interface FilePreview {
  file: File;
  url: string;
  isUploading: boolean;
  progress: number;
  error?: string;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/json',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function MessageInput({ dealId }: MessageInputProps) {
  const { user } = useCantonAuth();
  const { sendMessage } = useMessages(dealId);
  
  const [message, setMessage] = useState('');
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSendMessages = user && hasPermission(user.role, 'deal.send_message');
  const canUploadFiles = user && hasPermission(user.role, 'deal.upload_file');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'File type not allowed. Please use PDF, JSON, TXT, CSV, images, XLSX, or DOCX files.';
    }
    
    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFilePreview({
        file,
        url: '',
        isUploading: false,
        progress: 0,
        error
      });
      return;
    }

    setFilePreview({
      file,
      url: URL.createObjectURL(file),
      isUploading: false,
      progress: 0
    });
  };

  const uploadFile = async (file: File): Promise<{ fileUrl: string; fileName: string; fileSize: number } | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setFilePreview(prev => prev ? { ...prev, isUploading: true, progress: 0 } : null);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setFilePreview(prev => prev ? { ...prev, progress } : null);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve({
                fileUrl: response.data?.fileUrl || '',
                fileName: file.name,
                fileSize: file.size
              });
            } catch {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `/api/deals/${dealId}/files`);
        xhr.send(formData);
      });
    } catch {
      setFilePreview(prev => prev ? { ...prev, error: 'Upload failed', isUploading: false } : null);
      return null;
    }
  };

  const handleSend = async () => {
    if (isSending || (!message.trim() && !filePreview) || !canSendMessages) return;

    setIsSending(true);
    setSendError(null);
    
    try {
      if (filePreview && !filePreview.error) {
        const fileData = await uploadFile(filePreview.file);
        if (fileData) {
          const res = await fetch(`/api/deals/${dealId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: message.trim() || '',
              contentType: 'file',
              fileUrl: fileData.fileUrl,
              fileName: fileData.fileName,
              fileSize: fileData.fileSize
            }),
          });
          
          if (res.ok) {
            setMessage('');
            setFilePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          } else {
            setSendError('Failed to send file message');
            setTimeout(() => setSendError(null), 3000);
          }
        } else {
          setSendError('File upload failed');
          setTimeout(() => setSendError(null), 3000);
        }
      } else if (message.trim()) {
        const result = await sendMessage(message.trim());
        if (result) {
          setMessage('');
        } else {
          setSendError('Failed to send message');
          setTimeout(() => setSendError(null), 3000);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setSendError('Failed to send message');
      setTimeout(() => setSendError(null), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeFilePreview = () => {
    if (filePreview?.url) {
      URL.revokeObjectURL(filePreview.url);
    }
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  if (!canSendMessages) {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] text-white/25 text-center">Read-only — you don&apos;t have permission to send messages</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <AnimatePresence>
        {filePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <FileText className="w-3.5 h-3.5 text-white/60 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white/70 truncate">{filePreview.file.name}</p>
                {filePreview.isUploading && (
                  <div className="w-full bg-white/5 rounded-full h-0.5 mt-1">
                    <div
                      className="bg-white/70 h-0.5 rounded-full transition-all duration-300"
                      style={{ width: `${filePreview.progress}%` }}
                    />
                  </div>
                )}
                {filePreview.error && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                    <p className="text-[9px] text-red-400">{filePreview.error}</p>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-white/25">{formatFileSize(filePreview.file.size)}</span>
              <button
                onClick={removeFilePreview}
                disabled={filePreview.isUploading}
                className="p-1 text-white/30 hover:text-white/60 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 bg-white/[0.02] border border-white/[0.06] rounded px-3 py-2.5 focus-within:border-white/10 transition-colors">
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full bg-transparent text-[13px] text-white/80 placeholder-white/25 resize-none border-none outline-none leading-relaxed"
            rows={1}
            disabled={isSending}
          />
        </div>

        {canUploadFiles && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.json,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.xlsx,.docx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || !!filePreview}
              className="p-1.5 text-white/25 hover:text-white/50 transition-colors disabled:opacity-30"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={isSending || (!message.trim() && !filePreview) || !!filePreview?.error}
          className="w-7 h-7 rounded border border-white/30 text-white flex items-center justify-center hover:border-white/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          {isSending ? (
            <div className="w-3 h-3 border border-black/20 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {sendError && (
        <p className="text-[9px] text-red-400/60 font-mono px-4 pb-1">{sendError}</p>
      )}
    </div>
  );
}