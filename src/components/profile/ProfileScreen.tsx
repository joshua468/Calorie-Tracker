import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { useStore } from '@/store/useStore'
import {
  User, Bell, Shield, HelpCircle,
  ChevronRight, Scale, Ruler, Activity, LogOut, Download, AlertTriangle,
  Crown, Zap, Sliders, Wheat, Beef, Droplets, Check, ArrowLeft,
  UtensilsCrossed, Target, Sun, Globe, Dumbbell, Camera,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserProfile, ActivityLevel } from '@/lib/types'
import { ACTIVITY_LEVELS, DIETARY_PREFERENCES, getActivityLabel } from '@/lib/constants'
import { BackButton } from '@/components/ui/back-button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PaywallScreen } from './PaywallScreen'
import { useToastStore } from '@/store/toastStore'

const THEME_OPTIONS = ['light', 'dark', 'system'] as const
const GOAL_DIRECTIONS = [
  { value: 'lose' as const, label: 'Lose Weight', icon: '↓' },
  { value: 'maintain' as const, label: 'Maintain', icon: '→' },
  { value: 'gain' as const, label: 'Gain Weight', icon: '↑' },
]
const GOAL_RATES = [
  { value: 0.25, label: 'Mild', description: '0.25 kg/week' },
  { value: 0.5, label: 'Moderate', description: '0.5 kg/week' },
  { value: 0.75, label: 'Aggressive', description: '0.75 kg/week' },
  { value: 1, label: 'Maximum', description: '1 kg/week' },
]

type ProfileView =
  | 'root'
  | 'body-stats'
  | 'dietary-preferences'
  | 'fitness-goal'
  | 'settings'
  | 'data-privacy'
  | 'support'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

function NavRow({
  icon: Icon, label, value, onClick, className,
}: {
  icon: React.ElementType
  label: string
  value?: string
  onClick?: () => void
  className?: string
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 text-left',
        'hover:bg-muted/50 active:bg-muted/80',
        className,
      )}
    >
      <div className="p-2 rounded-xl bg-muted/50">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {value && <span className="text-sm text-muted-foreground/80 font-medium">{value}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
    </motion.button>
  )
}

function SectionCard({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={cn('rounded-3xl bg-card shadow-sm border border-border/50 overflow-hidden', className)}>
      {title && (
        <div className="px-5 pt-4 pb-1">
          <h3 className="text-xs font-semibold tracking-widest text-muted-foreground/60 uppercase">{title}</h3>
        </div>
      )}
      <div className="p-1">{children}</div>
    </motion.div>
  )
}

export function ProfileScreen({ onSignOut }: { onSignOut?: () => void }) {
  const profile = useStore((s) => s.profile)
  const updateProfile = useStore((s) => s.updateProfile)
  const exportData = useStore((s) => s.exportData)
  const deleteAllData = useStore((s) => s.deleteAllData)
  const userId = useStore((s) => s.userId)
  const setScreen = useStore((s) => s.setScreen)

  const [view, setView] = useState<ProfileView>('root')
  const [showExport, setShowExport] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [exportedData, setExportedData] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const initials = profile.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    try {
      const { storageService } = await import('@/lib/supabase/storage')
      const url = await storageService.uploadAvatar(userId, file)
      updateProfile({ avatarUrl: url })
    } catch {
      useToastStore.getState().addToast('Failed to upload avatar')
    }
    setUploading(false)
  }

  const handleExport = () => {
    const data = exportData()
    setExportedData(data)
    setShowExport(true)
  }

  const handleDelete = () => {
    if (deleteConfirmText === 'DELETE') {
      deleteAllData()
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
    }
  }

  const activityLabel = getActivityLabel(profile.activityLevel)
  const goalDirectionLabel = GOAL_DIRECTIONS.find((g) => g.value === profile.goalDirection)?.label || profile.goalDirection

  const renderBackButton = () => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setView('root')}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </motion.button>
  )

  if (view === 'body-stats') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 p-5 pb-8 max-w-lg mx-auto"
      >
        {renderBackButton()}
        <SectionCard title="Body Stats">
          <BodyStatsContent profile={profile} updateProfile={updateProfile} />
        </SectionCard>
      </motion.div>
    )
  }

  if (view === 'dietary-preferences') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 p-5 pb-8 max-w-lg mx-auto"
      >
        {renderBackButton()}
        <SectionCard title="Dietary Preferences">
          <DietaryPrefsContent profile={profile} updateProfile={updateProfile} />
        </SectionCard>
      </motion.div>
    )
  }

  if (view === 'fitness-goal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 p-5 pb-8 max-w-lg mx-auto"
      >
        {renderBackButton()}
        <SectionCard title="Fitness Goal">
          <FitnessGoalContent profile={profile} updateProfile={updateProfile} />
        </SectionCard>
      </motion.div>
    )
  }

  if (view === 'settings') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 p-5 pb-8 max-w-lg mx-auto"
      >
        {renderBackButton()}
        <SectionCard title="Settings">
          <SettingsContent profile={profile} updateProfile={updateProfile} />
        </SectionCard>
      </motion.div>
    )
  }

  if (view === 'data-privacy') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 p-5 pb-8 max-w-lg mx-auto"
      >
        {renderBackButton()}
        <SectionCard title="Data & Privacy">
          <DataPrivacyContent
            onExport={handleExport}
            onDelete={() => setShowDeleteConfirm(true)}
          />
        </SectionCard>
      </motion.div>
    )
  }

  if (view === 'support') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 p-5 pb-8 max-w-lg mx-auto"
      >
        {renderBackButton()}
        <SectionCard title="Support">
          <SupportContent onSignOut={() => setShowSignOutConfirm(true)} />
        </SectionCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 p-5 pb-8 max-w-lg mx-auto"
    >
      {/* Back to home */}
      <motion.div variants={itemVariants} className="flex flex-col pt-1">
        <BackButton onClick={() => setScreen('home')} />
        <h1 className="text-2xl font-bold text-foreground mt-5">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile</p>
      </motion.div>

      {/* Profile Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 px-1 pt-2 pb-4">
        <button
          onClick={() => avatarInputRef.current?.click()}
          disabled={uploading}
          className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden bg-muted ring-2 ring-border hover:ring-primary/50 transition-all group"
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xl font-bold text-muted-foreground">{initials}</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
              <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Camera className="h-5 w-5 text-white" />
            )}
          </div>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <div className="min-w-0 flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="h-9 text-lg font-bold rounded-xl"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { updateProfile({ name: nameDraft }); setEditingName(false) }
                  if (e.key === 'Escape') { setEditingName(false) }
                }}
              />
              <button
                onClick={() => { updateProfile({ name: nameDraft }); setEditingName(false) }}
                className="h-8 px-3 rounded-xl bg-brand-green text-white text-xs font-semibold"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground leading-tight truncate">
                {profile.name || 'Guest'}
              </h2>
              <button
                onClick={() => { setNameDraft(profile.name || ''); setEditingName(true) }}
                className="shrink-0 text-[11px] font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/15 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            {profile.isPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold">
                <Crown className="h-2.5 w-2.5" />
                PREMIUM
              </span>
            )}
            {profile.email && (
              <span className="text-xs text-muted-foreground truncate">{profile.email}</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Compact Goals Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2 px-1">
        {[
          { label: 'Calories', value: `${profile.goals.calorieGoal}`, unit: 'kcal', icon: Zap, color: 'text-brand-green', bg: 'bg-brand-green/10' },
          { label: 'Protein', value: `${profile.goals.proteinGoal}`, unit: 'g', icon: Beef, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Carbs', value: `${profile.goals.carbsGoal}`, unit: 'g', icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Fat', value: `${profile.goals.fatGoal}`, unit: 'g', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((g) => (
          <div key={g.label} className={cn('rounded-2xl p-3 border border-border/50', g.bg)}>
            <div className={cn('p-1.5 rounded-lg w-fit mb-1.5', g.bg)}>
              <g.icon className={cn('h-3.5 w-3.5', g.color)} />
            </div>
            <div className="text-[20px] font-bold tabular-nums text-foreground">{g.value}</div>
            <div className="text-[9px] text-muted-foreground font-medium">{g.unit} / {g.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Navigation List */}
      <SectionCard>
        <div className="space-y-0.5">
          <NavRow icon={Ruler} label="Body Stats" value={`${profile.height}${profile.heightUnit} · ${profile.weight}${profile.weightUnit}`} onClick={() => setView('body-stats')} />
          <NavRow icon={UtensilsCrossed} label="Dietary Preferences" value={profile.dietaryPreferences.length > 0 ? `${profile.dietaryPreferences.length} selected` : 'None'} onClick={() => setView('dietary-preferences')} />
          <NavRow icon={Activity} label="Activity Level" value={activityLabel} onClick={() => setView('fitness-goal')} />
          <NavRow icon={Target} label="Goal" value={goalDirectionLabel} onClick={() => setView('fitness-goal')} />
          <NavRow icon={Sliders} label="Settings" onClick={() => setView('settings')} />
          <NavRow icon={Shield} label="Data & Privacy" onClick={() => setView('data-privacy')} />
          <NavRow icon={HelpCircle} label="Support" onClick={() => setView('support')} />
        </div>
      </SectionCard>

      {/* Sign Out */}
      <motion.button
        variants={itemVariants}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowSignOutConfirm(true)}
        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 text-left hover:bg-destructive/5 active:bg-destructive/10 border border-transparent hover:border-destructive/20"
      >
        <div className="p-2 rounded-xl bg-destructive/10">
          <LogOut className="h-4 w-4 text-destructive" />
        </div>
        <span className="flex-1 text-sm font-medium text-destructive">Sign Out</span>
      </motion.button>

      {/* Premium Upsell Card — hidden for premium users */}
      {!profile.isPremium && (
        <motion.div variants={itemVariants} className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-card border border-amber-500/20 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Unlock Premium</p>
              <p className="text-[11px] text-muted-foreground/70">Personalised insights, trends & more</p>
            </div>
          </div>
          <Button
            variant="green"
            size="sm"
            className="w-full rounded-xl"
            onClick={() => setShowPaywall(true)}
          >
            Start Free Trial
          </Button>
        </motion.div>
      )}

      {/* App Version */}
      <motion.div variants={itemVariants} className="text-center py-4">
        <p className="text-[11px] text-muted-foreground/40 font-medium tracking-wide">
          Tally Health v1.0.0
        </p>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExport(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">Export Data</h3>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  All your stored data is shown below. Copy it before deleting your account.
                </p>
                <textarea
                  readOnly
                  value={exportedData}
                  className="w-full h-44 text-[10px] font-mono bg-muted/70 rounded-2xl p-3.5 text-foreground resize-none border border-border/30 focus:outline-none"
                />
                <div className="flex gap-2.5">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-2xl h-11"
                    onClick={() => { navigator.clipboard.writeText(exportedData); setShowExport(false) }}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="green"
                    className="flex-1 rounded-2xl h-11"
                    onClick={() => setShowExport(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Delete all data?</h3>
                    <p className="text-xs text-muted-foreground/70">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  All your food logs, goals, preferences, and personal data will be permanently erased.
                </p>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
                    Type <span className="font-mono text-destructive font-bold">DELETE</span> to confirm
                  </label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="h-11 rounded-2xl text-sm"
                  />
                </div>
                <div className="flex gap-2.5">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-2xl h-11"
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-2xl h-11"
                    disabled={deleteConfirmText !== 'DELETE'}
                    onClick={handleDelete}
                  >
                    Delete Everything
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSignOutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-destructive/10">
                    <LogOut className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Sign Out</h3>
                    <p className="text-xs text-muted-foreground/70">You will need to sign in again</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  Are you sure you want to sign out?
                </p>
                <div className="flex gap-2.5">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-2xl h-11"
                    onClick={() => setShowSignOutConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-2xl h-11"
                    onClick={() => { setShowSignOutConfirm(false); onSignOut?.() }}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaywall && (
          <PaywallScreen onClose={() => setShowPaywall(false)} onSubscribe={(plan) => {
            console.log('Subscribe to', plan)
            setShowPaywall(false)
          }} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function BodyStatsContent({ profile, updateProfile }: { profile: UserProfile; updateProfile: (p: Partial<UserProfile>) => void }) {
  const [editHeight, setEditHeight] = useState(false)
  const [editWeight, setEditWeight] = useState(false)
  const [editAge, setEditAge] = useState(false)
  const [editActivity, setEditActivity] = useState(false)
  const [heightDraft, setHeightDraft] = useState(profile.height)
  const [weightDraft, setWeightDraft] = useState(profile.weight)
  const [ageDraft, setAgeDraft] = useState(profile.age)
  const activityLabel = getActivityLabel(profile.activityLevel)

  return (
    <div className="px-3 space-y-0.5">
      <BodyStatRow
        icon={Ruler}
        label="Height"
        value={`${profile.height} ${profile.heightUnit}`}
        editing={editHeight}
        onToggle={() => { setEditHeight(!editHeight); setEditWeight(false); setEditAge(false); setEditActivity(false); setHeightDraft(profile.height) }}
        onDone={() => { updateProfile({ height: heightDraft }); setEditHeight(false) }}
      >
        <div className="flex items-center gap-2 pt-2 pb-1">
          <Input type="number" value={heightDraft} onChange={(e) => setHeightDraft(parseFloat(e.target.value) || 0)} className="h-11 text-sm [appearance:textfield]" />
          <span className="text-xs text-muted-foreground font-medium">{profile.heightUnit}</span>
        </div>
      </BodyStatRow>

      <BodyStatRow
        icon={Scale}
        label="Weight"
        value={`${profile.weight} ${profile.weightUnit}`}
        editing={editWeight}
        onToggle={() => { setEditWeight(!editWeight); setEditHeight(false); setEditAge(false); setEditActivity(false); setWeightDraft(profile.weight) }}
        onDone={() => { updateProfile({ weight: weightDraft }); setEditWeight(false) }}
      >
        <div className="flex items-center gap-2 pt-2 pb-1">
          <Input type="number" value={weightDraft} onChange={(e) => setWeightDraft(parseFloat(e.target.value) || 0)} className="h-11 text-sm [appearance:textfield]" />
          <span className="text-xs text-muted-foreground font-medium">{profile.weightUnit}</span>
        </div>
      </BodyStatRow>

      <BodyStatRow
        icon={User}
        label="Age"
        value={`${profile.age} years`}
        editing={editAge}
        onToggle={() => { setEditAge(!editAge); setEditHeight(false); setEditWeight(false); setEditActivity(false); setAgeDraft(profile.age) }}
        onDone={() => { updateProfile({ age: ageDraft }); setEditAge(false) }}
      >
        <div className="pt-2 pb-1">
          <Input type="number" value={ageDraft} onChange={(e) => setAgeDraft(parseInt(e.target.value) || 0)} className="h-11 text-sm [appearance:textfield]" />
        </div>
      </BodyStatRow>

      <BodyStatRow
        icon={Activity}
        label="Activity Level"
        value={activityLabel}
        editing={editActivity}
        onToggle={() => { setEditActivity(!editActivity); setEditHeight(false); setEditWeight(false); setEditAge(false) }}
        onDone={() => setEditActivity(false)}
      >
        <div className="flex flex-wrap gap-1.5 pt-2 pb-1">
          {ACTIVITY_LEVELS.map((level) => (
            <motion.button
              key={level.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateProfile({ activityLevel: level.value as ActivityLevel })}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
                profile.activityLevel === level.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted',
              )}
            >
              {level.label}
            </motion.button>
          ))}
        </div>
      </BodyStatRow>
    </div>
  )
}

function BodyStatRow({ icon: Icon, label, value, editing, onToggle, onDone, children }: {
  icon: React.ElementType; label: string; value: string; editing: boolean; onToggle: () => void; onDone: () => void; children: React.ReactNode
}) {
  return (
    <motion.div initial={false} animate={{ opacity: 1 }} className={cn('rounded-2xl overflow-hidden transition-colors duration-200', editing ? 'bg-primary/[0.04]' : 'hover:bg-muted/20')}>
      <motion.button whileTap={editing ? { scale: 1 } : { scale: 0.98 }} onClick={editing ? undefined : onToggle} className="flex items-center gap-3 w-full px-4 py-3 text-left">
        <div className={cn('p-2 rounded-xl', editing ? 'bg-primary/10' : 'bg-muted/50')}>
          <Icon className={cn('h-4 w-4', editing ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
        {!editing && (
          <>
            <span className="text-sm text-muted-foreground/80 font-medium">{value}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
          </>
        )}
      </motion.button>
      <AnimatePresence initial={false}>
        {editing && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="px-4 pb-3">
              {children}
              <motion.button whileTap={{ scale: 0.95 }} onClick={onDone} className="mt-2 w-full py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors">
                Done
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DietaryPrefsContent({ profile, updateProfile }: { profile: UserProfile; updateProfile: (p: Partial<UserProfile>) => void }) {
  return (
    <div className="px-3 py-2">
      <div className="flex flex-wrap gap-2">
        {DIETARY_PREFERENCES.map((pref) => {
          const selected = profile.dietaryPreferences.includes(pref)
          return (
            <motion.button
              key={pref}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                const updated = selected ? profile.dietaryPreferences.filter((p) => p !== pref) : [...profile.dietaryPreferences, pref]
                updateProfile({ dietaryPreferences: updated })
              }}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 border',
                selected ? 'bg-primary/10 text-primary border-primary/20 shadow-sm' : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/70 hover:text-foreground',
              )}
            >
              {selected && <Check className="h-3 w-3" />}
              {pref}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function FitnessGoalContent({ profile, updateProfile }: { profile: UserProfile; updateProfile: (p: Partial<UserProfile>) => void }) {
  return (
    <div className="px-3 py-2 space-y-3">
      <div className="flex gap-1.5">
        {GOAL_DIRECTIONS.map((gd) => (
          <motion.button
            key={gd.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateProfile({ goalDirection: gd.value })}
            className={cn(
              'flex-1 py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all duration-200 border',
              profile.goalDirection === gd.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/70 hover:text-foreground',
            )}
          >
            {gd.label}
          </motion.button>
        ))}
      </div>
      {profile.goalDirection !== 'maintain' && (
        <div className="flex gap-1.5">
          {GOAL_RATES.map((rate) => (
            <motion.button
              key={rate.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateProfile({ goalRate: rate.value })}
              className={cn(
                'flex-1 py-2 rounded-xl text-[11px] font-medium transition-all duration-200 border',
                profile.goalRate === rate.value
                  ? 'bg-muted/80 text-foreground border-border/50 shadow-sm'
                  : 'bg-transparent text-muted-foreground border-transparent hover:bg-muted/40',
              )}
            >
              <div>{rate.label}</div>
              <div className="text-[9px] text-muted-foreground/60 mt-0.5">{rate.description}</div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

function SettingsContent({ profile, updateProfile }: { profile: UserProfile; updateProfile: (p: Partial<UserProfile>) => void }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl">
        <div className="p-2 rounded-xl bg-muted/50"><Sun className="h-4 w-4 text-muted-foreground" /></div>
        <span className="flex-1 text-sm font-medium text-foreground">Theme</span>
        <div className="flex gap-1 bg-muted/50 rounded-xl p-0.5">
          {THEME_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => updateProfile({ theme: t })}
              className={cn('px-3 py-1 rounded-[10px] text-[11px] font-semibold capitalize transition-all duration-200', profile.theme === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/60 hover:text-foreground')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl">
        <div className="p-2 rounded-xl bg-muted/50"><Scale className="h-4 w-4 text-muted-foreground" /></div>
        <span className="flex-1 text-sm font-medium text-foreground">Units</span>
        <div className="flex gap-1 bg-muted/50 rounded-xl p-0.5">
          {(['metric', 'imperial'] as const).map((u) => (
            <button
              key={u}
              onClick={() => updateProfile({ unitSystem: u })}
              className={cn('px-3 py-1 rounded-[10px] text-[11px] font-semibold capitalize transition-all duration-200', profile.unitSystem === u ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/60 hover:text-foreground')}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl">
        <div className="p-2 rounded-xl bg-muted/50"><Bell className="h-4 w-4 text-muted-foreground" /></div>
        <span className="flex-1 text-sm font-medium text-foreground">Notifications</span>
        <Switch checked={profile.notificationsEnabled} onCheckedChange={(checked) => updateProfile({ notificationsEnabled: checked })} />
      </div>

      <div className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl">
        <div className="p-2 rounded-xl bg-muted/50"><Globe className="h-4 w-4 text-muted-foreground" /></div>
        <span className="flex-1 text-sm font-medium text-foreground">Language</span>
        <div className="flex gap-1 bg-muted/50 rounded-xl p-0.5">
          {[{ value: 'en', label: 'EN' }, { value: 'es', label: 'ES' }, { value: 'fr', label: 'FR' }, { value: 'de', label: 'DE' }].map((lang) => (
            <button
              key={lang.value}
              onClick={() => updateProfile({ language: lang.value })}
              className={cn('px-2.5 py-1 rounded-[10px] text-[11px] font-semibold transition-all duration-200', profile.language === lang.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/60 hover:text-foreground')}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl">
        <div className="p-2 rounded-xl bg-muted/50"><Dumbbell className="h-4 w-4 text-rose-500" /></div>
        <div className="flex-1">
          <span className="text-sm font-medium text-foreground">Add exercise to goal</span>
          <p className="text-[10px] text-muted-foreground">Add exercise calories to daily budget</p>
        </div>
        <Switch checked={profile.addExerciseToBudget} onCheckedChange={(checked) => updateProfile({ addExerciseToBudget: checked })} />
      </div>
    </div>
  )
}

function DataPrivacyContent({ onExport, onDelete }: { onExport: () => void; onDelete: () => void }) {
  return (
    <div className="space-y-0.5">
      <motion.button whileTap={{ scale: 0.98 }} onClick={onExport} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 text-left hover:bg-muted/50 active:bg-muted/80">
        <div className="p-2 rounded-xl bg-muted/50"><Download className="h-4 w-4 text-muted-foreground" /></div>
        <span className="flex-1 text-sm font-medium text-foreground">Export All Data</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
      </motion.button>
      <motion.button whileTap={{ scale: 0.98 }} onClick={onDelete} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 text-left hover:bg-muted/50 active:bg-muted/80">
        <div className="p-2 rounded-xl bg-destructive/10"><AlertTriangle className="h-4 w-4 text-destructive" /></div>
        <span className="flex-1 text-sm font-medium text-destructive">Delete All Data</span>
      </motion.button>
    </div>
  )
}

function SupportContent({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="space-y-0.5">
      <motion.button whileTap={{ scale: 0.98 }} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 text-left hover:bg-muted/50 active:bg-muted/80">
        <div className="p-2 rounded-xl bg-muted/50"><Shield className="h-4 w-4 text-muted-foreground" /></div>
        <span className="flex-1 text-sm font-medium text-foreground">Privacy Policy</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
      </motion.button>
      <motion.button whileTap={{ scale: 0.98 }} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 text-left hover:bg-muted/50 active:bg-muted/80">
        <div className="p-2 rounded-xl bg-muted/50"><HelpCircle className="h-4 w-4 text-muted-foreground" /></div>
        <span className="flex-1 text-sm font-medium text-foreground">Help & Support</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
      </motion.button>
      <motion.button whileTap={{ scale: 0.98 }} onClick={onSignOut} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 text-left hover:bg-muted/50 active:bg-muted/80">
        <div className="p-2 rounded-xl bg-destructive/10"><LogOut className="h-4 w-4 text-destructive" /></div>
        <span className="flex-1 text-sm font-medium text-destructive">Sign Out</span>
      </motion.button>
    </div>
  )
}
