import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AuthContext } from '../context/AuthContext';
import { 
  fetchUserGroups,
  createGroupThunk, 
  joinGroupThunk, 
  removeMemberThunk,
  setActiveGroup, 
  addMatch, 
  addToHistory, 
  setHistory,
  clearGroupState 
} from '../store/groupSlice';
import API from '../services/api';
import ActivityCard from '../components/ActivityCard';

const SwipeFeed = () => {
  const [activities, setActivities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingActivities, setLoadingActivities] = useState(true);
  
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupImageInput, setGroupImageInput] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState('matches'); 

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editProfileImage, setEditProfileImage] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const dispatch = useDispatch();
  const { list: groups = [], activeGroup, matches = [], history = [] } = useSelector((state) => state.group || {});
  const { user, updateUserContext, logoutContext } = useContext(AuthContext);
  const navigate = useNavigate();

  const UPLOADS_URL = import.meta.env.VITE_API_URL 
    ? (import.meta.env.VITE_API_URL + '/uploads/') 
    : 'https://tfriends-backend.onrender.com/uploads/';

  useEffect(() => {
    dispatch(fetchUserGroups());

    const fetchActivities = async () => {
      try {
        const res = await API.get('/activities');
        const list = Array.isArray(res.data) 
          ? res.data 
          : (res.data.activities || res.data.data || []);
        setActivities(list);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoadingActivities(false);
      }
    };

    const fetchSwipeHistory = async () => {
      try {
        const { data } = await API.get('/swipes');
        if (Array.isArray(data)) {
          const loadedHistory = data.map(item => ({
            id: item.activity?._id || item._id,
            title: item.activity?.title || 'פעילות שנמחקה',
            status: item.status === 'like' ? '💚 לייק' : '❌ דיסלייק',
            time: new Date(item.createdAt || Date.now()).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
          }));
          dispatch(setHistory(loadedHistory));
        }
      } catch (err) {
        console.error('Error fetching swipe history:', err);
      }
    };

    fetchActivities();
    fetchSwipeHistory();
  }, [dispatch]);

  const handleSelectGroup = (groupId) => {
    const selected = groups.find(g => g._id === groupId);
    dispatch(setActiveGroup(selected || groupId));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImageInput(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setGroupImageInput(null);
    setPreviewUrl(null);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupNameInput.trim()) return;

    const formData = new FormData();
    formData.append('name', groupNameInput.trim());
    if (groupImageInput) {
      formData.append('image', groupImageInput);
    }

    const result = await dispatch(createGroupThunk(formData));
    if (createGroupThunk.fulfilled.match(result)) {
      setGroupNameInput('');
      setGroupImageInput(null);
      setPreviewUrl(null);
      alert('הקבוצה נוצרה בהצלחה!');
    } else {
      alert(result.payload || 'שגיאה ביצירת הקבוצה');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!groupCodeInput.trim()) return;

    const result = await dispatch(joinGroupThunk(groupCodeInput.trim()));
    if (joinGroupThunk.fulfilled.match(result)) {
      setGroupCodeInput('');
      alert('הצטרפת לקבוצה בהצלחה!');
    } else {
      alert(result.payload || 'שגיאה בהצטרפות לקבוצה');
    }
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('האם אתה בטוח שברצונך להסיר משתמש זה מהקבוצה?')) {
      dispatch(removeMemberThunk({ groupId: activeGroup._id, memberId }));
    }
  };

  const openProfileModal = () => {
    setEditName(user?.name || '');
    setEditPassword('');
    setEditProfileImage(null);
    setEditPreviewUrl(null);
    setIsProfileModalOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const formData = new FormData();
      if (editName.trim()) formData.append('name', editName.trim());
      if (editPassword.trim()) formData.append('password', editPassword.trim());
      if (editProfileImage) formData.append('image', editProfileImage);

      const { data } = await API.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUserContext(data);
      setIsProfileModalOpen(false);
      alert('הפרופיל עודכן בהצלחה! ✨');
    } catch (err) {
      alert(err.response?.data?.message || 'שגיאה בעדכון הפרופיל');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSwipe = async (status) => {
    const currentActivity = activities[currentIndex];
    if (!currentActivity) return;
    
    dispatch(addToHistory({
      id: currentActivity._id,
      title: currentActivity.title,
      status: status === 'like' ? '💚 לייק' : '❌ דיסלייק',
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    }));

    try {
      const { data } = await API.post('/swipes', {
        activityId: currentActivity._id,
        status: status
      });

      if (data.match && activeGroup) {
        dispatch(addMatch({
          id: Date.now(),
          activityTitle: currentActivity.title,
          message: `יש התאמה בקבוצה "${activeGroup.name}" על ${currentActivity.title}! 🎉`
        }));
      }

      setCurrentIndex((prevIndex) => prevIndex + 1);
    } catch (err) {
      alert(err.response?.data?.message || 'שגיאה ברישום ההחלקה');
    }
  };

  const handleLogout = () => {
    dispatch(clearGroupState());
    logoutContext();
    navigate('/login');
  };

  const isAdmin = activeGroup && (activeGroup.admin?._id === user?._id || activeGroup.admin === user?._id);

  if (loadingActivities) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>טוען פעילויות...</h2>;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', direction: 'rtl', background: '#f8fafc', position: 'relative' }}>
      
      {/* 1. סרגל צד - ניהול קבוצות, היסטוריה והתאמות */}
      <div style={{ width: '360px', background: '#ffffff', borderLeft: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* בחירת קבוצה פעילה */}
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>👥 בחירת קבוצה פעילה:</h4>
          <select 
            value={activeGroup?._id || ''} 
            onChange={(e) => handleSelectGroup(e.target.value)}
            style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 'bold', outline: 'none' }}
          >
            {groups.length === 0 && <option value="">אין קבוצות זמינות</option>}
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} (קוד: {g.code})
              </option>
            ))}
          </select>

          {activeGroup && (
            <div style={{ marginTop: '12px', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <img 
                  src={activeGroup.image ? `${UPLOADS_URL}${activeGroup.image}` : 'https://via.placeholder.com/60?text=Group'} 
                  alt={activeGroup.name} 
                  style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/60?text=Group';
                  }}
                />
                <div>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>{activeGroup.name}</strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    קוד: <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{activeGroup.code}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <h5 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#475569' }}>
                  חברי הקבוצה ({activeGroup.members?.length || 0}):
                </h5>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeGroup.members?.map((member) => (
                    <li key={member._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {member.profileImage && member.profileImage !== 'default-avatar.png' ? (
                          <img 
                            src={`${UPLOADS_URL}${member.profileImage}`} 
                            alt={member.name} 
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span>👤</span>
                        )}
                        <span style={{ color: '#334155' }}>{member.name || member.email}</span>
                      </div>
                      {isAdmin && member._id !== user?._id && (
                        <button 
                          onClick={() => handleRemoveMember(member._id)}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          הסר ✕
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* פתיחת קבוצה חדשה */}
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>🔨 פתח קבוצה חדשה</h4>
          <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="שם הקבוצה..." 
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              required
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            />

            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '10px', textAlign: 'center', background: '#ffffff' }}>
              {previewUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <img 
                    src={previewUrl} 
                    alt="תצוגה מקדימה" 
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    החלף תמונה ✕
                  </button>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>📷</div>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>העלה תמונת קבוצה</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            <button type="submit" style={{ padding: '8px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              צור קבוצה 🚀
            </button>
          </form>
        </div>

        {/* הצטרפות עם קוד */}
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>🔑 הצטרף לקבוצה עם קוד</h4>
          <form onSubmit={handleJoinGroup} style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              placeholder="הכנס קוד קבוצה..." 
              value={groupCodeInput}
              onChange={(e) => setGroupCodeInput(e.target.value)}
              required
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '8px 12px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              הצטרף
            </button>
          </form>
        </div>

        {/* טאבים: התאמות והיסטוריה */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '12px' }}>
          <button 
            onClick={() => setActiveTab('matches')}
            style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'matches' ? '3px solid #2563eb' : 'none', fontWeight: activeTab === 'matches' ? 'bold' : 'normal', cursor: 'pointer', color: activeTab === 'matches' ? '#2563eb' : '#64748b' }}
          >
            התאמות ({matches.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'history' ? '3px solid #2563eb' : 'none', fontWeight: activeTab === 'history' ? 'bold' : 'normal', cursor: 'pointer', color: activeTab === 'history' ? '#2563eb' : '#64748b' }}
          >
            היסטוריה ({history.length})
          </button>
        </div>

        <div style={{ flex: 1 }}>
          {activeTab === 'matches' ? (
            matches.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '13px', marginTop: '15px' }}>אין עדיין התאמות בקבוצה...</p>
            ) : (
              matches.map((match) => (
                <div key={match.id} style={{ background: '#eff6ff', borderRight: '4px solid #2563eb', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                  <strong style={{ color: '#1e40af', display: 'block', fontSize: '13px' }}>🎯 בינגו משותף!</strong>
                  <span style={{ fontSize: '12px', color: '#334155' }}>{match.message}</span>
                </div>
              ))
            )
          ) : (
            history.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '13px', marginTop: '15px' }}>אין היסטוריה זמינה</p>
            ) : (
              history.map((item, index) => (
                <div key={index} style={{ background: '#ffffff', borderRight: `4px solid ${item.status.includes('לייק') ? '#16a34a' : '#dc2626'}`, padding: '8px', borderRadius: '6px', marginBottom: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '12px', color: '#1e293b' }}>{item.title}</strong>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.time}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{item.status}</span>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* 2. אזור הכרטיסיות המרכזי */}
      <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Header מרכזי עם פרטי המשתמש */}
        <div style={{ width: '100%', maxWidth: '520px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#ffffff', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user?.profileImage && user.profileImage !== 'default-avatar.png' ? (
              <img
                src={`${UPLOADS_URL}${user.profileImage}`}
                alt={user.name}
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                👤
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>שלום, {user?.name} 👋</h3>
                <button 
                  onClick={openProfileModal}
                  title="ערוך פרטים אישיים ותמונה"
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                >
                  ⚙️
                </button>
              </div>
              {activeGroup ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  {activeGroup.image && (
                    <img 
                      src={`${UPLOADS_URL}${activeGroup.image}`} 
                      alt="" 
                      style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold' }}>גולש כרגע בקבוצה: {activeGroup.name}</span>
                </div>
              ) : (
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>לא נבחרה קבוצה</span>
              )}
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            style={{ padding: '7px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
          >
            התנתק
          </button>
        </div>

        {/* כרטיסיית ההחלקה */}
        {currentIndex < activities.length ? (
          <ActivityCard 
            activity={activities[currentIndex]} 
            onSwipe={handleSwipe} 
          />
        ) : (
          <div style={{ marginTop: '50px', padding: '30px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', maxWidth: '420px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>אין יותר בילויים זמינים! 🤷‍♂️</h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>הגעת לסוף הרשימה.</p>
          </div>
        )}
      </div>

      {/* 3. מודל עריכת פרופיל אישי */}
      {isProfileModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            direction: 'rtl'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>⚙️ עדכון פרטים אישיים</h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img 
                  src={
                    editPreviewUrl 
                      ? editPreviewUrl 
                      : (user?.profileImage && user.profileImage !== 'default-avatar.png'
                          ? `${UPLOADS_URL}${user.profileImage}`
                          : 'https://via.placeholder.com/80?text=Avatar')
                  } 
                  alt="תמונת פרופיל"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }}
                />
                <label style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>
                  שנה תמונה
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditProfileImage(file);
                        setEditPreviewUrl(URL.createObjectURL(file));
                      }
                    }} 
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '4px' }}>שם מלא:</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '4px' }}>סיסמה חדשה (השאר ריק אם אינך רוצה לשנות):</label>
                <input 
                  type="password" 
                  placeholder="לפחות 6 תווים..."
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  minLength={6}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  disabled={isUpdatingProfile}
                  style={{ flex: 1, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: isUpdatingProfile ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  {isUpdatingProfile ? 'שומר שינויים...' : 'שמור שינויים'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsProfileModalOpen(false)}
                  style={{ padding: '10px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SwipeFeed;