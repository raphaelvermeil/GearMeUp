'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'
import {
    DirectusClientUser,
    DirectusConversation,
    DirectusMessage,
    getUserConversations,
    getConversationMessages,
    sendMessage,
    getCurrentUser,
    getAssetURL,
    getOrCreateClient
} from '@/lib/directus'
import Link from 'next/link'
import Image from 'next/image'
import { format, set } from 'date-fns'
import { DirectusClient } from '@directus/sdk';
import { useClient } from '@/hooks/useClient';
import { useUserConversations } from '@/hooks/useUserConversations';
import { useConversationMessages } from '@/hooks/useConversationMessages';

export default function Conversations() {
    const { user } = useAuth()
    // const [conversations, setConversations] = useState<DirectusConversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<DirectusConversation | null>(null)
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sending, setSending] = useState(false)
    const [refreshMessages, setRefreshMessages] = useState(true);
    const { client, loading: clientLoading, error: clientError } = useClient(user?.id || '')
    const { conversations, loading: conversationsLoading, error: conversationsError } = useUserConversations(user?.id || '')
    const { messages, loading: messagesLoading, error: messagesError } = useConversationMessages(selectedConversation?.id || '',refreshMessages)
    //const [messages, setMessages] = useState<DirectusMessage[]>([])
    //setLoading(conversationsLoading || clientLoading)

    useEffect(() => {
        console.log('Conversations changed')
        if (conversations.length > 0 && !selectedConversation) {
            setSelectedConversation(conversations[0])
        }
    }, [conversations])

    // Fetch messages when selected conversation changes
    // useEffect(() => {
    //     console.log('Selected conversation changed:')

    //     const fetchMessages = async () => {
    //         if (!selectedConversation) {
    //             console.log('no selected conv when fetching');
    //             return
    //         }

    //         try {
    //             const conversationMessages = await getConversationMessages(selectedConversation.id)
    //             console.log('Fetched messages:', conversationMessages)
    //             setMessages(conversationMessages)
    //             // Scroll to bottom of messages

    //         } catch (err) {
    //             console.error('Failed to fetch messages:', err)
    //             setError('Failed to load messages. Please try again later.')
    //         }
    //     }
    //     fetchMessages()
    // }, [selectedConversation])
    useEffect(() => {
        setTimeout(() => {
            const messageContainer = document.getElementById('message-container')
            if (messageContainer) {
                messageContainer.scrollTop = messageContainer.scrollHeight
            }
        }, 100)
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!newMessage.trim() || !selectedConversation || !client) return

        try {
            setSending(true)
            console.log('Sending message:', newMessage.trim())
            console.log('Selected conversation:', selectedConversation.id)
            console.log('Client ID:', client.id)
            await sendMessage({
                conversation: selectedConversation.id,
                sender: client.id,
                message: newMessage.trim()
            })

            // Refresh messages
            setRefreshMessages((prev) => !prev)

            // Clear input
            setNewMessage('')

            // Scroll to bottom
            setTimeout(() => {
                const messageContainer = document.getElementById('message-container')
                if (messageContainer) {
                    messageContainer.scrollTop = messageContainer.scrollHeight
                }
            }, 100)
        } catch (err) {
            console.error('Failed to send message:', err)
            setError('Failed to send message. Please try again.')
        } finally {
            setSending(false)
        }
    }

    // Get the other user in the conversation (not the current user)
    const getOtherUser = (conversation: DirectusConversation) => {
        if (!user) return null
        return conversation.user_1.id === client?.id ? conversation.user_2 : conversation.user_1
    }

    if (loading && conversations.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Page Header */}
            <div className="bg-gray-900 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold">Messages</h1>
                    <p className="mt-2 text-gray-300">Chat with gear owners and renters</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row h-[calc(100vh-250px)] bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Conversations List (Left Side) */}
                    <div className="w-full md:w-1/4 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="font-semibold text-lg text-gray-800">Your Conversations</h2>
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
                                    const otherUser = getOtherUser(conversation)
                                    console.log('Other User:', otherUser?.user.first_name)
                                    return (
                                        <li key={conversation.id}>
                                            <button
                                                className={`w-full text-left p-4 hover:bg-gray-100 transition-colors ${selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''
                                                    }`}
                                                onClick={() => setSelectedConversation(conversation)}
                                            >
                                                <div className="flex items-center mb-1">
                                                    <span className="font-medium text-gray-900">
                                                        {otherUser ? `${otherUser.user.first_name} ${otherUser.user.last_name}` : 'Unknown User'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {conversation.gear_listing ? conversation.gear_listing.title : 'No gear listing'}
                                                </p>
                                                {/* <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(conversation.created_at), 'MMM d, yyyy')}
                        </p> */}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Conversation Box (Right Side) */}
                    <div className="w-full md:w-3/4 flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Conversation Header */}
                                <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {getOtherUser(selectedConversation)
                                                ? `${getOtherUser(selectedConversation)?.user.first_name ?? ''} ${getOtherUser(selectedConversation)?.user.last_name ?? ''}` : 'Unknown User'
                                            }
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {selectedConversation.gear_listing
                                                ? `About: ${selectedConversation.gear_listing.title}`
                                                : 'No gear listing'
                                            }
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
                                    {messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-500">No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.map((message) => {
                                                const isCurrentUser = message.sender.id === client?.id;
                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`max-w-[75%] px-4 py-3 rounded-lg ${isCurrentUser
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-white border border-gray-200 text-gray-800'
                                                                }`}
                                                        >
                                                            <p>{message.message}</p>
                                                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-green-200' : 'text-gray-500'}`}>
                                                                {format(new Date(message.date_created), 'MMM d, h:mm a')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
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
                                            {sending ? 'Sending...' : 'Send'}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center p-8">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a conversation</h3>
                                    <p className="text-gray-500">
                                        Choose a conversation from the list to view messages
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                        <button
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                            onClick={() => setError(null)}
                        >
                            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}