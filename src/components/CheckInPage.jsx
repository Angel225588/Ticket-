import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';

// ─── OCR Parser ─────────────────────────────────────────────────────────────
function parsePackageForecast(ocrText) {
  const lines = ocrText.split('\n').filter((l) => l.trim());
  const guests = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 8) continue;

    // Match room number at start of line (3-4 digits)
    const roomMatch = trimmed.match(/^(\d{3,4})\b/);
    if (!roomMatch) continue;

    const roomNumber = roomMatch[1];
    const rest = trimmed.substring(roomMatch[0].length);

    // Room type (4 uppercase letters like KDBL, KSGL)
    const roomTypeMatch = rest.match(/\b([A-Z]{4})\b/);

    // Dates (DD-MMM-YY)
    const dateMatches = rest.match(/(\d{1,2}-[A-Z]{3}-\d{2})/g) || [];

    // Reservation status
    const statusMatch = rest.match(/\b(CKIN|DUOT|DUIN|NOSH)\b/);

    // Name - look for uppercase words (at least 3 chars) that aren't codes
    const codeWords = new Set([
      'KDBL', 'KSGL', 'KDBS', 'KTWN', 'KSUI', 'CKIN', 'DUOT', 'DUIN', 'NOSH',
      'BARRE', 'BARPK', 'BFPK', 'RACK', 'CORP', 'GOVT', 'MILE',
    ]);
    const nameMatch = rest.match(/\b([A-Z][A-Za-z'-]{2,}(?:\s+[A-Z][A-Za-z'-]{2,})*)\b/g);
    const name = nameMatch
      ? nameMatch.find((n) => !codeWords.has(n) && !n.match(/^\d+-[A-Z]{3}-\d{2}$/)) || ''
      : '';

    // Extract single-digit numbers for adults/children (look for patterns near end)
    const adultChildMatch = rest.match(/\b(\d)\s+(\d)\s+/g);
    let adults = 1;
    let children = 0;
    if (adultChildMatch) {
      const lastMatch = adultChildMatch[adultChildMatch.length - 1].trim().split(/\s+/);
      adults = parseInt(lastMatch[0]) || 1;
      children = parseInt(lastMatch[1]) || 0;
    }

    // Package codes
    const packageMatch = rest.match(/\b(BFPK)\b/);

    guests.push({
      roomNumber,
      roomType: roomTypeMatch?.[1] || '',
      name: name || 'Unknown',
      arrivalDate: dateMatches[0] || '',
      departureDate: dateMatches[1] || dateMatches[0] || '',
      resvStatus: statusMatch?.[1] || 'CKIN',
      adults,
      children,
      packageCodes: packageMatch?.[1] || '',
      isVip: false,
      checkedInCount: 0,
      checkedInEvents: [],
    });
  }

  return guests;
}

// ─── Live Clock ─────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold font-mono">
        {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">
        {now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
      </div>
    </div>
  );
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────
function DashboardStats({ guests }) {
  const totalPersons = guests.reduce((sum, g) => sum + g.adults + g.children, 0);
  const checkedIn = guests.reduce((sum, g) => sum + g.checkedInCount, 0);
  const remaining = totalPersons - checkedIn;
  const roomsDone = guests.filter((g) => g.checkedInCount >= g.adults + g.children).length;

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
        <LiveClock />
      </div>
      <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
        <div className="text-2xl font-bold text-parissy-navy">{guests.length}</div>
        <div className="text-xs text-gray-500">Rooms</div>
        <div className="text-xs text-gray-400">{totalPersons} pers.</div>
      </div>
      <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
        <div className="text-2xl font-bold text-green-600">{checkedIn}</div>
        <div className="text-xs text-gray-500">Checked In</div>
        <div className="text-xs text-gray-400">{roomsDone} rooms</div>
      </div>
      <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
        <div className={`text-2xl font-bold ${remaining > 0 ? 'text-amber-600' : 'text-green-600'}`}>
          {remaining}
        </div>
        <div className="text-xs text-gray-500">Remaining</div>
        <div className="text-xs text-gray-400">{guests.length - roomsDone} rooms</div>
      </div>
    </div>
  );
}

// ─── Emergency Contacts ─────────────────────────────────────────────────────
function EmergencyContacts({ contacts, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [reception, setReception] = useState(contacts.reception);
  const [supervisor, setSupervisor] = useState(contacts.supervisor);

  const handleSave = () => {
    onUpdate({ reception, supervisor });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
        <span className="text-red-600 font-bold text-sm">Emergency</span>
        <div className="flex items-center gap-1 flex-1">
          <label className="text-xs text-gray-600">Reception:</label>
          <input
            type="text"
            value={reception}
            onChange={(e) => setReception(e.target.value)}
            className="w-20 px-2 py-1 border rounded text-sm text-center"
          />
        </div>
        <div className="flex items-center gap-1 flex-1">
          <label className="text-xs text-gray-600">Supervisor:</label>
          <input
            type="text"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            className="w-20 px-2 py-1 border rounded text-sm text-center"
          />
        </div>
        <button onClick={handleSave} className="text-green-600 font-bold text-sm px-2">Save</button>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-4">
      <span className="text-red-600 font-bold text-sm">Emergency</span>
      <a href={`tel:${contacts.reception}`} className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-red-600">
        Reception: <span className="font-bold">{contacts.reception || '—'}</span>
      </a>
      <a href={`tel:${contacts.supervisor}`} className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-red-600">
        Supervisor: <span className="font-bold">{contacts.supervisor || '—'}</span>
      </a>
      <button onClick={() => setEditing(true)} className="ml-auto text-gray-400 hover:text-gray-600 text-xs">
        Edit
      </button>
    </div>
  );
}

// ─── Guest Card (shown after room lookup) ───────────────────────────────────
function GuestCard({ guest, onCheckIn, onDismiss }) {
  const totalPersons = guest.adults + guest.children;
  const remaining = totalPersons - guest.checkedInCount;
  const allDone = remaining <= 0;
  const [enteringCount, setEnteringCount] = useState(remaining);

  // Reset entering count when guest changes
  useEffect(() => {
    const r = guest.adults + guest.children - guest.checkedInCount;
    setEnteringCount(Math.max(0, r));
  }, [guest]);

  const handleCheckIn = () => {
    if (enteringCount > 0) {
      onCheckIn(guest.id, enteringCount);
    }
  };

  return (
    <div className={`rounded-xl border-2 overflow-hidden shadow-lg transition-all ${
      allDone ? 'border-green-400 bg-green-50' : 'border-parissy-navy bg-white'
    }`}>
      {/* Header: Room + Name + VIP */}
      <div className={`px-4 py-3 flex items-center gap-3 ${
        allDone ? 'bg-green-100' : 'bg-parissy-navy'
      }`}>
        <span className={`text-3xl font-black font-mono ${allDone ? 'text-green-700' : 'text-white'}`}>
          {guest.roomNumber}
        </span>
        <span className={`text-xl font-bold flex-1 ${allDone ? 'text-green-800' : 'text-white'}`}>
          {guest.name}
        </span>
        {guest.isVip && (
          <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
            VIP
          </span>
        )}
        {guest.resvStatus === 'DUOT' && (
          <span className="bg-orange-400 text-white px-2 py-0.5 rounded-full text-xs font-bold">
            DEPART
          </span>
        )}
        <button onClick={onDismiss} className={`text-2xl leading-none ${allDone ? 'text-green-400' : 'text-white/50 hover:text-white'}`}>
          &times;
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {/* Person count */}
        <div className="flex items-center gap-4 mb-3">
          <div className="text-center">
            <div className="text-3xl font-black text-parissy-navy">{totalPersons}</div>
            <div className="text-xs text-gray-500">
              {guest.adults}A{guest.children > 0 ? ` + ${guest.children}C` : ''}
            </div>
          </div>
          <div className="flex-1">
            {/* Progress bar */}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  allDone ? 'bg-green-500' : 'bg-parissy-navy'
                }`}
                style={{ width: `${(guest.checkedInCount / totalPersons) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {guest.checkedInCount} / {totalPersons} checked in
            </div>
          </div>
        </div>

        {allDone ? (
          <div className="text-center py-2">
            <div className="text-green-600 font-bold text-lg">ALL CHECKED IN</div>
          </div>
        ) : (
          <>
            {/* Entering count selector */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-sm text-gray-600 font-medium">Entering:</span>
              <button
                onClick={() => setEnteringCount(Math.max(1, enteringCount - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 text-xl font-bold flex items-center justify-center
                  hover:bg-gray-300 active:bg-gray-400 transition-colors"
              >
                -
              </button>
              <span className="text-3xl font-black text-parissy-navy w-12 text-center">{enteringCount}</span>
              <button
                onClick={() => setEnteringCount(Math.min(remaining, enteringCount + 1))}
                className="w-10 h-10 rounded-full bg-gray-200 text-xl font-bold flex items-center justify-center
                  hover:bg-gray-300 active:bg-gray-400 transition-colors"
              >
                +
              </button>
            </div>

            {/* CHECK IN button */}
            <button
              onClick={handleCheckIn}
              className="touch-btn w-full py-4 bg-green-600 text-white rounded-xl font-black text-xl
                hover:bg-green-700 active:bg-green-800 transition-colors shadow-lg"
            >
              CHECK IN
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Confirmation Toast ─────────────────────────────────────────────────────
function ConfirmationToast({ guest, count, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="rounded-xl border-2 border-green-400 bg-green-50 p-6 text-center shadow-lg animate-bounce-once">
      <div className="text-4xl mb-2">&#10003;</div>
      <div className="text-green-700 font-bold text-lg">
        Room {guest.roomNumber} &mdash; {guest.name}
      </div>
      <div className="text-green-600 text-sm mt-1">
        {count} person{count !== 1 ? 's' : ''} checked in
      </div>
    </div>
  );
}

// ─── Guest List Table ───────────────────────────────────────────────────────
function GuestList({ guests, onSelectRoom, onToggleVip, filter }) {
  const filteredGuests = useMemo(() => {
    if (filter === 'pending') {
      return guests.filter((g) => g.checkedInCount === 0);
    }
    if (filter === 'partial') {
      return guests.filter((g) => g.checkedInCount > 0 && g.checkedInCount < g.adults + g.children);
    }
    if (filter === 'done') {
      return guests.filter((g) => g.checkedInCount >= g.adults + g.children);
    }
    return guests;
  }, [guests, filter]);

  if (filteredGuests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        {guests.length === 0 ? 'No guests loaded. Upload a document or add guests manually.' : 'No guests match this filter.'}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredGuests.map((guest) => {
        const total = guest.adults + guest.children;
        const done = guest.checkedInCount >= total;
        const partial = guest.checkedInCount > 0 && !done;

        return (
          <button
            key={guest.id}
            onClick={() => onSelectRoom(guest.roomNumber)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left
              ${done ? 'bg-green-50 border-green-200' : partial ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`}
          >
            {/* Status indicator */}
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
              done ? 'bg-green-500' : partial ? 'bg-amber-500' : 'bg-gray-300'
            }`} />

            {/* Room number */}
            <span className={`font-mono font-bold text-lg w-12 ${done ? 'text-green-700' : 'text-parissy-navy'}`}>
              {guest.roomNumber}
            </span>

            {/* Name */}
            <span className={`font-medium flex-1 truncate ${done ? 'text-green-700 line-through' : 'text-gray-800'}`}>
              {guest.name}
            </span>

            {/* VIP badge */}
            {guest.isVip && (
              <span className="bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0">
                VIP
              </span>
            )}

            {/* DUOT badge */}
            {guest.resvStatus === 'DUOT' && (
              <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0">
                DEP
              </span>
            )}

            {/* Person count / status */}
            <span className={`text-sm font-bold flex-shrink-0 ${
              done ? 'text-green-600' : partial ? 'text-amber-600' : 'text-gray-500'
            }`}>
              {guest.checkedInCount}/{total}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Upload Modal ───────────────────────────────────────────────────────────
function UploadModal({ onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);
  const [parsedGuests, setParsedGuests] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setOcrText('');
    setParsedGuests(null);

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('fra');
      const { data } = await worker.recognize(file);
      await worker.terminate();
      setOcrText(data.text);

      const guests = parsePackageForecast(data.text);
      setParsedGuests(guests);
    } catch (err) {
      console.error('OCR failed:', err);
      setOcrText('OCR failed. Please try again or add guests manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (parsedGuests && parsedGuests.length > 0) {
      onConfirm(parsedGuests);
    }
  };

  const removeGuest = (index) => {
    setParsedGuests(parsedGuests.filter((_, i) => i !== index));
  };

  const updateGuest = (index, field, value) => {
    const updated = [...parsedGuests];
    updated[index] = { ...updated[index], [field]: value };
    setParsedGuests(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-parissy-navy">Import Guest List</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Upload area */}
          {!parsedGuests && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="touch-btn w-full py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500
                  hover:border-parissy-navy hover:text-parissy-navy transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-lg">Reading document...</span>
                  </span>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">&#128247;</div>
                    <div className="text-lg font-medium">Take Photo or Upload Image</div>
                    <div className="text-sm text-gray-400 mt-1">Package Forecast document</div>
                  </div>
                )}
              </button>

              {ocrText && !parsedGuests && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm font-medium">Could not parse guests from image. OCR text:</p>
                  <pre className="mt-2 text-xs text-gray-500 max-h-32 overflow-y-auto whitespace-pre-wrap">{ocrText}</pre>
                </div>
              )}
            </>
          )}

          {/* Review parsed data */}
          {parsedGuests && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-700">
                  Found {parsedGuests.length} guests &mdash; Review &amp; confirm
                </h3>
                <button
                  onClick={() => { setParsedGuests(null); setOcrText(''); }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Re-scan
                </button>
              </div>

              <div className="space-y-2">
                {parsedGuests.map((guest, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border">
                    <input
                      type="text"
                      value={guest.roomNumber}
                      onChange={(e) => updateGuest(i, 'roomNumber', e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-center font-mono font-bold text-sm"
                      placeholder="Room"
                    />
                    <input
                      type="text"
                      value={guest.name}
                      onChange={(e) => updateGuest(i, 'name', e.target.value)}
                      className="flex-1 px-2 py-1 border rounded text-sm font-medium"
                      placeholder="Name"
                    />
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-gray-500">A:</label>
                      <input
                        type="number"
                        value={guest.adults}
                        onChange={(e) => updateGuest(i, 'adults', parseInt(e.target.value) || 0)}
                        className="w-12 px-1 py-1 border rounded text-center text-sm"
                        min="0"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-gray-500">C:</label>
                      <input
                        type="number"
                        value={guest.children}
                        onChange={(e) => updateGuest(i, 'children', parseInt(e.target.value) || 0)}
                        className="w-12 px-1 py-1 border rounded text-center text-sm"
                        min="0"
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-center">{guest.resvStatus}</span>
                    <button
                      onClick={() => removeGuest(i)}
                      className="text-red-400 hover:text-red-600 text-lg"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {ocrText && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-400 cursor-pointer">Show raw OCR text</summary>
                  <pre className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-400 max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {ocrText}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {parsedGuests && parsedGuests.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <button
              onClick={handleConfirm}
              className="touch-btn w-full py-3 bg-parissy-navy text-white rounded-xl font-bold text-lg
                hover:bg-blue-800 transition-colors"
            >
              Load {parsedGuests.length} Guests
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add Guest Modal ────────────────────────────────────────────────────────
function AddGuestModal({ onSave, onClose }) {
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!roomNumber.trim()) return;
    onSave({
      roomNumber: roomNumber.trim(),
      roomType: '',
      name: name.trim() || 'Guest',
      arrivalDate: '',
      departureDate: '',
      resvStatus: 'CKIN',
      adults,
      children,
      packageCodes: 'BFPK',
      isVip,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-parissy-navy">Add Guest</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-center text-2xl font-mono font-bold
              focus:border-parissy-navy focus:outline-none"
            placeholder="204"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl text-sm focus:border-parissy-navy focus:outline-none"
            placeholder="SMITH"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setAdults(Math.max(0, adults - 1))} className="w-8 h-8 rounded-full bg-gray-200 font-bold">-</button>
              <span className="text-xl font-bold w-8 text-center">{adults}</span>
              <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full bg-gray-200 font-bold">+</button>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full bg-gray-200 font-bold">-</button>
              <span className="text-xl font-bold w-8 text-center">{children}</span>
              <button onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full bg-gray-200 font-bold">+</button>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isVip} onChange={(e) => setIsVip(e.target.checked)} className="w-5 h-5 rounded" />
          <span className="text-sm font-medium text-gray-700">VIP Guest</span>
        </label>

        <button
          onClick={handleSave}
          disabled={!roomNumber.trim()}
          className="touch-btn w-full py-3 bg-parissy-navy text-white rounded-xl font-bold text-lg
            hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add Guest
        </button>
      </div>
    </div>
  );
}

// ─── Main CheckInPage Component ─────────────────────────────────────────────
export default function CheckInPage() {
  const { state, dispatch } = useApp();
  const { guests, emergencyContacts } = state.checkin;

  const [searchValue, setSearchValue] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [confirmation, setConfirmation] = useState(null); // { guest, count }
  const [listFilter, setListFilter] = useState('all');
  const searchRef = useRef(null);

  // Find guest by room number (exact or partial match)
  const matchedGuest = useMemo(() => {
    if (!searchValue.trim()) return null;
    const query = searchValue.trim();
    // Exact match first
    const exact = guests.find((g) => g.roomNumber === query);
    if (exact) return exact;
    // Partial match (if only one result)
    const partial = guests.filter((g) => g.roomNumber.startsWith(query));
    if (partial.length === 1) return partial[0];
    return null;
  }, [searchValue, guests]);

  // Not found state
  const notFound = useMemo(() => {
    if (!searchValue.trim() || searchValue.trim().length < 3) return false;
    return !guests.some((g) => g.roomNumber.startsWith(searchValue.trim()));
  }, [searchValue, guests]);

  // Handle check-in
  const handleCheckIn = useCallback(
    (guestId, count) => {
      const guest = guests.find((g) => g.id === guestId);
      dispatch({ type: 'CHECKIN_GUEST', payload: { guestId, count } });
      setConfirmation({ guest: { ...guest }, count });
      setSearchValue('');
    },
    [dispatch, guests]
  );

  // After confirmation toast, refocus search
  const handleConfirmationDone = useCallback(() => {
    setConfirmation(null);
    searchRef.current?.focus();
  }, []);

  // Handle upload confirm
  const handleUploadConfirm = (parsedGuests) => {
    const today = new Date().toISOString().split('T')[0];
    const guestsWithIds = parsedGuests.map((g, i) => ({
      ...g,
      id: `import-${Date.now()}-${i}`,
      checkedInCount: 0,
      checkedInEvents: [],
    }));
    dispatch({
      type: 'SET_CHECKIN_GUESTS',
      payload: { guests: guestsWithIds, date: today },
    });
    setShowUpload(false);
  };

  // Handle add guest
  const handleAddGuest = (guestData) => {
    dispatch({ type: 'ADD_CHECKIN_GUEST', payload: guestData });
    setShowAddGuest(false);
  };

  // Handle emergency contacts update
  const handleUpdateContacts = (contacts) => {
    dispatch({ type: 'UPDATE_EMERGENCY_CONTACTS', payload: contacts });
  };

  // Handle reset
  const handleReset = () => {
    if (window.confirm('Reset all check-in data for today? This cannot be undone.')) {
      dispatch({ type: 'RESET_CHECKIN' });
    }
  };

  // Select room from guest list
  const handleSelectRoom = (roomNumber) => {
    setSearchValue(roomNumber);
    searchRef.current?.focus();
  };

  // Auto-focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
      {/* Top bar with actions */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-2">
        <h2 className="font-bold text-parissy-navy mr-auto">Breakfast Check-In</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="touch-btn px-3 py-1.5 bg-parissy-navy text-white rounded-lg text-sm font-medium
            hover:bg-blue-800 transition-colors"
        >
          &#128247; Upload
        </button>
        <button
          onClick={() => setShowAddGuest(true)}
          className="touch-btn px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium
            hover:bg-gray-300 transition-colors"
        >
          + Add
        </button>
        <button
          onClick={handleReset}
          className="touch-btn px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium
            transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4">
        {/* Dashboard stats */}
        <DashboardStats guests={guests} />

        {/* Room search */}
        <div className="relative">
          <input
            ref={searchRef}
            type="text"
            inputMode="numeric"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Room Number"
            className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl text-center text-3xl font-mono font-bold
              focus:outline-none transition-colors shadow-sm
              ${notFound
                ? 'border-red-400 bg-red-50 focus:border-red-500'
                : matchedGuest
                  ? 'border-green-400 bg-green-50 focus:border-green-500'
                  : 'border-gray-300 bg-white focus:border-parissy-navy'
              }`}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            &#128269;
          </div>
          {searchValue && (
            <button
              onClick={() => { setSearchValue(''); searchRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          )}
        </div>

        {/* Not found warning */}
        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-red-600 font-bold">Room {searchValue} not found</div>
            <div className="text-red-400 text-sm mt-1">Check the room number or add guest manually</div>
          </div>
        )}

        {/* Guest card or confirmation */}
        {confirmation ? (
          <ConfirmationToast
            guest={confirmation.guest}
            count={confirmation.count}
            onDone={handleConfirmationDone}
          />
        ) : matchedGuest ? (
          <GuestCard
            guest={matchedGuest}
            onCheckIn={handleCheckIn}
            onDismiss={() => { setSearchValue(''); searchRef.current?.focus(); }}
          />
        ) : null}

        {/* Emergency contacts */}
        <EmergencyContacts contacts={emergencyContacts} onUpdate={handleUpdateContacts} />

        {/* Guest list */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-700 flex-1">Guest List ({guests.length})</h3>
            <div className="flex gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'partial', label: 'Partial' },
                { id: 'done', label: 'Done' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setListFilter(f.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                    ${listFilter === f.id
                      ? 'bg-parissy-navy text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <GuestList
            guests={guests}
            onSelectRoom={handleSelectRoom}
            onToggleVip={(guestId) => dispatch({ type: 'TOGGLE_VIP', payload: { guestId } })}
            filter={listFilter}
          />
        </div>
      </div>

      {/* Modals */}
      {showUpload && <UploadModal onConfirm={handleUploadConfirm} onClose={() => setShowUpload(false)} />}
      {showAddGuest && <AddGuestModal onSave={handleAddGuest} onClose={() => setShowAddGuest(false)} />}
    </div>
  );
}
