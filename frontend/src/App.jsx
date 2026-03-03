import React, { useState } from 'react';
import Triage from './components/Triage';
import Chatbot from './components/Chatbot';
import Analytics from './components/Analytics';
import { ActivitySquare, MessageSquare, BarChart3 } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('triage');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-lg text-white">
                                <ActivitySquare className="w-6 h-6" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Swasthya-Setu <span className="text-blue-600 font-medium text-sm ml-2 px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">MVP Demo</span></h1>
                        </div>

                        {/* Nav Tabs */}
                        <nav className="flex space-x-1 sm:space-x-4">
                            <button
                                onClick={() => setActiveTab('triage')}
                                className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'triage'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <ActivitySquare className="w-4 h-4" /> Triage
                            </button>

                            <button
                                onClick={() => setActiveTab('chatbot')}
                                className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'chatbot'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4" /> Medical Chat
                            </button>

                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'analytics'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" /> Analytics
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                {activeTab === 'triage' && <Triage />}
                {activeTab === 'chatbot' && <Chatbot />}
                {activeTab === 'analytics' && <Analytics />}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
                <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
                    <p>Built for the AI For Bharat Hackathon. Not a replacement for professional medical advice.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
