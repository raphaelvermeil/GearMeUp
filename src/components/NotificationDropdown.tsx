'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { getNotifications, DirectusNotification, markNotificationAsRead } from '@/lib/directus';
import { useClient } from '@/hooks/useClient';
import { subscribeToMessages, getChannelInstance } from '@/lib/ably';

const NotificationDropdown = () => {
    const { user } = useAuth();
    const [reload, setReload] = useState(false);
    const { client } = useClient(user?.id || '');
    const [notifications, setNotifications] = useState<DirectusNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Fetch notifications from the server
    const fetchNotifications = useCallback(async () => {
        if (!client?.id || reload === null) return;

        try {
            const userNotifications = await getNotifications(client.id);
            setNotifications(userNotifications);
            console.log('Fetched notifications:', userNotifications);
            setUnreadCount(userNotifications.filter(n => !n.read).length);
            console.log('Fetched notifications:', userNotifications);
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [client?.id, reload]);

    // Set up Ably subscription for real-time notifications
    useEffect(() => {
        if (!client?.id) return;

        const notificationChannelId = `notifications:${client.id}`;

        const setupSubscription = async () => {
            try {
                // Unsubscribe from previous subscription if exists
                if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                    unsubscribeRef.current = null;
                }

                // Subscribe to the notifications channel
                const unsubscribe = await subscribeToMessages(notificationChannelId, (message) => {
                    console.log('Received notification update:', message);
                    // Refresh notifications when a new one is received
                    fetchNotifications();
                });

                unsubscribeRef.current = unsubscribe;
            } catch (error) {
                console.error('Error setting up notification subscription:', error);
            }
        };

        setupSubscription();

        // Initial fetch
        fetchNotifications();

        return () => {
            // Clean up subscription on unmount
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [client?.id, fetchNotifications]);

    // Refresh notifications when dropdown is opened or reload state changes
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications, reload]);

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Mark notification as read
    const markAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);
            setReload(!reload); // Trigger a reload to update the notification list
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // problem
    const problem = (notification: DirectusNotification) => {
        console.log('Problem with notification:', notification);
        console.log('Notification owner:', notification.request?.owner);
        console.log(String(notification.request?.owner).trim() === String(client?.id||'').trim());
        console.log(String(notification.request?.owner).trim() === String(client?.id||'').trim());

        return true;
    };

    // Handle click on notification
    const handleNotificationClick = (id: string) => {
        markAsRead(id);
        setIsOpen(false);
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell icon with notification badge */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-1 text-gray-700 hover:text-gray-900 focus:outline-none"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-800">Notifications</h3>
                        <button
                            onClick={() => {
                                notifications.forEach((notification) => markAsRead(notification.id));
                            }}
                            className="text-xs text-green-600 hover:text-green-800 transition-colors font-medium px-2 py-1 rounded hover:bg-green-50"
                        >
                            Mark all as read
                        </button>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            No notifications yet
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-200">
                                {notifications.map((notification) => (
                                    
                                    <Link
                                        href={notification.conversation !== null
                                            ? `/conversations?selectedConversationId=${notification.conversation?.id}`
                                            : `/users/${client?.id}?requestId=${notification.request?.id}&role=${(String(notification.request?.owner).trim() === String(client?.id||'').trim()) ? 'owner': 'renter'}`}//
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition duration-150 ease-in-out ${!notification.read ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex justify-between">
                                            <p className={`text-sm ${!notification.read ? 'font-medium' : 'text-gray-600'}`}>
                                                {notification.conversation !== null ? 'New message!' : 'Update on rental!'}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(notification.date_created)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-1">
                                <button
                                    onClick={() => {
                                        notifications.forEach((notification) => markAsRead(notification.id));
                                    }}
                                    className="text-xs text-green-600 hover:text-green-800 transition-colors font-medium px-2 py-1 rounded hover:bg-green-50"
                                >
                                    Mark all as read
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;