import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitTriage } from '../api';
import { AlertCircle, CheckCircle2, Info, Loader2, Plus, X } from 'lucide-react';

/**
 * Renders the AI Symptom Triage UI allowing users to add symptoms, choose language, submit them for priority analysis, and view the resulting recommendation.
 *
 * @returns {JSX.Element} The Triage React component UI.
 */
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
            case 'RED': return 'from-red-500 to-red-600';
            case 'YELLOW': return 'from-yellow-400 to-orange-500';
            case 'GREEN': return 'from-green-500 to-emerald-600';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    const getResultIcon = (level) => {
        switch (level) {
            case 'RED': return <AlertCircle className="w-12 h-12 text-white mb-3" />;
            case 'YELLOW': return <Info className="w-12 h-12 text-white mb-3" />;
            case 'GREEN': return <CheckCircle2 className="w-12 h-12 text-white mb-3" />;
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-10 rounded-3xl shadow-2xl border border-white/10"
            >
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold text-white mb-2"
                >
                    AI Symptom Triage
                </motion.h2>
                <p className="text-gray-400 mb-8">Intelligent priority classification powered by machine learning</p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                >
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Language / भाषा</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-4 glass rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-white bg-white/5"
                    >
                        <option value="en" className="bg-slate-800">English</option>
                        <option value="hi" className="bg-slate-800">हिंदी (Hindi)</option>
                    </select>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                >
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                        {language === 'en' ? 'Add Symptoms' : 'लक्षण जोड़ें'}
                    </label>
                    <form onSubmit={handleAddSymptom} className="flex gap-3">
                        <input
                            type="text"
                            value={symptomInput}
                            onChange={(e) => setSymptomInput(e.target.value)}
                            placeholder={language === 'en' ? 'e.g., headache, high fever...' : 'उदा., सिरदर्द, तेज बुखार...'}
                            className="flex-1 p-4 glass rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-500 bg-white/5"
                        />
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            {language === 'en' ? 'Add' : 'जोड़ें'}
                        </motion.button>
                    </form>
                </motion.div>

                <AnimatePresence>
                    {symptoms.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 flex flex-wrap gap-3"
                        >
                            {symptoms.map((sym, idx) => (
                                <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-semibold shadow-lg"
                                >
                                    {sym}
                                    <button
                                        onClick={() => handleRemoveSymptom(sym)}
                                        className="ml-2 hover:bg-white/20 rounded-full p-1 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.span>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-red-500 mb-4 text-sm font-medium"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={handleTriage}
                    disabled={loading || symptoms.length === 0}
                    whileHover={{ scale: loading || symptoms.length === 0 ? 1 : 1.02 }}
                    whileTap={{ scale: loading || symptoms.length === 0 ? 1 : 0.98 }}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        language === 'en' ? 'Analyze Symptoms' : 'लक्षणों का विश्लेषण करें'
                    )}
                </motion.button>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className={`mt-8 p-8 rounded-3xl bg-gradient-to-br ${getResultColor(result.triage_level)} text-white shadow-2xl`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                >
                                    {getResultIcon(result.triage_level)}
                                </motion.div>
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl font-bold mb-2"
                                >
                                    {result.triage_level} PRIORITY
                                </motion.h3>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm opacity-90 mb-6 bg-white/20 px-4 py-2 rounded-full"
                                >
                                    AI Confidence: {(result.confidence * 100).toFixed(1)}%
                                </motion.span>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-lg leading-relaxed font-medium"
                                >
                                    {result.advice}
                                </motion.p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
