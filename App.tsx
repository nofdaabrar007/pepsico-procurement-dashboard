
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import UploadPage from './pages/UploadPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import Header from './components/Header.tsx';
import { SubtleWaveBackground } from './components/Icons.tsx';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isUploadPage = location.pathname === '/upload' || location.pathname === '/';
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative overflow-hidden">
      {isUploadPage && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <SubtleWaveBackground className="w-full h-full object-cover text-blue-100/70" />
        </div>
      )}

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<Navigate to="/upload" replace />} />
            </Routes>
          </main>
          <footer className="text-center py-6 px-4 mt-auto border-t border-gray-200 bg-white/50 backdrop-blur-sm">
              <p className="text-sm text-gray-500 uppercase tracking-widest">
                  Crafted by <span className="font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300">Nofda Abrar</span>
              </p>
          </footer>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};


export default App;