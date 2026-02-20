"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageSquare, Workflow } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange: (count: number) => void;
}

interface NotificationItem {
  id: string;
  type: 'deal' | 'flow' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface ApiItem {
  id: string;
  title: string;
  status: string | null;
  updatedAt: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('flowryd_read_notifications');
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading read notifications:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const [dealsResponse, flowsResponse] = await Promise.all([
        fetch('/api/deals'),
        fetch('/api/flows')
      ]);

      const dealsJson = dealsResponse.ok ? await dealsResponse.json() : { data: [] };
      const flowsJson = flowsResponse.ok ? await flowsResponse.json() : { data: [] };

      const dealItems: ApiItem[] = dealsJson.data ?? [];
      const flowItems: ApiItem[] = flowsJson.data ?? [];

      const allNotifications: NotificationItem[] = [];

      dealItems.forEach((deal) => {
        allNotifications.push({
          id: `deal-${deal.id}`,
          type: 'deal',
          title: `Deal activity: ${deal.title}`,
          description: `Status: ${deal.status ?? 'draft'}`,
          timestamp: new Date(deal.updatedAt),
          isRead: false
        });
      });

      flowItems.forEach((flow) => {
        allNotifications.push({
          id: `flow-${flow.id}`,
          type: 'flow',
          title: `Flow updated: ${flow.title}`,
          description: `Status: ${flow.status ?? 'draft'}`,
          timestamp: new Date(flow.updatedAt),
          isRead: false
        });
      });

      allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const recentNotifications = allNotifications.slice(0, 15);

      const notificationsWithReadStatus = recentNotifications.map(notification => ({
        ...notification,
        isRead: readIds.includes(notification.id)
      }));

      setNotifications(notificationsWithReadStatus);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isOpen, readIds]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    onCountChange(unreadCount);
  }, [notifications, onCountChange]);

  const markAsRead = useCallback((notificationId: string) => {
    if (readIds.includes(notificationId)) return;

    const newReadIds = [...readIds, notificationId];
    setReadIds(newReadIds);
    
    try {
      localStorage.setItem('flowryd_read_notifications', JSON.stringify(newReadIds));
    } catch (error) {
      console.error('Error saving read notifications:', error);
    }

    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  }, [readIds]);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    const newReadIds = [...new Set([...readIds, ...allIds])];
    setReadIds(newReadIds);
    
    try {
      localStorage.setItem('flowryd_read_notifications', JSON.stringify(newReadIds));
    } catch (error) {
      console.error('Error saving read notifications:', error);
    }

    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, [notifications, readIds]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const renderTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'deal':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500/10">
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
        );
      case 'flow':
        return (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/10">
            <Workflow className="w-4 h-4 text-emerald-400" />
          </div>
        );
      case 'system':
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
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors"
                  >
                    Mark all as read
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
                  <div className="text-xs text-white/30">You&apos;re all caught up</div>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`flex items-start gap-3 p-4 border-b border-white/[0.04] cursor-pointer transition-colors hover:bg-white/[0.03] ${
                        !notification.isRead ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      {renderTypeIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white/80 truncate">
                          {notification.title}
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5 truncate">
                          {notification.description}
                        </div>
                        <div className="text-[9px] text-white/20 mt-1 font-mono">
                          {timeAgo(notification.timestamp)}
                        </div>
                      </div>

                      {!notification.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 border-t border-white/[0.06] text-center">
                <div className="text-[9px] text-white/20">Showing recent activity</div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

