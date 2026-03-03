"use client";

import React, { useState, useRef, KeyboardEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, FileText, AlertCircle, Upload, AtSign } from 'lucide-react';
import { useCantonAuth } from '@/lib/auth-context';
import { hasPermission } from '@/lib/auth/rbac';
import { useMessages } from '@/hooks/use-deals';
import { authFetch } from '@/lib/auth-fetch';
import { templateParticipants as _templateParticipants } from '@/lib/canton-templates-data';

interface Participant {
  id: string;
  userId: string;
  displayName: string | null;
  partyId: string | null;
  role: string | null;
}

interface MessageInputProps {
  dealId: string;
  participants?: Participant[];
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


interface TypingUser {
  userId: string;
  displayName: string;
  timestamp: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function MessageInput({ dealId, participants = [] }: MessageInputProps) {
  const { user } = useCantonAuth();
  const { sendMessage } = useMessages(dealId);
  
  const [message, setMessage] = useState('');
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [_typingUsers, _setTypingUsers] = useState<TypingUser[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  // Enhanced functionality
  const getTypingUsers = (): TypingUser[] => {
    // TODO: Wire to SSE typing events when implemented
    return [];
  };

  const handleMentionSearch = (query: string) => {
    if (!query) return [];
    return participants.filter(p => 
      (p.displayName?.toLowerCase().includes(query.toLowerCase())) ||
      (p.partyId?.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5);
  };

  const insertMention = (participant: Participant) => {
    const mentionText = `@${participant.displayName || participant.partyId}`;
    const beforeCursor = message.substring(0, mentionPosition);
    const afterCursor = message.substring(textareaRef.current?.selectionStart || 0);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    const newMessage = beforeCursor.substring(0, lastAtIndex) + mentionText + ' ' + afterCursor;
    
    setMessage(newMessage);
    setShowMentions(false);
    setMentionQuery('');
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPosition = lastAtIndex + mentionText.length + 1;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const error = validateFile(file);
      if (error) {
        setFilePreview({
          file,
          url: '',
          isUploading: false,
          progress: 0,
          error
        });
      } else {
        setFilePreview({
          file,
          url: URL.createObjectURL(file),
          isUploading: false,
          progress: 0
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          const res = await authFetch(`/api/deals/${dealId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: message.trim() || 'File shared',
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
      if (!showMentions) {
        handleSend();
      }
    }
    
    // Handle mention navigation
    if (showMentions) {
      if (e.key === 'Escape') {
        setShowMentions(false);
        setMentionQuery('');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    setMessage(value);
    
    // Check for @ mentions
    const beforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    const lastSpaceIndex = beforeCursor.lastIndexOf(' ');
    
    if (lastAtIndex > lastSpaceIndex && lastAtIndex !== -1) {
      const query = beforeCursor.substring(lastAtIndex + 1);
      if (query.length >= 0 && !query.includes(' ')) {
        setMentionQuery(query);
        setMentionPosition(lastAtIndex);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
    
    adjustTextareaHeight();
  };

  const currentTypingUsers = getTypingUsers();

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
    <div className="relative">
      {/* Typing Indicator */}
      <AnimatePresence>
        {currentTypingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 border-b border-white/5 bg-white/[0.01] overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-1 h-1 bg-white/40 rounded-full"
                  />
                ))}
              </div>
              <span className="text-[9px] text-white/40 font-mono">
                {currentTypingUsers.length === 1
                  ? `${currentTypingUsers[0].displayName} is typing...`
                  : `${currentTypingUsers.length} people are typing...`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Main Input Area with Drag and Drop */}
        <div
          className={`relative flex items-end gap-2 bg-white/[0.02] border rounded-lg px-3 py-2.5 transition-all duration-200 ${
            isDragOver
              ? 'border-blue-400/50 bg-blue-500/5'
              : 'border-white/[0.06] focus-within:border-white/10'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag Overlay */}
          <AnimatePresence>
            {isDragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400/50 rounded-lg flex items-center justify-center z-10"
              >
                <div className="flex items-center gap-2 text-blue-400">
                  <Upload className="w-4 h-4" />
                  <span className="text-[12px] font-medium">Drop file to upload</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (@mention, Shift+Enter for newline)"
              className="w-full bg-transparent text-[13px] text-white/80 placeholder-white/25 resize-none border-none outline-none leading-relaxed"
              rows={1}
              disabled={isSending}
            />

            {/* @Mentions Dropdown */}
            <AnimatePresence>
              {showMentions && (
                <motion.div
                  ref={mentionsRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-20 min-w-[200px] max-w-[300px]"
                >
                  <div className="p-2">
                    <div className="flex items-center gap-2 px-2 py-1 mb-1 border-b border-white/10">
                      <AtSign className="w-3 h-3 text-white/40" />
                      <span className="text-[8px] font-bold text-white/40 tracking-wide">MENTION</span>
                    </div>
                    {handleMentionSearch(mentionQuery).map((participant, _index) => (
                      <button
                        key={participant.id}
                        onClick={() => insertMention(participant)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                          <span className="text-[8px] font-bold text-white/60">
                            {(participant.displayName || participant.partyId || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-white/80 truncate">
                            {participant.displayName || participant.partyId || 'Unknown'}
                          </p>
                          {participant.role && (
                            <p className="text-[8px] text-white/40 font-mono">
                              {participant.role}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                    {handleMentionSearch(mentionQuery).length === 0 && (
                      <div className="px-2 py-2 text-[10px] text-white/30 text-center">
                        No participants found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* File Upload Button */}
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
                className="p-1.5 text-white/25 hover:text-white/50 transition-colors disabled:opacity-30 group"
              >
                <Paperclip className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          )}

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isSending || (!message.trim() && !filePreview) || !!filePreview?.error}
            className="w-7 h-7 rounded border border-white/30 text-white flex items-center justify-center hover:border-white/50 hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            {isSending ? (
              <div className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </motion.button>
        </div>

        {sendError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[9px] text-red-400/60 font-mono px-2 pt-2"
          >
            {sendError}
          </motion.p>
        )}
      </div>
    </div>
  );
}