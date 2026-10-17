import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

// Lazy loading על כל דפי האפליקציה לשיפור זמני טעינה
const SwipeFeed = lazy(() => import('./pages/SwipeFeed'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Suspense 
      fallback={
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
          color: '#2563eb'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <strong style={{ fontSize: '18px' }}>טוען את tfriends...</strong>
        </div>
      }
    >
      <Routes>
        {/* נתיבים ציבוריים */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* נתיב ראשי מוגן */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <SwipeFeed />
            </PrivateRoute>
          } 
        />

        {/* עמוד 404 ייעודי לכל נתיב שלא קיים */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;