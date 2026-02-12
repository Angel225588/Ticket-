import { useState, useEffect } from 'react';
import { tables, STAGES, STAGE_LABELS, STAGE_COLORS, formatTime } from '../data/tables';
import { useApp } from '../context/AppContext';

function TableCard({ table, order, isOverdue, onClick }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!order || order.currentStage === STAGES.DONE) {
      setElapsed(0);
      return;
    }
    const update = () => setElapsed(Date.now() - order.createdAt);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const stage = order ? order.currentStage : STAGES.AVAILABLE;
  const colors = STAGE_COLORS[stage];
  const isActive = order && stage !== STAGES.DONE;

  return (
    <button
      onClick={onClick}
      className={`absolute flex flex-col items-center justify-center rounded-lg border-2 shadow-sm
        transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95
        ${isOverdue ? 'overdue' : ''}
        ${table.type === 'round' ? 'rounded-full' : ''}
        ${table.type === 'rectangular' ? 'rounded-md' : ''}`}
      style={{
        left: `${table.x}%`,
        top: `${table.y}%`,
        width: table.type === 'rectangular' ? '13%' : '10%',
        height: table.type === 'round' ? '11%' : '10%',
        backgroundColor: colors.bg,
        borderColor: isOverdue ? '#ef4444' : colors.border,
        color: colors.text,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <span className="text-base font-bold leading-none">{table.id}</span>
      {isActive && (
        <>
          <span className="text-[10px] font-medium leading-tight mt-0.5 opacity-80">
            {STAGE_LABELS[stage]}
          </span>
          <span className="text-[10px] font-mono leading-tight opacity-70">
            {formatTime(elapsed)}
          </span>
          {order.guests > 0 && (
            <span className="text-[9px] leading-none opacity-60">
              {order.guests}p
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default function TableMap({ onSelectTable }) {
  const { getOrderForTable, overdueOrders } = useApp();

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-3 py-2 bg-white border-b text-xs">
        {Object.entries(STAGE_LABELS).map(([stage, label]) => (
          <div key={stage} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded border"
              style={{
                backgroundColor: STAGE_COLORS[stage].bg,
                borderColor: STAGE_COLORS[stage].border,
              }}
            />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Floor plan */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
        {/* Kitchen label */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 px-4 py-1 bg-parissy-navy text-white text-xs rounded-b font-medium tracking-wider uppercase">
          Kitchen
        </div>

        {/* Entrance label */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-4 py-1 bg-gray-700 text-white text-xs rounded-t font-medium tracking-wider uppercase">
          Entrance
        </div>

        {/* Walls */}
        <div className="absolute inset-2 border-2 border-dashed border-gray-300 rounded-lg pointer-events-none" />

        {/* Tables */}
        <div className="absolute" style={{ left: '2%', top: '5%', width: '96%', height: '90%' }}>
          {tables.map((table) => {
            const order = getOrderForTable(table.id);
            const isOverdue = order ? overdueOrders.has(order.id) : false;
            return (
              <TableCard
                key={table.id}
                table={table}
                order={order}
                isOverdue={isOverdue}
                onClick={() => onSelectTable(table.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
