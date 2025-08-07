'use client';

import { useState, useEffect } from 'react';
import { auth, storage, db } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) router.push('/login');
    });
    return unsubscribe;
  }, [router]);

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject || !pdfFile) {
      setError('All fields including PDF file are required.');
      return;
    }
    if (!auth.currentUser) {
      setError('You must be logged in to upload.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const timestamp = Date.now();
      const fileRef = ref(storage, `notes/${auth.currentUser.uid}/${timestamp}_${pdfFile.name}`);
      await uploadBytes(fileRef, pdfFile);
      const downloadURL = await getDownloadURL(fileRef);
      await addDoc(collection(db, 'notes'), {
        title,
        subject,
        fileURL: downloadURL,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        views: 0,
      });
      setUploading(false);
      setTitle('');
      setSubject('');
      setPdfFile(null);
      router.push('/');
    } catch (err) {
      setError('Upload failed: ' + err.message);
      setUploading(false);
    }
  };

  return (
    <section className="min-h-[85vh] flex items-center justify-center bg-var-bg-color dark:bg-gray-900 px-2 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-md w-full p-8 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-[var(--primary-color)] dark:text-[var(--primary-dark)] mb-6 drop-shadow text-center">
          Upload a Note (PDF)
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-red-600 dark:text-red-400 text-center">{error}</p>}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:border-[var(--accent)] transition"
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:border-[var(--accent)] transition"
            required
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 transition-colors"
            required
          />
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 mt-2 rounded-lg bg-[var(--primary-color)] dark:bg-[var(--primary-dark)] hover:opacity-90 text-white font-semibold text-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Note'}
          </button>
        </form>
      </div>
    </section>
  );
}
