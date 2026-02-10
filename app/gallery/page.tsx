'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MediaItem {
    _id: string;
    key: string;
    url: string;
    lastModified: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000');

import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

export default function GalleryPage() {
    const { t } = useLanguage();
    const [images, setImages] = useState<MediaItem[]>([]);
    const [videos, setVideos] = useState<MediaItem[]>([]);
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [isSlideshowActive, setIsSlideshowActive] = useState(false);
    const [slideshowIndex, setSlideshowIndex] = useState(0);

    const currentMedia = activeTab === 'photos' ? images : videos;

    useEffect(() => {
        // Fetch media from backend
        fetch(`${API_URL}/api/media`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Force chronological sort (oldest first) in case backend is inconsistent
                    const sortedImages = (data.data.images || []).sort((a: any, b: any) => {
                        const timeA = parseInt(a.key?.split('-')[0]) || 0;
                        const timeB = parseInt(b.key?.split('-')[0]) || 0;
                        return timeA - timeB;
                    });
                    const sortedVideos = (data.data.videos || []).sort((a: any, b: any) => {
                        const timeA = parseInt(a.key?.split('-')[0]) || 0;
                        const timeB = parseInt(b.key?.split('-')[0]) || 0;
                        return timeA - timeB;
                    });
                    setImages(sortedImages);
                    setVideos(sortedVideos);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Slideshow interval
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSlideshowActive && selectedMedia) {
            interval = setInterval(() => {
                const nextIndex = (slideshowIndex + 1) % currentMedia.length;
                handleMediaSelect(currentMedia[nextIndex], nextIndex);
            }, 3000); // 3 seconds per slide
        }
        return () => clearInterval(interval);
    }, [isSlideshowActive, slideshowIndex, currentMedia, selectedMedia]);

    const handleMediaSelect = (item: MediaItem, index: number) => {
        setSelectedMedia(item);
        setSlideshowIndex(index);
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const nextIndex = (slideshowIndex + 1) % currentMedia.length;
        handleMediaSelect(currentMedia[nextIndex], nextIndex);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const prevIndex = (slideshowIndex - 1 + currentMedia.length) % currentMedia.length;
        handleMediaSelect(currentMedia[prevIndex], prevIndex);
    };

    const toggleSlideshow = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsSlideshowActive(!isSlideshowActive);
    };

    const startSlideshow = () => {
        if (currentMedia.length > 0) {
            handleMediaSelect(currentMedia[0], 0);
            setIsSlideshowActive(true);
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-black/95 text-white">
            <nav className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
                <Link href="/" className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-600 tracking-tighter self-start sm:self-center">
                    GD 25th
                </Link>
                <div className="flex gap-4 sm:gap-6 items-center w-full sm:w-auto justify-between sm:justify-end">
                    <LanguageToggle />
                    <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-yellow-500 transition-colors uppercase tracking-widest">
                        {t('admin')}
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="text-center mb-10 sm:mb-16 px-4">
                <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight leading-[1.3] sm:leading-[1.4] py-2">{t('theGallery')}</h1>
                <p className="text-gray-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-8">{t('gallerySubtitle')}</p>

                {currentMedia.length > 0 && (
                    <button
                        onClick={startSlideshow}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/20"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        {t('startSlideshow')}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-8 sm:gap-12 mb-10 sm:mb-16">
                <button
                    onClick={() => setActiveTab('photos')}
                    className={`text-lg sm:text-xl font-bold pb-2 transition-all border-b-4 ${activeTab === 'photos' ? 'text-yellow-500 border-yellow-500' : 'text-gray-600 border-transparent hover:text-gray-400'}`}
                >
                    {t('photos')}
                </button>
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`text-lg sm:text-xl font-bold pb-2 transition-all border-b-4 ${activeTab === 'videos' ? 'text-yellow-500 border-yellow-500' : 'text-gray-600 border-transparent hover:text-gray-400'}`}
                >
                    {t('videos')}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
                    {currentMedia.map((item, index) => (
                        <div
                            key={item._id}
                            onClick={() => handleMediaSelect(item, index)}
                            className="group relative aspect-video overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 cursor-pointer hover:border-yellow-500/50 transition-all duration-500 shadow-xl"
                        >
                            {activeTab === 'videos' ? (
                                <div className="relative w-full h-full">
                                    <video src={item.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" preload="metadata" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform drop-shadow-2xl">
                                            <Image
                                                src="/gd25th-frontend/GDplayer.png"
                                                alt="Play"
                                                width={100}
                                                height={100}
                                                className="object-contain filter drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Image
                                    src={item.url}
                                    alt={item.key}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:opacity-0 group-hover:opacity-100 transition-opacity p-4 sm:p-6 flex items-end">
                                <p className="text-xs sm:text-sm font-medium text-yellow-500">{t('viewFullScreen')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/98 backdrop-blur-2xl animate-fade-in" onClick={() => {
                    setSelectedMedia(null);
                    setIsSlideshowActive(false);
                }}>
                    <button className="absolute top-4 right-4 sm:top-8 sm:right-8 text-white/50 hover:text-white transition-colors z-[60] bg-black/50 rounded-full p-2">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all z-[60]"
                    >
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all z-[60]"
                    >
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>

                    {/* Slideshow Controls */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 bg-black/50 px-4 py-2 rounded-full border border-white/10">
                        <button onClick={toggleSlideshow} className="text-yellow-500 hover:text-yellow-400 transition-colors">
                            {isSlideshowActive ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>
                        <span className="text-[10px] sm:text-xs font-medium tracking-widest text-gray-400 uppercase">
                            {slideshowIndex + 1} / {currentMedia.length}
                        </span>
                    </div>

                    <div className="relative w-full max-w-6xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {activeTab === 'videos' ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/50 rounded-xl overflow-hidden shadow-2xl">
                                <video
                                    src={selectedMedia.url}
                                    controls
                                    autoPlay
                                    className="w-full h-auto max-h-[80vh] sm:max-h-[85vh] object-contain"
                                />
                            </div>
                        ) : (
                            <div className="relative w-full h-[70vh] sm:h-[85vh] transition-all duration-500">
                                <Image
                                    src={selectedMedia.url}
                                    alt="Preview"
                                    fill
                                    className="object-contain shadow-2xl drop-shadow-2xl animate-fade-in"
                                    key={selectedMedia._id}
                                />
                            </div>
                        )}
                        <div className="absolute -bottom-10 sm:-bottom-12 left-0 right-0 text-center px-4">
                            <p className="text-gray-500 truncate tracking-widest uppercase text-[10px] sm:text-xs">
                                {selectedMedia.key.split('-').slice(1).join('-')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {currentMedia.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500 bg-gray-900/20 rounded-3xl mt-12 border border-gray-800/50">
                    <p className="text-lg sm:text-xl font-medium">{t('noMedia', { type: t(activeTab) })}</p>
                </div>
            )}
        </div>
    );
}
