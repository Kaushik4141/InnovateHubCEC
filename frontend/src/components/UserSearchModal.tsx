import React, { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { searchUsers, type UserMin } from '../services/userApi';

interface Props {
    open: boolean;
    onClose: () => void;
    onSelect: (user: UserMin) => void;
}

const UserSearchModal: React.FC<Props> = ({ open, onClose, onSelect }) => {
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<UserMin[]>([]);

    useEffect(() => {
        if (!open) {
            setQ('');
            setResults([]);
            setLoading(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const h = setTimeout(async () => {
            const qq = q.trim();
            if (!qq) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const r = await searchUsers(qq);
                setResults(r);
            } catch (e) {
                console.error('search failed', e);
            } finally {
                setLoading(false);
            }
        }, 250);
        return () => clearTimeout(h);
    }, [q, open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg mx-4 shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">New Message</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            autoFocus
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search users by name, email or USN..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-700">
                        {loading && <div className="p-3 text-gray-400">Searching...</div>}
                        {!loading && results.length === 0 && q.trim() !== '' && (
                            <div className="p-3 text-gray-400">No users found.</div>
                        )}
                        {results.map((u) => (
                            <button
                                key={u._id}
                                onClick={() => { onSelect(u); onClose(); }}
                                className="w-full text-left p-3 hover:bg-gray-700 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                                    {u.fullname.split(' ').map(s => s[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                    <div className="text-white font-medium">{u.fullname}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSearchModal;
