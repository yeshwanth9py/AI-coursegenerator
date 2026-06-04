import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function DownloadButton({ lessonTitle }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const content = document.getElementById('lesson-content');
    if (!content) return;

    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${lessonTitle || 'lesson'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: -window.scrollY },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(content).save();
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="fixed bottom-8 right-8 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
      title="Download PDF"
    >
      {downloading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Download className="w-5 h-5" />
      )}
      <span className="hidden sm:inline font-medium">
        {downloading ? 'Downloading...' : 'Download PDF'}
      </span>
    </button>
  );
}