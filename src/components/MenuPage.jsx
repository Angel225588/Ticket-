import { useState } from 'react';
import { useApp } from '../context/AppContext';

function EditItemModal({ item, onSave, onCancel }) {
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [description, setDescription] = useState(item?.description || '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...item,
      id: item?.id || Date.now().toString(36),
      name: name.trim(),
      price: parseFloat(price) || 0,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
        <div className="p-4 border-b">
          <h3 className="font-bold text-lg">{item?.id ? 'Edit Item' : 'New Item'}</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="Item name"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
            <input
              type="number"
              step="0.50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="Short description"
            />
          </div>
        </div>
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg bg-parissy-navy text-white font-medium hover:bg-blue-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { state, dispatch } = useApp();
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const handleSaveItem = (item) => {
    const menu = JSON.parse(JSON.stringify(state.menu));
    const category = menu.categories.find((c) => c.id === editingCategoryId);
    if (!category) return;

    const existingIdx = category.items.findIndex((i) => i.id === item.id);
    if (existingIdx >= 0) {
      category.items[existingIdx] = item;
    } else {
      category.items.push(item);
    }

    dispatch({ type: 'UPDATE_MENU', payload: menu });
    setEditingItem(null);
    setEditingCategoryId(null);
  };

  const handleDeleteItem = (categoryId, itemId) => {
    const menu = JSON.parse(JSON.stringify(state.menu));
    const category = menu.categories.find((c) => c.id === categoryId);
    if (!category) return;
    category.items = category.items.filter((i) => i.id !== itemId);
    dispatch({ type: 'UPDATE_MENU', payload: menu });
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scroll bg-white">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-parissy-navy">Par'Issy Menu</h1>
          <p className="text-sm text-gray-500">Tap items to edit, use + to add new items</p>
        </div>

        {state.menu.categories.map((category) => (
          <div key={category.id} className="border rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-800">{category.name}</h2>
              <button
                onClick={() => {
                  setEditingCategoryId(category.id);
                  setEditingItem({});
                }}
                className="touch-btn px-3 py-1 rounded-lg bg-parissy-navy text-white text-sm font-medium"
              >
                + Add
              </button>
            </div>
            <div className="divide-y">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500">{item.description}</div>
                    )}
                  </div>
                  <div className="font-bold text-parissy-navy">{item.price?.toFixed(2)}€</div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingCategoryId(category.id);
                        setEditingItem(item);
                      }}
                      className="px-2 py-1 rounded text-xs bg-gray-200 hover:bg-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(category.id, item.id)}
                      className="px-2 py-1 rounded text-xs bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
              {category.items.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">No items in this category</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={() => {
            setEditingItem(null);
            setEditingCategoryId(null);
          }}
        />
      )}
    </div>
  );
}
