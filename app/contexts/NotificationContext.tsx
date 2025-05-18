import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useAuth } from "./AuthContext";

export interface Notice {
  id: number;
  content: string;
  createAt: string;
  read: boolean;
  type: string;
}

interface NotificationContextType {
  notices: Notice[];
  unreadCount: number;
  fetchNotices: () => void;
  markAsRead: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notices: [],
  unreadCount: 0,
  fetchNotices: () => {},
  markAsRead: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken, user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);

  const fetchNotices = useCallback(async () => {
    if (!user) return;
    const token = getToken();
    const res = await fetch(
      `http://localhost:8080/education/api/notices/user/${user.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (data.code === 1000) setNotices(data.result);
  }, [getToken, user]);

  // WebSocket setup
  useEffect(() => {
    if (!user) return;
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/notice/${user.id}`, () => {
          fetchNotices();
        });
      },
    });
    stompClient.activate();
    return () => {
      stompClient.deactivate();
    };
  }, [user, fetchNotices]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const markAsRead = async (id: number) => {
    const token = getToken();
    await fetch(
      `http://localhost:8080/education/api/notices/${id}/read`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notices.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notices, unreadCount, fetchNotices, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};