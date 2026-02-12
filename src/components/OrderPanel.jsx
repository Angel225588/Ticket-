import { useState, useEffect, useRef } from 'react';
import { tables, STAGES, STAGE_LABELS, STAGE_COLORS, STAGE_ORDER, formatTime } from '../data/tables';
import { useApp } from '../context/AppContext';

function Timer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const update = () => setElapsed(Date.now() - startTime);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  return <span className="font-mono">{formatTime(elapsed)}</span>;
}

function StageTimeline({ order }) {
  return (
    <div className="space-y-1">
      {STAGE_ORDER.map((stage) => {
        const timestamp = order.stageTimestamps[stage];
        const isCurrent = order.currentStage === stage;
        const isPast = timestamp != null;
        const colors = STAGE_COLORS[stage];

        return (
          <div
            key={stage}
            className={`flex items-center gap-2 px-2 py-1 rounded text-sm
              ${isCurrent ? 'ring-2 ring-offset-1' : ''}
              ${isPast ? 'opacity-100' : 'opacity-40'}`}
            style={{
              backgroundColor: isPast ? colors.bg : '#f9fafb',
              color: isPast ? colors.text : '#9ca3af',
              ringColor: isCurrent ? colors.border : undefined,
            }}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full border ${isCurrent ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: isPast ? colors.text : '#d1d5db',
                borderColor: isPast ? colors.border : '#e5e7eb',
              }}
            />
            <span className="font-medium flex-1">{STAGE_LABELS[stage]}</span>
            {timestamp && (
              <span className="text-xs opacity-70">
                {new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NewOrderForm({ tableId, onCreated, onCancel }) {
  const { state, dispatch } = useApp();
  const [guests, setGuests] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const fileInputRef = useRef(null);

  const handleOCR = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrText('');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('fra');
      const { data } = await worker.recognize(file);
      await worker.terminate();
      setOcrText(data.text);

      // Try to parse items from OCR text
      const lines = data.text.split('\n').filter((l) => l.trim());
      const allMenuItems = state.menu.categories.flatMap((c) => c.items);
      const foundItems = [];

      lines.forEach((line) => {
        const cleanLine = line.trim().toLowerCase();
        allMenuItems.forEach((menuItem) => {
          if (cleanLine.includes(menuItem.name.toLowerCase()) || menuItem.name.toLowerCase().includes(cleanLine)) {
            if (!foundItems.find((fi) => fi.id === menuItem.id)) {
              foundItems.push({ ...menuItem, quantity: 1, modifications: '' });
            }
          }
        });
      });

      if (foundItems.length > 0) {
        setSelectedItems((prev) => [...prev, ...foundItems]);
      }

      // Try to parse guest count
      const gstMatch = data.text.match(/GST\s*(\d+)/i);
      if (gstMatch) setGuests(parseInt(gstMatch[1]));

    } catch (err) {
      console.error('OCR failed:', err);
      setOcrText('OCR failed - please add items manually');
    } finally {
      setOcrLoading(false);
    }
  };

  const addMenuItem = (item) => {
    const existing = selectedItems.findIndex((si) => si.id === item.id);
    if (existing >= 0) {
      const updated = [...selectedItems];
      updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1, modifications: '' }]);
    }
  };

  const removeSelectedItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    dispatch({
      type: 'CREATE_ORDER',
      payload: {
        tableId,
        guests,
        items: selectedItems,
        notes,
      },
    });
    onCreated();
  };

  const table = tables.find((t) => t.id === tableId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-parissy-navy text-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">New Order - Table {tableId}</h2>
          <p className="text-sm opacity-70">{table?.type} - {table?.defaultSeats} seats</p>
        </div>
        <button onClick={onCancel} className="touch-btn text-white/70 hover:text-white text-2xl">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4">
        {/* Guest count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="touch-btn w-10 h-10 rounded-full bg-gray-200 text-xl font-bold"
            >-</button>
            <span className="text-2xl font-bold w-12 text-center">{guests}</span>
            <button
              onClick={() => setGuests(guests + 1)}
              className="touch-btn w-10 h-10 rounded-full bg-gray-200 text-xl font-bold"
            >+</button>
          </div>
        </div>

        {/* OCR Scanner */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scan Ticket</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleOCR}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={ocrLoading}
            className="touch-btn w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600
              hover:border-parissy-navy hover:text-parissy-navy transition-colors"
          >
            {ocrLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Reading ticket...
              </span>
            ) : (
              <span>📷 Take Photo / Upload Ticket</span>
            )}
          </button>
          {ocrText && (
            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500 max-h-24 overflow-y-auto">
              {ocrText}
            </pre>
          )}
        </div>

        {/* Selected items */}
        {selectedItems.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Items ({selectedItems.length})
            </label>
            <div className="space-y-1">
              {selectedItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border rounded p-2">
                  <span className="text-sm font-medium flex-1">
                    {item.quantity > 1 && <span className="text-parissy-navy font-bold">{item.quantity}x </span>}
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500">{item.price?.toFixed(2)}€</span>
                  <button
                    onClick={() => removeSelectedItem(i)}
                    className="text-red-400 hover:text-red-600 text-lg leading-none"
                  >&times;</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu items picker */}
        <div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="touch-btn w-full py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {showMenu ? '▲ Hide Menu' : '▼ Add from Menu'}
          </button>
          {showMenu && (
            <div className="mt-2 space-y-3">
              {state.menu.categories.map((cat) => (
                <div key={cat.id}>
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">{cat.name}</h4>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    {cat.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => addMenuItem(item)}
                        className="text-left p-2 rounded bg-white border hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.price?.toFixed(2)}€</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bien cuit, sans oignons, allergies..."
            className="w-full p-2 border rounded-lg text-sm resize-none h-20"
          />
        </div>
      </div>

      {/* Create button */}
      <div className="p-4 border-t bg-white">
        <button
          onClick={handleCreate}
          className="touch-btn w-full py-3 bg-parissy-navy text-white rounded-lg font-bold text-lg
            hover:bg-blue-800 active:bg-blue-900 transition-colors"
        >
          Create Order
        </button>
      </div>
    </div>
  );
}

function OrderDetail({ order, onClose }) {
  const { dispatch, getNextStage, overdueOrders } = useApp();
  const [showAddItems, setShowAddItems] = useState(false);
  const { state } = useApp();
  const isOverdue = overdueOrders.has(order.id);

  const nextStage = getNextStage(order.currentStage);
  const colors = STAGE_COLORS[order.currentStage];

  const handleAdvance = (stage) => {
    dispatch({ type: 'ADVANCE_STAGE', payload: { orderId: order.id, stage } });
  };

  const handleClose = () => {
    dispatch({ type: 'CLOSE_ORDER', payload: { orderId: order.id } });
    onClose();
  };

  const handleAddItem = (item) => {
    dispatch({
      type: 'ADD_ITEMS',
      payload: { orderId: order.id, items: [{ ...item, quantity: 1, modifications: '' }] },
    });
  };

  const handleRemoveItem = (index) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { orderId: order.id, itemIndex: index } });
  };

  const total = order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`p-4 text-white flex items-center justify-between ${isOverdue ? 'overdue' : ''}`}
        style={{ backgroundColor: isOverdue ? '#dc2626' : '#1e3a5f' }}
      >
        <div>
          <h2 className="text-lg font-bold">Table {order.tableId}</h2>
          <div className="flex items-center gap-3 text-sm opacity-80">
            <span>{order.guests} guest{order.guests !== 1 ? 's' : ''}</span>
            <span>|</span>
            <Timer startTime={order.createdAt} />
          </div>
        </div>
        <button onClick={onClose} className="touch-btn text-white/70 hover:text-white text-2xl">&times;</button>
      </div>

      {/* Current stage badge */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: colors.text }} />
        <span className="font-bold" style={{ color: colors.text }}>{STAGE_LABELS[order.currentStage]}</span>
        <span className="text-sm opacity-60 ml-auto" style={{ color: colors.text }}>
          since {new Date(order.stageTimestamps[order.currentStage]).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4">
        {/* Stage advancement buttons */}
        {order.currentStage !== STAGES.DONE && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Advance Service</label>
            <div className="flex flex-wrap gap-2">
              {nextStage && (
                <button
                  onClick={() => handleAdvance(nextStage)}
                  className="touch-btn px-4 py-2 rounded-lg font-bold text-white text-sm shadow"
                  style={{ backgroundColor: STAGE_COLORS[nextStage].text }}
                >
                  → {STAGE_LABELS[nextStage]}
                </button>
              )}
              {/* Skip-to buttons for stages after next */}
              {STAGE_ORDER.slice(STAGE_ORDER.indexOf(order.currentStage) + 2).map((stage) => (
                <button
                  key={stage}
                  onClick={() => handleAdvance(stage)}
                  className="touch-btn px-3 py-2 rounded-lg text-sm border"
                  style={{
                    borderColor: STAGE_COLORS[stage].border,
                    color: STAGE_COLORS[stage].text,
                    backgroundColor: STAGE_COLORS[stage].bg,
                  }}
                >
                  {STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
          <StageTimeline order={order} />
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Items ({order.items.length})
            </label>
            <button
              onClick={() => setShowAddItems(!showAddItems)}
              className="text-xs text-parissy-navy font-medium hover:underline"
            >
              + Add
            </button>
          </div>
          {order.items.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No items added</p>
          ) : (
            <div className="space-y-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border rounded p-2">
                  <span className="text-sm flex-1">
                    {item.quantity > 1 && <span className="font-bold">{item.quantity}x </span>}
                    {item.name}
                    {item.modifications && (
                      <span className="text-gray-500 text-xs block">{item.modifications}</span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {((item.price || 0) * (item.quantity || 1)).toFixed(2)}€
                  </span>
                  <button onClick={() => handleRemoveItem(i)} className="text-red-400 hover:text-red-600">&times;</button>
                </div>
              ))}
              <div className="text-right text-sm font-bold text-gray-700 pt-1 border-t">
                Total: {total.toFixed(2)}€
              </div>
            </div>
          )}

          {showAddItems && (
            <div className="mt-2 space-y-2 border-t pt-2">
              {state.menu.categories.map((cat) => (
                <div key={cat.id}>
                  <h4 className="text-xs font-bold uppercase text-gray-400">{cat.name}</h4>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {cat.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddItem(item)}
                        className="text-left p-1.5 rounded bg-gray-50 border hover:bg-blue-50 text-xs"
                      >
                        {item.name} - {item.price?.toFixed(2)}€
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={order.notes}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_ORDER', payload: { orderId: order.id, notes: e.target.value } })
            }
            placeholder="Special requests, allergies..."
            className="w-full p-2 border rounded text-sm resize-none h-16"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-white flex gap-2">
        {order.currentStage === STAGES.DONE ? (
          <button
            onClick={handleClose}
            className="touch-btn flex-1 py-3 bg-green-600 text-white rounded-lg font-bold
              hover:bg-green-700 transition-colors"
          >
            Clear Table
          </button>
        ) : (
          <button
            onClick={handleClose}
            className="touch-btn flex-1 py-3 bg-red-500 text-white rounded-lg font-bold
              hover:bg-red-600 transition-colors"
          >
            Close Order
          </button>
        )}
      </div>
    </div>
  );
}

export default function OrderPanel({ tableId, onClose }) {
  const { getOrderForTable } = useApp();
  const order = getOrderForTable(tableId);

  return (
    <div className="w-full sm:w-96 bg-white border-l shadow-xl flex flex-col h-full overflow-hidden">
      {order ? (
        <OrderDetail order={order} onClose={onClose} />
      ) : (
        <NewOrderForm tableId={tableId} onCreated={onClose} onCancel={onClose} />
      )}
    </div>
  );
}
