import React, { useState } from 'react';
import { submitTriage } from '../api';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function Triage() {
    const [symptomInput, setSymptomInput] = useState('');
    const [symptoms, setSymptoms] = useState([]);
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleAddSymptom = (e) => {
        e.preventDefault();
        if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
            setSymptoms([...symptoms, symptomInput.trim()]);
            setSymptomInput('');
        }
    };

    const handleRemoveSymptom = (sym) => {
        setSymptoms(symptoms.filter(s => s !== sym));
    };

    const handleTriage = async () => {
        if (symptoms.length === 0) {
            setError(language === 'en' ? 'Please add at least one symptom.' : 'कृपया कम से कम एक लक्षण दर्ज करें।');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await submitTriage(symptoms, language);
            setResult(data);
        } catch (err) {
            setError('Failed to reach triage service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getResultColor = (level) => {
        switch (level) {
            case 'RED': return 'bg-red-50 border-red-200 text-red-800';
            case 'YELLOW': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'GREEN': return 'bg-green-50 border-green-200 text-green-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getResultIcon = (level) => {
        switch (level) {
            case 'RED': return <AlertCircle className="w-8 h-8 text-red-600 mb-2" />;
            case 'YELLOW': return <Info className="w-8 h-8 text-yellow-600 mb-2" />;
            case 'GREEN': return <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />;
            default: return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Patient Symptom Triage</h2>

            <div className="mb-6 flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language / भाषा</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="en">English</option>
                        <option value="hi">हिंदी (Hindi)</option>
                    </select>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Add Symptoms' : 'लक्षण जोड़ें'}
                </label>
                <form onSubmit={handleAddSymptom} className="flex gap-2">
                    <input
                        type="text"
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        placeholder={language === 'en' ? 'e.g., headache, high fever...' : 'उदा., सिरदर्द, तेज बुखार...'}
                        className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button type="submit" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                        {language === 'en' ? 'Add' : 'जोड़ें'}
                    </button>
                </form>
            </div>

            {symptoms.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {symptoms.map((sym, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                            {sym}
                            <button onClick={() => handleRemoveSymptom(sym)} className="ml-2 text-blue-400 hover:text-blue-600">&times;</button>
                        </span>
                    ))}
                </div>
            )}

            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

            <button
                onClick={handleTriage}
                disabled={loading || symptoms.length === 0}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex justify-center items-center"
            >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (language === 'en' ? 'Analyze Symptoms' : 'लक्षणों का विश्लेषण करें')}
            </button>

            {result && (
                <div className={`mt-8 p-6 rounded-xl border ${getResultColor(result.triage_level)}`}>
                    <div className="flex flex-col items-center text-center">
                        {getResultIcon(result.triage_level)}
                        <h3 className="text-xl font-bold mb-1">
                            {result.triage_level} PRIORITY
                        </h3>
                        <span className="text-sm opacity-80 mb-4">
                            AI Confidence: {(result.confidence * 100).toFixed(1)}%
                        </span>
                        <p className="text-lg leading-relaxed font-medium">
                            {result.advice}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
