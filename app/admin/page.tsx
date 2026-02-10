'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000');

export default function AdminPage() {
    const { t } = useLanguage();
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/login`, { password });
            if (res.data.success) {
                setIsLoggedIn(true);
                setMessage('');
            }
        } catch (err) {
            setMessage('Invalid password. Please try again.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files) return;

        setUploading(true);
        setMessage('');

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const CHUNK_SIZE = 10 * 1024 * 1024; // Increased to 10MB chunks for efficiency
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

                setMessage(`Starting upload for ${file.name}...`);

                // 1. Start Multipart Upload
                const startRes = await axios.post(`${API_URL}/api/upload/start`, {
                    filename: file.name,
                    filetype: file.type
                });

                const { uploadId, key } = startRes.data;
                const uploadedParts = [];

                // 2. Upload Chunks
                for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
                    const start = (partNumber - 1) * CHUNK_SIZE;
                    const end = Math.min(partNumber * CHUNK_SIZE, file.size);
                    const chunk = file.slice(start, end);

                    let success = false;
                    let attempts = 0;
                    const maxAttempts = 3;

                    while (!success && attempts < maxAttempts) {
                        try {
                            attempts++;
                            // Get presigned URL for this part
                            const urlRes = await axios.post(`${API_URL}/api/upload/get-part-url`, {
                                key,
                                uploadId,
                                partNumber
                            });

                            const uploadUrl = urlRes.data.url;

                            // Upload chunk to S3
                            const uploadRes = await axios.put(uploadUrl, chunk, {
                                headers: { 'Content-Type': file.type }
                            });

                            // Store ETag
                            const etag = uploadRes.headers.etag;
                            uploadedParts.push({
                                ETag: etag,
                                PartNumber: partNumber
                            });

                            success = true;
                            const percent = Math.round((partNumber / totalChunks) * 100);
                            setMessage(`Uploading ${file.name}: ${percent}%`);
                        } catch (partErr) {
                            console.warn(`Part ${partNumber} failed (Attempt ${attempts}). Retrying...`, partErr);
                            if (attempts >= maxAttempts) throw partErr;
                            // Wait 1s before retry
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                }

                // 3. Complete Multipart Upload
                setMessage(`Finalizing ${file.name}...`);
                await axios.post(`${API_URL}/api/upload/complete`, {
                    key,
                    uploadId,
                    parts: uploadedParts,
                    originalName: file.name
                });
            }

            setMessage(`Successfully uploaded ${files.length} files!`);
            setFiles(null);
        } catch (err: any) {
            let errorMsg = err.response?.data?.message || err.message || 'Upload failed. Please try again.';

            // Specific check for Mixed Content / Network Error on mobile
            if (typeof window !== 'undefined' && window.location.protocol === 'https:' && API_URL.startsWith('http:')) {
                errorMsg = "Network Error: You are on a secure site (HTTPS) but trying to connect to an insecure local backend (HTTP). This is blocked by mobile browsers. Please use the server's local IP address with http:// in your browser if you are testing locally.";
            }

            setMessage(errorMsg);
            console.error('Upload Error:', err);
        } finally {
            setUploading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <div className="absolute top-6 right-6 z-10">
                    <LanguageToggle />
                </div>
                <div className="bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-white">{t('adminAccess')}</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">{t('password')}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all font-sans"
                                placeholder={t('enterPassword')}
                            />
                        </div>
                        {message && <p className="text-red-500 text-sm text-center">{message}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            {t('login')}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8 text-white">
            <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-12">
                <h1 className="text-xl sm:text-2xl font-bold text-yellow-500">{t('adminDashboard')}</h1>
                <div className="flex items-center gap-6">
                    <LanguageToggle />
                    <button
                        onClick={() => setIsLoggedIn(false)}
                        className="text-sm text-gray-400 hover:text-white uppercase tracking-widest font-black"
                    >
                        {t('logout')}
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto space-y-12">
                <div className="bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-xl">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-6">{t('uploadNewMemories')}</h2>

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 sm:p-12 text-center hover:border-yellow-500 transition-colors cursor-pointer relative bg-black/20">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*,video/*"
                            />
                            <div className="space-y-2">
                                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="text-sm sm:text-base text-gray-300 font-medium">{t('clickToSelect')}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">PNG, JPG, HEIC, MP4, MOV up to 5GB (Max 100 files at once)</p>
                            </div>
                        </div>

                        {files && (
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                <p className="text-sm text-gray-300 font-medium">{t('filesSelected', { count: files.length.toString() })}</p>
                            </div>
                        )}

                        {message && (
                            <div className={`p-4 rounded-lg text-sm sm:text-base ${message.includes('success') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={uploading || !files}
                            className={`w-full py-3 sm:py-4 px-6 rounded-lg font-bold text-base sm:text-lg shadow-lg transition-all transform active:scale-95 ${uploading || !files
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:shadow-yellow-500/20 shadow-xl'
                                }`}
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('uploading')}
                                </span>
                            ) : (
                                t('uploadFiles')
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
