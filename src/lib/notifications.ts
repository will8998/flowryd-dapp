import { db } from '@/db';
import { notifications } from '@/db/schema';
import type { NewNotification } from '@/db/schema';

export interface CreateNotificationData {
  type: string;
  title: string;
  body?: string;
  link?: string;
}

/**
 * Create a notification for a specific user
 */
export async function createNotification(userId: string, data: CreateNotificationData): Promise<void> {
  try {
    await db.insert(notifications).values({
      userId,
      type: data.type,
      title: data.title,
      body: data.body,
      link: data.link,
      read: false,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(userIds: string[], data: CreateNotificationData): Promise<void> {
  try {
    const notificationRecords: NewNotification[] = userIds.map(userId => ({
      userId,
      type: data.type,
      title: data.title,
      body: data.body,
      link: data.link,
      read: false,
    }));

    await db.insert(notifications).values(notificationRecords);
  } catch (error) {
    console.error('Failed to create notifications for users:', error);
    throw error;
  }
}

/**
 * Notification type constants for consistency
 */
export const NOTIFICATION_TYPES = {
  DEAL_UPDATE: 'deal_update',
  MESSAGE: 'message',
  PARTICIPANT_JOINED: 'participant_joined',
  FLOW_PUBLISHED: 'flow_published',
  SYSTEM: 'system',
} as const;

/**
 * Helper functions for creating specific types of notifications
 */
export const NotificationHelpers = {
  /**
   * Create a deal update notification
   */
  dealUpdate: (userId: string, dealTitle: string, dealId: string, action: string) =>
    createNotification(userId, {
      type: NOTIFICATION_TYPES.DEAL_UPDATE,
      title: `Deal ${action}: ${dealTitle}`,
      body: `The deal "${dealTitle}" has been ${action.toLowerCase()}`,
      link: `/deals/${dealId}`,
    }),

  /**
   * Create a new message notification
   */
  newMessage: (userId: string, dealTitle: string, dealId: string, senderName: string) =>
    createNotification(userId, {
      type: NOTIFICATION_TYPES.MESSAGE,
      title: `New message in ${dealTitle}`,
      body: `${senderName} sent a message`,
      link: `/deals/${dealId}`,
    }),

  /**
   * Create a participant joined notification
   */
  participantJoined: (userId: string, participantName: string, dealTitle: string, dealId: string) =>
    createNotification(userId, {
      type: NOTIFICATION_TYPES.PARTICIPANT_JOINED,
      title: `${participantName} joined ${dealTitle}`,
      body: `A new participant has joined the deal`,
      link: `/deals/${dealId}`,
    }),

  /**
   * Create a flow published notification
   */
  flowPublished: (userId: string, flowTitle: string, flowId: string) =>
    createNotification(userId, {
      type: NOTIFICATION_TYPES.FLOW_PUBLISHED,
      title: `Flow published: ${flowTitle}`,
      body: `Your flow "${flowTitle}" has been published`,
      link: `/flows/${flowId}`,
    }),

  /**
   * Create a system notification
   */
  system: (userId: string, title: string, body?: string, link?: string) =>
    createNotification(userId, {
      type: NOTIFICATION_TYPES.SYSTEM,
      title,
      body,
      link,
    }),
};

/**
 * Batch notification helpers for multiple users
 */
export const BatchNotificationHelpers = {
  /**
   * Notify all deal participants about an update
   */
  dealUpdateForParticipants: (userIds: string[], dealTitle: string, dealId: string, action: string) =>
    createNotificationsForUsers(userIds, {
      type: NOTIFICATION_TYPES.DEAL_UPDATE,
      title: `Deal ${action}: ${dealTitle}`,
      body: `The deal "${dealTitle}" has been ${action.toLowerCase()}`,
      link: `/deals/${dealId}`,
    }),

  /**
   * Notify all deal participants about a new message (except sender)
   */
  newMessageForParticipants: (userIds: string[], dealTitle: string, dealId: string, senderName: string) =>
    createNotificationsForUsers(userIds, {
      type: NOTIFICATION_TYPES.MESSAGE,
      title: `New message in ${dealTitle}`,
      body: `${senderName} sent a message`,
      link: `/deals/${dealId}`,
    }),

  /**
   * Send system notifications to multiple users
   */
  systemForUsers: (userIds: string[], title: string, body?: string, link?: string) =>
    createNotificationsForUsers(userIds, {
      type: NOTIFICATION_TYPES.SYSTEM,
      title,
      body,
      link,
    }),
};