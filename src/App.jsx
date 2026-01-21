import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AttendanceView } from './components/AttendanceView';
import { ProfileView } from './components/ProfileView';
import { NewGradesNotification } from './components/NewGradesNotification';
import { api } from './services/api';
import { detectNewGrades } from './services/gradeNotifications';

function App({ isExtension = false, initialData = null, showOriginalSite = null }) {
  const [sessionData, setSessionData] = useState(initialData ? { data: initialData } : null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentBulletin, setCurrentBulletin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('betterscodoc-theme') || 'dark');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [newGrades, setNewGrades] = useState([]);

  // Set initial bulletin from initialData and check for new grades
  useEffect(() => {
    if (initialData?.relevé) {
      setCurrentBulletin(initialData);
      // Détecter les nouvelles notes
      const detected = detectNewGrades(initialData);
      if (detected.length > 0) {
        setNewGrades(detected);
      }
    }
  }, [initialData]);

  // Apply theme to our root container
  useEffect(() => {
    const root = document.getElementById('better-scodoc-root');
    if (root) {
      if (theme === 'light') {
        root.classList.add('light');
      } else {
        root.classList.remove('light');
      }
    }
    localStorage.setItem('betterscodoc-theme', theme);
  }, [theme]);

  // Load photo
  useEffect(() => {
    if (sessionData) {
      // En extension, on peut utiliser l'URL directe
      setPhotoUrl('/services/data.php?q=getStudentPic');
    }
  }, [sessionData]);

  // Check for new grades
  useEffect(() => {
    if (activeTab === 'dashboard' && currentBulletin) {
      try {
        const grades = detectNewGrades(currentBulletin);
        if (grades.length > 0) {
          setNewGrades(grades);
        }
      } catch (e) {
        console.error('Error detecting grades:', e);
      }
    }
  }, [activeTab, currentBulletin]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (result) => {
    setSessionData(result);
    if (result.data?.relevé) {
      setCurrentBulletin(result.data);
    }
  };

  const handleLogout = async () => {
    if (isExtension) {
      // Déconnexion via CAS
      window.location.href = 'https://cas.iutbeziers.fr:8443/logout';
    } else {
      await api.logout();
      setSessionData(null);
      setCurrentBulletin(null);
      setPhotoUrl(null);
      setActiveTab('dashboard');
    }
  };

  const handleSelectSemester = async (semesterId) => {
    setLoading(true);
    setLoadingProgress(10);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 10, 80));
    }, 300);

    try {
      const bulletin = await api.getBulletin(semesterId);
      clearInterval(progressInterval);
      setLoadingProgress(100);

      setTimeout(() => {
        setCurrentBulletin(bulletin);
        setLoading(false);
        setLoadingProgress(0);
      }, 200);
    } catch (e) {
      console.error('Failed to load bulletin:', e);
      clearInterval(progressInterval);
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  // Si pas de données et en mode extension, afficher le login
  if (!sessionData) {
    return <Login onLogin={handleLogin} showOriginalSite={showOriginalSite} />;
  }

  const relevé = currentBulletin?.relevé || sessionData.data?.relevé;
  const etudiant = relevé?.etudiant;
  const semesters = sessionData.data?.semestres || [];

  return (
    <div className="layout-container">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <p style={{ marginBottom: 20, fontSize: 16 }}>Chargement du semestre...</p>
            <div className="progress-bar" style={{ width: 220 }}>
              <div className="progress-fill" style={{ width: `${loadingProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Notification de nouvelles notes */}
      {newGrades.length > 0 && (
        <NewGradesNotification
          newGrades={newGrades}
          onDismiss={() => setNewGrades([])}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        semesters={semesters}
        onSelectSemester={handleSelectSemester}
        currentSemesterId={relevé?.formsemestre_id}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="main-content">
        {/* User Profile Card - Compact */}
        {etudiant && activeTab !== 'profile' && (
          <div className="user-profile-card">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Photo"
                className="user-photo"
                onError={(e) => e.target.style.display = 'none'}
              />
            ) : (
              <div className="user-photo-placeholder">
                {etudiant.prenom?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="user-details">
              <div className="user-details-name">{etudiant.prenom} {etudiant.nom}</div>
              <div className="user-details-info">
                <span className="user-details-item">📧 {etudiant.email}</span>
                <span className="user-details-item">🆔 {etudiant.code_nip}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="page-content fade-in">
          {activeTab === 'dashboard' && <Dashboard data={currentBulletin} allSemesters={semesters} />}
          {activeTab === 'attendance' && <AttendanceView data={currentBulletin} />}
          {activeTab === 'profile' && (
            <ProfileView
              data={currentBulletin}
              photoUrl={photoUrl}
              allSemesters={semesters}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
