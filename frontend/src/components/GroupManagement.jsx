import { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserGroups, 
  createGroupThunk, 
  joinGroupThunk, 
  removeMemberThunk, 
  setActiveGroup 
} from '../store/groupSlice';
import { AuthContext } from '../context/AuthContext';

const GroupManagement = () => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const { list: groups, activeGroup, error } = useSelector((state) => state.group);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [msg, setMsg] = useState('');

  const UPLOADS_URL = 'http://localhost:5000/uploads/';

  useEffect(() => {
    dispatch(fetchUserGroups());
  }, [dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const formData = new FormData();
    formData.append('name', newGroupName.trim());
    if (groupImage) {
      formData.append('image', groupImage);
    }

    const result = await dispatch(createGroupThunk(formData));
    if (createGroupThunk.fulfilled.match(result)) {
      setNewGroupName('');
      setGroupImage(null);
      setPreviewUrl(null);
      setMsg('הקבוצה נוצרה בהצלחה!');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    const result = await dispatch(joinGroupThunk(joinCode.trim()));
    if (joinGroupThunk.fulfilled.match(result)) {
      setJoinCode('');
      setMsg('הצטרפת לקבוצה בהצלחה!');
    }
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('האם אתה בטוח שברצונך להסיר משתמש זה מהקבוצה?')) {
      dispatch(removeMemberThunk({ groupId: activeGroup._id, memberId }));
    }
  };

  const isAdmin = activeGroup?.admin?._id === user?._id || activeGroup?.admin === user?._id;

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>👥 ניהול קבוצות</h2>
      
      {msg && <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>{msg}</div>}
      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>{error}</div>}

      {/* בחירת קבוצה פעילה */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>הקבוצה הפעילה שלך:</label>
        <select 
          value={activeGroup?._id || ''} 
          onChange={(e) => {
            const selected = groups.find(g => g._id === e.target.value);
            dispatch(setActiveGroup(selected));
          }}
          style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
        >
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name} (קוד: {g.code})
            </option>
          ))}
        </select>
      </div>

      {/* פרטי הקבוצה הפעילה וחבריה */}
      {activeGroup && (
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <img 
              src={activeGroup.image ? `${UPLOADS_URL}${activeGroup.image}` : 'https://via.placeholder.com/60?text=Group'} 
              alt={activeGroup.name} 
              style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/60?text=Group'; }}
            />
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', color: '#0f172a' }}>{activeGroup.name}</h3>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                🔑 קוד הצטרפות: <b style={{ color: '#2563eb' }}>{activeGroup.code}</b>
              </div>
            </div>
          </div>

          <h4 style={{ margin: '14px 0 8px 0', fontSize: '13px', color: '#475569' }}>חברי הקבוצה ({activeGroup.members?.length}):</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeGroup.members?.map((member) => (
              <li key={member._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: '#fff', borderRadius: '6px', border: '1px solid #f1f5f9', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {member.profileImage && member.profileImage !== 'default-avatar.png' ? (
                    <img src={`${UPLOADS_URL}${member.profileImage}`} alt={member.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span>👤</span>
                  )}
                  <span>{member.name} ({member.email})</span>
                </div>
                
                {isAdmin && member._id !== user?._id && (
                  <button 
                    onClick={() => handleRemoveMember(member._id)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                  >
                    הסר מהקבוצה ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* יצירת קבוצה */}
      <form onSubmit={handleCreateGroup} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ margin: 0, color: '#1e293b' }}>צור קבוצה חדשה ➕</h4>
        <input 
          type="text" 
          placeholder="שם הקבוצה..." 
          value={newGroupName} 
          onChange={(e) => setNewGroupName(e.target.value)}
          required
          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        
        {previewUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={previewUrl} alt="Preview" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />
            <button type="button" onClick={() => { setGroupImage(null); setPreviewUrl(null); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '3px 6px', fontSize: '11px', cursor: 'pointer' }}>הסר תמונה</button>
          </div>
        ) : (
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '12px' }} />
        )}

        <button type="submit" style={{ padding: '9px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          צור קבוצה
        </button>
      </form>

      {/* הצטרפות עם קוד */}
      <form onSubmit={handleJoinGroup} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ margin: 0, color: '#1e293b' }}>הצטרף לקבוצה קיימת 🔑</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="הזן קוד קבוצה..." 
            value={joinCode} 
            onChange={(e) => setJoinCode(e.target.value)}
            required
            style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <button type="submit" style={{ padding: '8px 14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            הצטרף
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupManagement;