'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-auth users to login
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      if (!u) {
        router.push('/login');
      }
    });
    return unsubscribe;
  }, [router]);

  // Load notes uploaded by current user
  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const q = query(collection(db, 'notes'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList = [];
      snapshot.forEach(doc => {
        notesList.push({ id: doc.id, ...doc.data() });
      });
      setNotes(notesList);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Delete a note after confirmation
  const deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
      alert('Failed to delete note: ' + error.message);
    }
  };

  // Aggregate stats (likes, views)
  const totalLikes = notes.reduce((sum, n) => sum + (n.likes || 0), 0);
  const totalViews = notes.reduce((sum, n) => sum + (n.views || 0), 0);

  return (
    <section className="min-h-[85vh] p-6 bg-gradient-to-b from-blue-100 to-indigo-50">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-4 text-[var(--primary-color)]">
          {user ? `${user.email}'s Dashboard` : 'User Dashboard'}
        </h1>
        <p className="mb-6 text-gray-600">
          Here are your uploaded notes and summary statistics.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8 text-center">
          <div className="bg-blue-50 rounded-xl py-4 px-5 shadow">
            <p className="text-2xl font-semibold text-blue-700">{notes.length}</p>
            <p className="text-sm text-gray-500">Notes Uploaded</p>
          </div>
          <div className="bg-blue-50 rounded-xl py-4 px-5 shadow">
            <p className="text-2xl font-semibold text-blue-700">{totalLikes}</p>
            <p className="text-sm text-gray-500">Total Likes</p>
          </div>
          <div className="bg-blue-50 rounded-xl py-4 px-5 shadow">
            <p className="text-2xl font-semibold text-blue-700">{totalViews}</p>
            <p className="text-sm text-gray-500">Total Views</p>
          </div>
        </div>

        {/* User notes list */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Notes</h2>

        {loading && <p className="text-center text-gray-500">Loading your notes...</p>}

        {!loading && notes.length === 0 && (
          <p className="text-center text-gray-500">You haven't uploaded any notes yet.</p>
        )}

        <div className="space-y-4">
          {notes.map(note => (
            <div
              key={note.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm"
            >
              <div className="mb-3 sm:mb-0">
                <h3 className="text-lg font-semibold text-indigo-800">{note.title}</h3>
                <p className="text-indigo-700 font-medium">{note.subject}</p>
                <p className="text-gray-500 text-sm">
                  Uploaded: {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleString() : 'unknown'}
                </p>
                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                  <span>Likes: {note.likes || 0}</span>
                  <span>Views: {note.views || 0}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href={note.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] rounded text-white font-semibold transition"
                >
                  Download
                </a>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
