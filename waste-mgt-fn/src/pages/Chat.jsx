import React from 'react';
import SideNav from './SideNav/SideNav';
import Chatbot from '../components/Chatbot';

const Chat = () => {
    return (
        <div className="flex h-screen">
            <SideNav />
            <div className="flex-1 p-6 bg-gray-100">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Assistant</h1>
                        <p className="text-gray-600 mb-6">
                            Get instant help with waste management, recycling, and environmental sustainability.
                        </p>
                        <Chatbot />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat; 