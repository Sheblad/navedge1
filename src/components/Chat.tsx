import React, { useState } from 'react';
import { Send, Search, Phone, Video, MoreVertical } from 'lucide-react';

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

  const mockChats = [
    {
      id: 1,
      name: 'Ahmed Al-Rashid',
      avatar: 'AR',
      lastMessage: 'Thanks for the quick response!',
      time: '2 min ago',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Mohammed Hassan',
      avatar: 'MH',
      lastMessage: 'Vehicle maintenance scheduled',
      time: '1 hour ago',
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: 'Omar Khalil',
      avatar: 'OK',
      lastMessage: 'Contract renewal discussion',
      time: '3 hours ago',
      unread: 1,
      online: true
    }
  ];

  const mockMessages = [
    {
      id: 1,
      sender: 'Ahmed Al-Rashid',
      message: 'Hi, I need to discuss the new route assignments',
      time: '10:30 AM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      message: 'Sure, what specific routes are you interested in?',
      time: '10:32 AM',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Ahmed Al-Rashid',
      message: 'The downtown area routes seem to have better earnings potential',
      time: '10:35 AM',
      isOwn: false
    },
    {
      id: 4,
      sender: 'You',
      message: 'I can assign you to the downtown routes starting tomorrow. The commission structure remains the same.',
      time: '10:37 AM',
      isOwn: true
    },
    {
      id: 5,
      sender: 'Ahmed Al-Rashid',
      message: 'Thanks for the quick response!',
      time: '10:38 AM',
      isOwn: false
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedChat === chat.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{chat.avatar}</span>
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">AR</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Ahmed Al-Rashid</h3>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.isOwn
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${
                  msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;