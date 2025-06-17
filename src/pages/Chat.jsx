import React from 'react';
import SideNav from './SideNav/SideNav';
import Chatbot from '../components/Chatbot';

const Chat = () => {
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-50">
            <SideNav />
            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-200 hover:shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">AI Assistant</h1>
                                <p className="text-gray-600 mt-2">
                                    Get instant help with waste management, recycling, and environmental sustainability.
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 pt-6">
                            <Chatbot />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat; 