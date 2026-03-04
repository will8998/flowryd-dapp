"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToPDF, ExportColumn, PDFExportOptions } from '@/lib/export-utils';

interface ExportDropdownProps {
  data: Record<string, unknown>[];
  filename: string;
  columns: ExportColumn[];
  title: string;
  className?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  data,
  filename,
  columns,
  title,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    exportToCSV(data, filename, columns);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    const pdfOptions: PDFExportOptions = {
      title,
      columns,
      orientation: 'landscape'
    };
    exportToPDF(data, filename, pdfOptions);
    setIsOpen(false);
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-white/30 text-white rounded text-[10px] font-bold tracking-wide hover:border-white/50 hover:bg-white/5 transition-colors"
      >
        <Download className="w-3 h-3" />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-900 border border-white/10 rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export as CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};