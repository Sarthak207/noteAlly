'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(u => setUser(u));
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, querySnapshot => {
      const arr = [];
      querySnapshot.forEach(docSnap => arr.push({ id: docSnap.id, ...docSnap.data() }));
      setNotes(arr);
      setLoading(false);
    });
    return () => {
      unsubscribe();
      unsubAuth();
    };
  }, []);

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

  // Filter notes based on search
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.subject.toLowerCase().includes(search.toLowerCase())
  );

  // Group notes by subject
  const groupedBySubject = filteredNotes.reduce((groups, note) => {
    const subject = note.subject || 'Others';
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(note);
    return groups;
  }, {});

  return (
    <section className="min-h-[85vh] bg-gradient-to-b from-indigo-100 to-indigo-50 p-4">
      <Toaster position="top-center" />
      <h1 className="text-4xl font-bold text-indigo-900 mb-8 text-center">Shared Notes</h1>

      <input
        type="text"
        placeholder="Search by title or subject..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 w-full max-w-lg mx-auto p-3 rounded border border-indigo-300 focus:outline-none focus:border-indigo-600"
      />

      {loading && <p className="text-center text-indigo-700">Loading notes...</p>}

      {!loading && filteredNotes.length === 0 && (
        <p className="text-center text-indigo-700">No notes found.</p>
      )}

      {!loading && Object.keys(groupedBySubject).map(subject => (
        <div key={subject} className="mb-10">
          <h2 className="text-2xl text-indigo-900 font-semibold mb-6 border-b border-indigo-300 pb-2">{subject}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {groupedBySubject[subject].map(note => {
              const isLiked = note.likedBy && user && note.likedBy.includes(user.uid);
              return (
                <div key={note.id} className="border rounded-lg p-6 shadow bg-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-indigo-800 mb-2">{note.title}</h3>
                    <p className="text-indigo-600 font-medium mb-1">Subject: {note.subject}</p>
                    <p className="text-indigo-600 text-sm mb-3">Uploaded by: {note.uploaderEmail || note.userId}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href={note.fileURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleView(note)}
                      className="text-indigo-700 font-semibold hover:underline"
                    >
                      Download PDF
                    </a>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(note)}
                        className={`rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-1 transition
                          ${isLiked ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100 text-indigo-700 hover:bg-indigo-200'}`}
                        disabled={!user}
                        aria-label={isLiked ? 'Unlike note' : 'Like note'}
                      >
                        <span>👍</span> {note.likes || 0}
                      </button>
                      <span className="text-indigo-500 text-sm">Views: {note.views || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
