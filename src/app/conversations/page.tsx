"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    DirectusClientUser,
    DirectusConversation,
    DirectusMessage,
    getUserConversations,
    getConversationMessages,
    sendMessage,
    getCurrentUser,
    getAssetURL,
    getOrCreateClient,
} from "@/lib/directus";
import Link from "next/link";
import Image from "next/image";
import { format, set } from "date-fns";
import { DirectusClient } from "@directus/sdk";
import { useClient } from "@/hooks/useClient";
import { useUserConversations } from "@/hooks/useUserConversations";
import { useConversationMessages } from "@/hooks/useConversationMessages";
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';

export default function Conversations() {
    const { user } = useAuth();
    // const [conversations, setConversations] = useState<DirectusConversation[]>([])
    const [selectedConversation, setSelectedConversation] =
        useState<DirectusConversation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [refreshMessages, setRefreshMessages] = useState(true);
    const {
        client,
        loading: clientLoading,
        error: clientError,
    } = useClient(user?.id || "");
    const {
        conversations,
        loading: conversationsLoading,
        error: conversationsError,
    } = useUserConversations(user?.id || "");
    const {
        messages: persistedMessages,
        loading: messagesLoading,
        error: messagesError,
    } = useConversationMessages(selectedConversation?.id || "", refreshMessages);

    //coming from notifDropdown
    const searchParams = useSearchParams();
    const selectedConversationIdParam = searchParams.get("selectedConversationId");
    useEffect(() => {
        if (selectedConversationIdParam && conversations.length > 0) {
            // Try adding console.log with more detailed type information
            console.log("Selected ID (type):", selectedConversationIdParam, typeof selectedConversationIdParam);
            console.log("Conversation ID (type):", conversations[1].id, typeof conversations[1].id);

            const targetConversation = conversations.find(conv => String(conv.id) === selectedConversationIdParam);
            console.log("Target Conversation:", targetConversation);
            if (targetConversation) {
                setSelectedConversation(targetConversation);
            }
        }
    }, [selectedConversationIdParam, conversations]);

    // ALBY
    const {
        messages: realTimeMessages,
        sendMessage: sendRealTimeMessage,
        error: realTimeError,
        isConnected,
        reconnectAttempts,
        maxReconnectAttempts,
    } = useRealTimeMessages(selectedConversation?.id || '');

    // Merge persisted and real-time messages, removing duplicates
    const allMessages = [...persistedMessages, ...realTimeMessages]
        .filter((message, index, self) =>
            index === self.findIndex((m) => m.id === message.id)
        )
        .sort((a, b) =>
            new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
        );


    useEffect(() => {
        console.log("Conversations changed");
        if (conversations.length > 0 && !selectedConversation) {
            setSelectedConversation(conversations[0]);
        }
    }, [conversations, selectedConversation]);

    useEffect(() => {
        setTimeout(() => {
            const messageContainer = document.getElementById("message-container");
            if (messageContainer) {
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        }, 100);
    }, [allMessages]);

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedConversation || !client) return;

        try {
            setSending(true);
            setError(null);

            // Send message through real-time system
            if (!isConnected) {
                throw new Error("Real-time connection not available. Please try again.");
            }

            sendRealTimeMessage(newMessage.trim(), client.id);

            // Also send through Directus for persistence
            await sendMessage({
                conversation: selectedConversation.id,
                sender: client.id,
                message: newMessage.trim(),
            });

            setNewMessage("");
        } catch (err) {
            console.error("Failed to send message:", err);
            setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    // Get the other user in the conversation (not the current user)
    const getOtherUser = (conversation: DirectusConversation) => {
        if (!user) return null;
        return conversation.user_1.id === client?.id
            ? conversation.user_2
            : conversation.user_1;
    };

    if (
        clientLoading ||
        conversationsLoading
    ) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Page Header */}
            <div className="bg-gray-900 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold">Messages</h1>
                    <p className="mt-2 text-gray-300">
                        Chat with gear owners and renters
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row h-[calc(100vh-250px)] bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Conversations List (Left Side) */}
                    <div className="w-full md:w-1/4 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="font-semibold text-lg text-gray-800">
                                Your Conversations
                            </h2>
                        </div>

                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-6 text-center h-32">
                                <p className="text-gray-500">No conversations yet</p>
                                <Link
                                    href="/gear"
                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                    Browse Gear
                                </Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {conversations.map((conversation) => {
                                    const otherUser = getOtherUser(conversation);
                                    console.log("Other User:", otherUser?.first_name);
                                    return (
                                        <li key={conversation.id}>
                                            <button
                                                className={`w-full text-left p-4 hover:bg-gray-100 transition-colors ${selectedConversation?.id === conversation.id
                                                    ? "bg-gray-100"
                                                    : ""
                                                    }`}
                                                onClick={() => setSelectedConversation(conversation)}
                                            >
                                                <div className="flex items-center mb-1">
                                                    <span className="font-medium text-gray-900">
                                                        {otherUser
                                                            ? `${otherUser.first_name} ${otherUser.last_name}`
                                                            : "Unknown User"}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {conversation.gear_listing
                                                        ? conversation.gear_listing.title
                                                        : "No gear listing"}
                                                </p>
                                                {/* <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(conversation.created_at), 'MMM d, yyyy')}
                        </p> */}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    {/* Conversation Box (Right Side) */}
                    {(conversations.length !== 0 && messagesLoading) ? (
                        <div className="flex justify-center md:w-3/4 items-center h-full w-full">
                            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                    ) :
                        (<div className="w-full md:w-3/4 flex flex-col">
                            {conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                                        No conversations yet
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Start a conversation by browsing gear and making a rental
                                        request.
                                    </p>
                                    <Link
                                        href="/gear"
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Browse Gear
                                    </Link>
                                </div>
                            ) : selectedConversation ? (
                                <>
                                    {/* Conversation Header */}
                                    <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {getOtherUser(selectedConversation)
                                                    ? `${getOtherUser(selectedConversation)?.first_name ?? ""
                                                    } ${getOtherUser(selectedConversation)?.last_name ?? ""
                                                    }`
                                                    : "Unknown User"}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {selectedConversation.gear_listing
                                                    ? `About: ${selectedConversation.gear_listing.title}`
                                                    : "No gear listing"}
                                            </p>
                                        </div>

                                        {selectedConversation.gear_listing && (
                                            <Link
                                                href={`/gear/${selectedConversation.gear_listing.id}`}
                                                className="ml-auto text-sm text-green-600 hover:text-green-700"
                                            >
                                                View Listing
                                            </Link>
                                        )}
                                    </div>

                                    {/* Messages */}
                                    <div
                                        id="message-container"
                                        className="flex-1 p-6 overflow-y-auto bg-gray-50"
                                    >
                                        {allMessages.length === 0 ? (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-500">
                                                    No messages yet. Start the conversation!
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {allMessages.map((message) => {
                                                    const isCurrentUser = message.sender.id === client?.id;
                                                    return (
                                                        <div
                                                            key={message.id}
                                                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                                                        >
                                                            <div
                                                                className={`max-w-[75%] px-4 py-3 rounded-lg ${isCurrentUser
                                                                    ? "bg-green-600 text-white"
                                                                    : "bg-white border border-gray-200 text-gray-800"
                                                                    }`}
                                                            >
                                                                <p>{message.message}</p>
                                                                <p
                                                                    className={`text-xs mt-1 ${isCurrentUser
                                                                        ? "text-green-200"
                                                                        : "text-gray-500"
                                                                        }`}
                                                                >
                                                                    {format(
                                                                        new Date(message.date_created),
                                                                        "MMM d, h:mm a"
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <div className="px-4 py-4 bg-white border-t border-gray-200">
                                        <form onSubmit={handleSendMessage} className="flex">
                                            <input
                                                type="text"
                                                placeholder="Type your message..."
                                                className="flex-1 rounded-l-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                disabled={sending}
                                            />
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                disabled={sending || !newMessage.trim()}
                                            >
                                                {sending ? "Sending..." : "Send"}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center p-8">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            Select a conversation
                                        </h3>
                                        <p className="text-gray-500">
                                            Choose a conversation from the list to view messages
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>)}
                </div>

                {/* Connection Status */}
                {!isConnected && (
                    <div className="mb-4">
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm">
                                        {reconnectAttempts > 0
                                            ? `Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`
                                            : "Real-time connection is not available. Messages may be delayed."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mb-4">
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm">{error}</p>
                                </div>
                                <div className="ml-auto pl-3">
                                    <button
                                        onClick={() => setError(null)}
                                        className="text-red-700 hover:text-red-500"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
