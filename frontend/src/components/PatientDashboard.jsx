import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, User, Clock, ChevronRight, History, HeartPulse, MessageCircle, AlertCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://5zdiwo4lfl.execute-api.ap-south-1.amazonaws.com/api/v1';

export default function PatientDashboard({ onSelectPatient }) {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Female', is_pregnant: false });
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [registerError, setRegisterError] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/patients/`);
            setPatients(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching patients:", err);
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError(null);
        try {
            const res = await axios.post(`${API_BASE_URL}/patients/`, newPatient);
            setPatients([res.data, ...patients]);
            setShowRegister(false);
            setNewPatient({ name: '', age: '', gender: 'Female', is_pregnant: false });
        } catch (err) {
            console.error("Error registering patient:", err);
            const errorData = err.response?.data?.detail;
            const errorMessage = typeof errorData === 'string'
                ? errorData
                : (Array.isArray(errorData) ? errorData[0]?.msg : JSON.stringify(errorData));
            setRegisterError(errorMessage || "Failed to register patient. Please check if the backend is running.");
        }
    };

    const viewHistory = async (patientId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/patients/${patientId}`);
            setSelectedHistory(res.data);
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    const deletePatient = async (e, patientId, patientName) => {
        e.stopPropagation();
        if (!window.confirm(`Delete patient "${patientName}"? This will also delete all their consultation history.`)) return;
        try {
            await axios.delete(`${API_BASE_URL}/patients/${patientId}`);
            setPatients(prev => prev.filter(p => p.id !== patientId));
        } catch (err) {
            console.error("Error deleting patient:", err);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-bold text-white mb-2">Patient Records</h2>
                    <p className="text-gray-400">Manage and select patients for consultation</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRegister(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 rounded-2xl font-bold text-white shadow-xl shadow-blue-500/20"
                >
                    <UserPlus className="w-5 h-5" />
                    Add Patient
                </motion.button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredPatients.map((patient, idx) => (
                        <motion.div
                            key={idx}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden"
                            onClick={() => onSelectPatient(patient)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <User className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            viewHistory(patient.id);
                                        }}
                                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="View History"
                                    >
                                        <History className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => deletePatient(e, patient.id, patient.name)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                        title="Delete Patient"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                {patient.name}
                            </h3>
                            <div className="flex gap-4 text-sm text-gray-400">
                                <span>{patient.age} Years</span>
                                <span className="w-px h-4 bg-white/10" />
                                <span>{patient.gender}</span>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Added {new Date(patient.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {loading && patients.length === 0 && (
                <div className="text-center py-20">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-400">Loading patients...</p>
                </div>
            )}

            {!loading && filteredPatients.length === 0 && (
                <div className="text-center py-20 glass rounded-3xl border border-dashed border-white/10">
                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No patients found. Register your first patient to begin.</p>
                </div>
            )}

            {/* Registration Modal */}
            <AnimatePresence>
                {showRegister && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRegister(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-slate-900 border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold text-white mb-6">Add New Patient</h3>
                            <form onSubmit={handleRegister} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                        value={newPatient.name}
                                        onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Age</label>
                                        <input
                                            required
                                            type="number"
                                            min="18"
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                            value={newPatient.age}
                                            onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                                        <select
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                            value={newPatient.gender}
                                            onChange={(e) => setNewPatient({
                                                ...newPatient,
                                                gender: e.target.value,
                                                is_pregnant: e.target.value === 'Female' ? newPatient.is_pregnant : false
                                            })}
                                        >
                                            <option value="Female">Female</option>
                                            <option value="Male">Male</option>
                                        </select>
                                    </div>
                                </div>
                                {newPatient.gender === 'Female' && (
                                    <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                        <input
                                            type="checkbox"
                                            id="is_pregnant"
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-slate-700"
                                            checked={newPatient.is_pregnant}
                                            onChange={(e) => setNewPatient({ ...newPatient, is_pregnant: e.target.checked })}
                                        />
                                        <label htmlFor="is_pregnant" className="text-sm font-medium text-gray-300 cursor-pointer">
                                            Is the patient pregnant?
                                        </label>
                                    </div>
                                )}
                                {registerError && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>{registerError}</span>
                                    </div>
                                )}
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRegister(false)}
                                        className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        Add Patient
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                {selectedHistory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedHistory(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-slate-900 border-l border-white/10 shadow-2xl overflow-y-auto"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-3xl font-bold text-white">{selectedHistory.name}'s History</h3>
                                        <p className="text-gray-400">{selectedHistory.age} Y • {selectedHistory.gender}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedHistory(null)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {selectedHistory.history.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            No previous records found for this patient.
                                        </div>
                                    ) : (
                                        selectedHistory.history.map((item, idx) => (
                                            <div key={idx} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                                                <div className={`absolute top-0 left-0 bottom-0 w-1 ${item.type === 'TRIAGE'
                                                    ? (item.triage_level === 'RED' ? 'bg-red-500' : item.triage_level === 'YELLOW' ? 'bg-yellow-500' : 'bg-green-500')
                                                    : 'bg-blue-500'
                                                    }`} />

                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-2">
                                                        {item.type === 'TRIAGE' ? <HeartPulse className="w-4 h-4 text-pink-400" /> : <MessageCircle className="w-4 h-4 text-blue-400" />}
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.type}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>

                                                <p className="text-white font-medium mb-3">"{item.query}"</p>
                                                <div className="bg-white/5 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
                                                    {item.response}
                                                </div>

                                                {item.triage_level && (
                                                    <div className="mt-4 flex justify-end">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.triage_level === 'RED' ? 'bg-red-500/20 text-red-400' :
                                                            item.triage_level === 'YELLOW' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-green-500/20 text-green-400'
                                                            }`}>
                                                            {item.triage_level}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
