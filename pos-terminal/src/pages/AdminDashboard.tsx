import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Download, LogOut, RefreshCw, Receipt, Search } from 'lucide-react';

interface Ticket {
    _id: string;
    id: string;
    amount: number;
    date: string;
    mobile?: string;
    createdAt: string;
    items: any[];
}

export default function AdminDashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await axios.get(`${API_URL}/api/tickets`);
            setTickets(response.data);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const downloadCSV = () => {
        if (tickets.length === 0) return;

        const headers = ['Ticket ID', 'Date', 'Amount', 'Mobile', 'Created At'];
        const csvContent = [
            headers.join(','),
            ...tickets.map(t => [
                t.id,
                `"${t.date}"`,
                t.amount,
                t.mobile || '',
                t.createdAt
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Derived Stats
    const totalRevenue = tickets.reduce((sum, t) => sum + t.amount, 0);

    // Filtered Tickets
    // Filtered Tickets
    const filteredTickets = tickets.filter(t => {
        const idMatch = t.id ? t.id.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const mobileMatch = t.mobile ? t.mobile.includes(searchTerm) : false;
        return idMatch || mobileMatch;
    });

    // Change Password State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ email: '', newPassword: '' });
    const [passwordMessage, setPasswordMessage] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage('');
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            await axios.post(
                `${API_URL}/api/auth/change-password`,
                passwordData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPasswordMessage('Password updated successfully!');
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordMessage('');
                setPasswordData({ email: '', newPassword: '' });
            }, 1500);
        } catch (error: any) {
            setPasswordMessage(error.response?.data?.message || 'Failed to update password');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            {/* Header */}
            <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-20 border-b border-white/10">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                            <img
                                src="/e3logo.jpeg"
                                alt="Admin Logo"
                                className="relative w-10 h-10 rounded-lg object-contain bg-white ring-2 ring-white/10"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none text-white">ETHREE POS</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Admin Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors mr-2"
                        >
                            Change User Password
                        </button>
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-slate-200">Administrator</span>
                            <span className="text-xs text-slate-500 font-medium">System Access</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-slate-800 hover:bg-rose-600 text-white p-2.5 rounded-xl transition-all shadow-lg border border-slate-700 hover:border-rose-500 group"
                            title="Logout"
                        >
                            <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-6 max-w-7xl">
                {/* Stats Grid */}
                {/* ... existing stats ... */}

                {/* Password Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 animate-in fade-in zoom-in duration-200">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Change User Password</h2>

                            {passwordMessage && (
                                <div className={`p-3 rounded-lg text-sm font-medium mb-4 ${passwordMessage.includes('success') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {passwordMessage}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="user@ethree.com"
                                        value={passwordData.email}
                                        onChange={(e) => setPasswordData({ ...passwordData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Min 6 characters"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by Ticket ID or Mobile..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={fetchTickets}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all shadow-sm hover:shadow active:scale-[0.98]"
                            disabled={loading}
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={downloadCSV}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                            disabled={loading || tickets.length === 0}
                        >
                            <Download size={18} />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Ticket ID</th>
                                    <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <RefreshCw size={32} className="animate-spin mb-3 text-slate-300" />
                                                <span className="font-medium">Loading sales data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No tickets found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <tr key={ticket._id} className="group hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <Receipt size={16} />
                                                    </div>
                                                    <span className="font-mono text-sm font-bold text-slate-700">{ticket.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {ticket.mobile ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {ticket.mobile}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-emerald-600 font-black text-base">₹{ticket.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    Paid
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
                        <span className="font-medium">Showing <span className="text-slate-900 font-bold">{filteredTickets.length}</span> tickets</span>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                            <span>Total Revenue:</span>
                            <span className="font-black text-slate-900 text-lg">₹{totalRevenue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
