import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// ════════════════════════════════════════════════════════════════════════════
// FAVORITES MANAGER - Handles all favorite operations
// ════════════════════════════════════════════════════════════════════════════

export function useFavorites(userId) {
  const [favorites, setFavorites] = useState([]);
  const [folders, setFolders] = useState([
    { id: 'all', name: 'All Saved', icon: '❤️', count: 0, isDefault: true },
    { id: 'dream', name: 'Dream Colleges', icon: '🎯', count: 0, isDefault: true },
    { id: 'safe', name: 'Safe Bets', icon: '✅', count: 0, isDefault: true },
    { id: 'backup', name: 'Backup', icon: '🔖', count: 0, isDefault: true },
  ]);
  const [loading, setLoading] = useState(true);

  // Load favorites from Supabase
  useEffect(() => {
    if (!userId) return;
    loadFavorites();
    loadFolders();
  }, [userId]);

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });
      
      if (error) throw error;
      setFavorites(data || []);
      updateFolderCounts(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Merge custom folders with default folders
      if (data && data.length > 0) {
        setFolders(prev => [...prev.filter(f => f.isDefault), ...data]);
      }
    } catch (err) {
      console.error('Error loading folders:', err);
    }
  };

  const updateFolderCounts = (favs) => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      count: folder.id === 'all' 
        ? favs.length 
        : favs.filter(f => f.folder_id === folder.id).length
    })));
  };

  // Add to favorites
  const addFavorite = async (collegeKey, collegeData, folderId = 'all') => {
    try {
      const favorite = {
        user_id: userId,
        college_key: collegeKey,
        folder_id: folderId,
        college_name: collegeData["College Name"],
        branch_name: collegeData["Branch Name"],
        city: collegeData.City,
        cutoff: collegeData._rankCutoff,
        year: collegeData.Year,
        college_code: collegeData["College Code"],
      };

      const { data, error } = await supabase
        .from('favorites')
        .insert(favorite)
        .select()
        .single();
      
      if (error) throw error;
      
      setFavorites(prev => [data, ...prev]);
      updateFolderCounts([data, ...favorites]);
      
      return { success: true, data };
    } catch (err) {
      console.error('Error adding favorite:', err);
      return { success: false, error: err.message };
    }
  };

  // Remove from favorites
  const removeFavorite = async (collegeKey) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('college_key', collegeKey);
      
      if (error) throw error;
      
      const newFavorites = favorites.filter(f => f.college_key !== collegeKey);
      setFavorites(newFavorites);
      updateFolderCounts(newFavorites);
      
      return { success: true };
    } catch (err) {
      console.error('Error removing favorite:', err);
      return { success: false, error: err.message };
    }
  };

  // Check if college is favorited
  const isFavorite = (collegeKey) => {
    return favorites.some(f => f.college_key === collegeKey);
  };

  // Move to folder
  const moveToFolder = async (collegeKey, newFolderId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .update({ folder_id: newFolderId })
        .eq('user_id', userId)
        .eq('college_key', collegeKey);
      
      if (error) throw error;
      
      const newFavorites = favorites.map(f => 
        f.college_key === collegeKey ? { ...f, folder_id: newFolderId } : f
      );
      setFavorites(newFavorites);
      updateFolderCounts(newFavorites);
      
      return { success: true };
    } catch (err) {
      console.error('Error moving to folder:', err);
      return { success: false, error: err.message };
    }
  };

  // Create new folder
  const createFolder = async (name, icon = '📁', color = '#f97316') => {
    try {
      const folder = {
        id: Date.now().toString(),
        user_id: userId,
        name,
        icon,
        color,
      };

      const { data, error } = await supabase
        .from('folders')
        .insert(folder)
        .select()
        .single();
      
      if (error) throw error;
      
      setFolders(prev => [...prev, { ...data, count: 0 }]);
      
      return { success: true, data };
    } catch (err) {
      console.error('Error creating folder:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete folder (move colleges to 'all')
  const deleteFolder = async (folderId) => {
    if (folders.find(f => f.id === folderId)?.isDefault) {
      return { success: false, error: 'Cannot delete default folder' };
    }

    try {
      // Move all colleges in this folder to 'all'
      await supabase
        .from('favorites')
        .update({ folder_id: 'all' })
        .eq('user_id', userId)
        .eq('folder_id', folderId);

      // Delete the folder
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('user_id', userId)
        .eq('id', folderId);
      
      if (error) throw error;
      
      setFolders(prev => prev.filter(f => f.id !== folderId));
      await loadFavorites(); // Reload to update counts
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting folder:', err);
      return { success: false, error: err.message };
    }
  };

  // Get favorites for specific folder
  const getFolderFavorites = (folderId) => {
    if (folderId === 'all') return favorites;
    return favorites.filter(f => f.folder_id === folderId);
  };

  return {
    favorites,
    folders,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    moveToFolder,
    createFolder,
    deleteFolder,
    getFolderFavorites,
    refreshFavorites: loadFavorites,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// COLLEGE NOTES HOOK
// ════════════════════════════════════════════════════════════════════════════

export function useCollegeNotes(userId, collegeKey) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useState(null);

  useEffect(() => {
    if (!userId || !collegeKey) return;
    loadNotes();
  }, [userId, collegeKey]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('college_notes')
        .select('notes')
        .eq('user_id', userId)
        .eq('college_key', collegeKey)
        .single();
      
      if (data) setNotes(data.notes || "");
    } catch (err) {
      // Ignore error if no notes exist yet
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async (text) => {
    try {
      const { error } = await supabase
        .from('college_notes')
        .upsert({
          user_id: userId,
          college_key: collegeKey,
          notes: text,
          updated_at: new Date().toISOString(),
        });
      
      if (!error) setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  const updateNotes = (text) => {
    setNotes(text);
    
    // Debounce save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveNotes(text), 1000);
  };

  return { notes, updateNotes, loading, lastSaved };
}

// ════════════════════════════════════════════════════════════════════════════
// HEART BUTTON COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export function HeartButton({ collegeKey, collegeData, isFavorite, onToggle, className = "" }) {
  const [animating, setAnimating] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    
    onToggle(collegeKey, collegeData);
  };

  return (
    <button
      onClick={handleClick}
      className={`heart-btn ${isFavorite ? 'active' : ''} ${animating ? 'animating' : ''} ${className}`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: isFavorite ? '2px solid #ef4444' : '2px solid #e5e7eb',
        background: isFavorite ? '#ef4444' : '#fff',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isFavorite ? "#fff" : "none"}
        stroke={isFavorite ? "#fff" : "#9ca3af"}
        strokeWidth="2"
        style={{
          transition: 'transform 0.3s',
          transform: animating ? 'scale(1.3)' : 'scale(1)',
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTION
// ════════════════════════════════════════════════════════════════════════════

export function getCollegeBranchKey(item) {
  return `${item["College Code"]}_${item["Branch Name"]}_${item.Year}`.replace(/[^a-zA-Z0-9_]/g, "_");
}

// ════════════════════════════════════════════════════════════════════════════
// CSS ADDITIONS (add to your global CSS)
// ════════════════════════════════════════════════════════════════════════════

export const FAVORITES_CSS = `
.heart-btn:hover {
  transform: scale(1.1);
  border-color: #ef4444;
  background: #fef2f2;
}

.heart-btn.active:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.heart-btn.animating {
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
`;
