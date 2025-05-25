import React, { useState, useEffect } from "react";
import { BookOpenIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";

interface DocumentItem {
  id: number;
  title: string;
  filePath: string;
  uploadedAt: string;
}

interface DocumentsTabProps {
  classId: number;
}

export default function DocumentsTab({ classId }: DocumentsTabProps) {
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [classId]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:8080/education/api/documents/class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.code === 1000) {
        setDocuments(data.result);
      } else {
        setError(data.message || "Không thể tải tài liệu.");
      }
    } catch {
      setError("Không thể tải tài liệu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 relative">
        <h2 className="text-2xl font-bold text-blue-700 mb-1 flex items-center">
          <BookOpenIcon className="h-7 w-7 mr-2" />
          Tài liệu lớp học
        </h2>
        <p className="mb-6 text-gray-500">Danh sách tài liệu được chia sẻ trong lớp.</p>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-600">Đang tải tài liệu...</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Chưa có tài liệu nào.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <li key={doc.id} className="py-4 flex items-center justify-between group">
                <div>
                  <div className="font-semibold text-gray-800 group-hover:text-blue-700 transition text-base">
                    {doc.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleTimeString("vi-VN")}{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <a
                  href={doc.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-1" />
                  Xem
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 