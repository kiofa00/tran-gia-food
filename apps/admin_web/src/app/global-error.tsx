'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="m-0 p-0 font-sans bg-slate-50 flex justify-center items-center min-h-screen">
        <div className="max-w-md w-11/12 bg-white p-10 rounded-2xl shadow-xl text-center border border-slate-200">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-orange-500 text-2xl font-bold m-0 mb-3">
            500 — Sự Cố Hệ Thống Nghiêm Trọng
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mb-6">
            Đã có lỗi nghiêm trọng tại Root Layout của ứng dụng Admin Web.
          </p>
          <button
            onClick={() => reset()}
            className="bg-orange-500 text-white border-none rounded-lg py-3 px-7 text-base font-semibold cursor-pointer shadow-md hover:bg-orange-600 transition-colors"
          >
            Thử Khởi Động Lại
          </button>
        </div>
      </body>
    </html>
  );
}
