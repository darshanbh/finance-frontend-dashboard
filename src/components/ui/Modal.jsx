import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { CATEGORIES } from '../../data/mockData'
import { X, Check, TrendingUp, TrendingDown } from 'lucide-react'

// Categories that belong to income vs expense
const INCOME_CATS  = ['salary', 'freelance', 'investment']
const EXPENSE_CATS = ['food','transport','shopping','health','entertainment','utilities','rent','education','insurance']

const BLANK = {
  description: '',
  amount:      '',
  type:        'expense',
  category:    'food',
  date:        new Date().toISOString().slice(0, 10),
}

export default function Modal() {
  const { state, dispatch } = useApp()
  const { modal } = state
  const { open, editing } = modal

  const [form, setForm]     = useState(BLANK)
  const [errors, setErrors] = useState({})

  // Populate form when modal opens
  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        description: editing.description,
        amount:      String(editing.amount),
        type:        editing.type,
        category:    editing.category,
        date:        editing.date,
      })
    } else {
      setForm(BLANK)
    }
    setErrors({})
  }, [open, editing])

  if (!open) return null

  // Update a single field and clear its error
  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  // Switch type and auto-reset category to a valid one for that type
  function switchType(t) {
    set('type', t)
    set('category', t === 'income' ? 'salary' : 'food')
  }

  // Validate before submit
  function validate() {
    const e = {}
    if (!form.description.trim())                                          e.description = 'Description is required'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter a valid positive amount'
    if (!form.date)                                                        e.date = 'Date is required'
    return e
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const payload = {
      description: form.description.trim(),
      amount:      Number(form.amount),
      type:        form.type,
      category:    form.category,
      date:        form.date,
    }

    if (editing) {
      dispatch({ type: 'UPDATE_TX', payload: { ...payload, id: editing.id } })
    } else {
      dispatch({ type: 'ADD_TX', payload })
    }
  }

  function handleClose() {
    dispatch({ type: 'CLOSE_MODAL' })
  }

  const catList = form.type === 'income'
    ? INCOME_CATS.map(k => [k, CATEGORIES[k]])
    : EXPENSE_CATS.map(k => [k, CATEGORIES[k]])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl modal-in max-h-[92vh] overflow-y-auto"
        style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-base" style={{ color: 'var(--text)' }}>
            {editing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center var(--muted) hover:var(--text) hover:bg-white/8 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Type toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
              Type
            </label>
            <div className="flex gap-2">
              {['income', 'expense'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchType(t)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                    font-semibold text-sm capitalize transition-all duration-150 border
                    ${form.type === t
                      ? t === 'income'
                        ? 'bg-green-500/12 border-green-500/30 text-green-400'
                        : 'bg-red-500/12 border-red-500/30 text-red-400'
                      : 'border-white/10 var(--text) hover:var(--text) hover:border-white/20'
                    }
                  `}
                >
                  {t === 'income'
                    ? <TrendingUp   className="w-4 h-4" />
                    : <TrendingDown className="w-4 h-4" />
                  }
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="e.g. Monthly Salary, Swiggy order, Netflix..."
              className={`field ${errors.description ? 'error' : ''}`}
            />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
                Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                placeholder="0"
                className={`field ${errors.amount ? 'error' : ''}`}
              />
              {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className={`field ${errors.date ? 'error' : ''}`}
              />
              {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Category grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {catList.map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('category', key)}
                  className={`
                    flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border
                    text-xs font-semibold transition-all duration-150
                    ${form.category === key
                      ? 'border-indigo-500/50 bg-indigo-500/12 text-indigo-300'
                      : 'border-white/8 var(--muted) hover:border-white/20 hover:var(--text2)'
                    }
                  `}
                  style={form.category === key ? {} : { background: 'var(--surface2)' }}
                >
                  <span className="text-xl leading-none">{cat.icon}</span>
                  <span className="leading-tight text-center">{cat.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-6 pb-5 flex gap-2">
          <button type="button" onClick={handleClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn btn-primary flex-1">
            <Check className="w-4 h-4" />
            {editing ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>

      </div>
    </div>
  )
}