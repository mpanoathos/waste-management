import { useEffect, useState } from 'react';
import SideNav from "./SideNav/SideNav";
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

const CollectionHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await api.get('/user/collection-history');
                setHistory(response.data.history);
            } catch (error) {
                console.error('Error fetching collection history:', error);
                toast.error('Failed to load collection history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100">
                <SideNav />
                <div className="p-6 overflow-auto w-full flex items-center justify-center">
                    <LoadingSpinner size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <SideNav />
            <div className="p-6 overflow-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Collection History</h1>
                    <div className="text-sm text-gray-500">
                        Total Collections: {history.length}
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bin ID</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected By</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(record.collectedAt).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                                        Bin #{record.bin.id}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.collectedBy.name}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.bin.location}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.notes}
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                        No collection history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CollectionHistory;