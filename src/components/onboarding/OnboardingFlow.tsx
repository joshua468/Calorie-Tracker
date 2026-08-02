import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check } from 'lucide-react'

const COLORS = {
  primary: '#2FAE60',
  primaryDark: '#1F8F4C',
  primaryLight: '#E9F8EE',
  ink: '#0E1B33',
  inkSoft: '#6B7690',
  track: '#E7ECF6',
  bg: '#FFFFFF',
  carb: '#2FAE60',
  protein: '#1F8F4C',
  fat: '#FFA23E',
  danger: '#FF5A5F',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_LIST = Array.from({length: 31}, (_, i) => i + 1)
const YEARS = Array.from({length: 90}, (_, i) => 2015 - i)
const HOURS = Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0'))
const MINS = Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'))
const PERIODS = ['AM', 'PM']

const GOALS = [
  { k: 'lose', e: '⬇️', t: 'Lose Weight' },
  { k: 'muscle', e: '💪', t: 'Gain Muscle' },
  { k: 'maintain', e: '⚖️', t: 'Maintain Weight' },
  { k: 'energy', e: '⚡', t: 'Boost Energy' },
  { k: 'nutrition', e: '🥗', t: 'Improve Nutrition' },
  { k: 'gain', e: '📈', t: 'Gain Weight' },
]

const ACTIVITIES = [
  { k: 'sedentary', e: '🛋️', t: 'Sedentary' },
  { k: 'light', e: '🚶', t: 'Lightly Active' },
  { k: 'moderate', e: '🏃', t: 'Moderately Active' },
  { k: 'very', e: '🚴', t: 'Very Active' },
  { k: 'super', e: '🔥', t: 'Super Active' },
]

const DIETS = [
  { k: 'balanced', e: '🍽️', t: 'Balanced Diet' },
  { k: 'protein', e: '🍗', t: 'High Protein' },
  { k: 'lowcarb', e: '🥩', t: 'Low Carb' },
  { k: 'vegetarian', e: '🥕', t: 'Vegetarian' },
  { k: 'vegan', e: '🥬', t: 'Vegan' },
  { k: 'keto', e: '🥑', t: 'Keto' },
  { k: 'mediterranean', e: '🫒', t: 'Mediterranean' },
]

interface OnboardingFlowProps {
  onComplete: (profile: any) => void
}

type ScreenKey =
  | 'name' | 'gender' | 'birthday' | 'height' | 'weight'
  | 'targetWeight' | 'goal' | 'activity' | 'diet'
  | 'breakfastTime' | 'dinnerTime' | 'generating' | 'result'

const SCREENS: ScreenKey[] = [
  'name', 'gender', 'birthday', 'height', 'weight', 'targetWeight',
  'goal', 'activity', 'diet', 'breakfastTime', 'dinnerTime',
  'generating', 'result',
]

function computeCalories(state: any) {
  const w = state.weightKg, h = state.heightCm
  const age = 2026 - state.birthYear
  const bmr = state.gender === 'female'
    ? (10 * w) + (6.25 * h) - (5 * age) - 161
    : (10 * w) + (6.25 * h) - (5 * age) + 5
  const multTable: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, super: 1.9 }
  const mult = multTable[state.activity] || 1.4
  let kcal = bmr * mult
  if (state.goal === 'lose') kcal -= 400
  if (state.goal === 'gain' || state.goal === 'muscle') kcal += 300
  kcal = Math.max(1200, Math.round(kcal / 10) * 10)
  return kcal
}

function PickerColumn({ id, items, activeIdx }: { id: string; items: (string | number)[]; activeIdx: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = activeIdx * 46
    }
  }, [id, activeIdx])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const col = e.currentTarget
    clearTimeout((col as any)._timer)
    ;(col as any)._timer = setTimeout(() => {
      const idx = Math.round(col.scrollTop / 46)
      if (idx < 0 || idx >= items.length) return
      col.scrollTo({ top: idx * 46, behavior: 'smooth' })
      const items_el = col.querySelectorAll('.picker-item')
      items_el.forEach((el, i) => {
        const h = el as HTMLElement
        h.classList.toggle('active', i === idx)
        h.style.color = i === idx ? '#0E1B33' : '#C3CBDB'
        h.style.fontSize = i === idx ? '19px' : '17px'
      })
      const event = new CustomEvent('picker-change', { detail: { id, val: items[idx] } })
      window.dispatchEvent(event)
    }, 120)
  }, [id, items])

  return (
    <div
      ref={ref}
      className="flex-1 overflow-y-scroll scroll-smooth text-center [scrollbar-width:none]"
      style={{
        scrollSnapType: 'y mandatory',
        WebkitScrollSnapType: 'y mandatory',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
      }}
      onScroll={handleScroll}
    >
      <div className="h-[107px] shrink-0" />
      {items.map((it, i) => (
        <div
          key={i}
          className={`picker-item h-[46px] flex items-center justify-center scroll-snap-align-center text-[17px] font-bold transition-colors duration-150 ${i === activeIdx ? 'active' : ''}`}
          style={{ color: i === activeIdx ? '#0E1B33' : '#C3CBDB', fontSize: i === activeIdx ? '19px' : '17px' }}
          data-value={it}
        >
          {it}
        </div>
      ))}
      <div className="h-[107px] shrink-0" />
    </div>
  )
}

function Ruler({ id, min, max, value, onChange }: { id: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollLeft = (value - min) * 12
    }
  }, [value, min])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    clearTimeout((el as any)._rulerTimer)
    ;(el as any)._rulerTimer = setTimeout(() => {
      const idx = Math.round(el.scrollLeft / 12)
      el.scrollTo({ left: idx * 12, behavior: 'smooth' })
      onChange(min + idx)
    }, 100)
  }, [min, onChange])

  const ticks = []
  for (let v = min; v <= max; v++) {
    const isMajor = v % 5 === 0
    ticks.push(
      <div
        key={v}
        className="flex-[0_0_12px] scroll-snap-align-center flex justify-center"
        data-value={v}
      >
        <div
          className={`rounded-[2px] ${isMajor ? 'h-[44px] w-[2px]' : 'h-[26px] w-[2px]'}`}
          style={{ background: isMajor ? COLORS.inkSoft : '#D6DCEA' }}
        />
      </div>
    )
  }

  return (
    <div className="relative h-[110px] mt-5 overflow-hidden">
      <div
        ref={ref}
        className="flex items-end h-full overflow-x-scroll scroll-smooth [scrollbar-width:none]"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitScrollSnapType: 'x mandatory',
          padding: '0 50%',
        }}
        onScroll={handleScroll}
      >
        {ticks}
      </div>
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[3px] h-[56px] rounded-[3px] pointer-events-none"
        style={{ background: COLORS.primary }}
      />
    </div>
  )
}

function ProgressHeader({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  return (
    <div className="flex items-center gap-[14px] mb-5">
      <button onClick={onBack} className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex-1 flex gap-[5px]">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="h-[6px] flex-1 rounded-[6px] transition-all duration-400"
            style={{ background: i < step ? COLORS.primary : COLORS.track }}
          />
        ))}
      </div>
      <span className="text-xs font-bold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{step}/{total}</span>
    </div>
  )
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [screenIdx, setScreenIdx] = useState(0)
  const [direction, setDirection] = useState(0)
  const [state, setState] = useState({
    name: '',
    gender: null as string | null,
    birthMonth: 6,
    birthDay: 15,
    birthYear: 1996,
    heightUnit: 'cm' as 'cm' | 'ft',
    heightCm: 175,
    weightKg: 75,
    targetWeightKg: 70,
    goal: null as string | null,
    activity: null as string | null,
    diet: null as string | null,
    breakfastH: 8,
    breakfastM: 0,
    breakfastP: 'AM' as string,
    dinnerH: 7,
    dinnerM: 30,
    dinnerP: 'PM' as string,
  })
  const [genProgress, setGenProgress] = useState(0)

  useEffect(() => {
    const handler = (e: Event) => {
      const { id, val } = (e as CustomEvent).detail
      setState(prev => {
        const updates: any = {}
        if (id === 'month') updates.birthMonth = MONTHS.indexOf(val) + 1
        else if (id === 'day') updates.birthDay = parseInt(val)
        else if (id === 'year') updates.birthYear = parseInt(val)
        else if (id === 'breakfastH') updates.breakfastH = parseInt(val)
        else if (id === 'breakfastM') updates.breakfastM = parseInt(val)
        else if (id === 'breakfastP') updates.breakfastP = val
        else if (id === 'dinnerH') updates.dinnerH = parseInt(val)
        else if (id === 'dinnerM') updates.dinnerM = parseInt(val)
        else if (id === 'dinnerP') updates.dinnerP = val
        return { ...prev, ...updates }
      })
    }
    window.addEventListener('picker-change', handler)
    return () => window.removeEventListener('picker-change', handler)
  }, [])

  const currentScreen = SCREENS[screenIdx]
  const isGenScreen = currentScreen === 'generating'
  const isResultScreen = currentScreen === 'result'

  const goNext = useCallback(() => {
    if (screenIdx < SCREENS.length - 1) {
      setDirection(1)
      setScreenIdx(s => s + 1)
    }
  }, [screenIdx])

  const goBack = useCallback(() => {
    if (screenIdx > 0) {
      setDirection(-1)
      setScreenIdx(s => s - 1)
    }
  }, [screenIdx])

  useEffect(() => {
    if (currentScreen === 'generating') {
      let pct = 0
      const timer = setInterval(() => {
        pct += 2
        if (pct >= 100) {
          pct = 100
          clearInterval(timer)
          setTimeout(() => goNext(), 400)
        }
        setGenProgress(pct)
      }, 30)
      return () => clearInterval(timer)
    }
  }, [currentScreen, goNext])

  const calories = computeCalories(state)
  const carbPct = 45, proteinPct = 30, fatPct = 25
  const circ = 2 * Math.PI * 80
  const carbOffset = circ - (circ * carbPct / 100)
  const proteinOffset = circ - (circ * proteinPct / 100)
  const fatOffset = circ - (circ * fatPct / 100)

  const variations = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 300 : -300, opacity: 0 }),
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'name': return (
        <div className="flex-1 flex flex-col">
          <h1 className="text-[23px] font-extrabold mb-5" style={{ color: COLORS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>What's your name?</h1>
          <input
            autoFocus
            value={state.name}
            onChange={e => setState(s => ({ ...s, name: e.target.value }))}
            placeholder="Enter your name"
            className="w-full border-none border-b-2 text-[28px] font-extrabold py-[10px] px-[2px] outline-none bg-transparent transition-colors"
            style={{ color: COLORS.ink, borderBottomColor: COLORS.track }}
            onFocus={e => e.target.style.borderColor = COLORS.primary}
            onBlur={e => e.target.style.borderColor = COLORS.track}
          />
        </div>
      )

      case 'gender': return (
        <div className="flex-1 flex flex-col">
          <h1 className="text-[23px] font-extrabold mb-5" style={{ color: COLORS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>What's your gender?</h1>
          <div className="flex gap-4">
            {[
              { k: 'male', icon: '♂', label: 'Male' },
              { k: 'female', icon: '♀', label: 'Female' },
              { k: 'na', icon: '—', label: 'Prefer not to say' },
            ].map(g => (
              <button
                key={g.k}
                onClick={() => setState(s => ({ ...s, gender: g.k }))}
                className={`flex-1 border-2 rounded-[18px] py-[26px] text-center cursor-pointer transition-all ${state.gender === g.k ? 'selected' : ''}`}
                style={{
                  borderColor: state.gender === g.k ? COLORS.primary : COLORS.track,
                  background: state.gender === g.k ? COLORS.primaryLight : 'transparent',
                }}
              >
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-[14px] flex items-center justify-center text-[26px] transition-all"
                  style={{
                    background: state.gender === g.k ? COLORS.primary : COLORS.track,
                    color: state.gender === g.k ? '#fff' : COLORS.inkSoft,
                  }}
                >
                  {g.icon}
                </div>
                <div className="text-sm font-bold" style={{ color: COLORS.ink }}>{g.label}</div>
              </button>
            ))}
          </div>
        </div>
      )

      case 'birthday': return (
        <div className="flex-1 flex flex-col">
          <h1 className="text-[23px] font-extrabold" style={{ color: COLORS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>When's your birthday?</h1>
          <p className="text-[11px] font-medium mb-4 mt-1" style={{ color: COLORS.inkSoft }}>Don't worry, you can always change this later.</p>
          <div className="flex justify-center gap-1.5 h-[260px] relative mt-2.5">
            <div
              className="absolute top-1/2 left-2 right-2 -translate-y-1/2 h-[46px] rounded-xl pointer-events-none z-0"
              style={{ background: COLORS.primaryLight }}
            />
            <PickerColumn id="month" items={MONTHS} activeIdx={MONTHS.indexOf('Jun')} />
            <PickerColumn id="day" items={DAYS_LIST} activeIdx={state.birthDay - 1} />
            <PickerColumn id="year" items={YEARS} activeIdx={YEARS.indexOf(state.birthYear)} />
          </div>
        </div>
      )

      case 'height': return (
        <div className="flex-1 flex flex-col">
          <h1 className="text-[23px] font-extrabold" style={{ color: COLORS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>How tall are you?</h1>
          <p className="text-[11px] font-medium mb-4 mt-1" style={{ color: COLORS.inkSoft }}>Don't worry, you can always change this later.</p>
          <div className="flex justify-center gap-2 mb-4">
            {['cm', 'ft'].map(u => (
              <button
                key={u}
                onClick={() => setState(s => ({ ...s, heightUnit: u as 'cm' | 'ft' }))}
                className="px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer border-none"
                style={{
                  background: state.heightUnit === u ? COLORS.primary : COLORS.track,
                  color: state.heightUnit === u ? '#fff' : COLORS.inkSoft,
                }}
              >
                {u === 'cm' ? 'cm' : 'ft/in'}
              </button>
            ))}
          </div>
          <div className="text-center mt-2 mb-1">
            <span className="text-[48px] font-black" style={{ color: COLORS.ink }}>
              {state.heightUnit === 'cm' ? state.heightCm : `${Math.floor(state.heightCm / 2.54 / 12)}'${Math.round((state.heightCm / 2.54) % 12)}"`}
            </span>
            <span className="text-base font-bold" style={{ color: COLORS.inkSoft }}> {state.heightUnit}</span>
          </div>
          <Ruler id="height" min={140} max={210} value={state.heightCm} onChange={v => setState(s => ({ ...s, heightCm: v }))} />
        </div>
      )

      case 'weight': return (
        <div className="flex-1 flex flex-col">
          <h1 className="text-[23px] font-extrabold" style={{ color: COLORS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>What's your current weight?</h1>
          <p className="text-[11px] font-medium mb-4 mt-1" style={{ color: COLORS.inkSoft }}>Don't worry, you can always change this later.</p>
          <div className="text-center mt-2 mb-1">
            <span className="text-[48px] font-black" style={{ color: COLORS.ink }}>{state.weightKg}</span>
            <span className="text-base font-bold" style={{ color: COLORS.inkSoft }}> kg</span>
          </div>
          <Ruler id="weight" min={35} max={160} value={state.weightKg} onChange={v => setState(s => ({ ...s, weightKg: v }))} />
        </div>
      )

      case 'targetWeight': return (
        <div className="flex-1 flex flex-col">
          <h1 className="text-[23px] font-extrabold" style={{ color: COLORS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>What's your target weight?</h1>
          <p className="text-[11px] font-medium mb-4 mt-1" style={{ color: COLORS.inkSoft }}>Don't worry, you can always change this later.</p>
          <div className="text-center mt-2 mb-1">
            <span className="text-[48px] font-black" style={{ color: COLORS.ink }}>{state.targetWeightKg}</span>
            <span className="text-base font-bold" style={{ color: COLORS.inkSoft }}> kg</span>
          </div>
          <Ruler id="targetweight" min={35} max={160} value={state.targetWeightKg} onChange={v => setState(s => ({ ...s, targetWeightKg: v }))} />
        </div>
      )

      case 'goal': return (
        <div className="flex-1 flex flex-col min-h-0">
          <h1 className="text-[23px] font-extrabold mb-5 shrink-0" style={{ color: COLORS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>What's your main goal with Tally Health?</h1>
          <div className="flex-1 overflow-y-auto flex flex-col gap-[10px] min-h-0 px-[1px]">
            {GOALS.map(g => (
              <button
                key={g.k}
                onClick={() => setState(s => ({ ...s, goal: g.k }))}
                className="flex items-center gap-3.5 border-2 rounded-[16px] p-3.5 px-4 cursor-pointer transition-all"
                style={{
                  borderColor: state.goal === g.k ? COLORS.primary : COLORS.track,
                  background: state.goal === g.k ? COLORS.primaryLight : 'transparent',
                }}
              >
                <div
                  className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-lg shrink-0"
                  style={{ background: COLORS.track }}
                >
                  {g.e}
                </div>
                <span className="text-[14.5px] font-bold flex-1" style={{ color: COLORS.ink }}>{g.t}</span>
                <div
                  className="w-[22px] h-[22px] rounded-full border-2 shrink-0 flex items-center justify-center text-xs text-white"
                  style={{
                    borderColor: state.goal === g.k ? COLORS.primary : COLORS.track,
                    background: state.goal === g.k ? COLORS.primary : 'transparent',
                  }}
                >
                  {state.goal === g.k && <Check className="h-3 w-3" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )

      case 'activity': return (
        <div className="flex-1 flex flex-col min-h-0">
          <h1 className="text-[23px] font-extrabold mb-5 shrink-0" style={{ color: COLORS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>What's your activity level?</h1>
          <div className="flex-1 overflow-y-auto flex flex-col gap-[10px] min-h-0 px-[1px]">
            {ACTIVITIES.map(a => (
              <button
                key={a.k}
                onClick={() => setState(s => ({ ...s, activity: a.k }))}
                className="flex items-center gap-3.5 border-2 rounded-[16px] p-3.5 px-4 cursor-pointer transition-all"
                style={{
                  borderColor: state.activity === a.k ? COLORS.primary : COLORS.track,
                  background: state.activity === a.k ? COLORS.primaryLight : 'transparent',
                }}
              >
                <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-lg shrink-0" style={{ background: COLORS.track }}>
                  {a.e}
                </div>
                <span className="text-[14.5px] font-bold flex-1" style={{ color: COLORS.ink }}>{a.t}</span>
                <div
                  className="w-[22px] h-[22px] rounded-full border-2 shrink-0 flex items-center justify-center text-xs text-white"
                  style={{
                    borderColor: state.activity === a.k ? COLORS.primary : COLORS.track,
                    background: state.activity === a.k ? COLORS.primary : 'transparent',
                  }}
                >
                  {state.activity === a.k && <Check className="h-3 w-3" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )

      case 'diet': return (
        <div className="flex-1 flex flex-col min-h-0">
          <h1 className="text-[23px] font-extrabold mb-5 shrink-0" style={{ color: COLORS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>What's your diet type?</h1>
          <div className="flex-1 overflow-y-auto flex flex-col gap-[10px] min-h-0 px-[1px]">
            {DIETS.map(d => (
              <button
                key={d.k}
                onClick={() => setState(s => ({ ...s, diet: d.k }))}
                className="flex items-center gap-3.5 border-2 rounded-[16px] p-3.5 px-4 cursor-pointer transition-all"
                style={{
                  borderColor: state.diet === d.k ? COLORS.primary : COLORS.track,
                  background: state.diet === d.k ? COLORS.primaryLight : 'transparent',
                }}
              >
                <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-lg shrink-0" style={{ background: COLORS.track }}>
                  {d.e}
                </div>
                <span className="text-[14.5px] font-bold flex-1" style={{ color: COLORS.ink }}>{d.t}</span>
                <div
                  className="w-[22px] h-[22px] rounded-full border-2 shrink-0 flex items-center justify-center text-xs text-white"
                  style={{
                    borderColor: state.diet === d.k ? COLORS.primary : COLORS.track,
                    background: state.diet === d.k ? COLORS.primary : 'transparent',
                  }}
                >
                  {state.diet === d.k && <Check className="h-3 w-3" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )

      case 'breakfastTime':
      case 'dinnerTime': {
        const isBreakfast = currentScreen === 'breakfastTime'
        const title = isBreakfast ? 'When do you usually have breakfast?' : 'When do you usually have dinner?'
        const hKey = isBreakfast ? 'breakfastH' : 'dinnerH'
        const mKey = isBreakfast ? 'breakfastM' : 'dinnerM'
        const pKey = isBreakfast ? 'breakfastP' : 'dinnerP'
        const hVal = state[hKey as keyof typeof state] as number
        const mVal = state[mKey as keyof typeof state] as number
        const pVal = state[pKey as keyof typeof state] as string
        return (
          <div className="flex-1 flex flex-col">
            <h1 className="text-[23px] font-extrabold mb-5" style={{ color: COLORS.ink, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{title}</h1>
            <div className="flex justify-center gap-1.5 h-[260px] relative mt-2.5">
              <div className="absolute top-1/2 left-2 right-2 -translate-y-1/2 h-[46px] rounded-xl pointer-events-none z-0" style={{ background: COLORS.primaryLight }} />
              <PickerColumn id={hKey} items={HOURS} activeIdx={hVal - 1} />
              <PickerColumn id={mKey} items={MINS} activeIdx={mVal} />
              <PickerColumn id={pKey} items={PERIODS} activeIdx={PERIODS.indexOf(pVal)} />
            </div>
          </div>
        )
      }

      case 'generating': {
        const circumference = 502
        const offset = circumference - (circumference * genProgress / 100)
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative w-[180px] h-[180px] mb-7">
              <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
                <circle cx="90" cy="90" r="80" fill="none" stroke={COLORS.track} strokeWidth="14" />
                <circle
                  cx="90" cy="90" r="80" fill="none" stroke={COLORS.primary} strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[34px] font-black" style={{ color: COLORS.ink }}>
                {genProgress}%
              </div>
            </div>
            <div className="text-[19px] font-extrabold mb-2" style={{ color: COLORS.ink }}>Personalizing your Tally Health experience</div>
            <div className="text-[13.5px] leading-relaxed max-w-[240px]" style={{ color: COLORS.inkSoft }}>
              Hang tight! We're crafting a personalized plan just for you.
            </div>
          </div>
        )
      }

      case 'result': {
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-[20px] font-extrabold mb-6" style={{ color: COLORS.ink }}>
              Your personalized calorie<br />plan is ready!
            </div>
            <div className="relative w-[210px] h-[210px] mb-6">
              <svg width="210" height="210" viewBox="0 0 210 210" className="-rotate-90">
                <circle cx="105" cy="105" r="80" fill="none" stroke={COLORS.track} strokeWidth="20" />
                <circle cx="105" cy="105" r="80" fill="none" stroke={COLORS.carb} strokeWidth="20"
                  strokeDasharray={circ} strokeDashoffset={carbOffset} strokeLinecap="round" />
                <circle cx="105" cy="105" r="80" fill="none" stroke={COLORS.protein} strokeWidth="20"
                  strokeDasharray={circ} strokeDashoffset={proteinOffset}
                  transform={`rotate(${carbPct * 3.6} 105 105)`} strokeLinecap="round" />
                <circle cx="105" cy="105" r="80" fill="none" stroke={COLORS.fat} strokeWidth="20"
                  strokeDasharray={circ} strokeDashoffset={fatOffset}
                  transform={`rotate(${(carbPct + proteinPct) * 3.6} 105 105)`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[38px] font-black" style={{ color: COLORS.ink }}>{calories}</div>
                <div className="text-xs font-bold tracking-wider" style={{ color: COLORS.inkSoft }}>KCAL / DAY</div>
              </div>
            </div>
            <div className="flex gap-4">
              {[
                { l: 'Carbs', p: carbPct, color: COLORS.carb },
                { l: 'Protein', p: proteinPct, color: COLORS.protein },
                { l: 'Fat', p: fatPct, color: COLORS.fat },
              ].map(m => (
                <div key={m.l} className="flex items-center gap-1.5 text-[12.5px] font-bold" style={{ color: COLORS.inkSoft }}>
                  <span className="w-[9px] h-[9px] rounded-full" style={{ background: m.color }} />
                  {m.l} {m.p}%
                </div>
              ))}
            </div>
          </div>
        )
      }

      default: return null
    }
  }

  const nameValid = state.name.trim().length > 0
  const genderValid = state.gender !== null
  const goalValid = state.goal !== null
  const activityValid = state.activity !== null
  const dietValid = state.diet !== null

  const canContinue =
    (currentScreen === 'name' && nameValid) ||
    (currentScreen === 'gender' && genderValid) ||
    (currentScreen === 'goal' && goalValid) ||
    (currentScreen === 'activity' && activityValid) ||
    (currentScreen === 'diet' && dietValid) ||
    !['name', 'gender', 'goal', 'activity', 'diet'].includes(currentScreen)

  return (
    <div className="flex h-full flex-col" style={{ background: COLORS.bg }}>
      {/* Top bar */}
      {isGenScreen || isResultScreen ? (
        <div className="flex items-center gap-[14px] mb-5 px-6 pt-14">
          <button onClick={goBack} className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="px-6 pt-14">
          <ProgressHeader step={screenIdx + 1} total={SCREENS.length - 2} onBack={goBack} />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={screenIdx}
            custom={direction}
            variants={variations}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
            className="flex-1 flex flex-col"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 pt-4">
        {!isGenScreen && !isResultScreen && (
          <>
            <div className="flex gap-3">
              {screenIdx > 0 && (
                <button
                  onClick={goBack}
                  className="flex-1 py-[17px] rounded-[16px] text-base font-bold border-2 cursor-pointer transition-all active:scale-[0.97]"
                  style={{
                    borderColor: COLORS.track,
                    color: COLORS.inkSoft,
                    background: 'transparent',
                  }}
                >
                  Previous
                </button>
              )}
              <button
                onClick={goNext}
                disabled={!canContinue}
                className={`${screenIdx > 0 ? 'flex-1' : 'w-full'} py-[17px] rounded-[16px] text-base font-bold border-none cursor-pointer transition-all active:scale-[0.97]`}
                style={{
                  background: canContinue ? COLORS.primary : COLORS.track,
                  color: canContinue ? '#fff' : '#AEB8CC',
                  boxShadow: canContinue ? `0 12px 24px -10px rgba(47,174,96,0.5)` : 'none',
                }}
              >
                {currentScreen === 'dinnerTime' ? 'Finish' : 'Continue'}
              </button>
            </div>
          </>
        )}

        {isResultScreen && (
          <button
            onClick={() => {
              onComplete({
                name: state.name,
                sex: state.gender || 'other',
                age: 2026 - state.birthYear,
                height: state.heightCm,
                weight: state.weightKg,
                targetWeight: state.targetWeightKg,
                goalDirection: state.goal === 'lose' ? 'lose' : state.goal === 'gain' || state.goal === 'muscle' ? 'gain' : 'maintain',
                activityLevel: state.activity || 'moderate',
                dietaryPreferences: state.diet ? [state.diet] : [],
                calories,
                onboardingCompleted: true,
              })
            }}
            className="w-full py-[17px] rounded-[16px] text-base font-bold border-none cursor-pointer transition-all active:scale-[0.97]"
            style={{
              background: COLORS.primary,
              color: '#fff',
              boxShadow: `0 12px 24px -10px rgba(47,174,96,0.5)`,
            }}
          >
            Start Your Plan Now
          </button>
        )}
      </div>
    </div>
  )
}
