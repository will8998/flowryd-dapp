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
    } catch (error) {
      setFilePreview(prev => prev ? { ...prev, error: 'Upload failed', isUploading: false } : null);
      return null;
    }
  };

  const handleSend = async () => {
    if (isSending || (!message.trim() && !filePreview) || !canSendMessages) return;

    setIsSending(true);
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
          }
        }
      } else if (message.trim()) {
        await sendMessage(message.trim());
        setMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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
      <div className="p-6">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[20px] p-4 text-center">
          <p className="text-white/40 text-sm">You don&apos;t have permission to send messages in this deal room.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AnimatePresence>
        {filePreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{filePreview.file.name}</p>
                  <p className="text-[10px] text-white/40">{formatFileSize(filePreview.file.size)}</p>
                  
                  {filePreview.isUploading && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-[10px] text-white/60">
                        <span>Uploading {filePreview.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${filePreview.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {filePreview.error && (
                    <div className="flex items-center gap-1 mt-1 text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      <p className="text-[10px]">{filePreview.error}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={removeFilePreview}
                  disabled={filePreview.isUploading}
                  className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-[20px] p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full bg-transparent text-white text-sm placeholder-white/40 resize-none border-none outline-none"
              rows={1}
              disabled={isSending}
            />
          </div>
          
          <div className="flex items-end gap-2">
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
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <button
              onClick={handleSend}
              disabled={isSending || (!message.trim() && !filePreview) || !!filePreview?.error}
              className="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="w-3 h-3 border border-black/20 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}