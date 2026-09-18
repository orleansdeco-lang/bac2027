import React from "react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export function OrganizationJsonLd({ siteUrl = "https://shater.dz" }: { siteUrl?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "الشاطر | SHATER",
    alternateName: "SHATER BAC",
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    description:
      "منظومة ذكية للتعلم والتدريب وبناء الكفاءة لشهادة البكالوريا في الجزائر دورة 2027.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DZ",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd({ siteUrl = "https://shater.dz" }: { siteUrl?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "الشاطر | SHATER",
    url: siteUrl,
    inLanguage: "ar",
    description:
      "المنصة الشاملة للبكالوريا الجزائرية: دروس، ملخصات، تمارين، مواضيع سابقة مع الحلول، وحاسبة معدل البكالوريا.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/curriculum?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
