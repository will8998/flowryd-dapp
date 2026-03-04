"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, MessageSquare, Workflow, CheckCheck, User, AlertCircle } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange: (count: number) => void;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const response = await authFetch('/api/notifications?limit=15');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isOpen]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await authFetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        const count = data.data?.unreadCount || 0;
        setUnreadCount(count);
        onCountChange(count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await authFetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await authFetch('/api/notifications/read-all', {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [fetchUnreadCount]);

  const handleNotificationClick = useCallback((notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      window.location.href = notification.link;
    }
  }, [markAsRead]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'deal_update':
      case 'message':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500/10">
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
        );
      case 'flow_published':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/10">
            <Workflow className="w-4 h-4 text-emerald-400" />
          </div>
        );
      case 'participant_joined':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-500/10">
            <User className="w-4 h-4 text-purple-400" />
          </div>
        );
      case 'system':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-500/10">
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10">
            <Bell className="w-4 h-4 text-white/40" />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[55]"
            onClick={handleBackdropClick}
          />
          
          <div className="absolute right-0 top-full mt-2 z-[56] w-96">
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", duration: 0.25, bounce: 0.1 }}
              className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[16px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-12 flex items-center justify-center">
                  <div className="text-xs text-white/40">Loading...</div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Bell className="w-8 h-8 text-white/10 mb-3" />
                  <div className="text-xs text-white/30">All caught up!</div>
                  <div className="text-[10px] text-white/20 mt-1">No new notifications</div>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start gap-3 p-4 border-b border-white/[0.04] cursor-pointer transition-colors hover:bg-white/[0.03] ${
                        !notification.read ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      {renderTypeIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white/80 truncate">
                          {notification.title}
                        </div>
                        {notification.body && (
                          <div className="text-[10px] text-white/40 mt-0.5 truncate">
                            {notification.body}
                          </div>
                        )}
                        <div className="text-[9px] text-white/20 mt-1 font-mono">
                          {timeAgo(notification.createdAt)}
                        </div>
                      </div>

                      {!notification.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 border-t border-white/[0.06] text-center">
                <div className="text-[9px] text-white/20">Updates every 30 seconds</div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};