import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'واش نقدر نقرا بعد الباك؟ احسب معدلك واكتشف التخصصات | SHATER',
  description: 'احسب معدل البكالوريا واكتشف التخصصات الجامعية والمؤسسات التي يمكنك استكشافها حسب شعبتك ومعدلك في الجزائر.',
  keywords: [
    'التوجيه الجامعي في الجزائر',
    'واش نقدر نقرا بعد الباك',
    'حساب معدل البكالوريا',
    'المنشور الوزاري للتوجيه الجامعي 2026',
    'تخصصات البكالوريا الجزائر',
    'المعدل الموزون للطب والهندسة',
    'عتبات القبول الجامعي الجزائر',
    'SHATER BAC',
    'شعبة علوم تجريبية',
    'شعبة رياضيات',
    'شعبة تقني رياضي',
  ],
  authors: [{ name: 'SHATER BAC — الشاطر' }],
  openGraph: {
    title: 'واش نقدر نقرا بعد الباك؟ احسب معدلك واكتشف التخصصات | SHATER',
    description: 'احسب معدل البكالوريا واكتشف التخصصات الجامعية والمؤسسات التي يمكنك استكشافها حسب شعبتك ومعدلك في الجزائر.',
    url: 'https://shater-bac.dz/orientation',
    siteName: 'SHATER | الشاطر',
    locale: 'ar_DZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'واش نقدر نقرا بعد الباك؟ احسب معدلك واكتشف التخصصات | SHATER',
    description: 'احسب معدل البكالوريا واكتشف التخصصات الجامعية والمؤسسات التي يمكنك استكشافها حسب شعبتك ومعدلك في الجزائر.',
  },
  alternates: {
    canonical: '/orientation',
  },
};

export default function OrientationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org WebApplication structured data for educational calculator & orientation explorer
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'مستكشف التوجيه الجامعي الجزائري — واش نقدر نقرا؟',
    description: 'أداة مجانية ذكية لحساب معدل البكالوريا واستكشاف التخصصات الجامعية والمؤسسات المتاحة في الجزائر.',
    url: 'https://shater-bac.dz/orientation',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'DZD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SHATER BAC',
      url: 'https://shater-bac.dz',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
