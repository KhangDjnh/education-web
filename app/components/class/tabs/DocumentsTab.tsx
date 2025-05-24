import React, { useState, useEffect } from 'react';
import { DocumentIcon, ArrowDownTrayIcon, TrashIcon, PlusIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newDocument, setNewDocument] = useState<{ title: string; filePath: string }>({
    title: '',
    filePath: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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

  const handleUpload = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.uploadDocument(
        {
          classId,
          title: newDocument.title,
          filePath: newDocument.filePath,
        },
        token
      );

      setShowUploadModal(false);
      setNewDocument({ title: '', filePath: '' });
      await fetchDocuments();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while uploading document'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedDocument) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.updateDocument(
        selectedDocument.id,
        {
          title: newDocument.title,
          filePath: newDocument.filePath,
        },
        token
      );

      setShowEditModal(false);
      setSelectedDocument(null);
      setNewDocument({ title: '', filePath: '' });
      await fetchDocuments();
    } catch (err) {
      console.error('Error updating document:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while updating document'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.deleteDocument(selectedDocument.id, token);
      setShowDeleteModal(false);
      setSelectedDocument(null);
      await fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while deleting document'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDocument = (filePath: string) => {
    window.open(filePath, '_blank');
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
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
        >
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
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center mx-auto"
            >
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
                    onClick={() => handleViewDocument(doc.filePath)}
                    className="text-gray-400 hover:text-blue-600"
                    title="View"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDocument(doc);
                      setNewDocument({ title: doc.title, filePath: doc.filePath });
                      setShowEditModal(true);
                    }}
                    className="text-gray-400 hover:text-blue-600"
                    title="Edit"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowDeleteModal(true);
                    }}
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

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document title"
                />
              </div>
              <div>
                <label htmlFor="filePath" className="block text-sm font-medium text-gray-700 mb-1">
                  File Path
                </label>
                <input
                  type="text"
                  id="filePath"
                  value={newDocument.filePath}
                  onChange={(e) => setNewDocument({ ...newDocument, filePath: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter file path"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isSubmitting || !newDocument.title || !newDocument.filePath}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {showEditModal && selectedDocument && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Document</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedDocument(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  id="editTitle"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document title"
                />
              </div>
              <div>
                <label htmlFor="editFilePath" className="block text-sm font-medium text-gray-700 mb-1">
                  File Path
                </label>
                <input
                  type="text"
                  id="editFilePath"
                  value={newDocument.filePath}
                  onChange={(e) => setNewDocument({ ...newDocument, filePath: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter file path"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedDocument(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={isSubmitting || !newDocument.title || !newDocument.filePath}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Document Modal */}
      {showDeleteModal && selectedDocument && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Delete Document</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDocument(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the document "{selectedDocument.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDocument(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 