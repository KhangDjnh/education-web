import React from "react";
import {
  DocumentTextIcon,
  PaperClipIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

interface AssignmentFile {
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface Assignment {
  id: number;
  title: string;
  content: string;
  classId: number;
  files: AssignmentFile[];
  status: string;
  startAt: string;
  endAt: string;
  createdAt: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  opened: boolean;
  onClick: () => void;
  getToken?: () => string;
  onDelete?: (id: number) => void;
  onEdit?: (assignment: Assignment) => void; // thêm dòng này
}

const statusColor = (status: string) => {
  if (status === "Đang diễn ra")
    return "bg-green-100 text-green-700 border-green-300";
  if (status === "Chưa bắt đầu")
    return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-gray-100 text-gray-600 border-gray-300";
};

const downloadAssignmentFile = async (
  file: AssignmentFile,
  token: string
) => {
  try {
    const res = await fetch(
      `http://localhost:8080/education${file.downloadUrl}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error("Không thể tải file");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 100);
  } catch (err) {
    alert("Không thể tải file đính kèm");
  }
};

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  opened,
  onClick,
  getToken,
  onDelete,
  onEdit,
}) => {
  return (
    <div
      className={`rounded-xl shadow-md border transition-all cursor-pointer bg-white mb-4 ${
        opened ? "ring-2 ring-blue-400" : "hover:shadow-lg"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          <div>
            <div className="font-bold text-lg text-gray-800">{assignment.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor(
                  assignment.status
                )}`}
              >
                {assignment.status}
              </span>
              <span className="flex items-center text-xs text-gray-500 ml-2">
                <ClockIcon className="h-4 w-4 mr-1" />
                {new Date(assignment.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {opened ? (
            <ChevronUpIcon className="h-6 w-6 text-blue-400" />
          ) : (
            <ChevronDownIcon className="h-6 w-6 text-gray-400" />
          )}
          {/* Nút edit và xóa chỉ hiển thị khi card đang mở */}
          {opened && (
            <>
              <button
                type="button"
                className="ml-2 p-1 rounded hover:bg-yellow-100"
                title="Chỉnh sửa bài tập"
                onClick={e => {
                  e.stopPropagation();
                  onEdit && onEdit(assignment);
                }}
              >
                <PencilSquareIcon className="h-6 w-6 text-yellow-500" />
              </button>
              <button
                type="button"
                className="ml-2 p-1 rounded hover:bg-red-100"
                title="Xóa bài tập"
                onClick={e => {
                  e.stopPropagation();
                  if (
                    window.confirm("Bạn có chắc chắn muốn xóa bài tập này?")
                  ) {
                    onDelete && onDelete(assignment.id);
                  }
                }}
              >
                <TrashIcon className="h-6 w-6 text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>
      {opened && (
        <div className="px-6 pb-6 pt-2 border-t bg-blue-50 rounded-b-xl">
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Nội dung:</span>
            <div className="text-gray-800 mt-1">{assignment.content}</div>
          </div>
          <div className="mb-2 flex flex-wrap gap-4">
            <div>
              <span className="font-semibold text-gray-700">Thời gian bắt đầu:</span>
              <span className="ml-2 text-gray-600">
                {new Date(assignment.startAt).toLocaleString("vi-VN")}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Thời gian kết thúc:</span>
              <span className="ml-2 text-gray-600">
                {new Date(assignment.endAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Ngày tạo:</span>
            <span className="ml-2 text-gray-600">
              {new Date(assignment.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-700">File đính kèm:</span>
            {assignment.files.length === 0 ? (
              <span className="ml-2 text-gray-400">Không có file</span>
            ) : (
              <ul className="mt-2 space-y-2">
                {assignment.files.map((file, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <PaperClipIcon className="h-5 w-5 text-blue-400" />
                    <button
                      type="button"
                      className="text-blue-700 hover:underline font-medium flex items-center"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (getToken && file.downloadUrl) {
                          await downloadAssignmentFile(file, getToken());
                        }
                      }}
                    >
                      {file.fileName}
                      <ArrowDownTrayIcon className="h-4 w-4 ml-1" />
                    </button>
                    <span className="text-xs text-gray-400 ml-2">
                      ({(file.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;