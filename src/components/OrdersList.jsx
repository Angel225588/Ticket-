import { useState, useEffect } from 'react';
import { STAGES, STAGE_LABELS, STAGE_COLORS, STAGE_ORDER, formatTime } from '../data/tables';
import { useApp } from '../context/AppContext';

function OrderTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const update = () => setElapsed(Date.now() - startTime);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  return <span className="font-mono text-sm">{formatTime(elapsed)}</span>;
}

export default function OrdersList({ onSelectTable }) {
  const { state, overdueOrders } = useApp();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time'); // 'time' | 'table' | 'stage'

  const orders = Object.values(state.orders).filter((o) => {
    if (filter === 'all') return o.currentStage !== STAGES.DONE;
    return o.currentStage === filter;
  });

  const sorted = [...orders].sort((a, b) => {
    if (sortBy === 'time') return a.createdAt - b.createdAt;
    if (sortBy === 'table') return a.tableId - b.tableId;
    if (sortBy === 'stage') return STAGE_ORDER.indexOf(a.currentStage) - STAGE_ORDER.indexOf(b.currentStage);
    return 0;
  });

  const activeCount = Object.values(state.orders).filter((o) => o.currentStage !== STAGES.DONE).length;
  const overdueCount = overdueOrders.size;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Stats bar */}
      <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-4">
        <div className="text-sm">
          <span className="font-bold text-parissy-navy text-lg">{activeCount}</span>
          <span className="text-gray-500 ml-1">active</span>
        </div>
        {overdueCount > 0 && (
          <div className="text-sm">
            <span className="font-bold text-red-600 text-lg">{overdueCount}</span>
            <span className="text-red-500 ml-1">overdue</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="time">Sort: Time</option>
            <option value="table">Sort: Table</option>
            <option value="stage">Sort: Stage</option>
          </select>
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 py-2 border-b flex gap-1 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
            ${filter === 'all' ? 'bg-parissy-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All Active
        </button>
        {STAGE_ORDER.filter((s) => s !== STAGES.DONE).map((stage) => {
          const count = Object.values(state.orders).filter((o) => o.currentStage === stage).length;
          return (
            <button
              key={stage}
              onClick={() => setFilter(stage)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1
                ${filter === stage ? '' : 'hover:opacity-80'}`}
              style={{
                backgroundColor: filter === stage ? STAGE_COLORS[stage].text : STAGE_COLORS[stage].bg,
                color: filter === stage ? 'white' : STAGE_COLORS[stage].text,
              }}
            >
              {STAGE_LABELS[stage]}
              {count > 0 && (
                <span className="bg-white/30 rounded-full px-1.5 text-[10px]">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <p>No active orders</p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {sorted.map((order) => {
              const colors = STAGE_COLORS[order.currentStage];
              const isOverdue = overdueOrders.has(order.id);

              return (
                <button
                  key={order.id}
                  onClick={() => onSelectTable(order.tableId)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3
                    ${isOverdue ? 'bg-red-50' : ''}`}
                >
                  {/* Table number */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg
                      ${isOverdue ? 'overdue' : ''}`}
                    style={{
                      backgroundColor: isOverdue ? '#fecaca' : colors.bg,
                      color: isOverdue ? '#dc2626' : colors.text,
                      border: `2px solid ${isOverdue ? '#f87171' : colors.border}`,
                    }}
                  >
                    {order.tableId}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {STAGE_LABELS[order.currentStage]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {order.guests}p
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {order.items.length > 0
                        ? order.items.map((i) => i.name).join(', ')
                        : 'No items'}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="text-right">
                    <OrderTimer startTime={order.createdAt} />
                    <div className="text-[10px] text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
