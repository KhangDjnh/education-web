import React, { useState, useEffect } from 'react';
import { DocumentIcon, ArrowDownTrayIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { Document } from '../../../types/class';

interface DocumentsTabProps {
  classId: string;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ classId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, [classId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const data = await classService.getDocuments(classId, token);
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching documents'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownload = async (document: Document) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Implement download logic here
      console.log('Downloading document:', document.title);
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Implement delete logic here
      console.log('Deleting document:', documentId);
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Class Documents</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No documents yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading documents to this class.
          </p>
          <div className="mt-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center mx-auto">
              <PlusIcon className="h-5 w-5 mr-2" />
              Upload First Document
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <DocumentIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Uploaded on {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="text-gray-400 hover:text-blue-600"
                    title="Download"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}; 