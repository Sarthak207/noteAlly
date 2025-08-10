'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(u => setUser(u));
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allNotes = [];
      querySnapshot.forEach((docSnap) => {
        allNotes.push({ id: docSnap.id, ...docSnap.data() });
      });
      setNotes(allNotes);
      setLoading(false);

      // Extract unique subjects for folders
      const uniqueSubjects = [...new Set(allNotes.map(note => note.subject || 'Uncategorized'))];
      setSubjects(uniqueSubjects);
    });

    return () => {
      unsubscribe();
      unsubAuth();
    };
  }, []);

  // Filter notes based on search and selected subject
  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject ? note.subject === selectedSubject : true;
    return matchesSearch && matchesSubject;
  });

  const handleLike = async (note) => {
    if (!user) {
      toast.error('Please log in to like notes!');
      return;
    }
    const noteRef = doc(db, 'notes', note.id);
    const isLiked = note.likedBy && note.likedBy.includes(user.uid);

    try {
      if (isLiked) {
        await updateDoc(noteRef, {
          likedBy: arrayRemove(user.uid),
          likes: (note.likes || 1) - 1,
        });
        toast('Like removed');
      } else {
        await updateDoc(noteRef, {
          likedBy: arrayUnion(user.uid),
          likes: (note.likes || 0) + 1,
        });
        toast('Liked!');
      }
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleView = async (note) => {
    const noteRef = doc(db, 'notes', note.id);
    try {
      await updateDoc(noteRef, { views: (note.views || 0) + 1 });
    } catch (err) {
      toast.error('Failed to update view count');
    }
  };

  return (
    <section className="min-h-[85vh] bg-gradient-to-b from-indigo-100 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 transition-colors">
      <Toaster position="top-center" />
      <h1 className="text-4xl font-bold text-indigo-900 dark:text-indigo-200 mb-8 text-center">Shared Notes</h1>

      {/* Filters + Search bar in one row */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 mb-8">
        {/* Subject Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            className={`px-5 py-2 rounded-full font-semibold transition ${
              selectedSubject === null
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setSelectedSubject(null)}
          >
            All Subjects
          </button>
          {subjects.map(subject => (
            <button
              key={subject}
              className={`px-5 py-2 rounded-full font-semibold transition ${
                selectedSubject === subject
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Search bar aligned right */}
        <div className="flex justify-end w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 p-3 rounded border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 transition"
          />
        </div>
      </div>

      {loading && <p className="text-center text-indigo-700 dark:text-indigo-400">Loading notes...</p>}

      {!loading && filteredNotes.length === 0 && (
        <p className="text-center text-indigo-700 dark:text-indigo-400">No notes found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredNotes.map(note => {
          const isLiked = note.likedBy && user && note.likedBy.includes(user.uid);
          return (
            <div
              key={note.id}
              className="border rounded-lg p-6 shadow bg-white dark:bg-gray-800 flex flex-col justify-between transition-colors"
            >
              <div>
                <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300 mb-2">{note.title}</h2>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-1">Subject: {note.subject}</p>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm mb-3">
                  Uploaded by: {note.uploaderEmail || note.userId}
                </p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <a
                  href={note.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleView(note)}
                  className="text-indigo-700 dark:text-indigo-300 font-semibold hover:underline"
                >
                  Download PDF
                </a>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(note)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-1 transition
                      ${
                        isLiked
                          ? 'bg-[var(--primary-color)] text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-600'
                      }`}
                    disabled={!user}
                    aria-label={isLiked ? 'Unlike note' : 'Like note'}
                  >
                    <span>👍</span> {note.likes || 0}
                  </button>
                  <span className="text-indigo-500 dark:text-indigo-400 text-sm">
                    Views: {note.views || 0}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
