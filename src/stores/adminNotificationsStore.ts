import { create } from 'zustand';

interface AdminNotificationsState {
  supportRequestsUnread: number;
  commentsUnread: number;
  usersUnread: number;
  processedSupportRequestIds: Record<string, true>;
  processedCommentIds: Record<string, true>;
  processedUserIds: Record<string, true>;
}

interface AdminNotificationsActions {
  registerSupportRequestNotification: (requestId: string) => boolean;
  registerCommentNotification: (commentId: string) => boolean;
  registerUserNotification: (userId: string) => boolean;
  clearSupportRequestsUnread: () => void;
  clearCommentsUnread: () => void;
  clearUsersUnread: () => void;
}

type AdminNotificationsStore = AdminNotificationsState & AdminNotificationsActions;

export const useAdminNotificationsStore = create<AdminNotificationsStore>()((set) => ({
  supportRequestsUnread: 0,
  commentsUnread: 0,
  usersUnread: 0,
  processedSupportRequestIds: {},
  processedCommentIds: {},
  processedUserIds: {},

  registerSupportRequestNotification: (requestId) => {
    let isNew = false;
    set((state) => {
      if (state.processedSupportRequestIds[requestId]) {
        return state;
      }

      isNew = true;
      return {
        supportRequestsUnread: state.supportRequestsUnread + 1,
        processedSupportRequestIds: {
          ...state.processedSupportRequestIds,
          [requestId]: true,
        },
      };
    });

    return isNew;
  },

  registerCommentNotification: (commentId) => {
    let isNew = false;
    set((state) => {
      if (state.processedCommentIds[commentId]) {
        return state;
      }

      isNew = true;
      return {
        commentsUnread: state.commentsUnread + 1,
        processedCommentIds: {
          ...state.processedCommentIds,
          [commentId]: true,
        },
      };
    });

    return isNew;
  },

  registerUserNotification: (userId) => {
    let isNew = false;
    set((state) => {
      if (state.processedUserIds[userId]) {
        return state;
      }

      isNew = true;
      return {
        usersUnread: state.usersUnread + 1,
        processedUserIds: {
          ...state.processedUserIds,
          [userId]: true,
        },
      };
    });

    return isNew;
  },

  clearSupportRequestsUnread: () =>
    set({
      supportRequestsUnread: 0,
    }),

  clearCommentsUnread: () =>
    set({
      commentsUnread: 0,
    }),

  clearUsersUnread: () =>
    set({
      usersUnread: 0,
    }),
}));
