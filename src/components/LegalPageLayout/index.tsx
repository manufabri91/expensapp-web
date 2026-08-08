interface LegalSection {
  heading: string;
  body: string;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  disclaimer: string;
  sections: LegalSection[];
}

export const LegalPageLayout = ({ title, lastUpdated, disclaimer, sections }: LegalPageLayoutProps) => {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{lastUpdated}</p>
      <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        {disclaimer}
      </p>
      <div className="mt-8">
        {sections.map((section) => (
          <section key={section.heading} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{section.heading}</h2>
            <p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-300">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
};
