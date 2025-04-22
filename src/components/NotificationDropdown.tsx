'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { getNotifications, DirectusNotification, markNotificationAsRead } from '@/lib/directus';
import { useClient } from '@/hooks/useClient';
import { constants } from 'buffer';


const NotificationDropdown = () => {
    const { user } = useAuth();
    const [reload, setReload] = useState(false);
    const { client } = useClient(user?.id || '');
    const [notifications, setNotifications] = useState<DirectusNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Count unread notifications
    //const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const userNotifications = await getNotifications(client?.id || '');
                setNotifications(userNotifications);
                setUnreadCount(userNotifications.filter(n => !n.read).length);
                console.log('Fetched notifications:', userNotifications);
            }
            catch (error) {
                console.error('Error fetching notifications:', error);
            }
            finally { }

        }
        fetchNotifications();
    }, [client?.id, isOpen, reload]);

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
            const response = await markNotificationAsRead(id);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
        finally {
            setReload(!reload);
        }
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
                    <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            No notifications yet
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-200">
                                {notifications.map((notification) => (
                                    console.log('Conv:', notification.conversation),
                                    <Link
                                        href={notification.conversation !== null ? '/conversations' : `/users/${client?.id}`}
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition duration-150 ease-in-out ${!notification.read ? 'bg-blue-50' : ''
                                            }`}
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
                                    className="block w-full text-center text-xs text-blue-600 hover:text-blue-800 py-2"
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