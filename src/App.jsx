import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import TableMap from './components/TableMap';
import OrderPanel from './components/OrderPanel';
import OrdersList from './components/OrdersList';
import MenuPage from './components/MenuPage';
import CheckInPage from './components/CheckInPage';

function Header({ view, setView, alarmEnabled, onToggleAlarm, onRequestNotifications }) {
  return (
    <header className="bg-parissy-navy text-white px-4 py-2 flex items-center gap-2 shadow-lg z-20">
      <h1 className="text-lg font-bold tracking-wide mr-4">Par'Issy</h1>

      <nav className="flex gap-1">
        {[
          { id: 'checkin', label: 'Check-In', icon: '🛎️' },
          { id: 'map', label: 'Tables', icon: '🗺️' },
          { id: 'orders', label: 'Orders', icon: '📋' },
          { id: 'menu', label: 'Menu', icon: '📖' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`touch-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${view === tab.id ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onRequestNotifications}
          className="touch-btn px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
          title="Enable browser notifications"
        >
          🔔
        </button>
        <button
          onClick={onToggleAlarm}
          className={`touch-btn px-2 py-1 text-xs rounded transition-colors
            ${alarmEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-white/10 hover:bg-white/20 opacity-50'}`}
          title={alarmEnabled ? 'Alarm ON' : 'Alarm OFF'}
        >
          {alarmEnabled ? '⏰ ON' : '⏰ OFF'}
        </button>
      </div>
    </header>
  );
}

function AppContent() {
  const { state, dispatch, requestNotificationPermission } = useApp();
  const [view, setView] = useState('checkin');
  const [selectedTable, setSelectedTable] = useState(null);

  // Close panel on escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setSelectedTable(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const toggleAlarm = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { alarmEnabled: !state.alarmEnabled },
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Header
        view={view}
        setView={setView}
        alarmEnabled={state.alarmEnabled}
        onToggleAlarm={toggleAlarm}
        onRequestNotifications={requestNotificationPermission}
      />

      <main className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
          ${selectedTable ? 'hidden sm:flex' : 'flex'}`}>
          {view === 'checkin' && <CheckInPage />}
          {view === 'map' && <TableMap onSelectTable={setSelectedTable} />}
          {view === 'orders' && <OrdersList onSelectTable={setSelectedTable} />}
          {view === 'menu' && <MenuPage />}
        </div>

        {/* Order panel (side panel on desktop, full screen on mobile) */}
        {selectedTable && (
          <>
            {/* Backdrop on mobile */}
            <div
              className="fixed inset-0 bg-black/30 z-30 sm:hidden"
              onClick={() => setSelectedTable(null)}
            />
            <div className="fixed inset-y-0 right-0 z-40 sm:relative sm:z-auto">
              <OrderPanel tableId={selectedTable} onClose={() => setSelectedTable(null)} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
