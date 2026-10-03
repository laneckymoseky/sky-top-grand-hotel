import React from 'react';
import { useAuthStore } from '../store/authStore';

const ChatPage = () => {
  const { userProfile } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-600">💬 Customer Support</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-2xl font-bold mb-4">Chat with Our Team</p>
          <p className="text-gray-600 mb-8">
            Have questions? Our support team is here to help!
          </p>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-gray-700">Chat functionality coming soon:</p>
            <ul className="mt-4 space-y-2 text-gray-600 text-left max-w-md mx-auto">
              <li>✓ Real-time messaging</li>
              <li>✓ Support ticket tracking</li>
              <li>✓ Quick responses</li>
              <li>✓ File sharing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
