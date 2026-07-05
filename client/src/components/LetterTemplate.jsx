import { renderLetterHTML } from './letterTemplates';

export default function LetterTemplate({ submission, onClose }) {
  const html = renderLetterHTML(submission);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="font-semibold text-gray-800">Preview Surat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">
            ✕
          </button>
        </div>
        <div className="p-0">
          <iframe
            srcDoc={html}
            className="w-full h-96 border-0 rounded-b-xl"
            title="Preview Surat"
            sandbox="allow-same-origin"
          />
        </div>
        <div className="flex justify-end px-5 pb-5">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
