"use client";

import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  File, 
  Download, 
  Upload, 
  Image, 
  FileSpreadsheet,
  FileCode,
  Archive,
  Video,
  Music,
  Paperclip
} from 'lucide-react';

interface Message {
  id: string;
  dealId: string;
  threadId: string | null;
  senderId: string;
  content: string;
  contentType: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isEdited: boolean | null;
  createdAt: string;
  senderDisplayName: string | null;
  senderPartyId: string | null;
}

interface FilesSidebarProps {
  messages: Message[];
  dealId: string;
  onFileUploaded: () => void;
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileIcon = (fileName: string | null) => {
  if (!fileName) return FileText;
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
      return Image;
    case 'pdf':
      return FileText;
    case 'doc':
    case 'docx':
      return FileText;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return FileSpreadsheet;
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
    case 'html':
    case 'css':
    case 'json':
    case 'xml':
      return FileCode;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return Archive;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'mkv':
    case 'webm':
      return Video;
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
      return Music;
    default:
      return File;
  }
};

const isImageFile = (fileName: string | null) => {
  if (!fileName) return false;
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext || '');
};

export default function FilesSidebar({ messages, dealId, onFileUploaded }: FilesSidebarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const files = useMemo(() => {
    return messages
      .filter(msg => (msg.contentType === 'file' || msg.fileUrl) && msg.fileUrl && msg.fileName)
      .map(msg => ({
        id: msg.id,
        name: msg.fileName!,
        url: msg.fileUrl!,
        size: msg.fileSize,
        uploadedBy: msg.senderDisplayName || msg.senderPartyId || 'Unknown',
        uploadedAt: msg.createdAt,
        isImage: isImageFile(msg.fileName),
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [messages]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/deals/${dealId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        onFileUploaded();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-white/5">
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-white/70 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
        >
          {isUploading ? (
            <>
              <div className="w-3 h-3 border border-white/30 border-t-transparent rounded-full animate-spin" />
              UPLOADING...
            </>
          ) : (
            <>
              <Upload className="w-3 h-3" />
              UPLOAD FILE
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {files.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-3">
                <Paperclip className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-[11px] text-white/30">No files uploaded</p>
              <p className="text-[9px] text-white/15 mt-0.5">Upload files to share with participants</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => {
              const Icon = getFileIcon(file.name);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white/[0.01] border border-white/5 rounded p-3 hover:bg-white/[0.02] hover:border-white/10 transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-white/60" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-[11px] font-medium text-white/80 truncate leading-tight">
                          {file.name}
                        </h4>
                        <button
                          onClick={() => handleDownload(file.url, file.name)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all shrink-0"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[8px] text-white/30">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className="truncate">{file.uploadedBy}</span>
                        <span>•</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                      </div>

                      {file.isImage && (
                        <div className="mt-2">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="max-w-full h-auto max-h-32 rounded border border-white/10 object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}