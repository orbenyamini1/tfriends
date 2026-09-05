import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// טעינה עצלה של העמודים (Code Splitting / Lazy Loading)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SwipeFeed = lazy(() => import('./pages/SwipeFeed'));
const NotFound = lazy(() => import('./pages/NotFound'));

// הגנה על נתיבים תוך שימוש ב-AuthContext ובדיקת Loading
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px', fontFamily: 'Arial, sans-serif' }}>
        <h3>מאמת נתונים... ⏳</h3>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      {/* Suspense מציג אינדיקציית טעינה בזמן שהעמוד נשלף ברקע */}
      <Suspense fallback={
        <div style={{ textAlign: 'center', marginTop: '60px', fontFamily: 'Arial, sans-serif' }}>
          <h3>טוען עמוד... ⏳</h3>
        </div>
      }>
        <Routes>
          {/* נתיבים ציבוריים */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* נתיב מוגן של הפיד הראשי */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <SwipeFeed />
              </ProtectedRoute>
            } 
          />

          {/* עמוד 404 לכל נתיב לא מוכר (דרישת חובה במחוון) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;