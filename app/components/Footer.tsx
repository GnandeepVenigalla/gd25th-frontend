'use client';
import Image from 'next/image';

import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();
    return (
        <footer className="w-full py-6 mt-auto text-center text-sm text-gray-600 bg-black/20 backdrop-blur-sm">
            <p>&copy; {new Date().getFullYear()} <Image src="/michael-dale.svg" alt="GD Logo" width={15} height={20} className="inline-block mr-1" />GD Enterprises. {t('allRightsReserved')}</p>
        </footer>
    );
}
