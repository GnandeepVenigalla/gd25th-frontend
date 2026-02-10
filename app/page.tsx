'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from './context/LanguageContext';
import LanguageToggle from './components/LanguageToggle';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-[90vh] flex flex-col items-center justify-center p-6 md:p-8 py-12 md:py-20 relative">
      {/* Top Navigation for Language */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle />
      </div>

      {/* Hero Section */}
      <section className="text-center animate-fade-in space-y-8 max-w-4xl mx-auto w-full">
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto mb-4 sm:mb-8 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <Image
            src="/GD25thlogo.png"
            alt="GD 25th"
            fill
            className="object-contain" // Uses Next.js Image
            priority
          />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 px-4 leading-[1.3] sm:leading-[1.4] py-2">
          {t('happyBirthday')}
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400 leading-relaxed sm:leading-loose px-4">
          {t('heroDescription')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 px-6">
          <Link href="/gallery" className="btn px-8 py-4 text-lg w-full sm:w-auto shadow-xl shadow-yellow-500/20 active:scale-95 transition-transform flex items-center justify-center">
            {t('viewGallery')}
          </Link>
          <Link href="/admin" className="px-8 py-4 rounded-full border border-gray-600 hover:border-yellow-500 hover:text-yellow-500 transition-all w-full sm:w-auto active:scale-95 flex items-center justify-center">
            {t('uploadMemories')}
          </Link>
        </div>
      </section>
    </main>
  );
}
