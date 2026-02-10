'use client';
import Image from 'next/image';

import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();
    return (
        <footer className="fixed bottom-0 left-0 w-full py-4 text-center text-[10px] sm:text-xs text-gray-500 bg-black/60 backdrop-blur-md border-t border-white/5 z-50">
            <p>&copy; {new Date().getFullYear()} <Image src="/gd25th-frontend/michael-dale.svg" alt="GD Logo" width={12} height={16} className="inline-block mr-1 opacity-50" />GD Enterprises. {t('allRightsReserved')}</p>
        </footer>
    );
}
