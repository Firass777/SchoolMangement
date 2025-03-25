import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaDownload, FaTrash, FaSearch, FaSpinner, FaSync } from 'react-icons/fa';

const DocumentManager = () => {
    const [file, setFile] = useState(null);
    const [uploadedBy, setUploadedBy] = useState('');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [searchQuery, setSearchQuery] = useState('');

    const fetchDocuments = async () => {
        try {
            setRefreshing(true);
            const response = await axios.get('http://127.0.0.1:8000/api/documents');
            
            // Process documents to ensure consistent structure
            const processedDocs = response.data.documents.map(doc => ({
                ...doc,
                prediction: doc.prediction || {
                    status: 'processing',
                    category: null,
                    confidence: null,
                    processed_at: null
                }
            }));
            
            setDocuments(processedDocs);
        } catch (error) {
            setMessage({ text: 'Failed to load documents', type: 'error' });
            console.error('Error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
        
        // Set up auto-refresh every 3 seconds
        const interval = setInterval(fetchDocuments, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !uploadedBy) {
            setMessage({ text: 'Please select a file and enter your name', type: 'error' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ text: '', type: '' });
            const formData = new FormData();
            formData.append('document', file);
            formData.append('uploaded_by', uploadedBy);

            await axios.post('http://127.0.0.1:8000/api/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ text: 'Document uploaded! Processing...', type: 'success' });
            setFile(null);
            setUploadedBy('');
            // Force immediate refresh after 1 second to show processing status
            setTimeout(fetchDocuments, 1000);
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.message || 'Upload failed', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        
        try {
            await axios.delete(`http://127.0.0.1:8000/api/documents/${id}`);
            setMessage({ text: 'Document deleted', type: 'success' });
            fetchDocuments();
        } catch (error) {
            setMessage({ text: 'Delete failed', type: 'error' });
        }
    };

    const renderStatusBadge = (doc) => {
        // Always show Uncertain if confidence is 0
        const status = doc.prediction?.confidence === 0 ? 'uncertain' : 
                     doc.prediction?.status || 'processing';
        const confidence = doc.prediction?.confidence;
        const category = doc.prediction?.category;
    
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
        switch (status.toLowerCase()) {
            case 'confirmed':
                return (
                    <div className="flex items-center gap-1">
                        <span className={`${baseClasses} bg-green-100 text-green-800`}>
                            {category}
                        </span>
                        <span className="text-sm text-gray-600">
                            ({Math.round(confidence)}%)
                        </span>
                    </div>
                );
            case 'pending':
            case 'uncertain':  
                return (
                    <div className="flex items-center gap-1">
                        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
                            {status === 'uncertain' ? 'Uncertain' : 'Needs Review'}
                        </span>
                        <span className="text-sm text-gray-600">
                            ({Math.round(confidence)}%)
                        </span>
                    </div>
                );
            default:
                return (
                    <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
                        Processing...
                    </span>
                );
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.prediction?.category?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Document Management System</h1>
                <button 
                    onClick={fetchDocuments}
                    disabled={refreshing}
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                >
                    {refreshing ? (
                        <FaSpinner className="animate-spin" />
                    ) : (
                        <FaSync />
                    )}
                    Refresh
                </button>
            </div>

            {/* Upload Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-medium">Your Name:</label>
                        <input
                            type="text"
                            value={uploadedBy}
                            onChange={(e) => setUploadedBy(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">PDF Document:</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            accept=".pdf"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center justify-center py-2 px-4 rounded font-medium 
                            ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <FaUpload className="mr-2" />
                                Upload Document
                            </>
                        )}
                    </button>
                </form>
                {message.text && (
                    <div className={`mt-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Document List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Your Documents</h2>
                    <div className="relative w-64">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left font-medium text-gray-700">File Name</th>
                                <th className="p-3 text-left font-medium text-gray-700">Status</th>
                                <th className="p-3 text-left font-medium text-gray-700">Uploaded By</th>
                                <th className="p-3 text-left font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredDocuments.length > 0 ? (
                                filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="p-3 max-w-xs truncate">{doc.file_name}</td>
                                        <td className="p-3">
                                            {renderStatusBadge(doc)}
                                        </td>
                                        <td className="p-3">{doc.uploaded_by}</td>
                                        <td className="p-3 space-x-2">
                                            <a
                                                href={`http://127.0.0.1:8000/api/documents/${doc.id}/download`}
                                                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                                                download
                                            >
                                                <FaDownload className="mr-1" /> Download
                                            </a>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="text-red-600 hover:text-red-800 inline-flex items-center"
                                            >
                                                <FaTrash className="mr-1" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">
                                        No documents found
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

export default DocumentManager;