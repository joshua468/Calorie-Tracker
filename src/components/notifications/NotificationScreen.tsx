'use client'

import { ChevronLeft, Bell, Timer, Utensils, Trophy } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useStore } from '@/store/useStore'

interface NotificationScreenProps {
  onBack: () => void
}

const SAMPLE_NOTIFICATIONS = [
  { id: '1', icon: Utensils, title: 'Time to log breakfast!', desc: 'You haven\'t logged your breakfast yet.', time: '2h ago', type: 'reminder' },
  { id: '2', icon: Trophy, title: 'Goal almost reached!', desc: 'You\'re 85% to your daily calorie goal.', time: '5h ago', type: 'progress' },
  { id: '3', icon: Timer, title: 'Meal streak: 5 days!', desc: 'You\'ve logged meals for 5 days straight.', time: '1d ago', type: 'streak' },
]

const NOTIFICATION_TYPES = [
  { key: 'mealReminders', label: 'Meal reminders', icon: Timer },
  { key: 'goalProgress', label: 'Goal progress', icon: Trophy },
  { key: 'tips', label: 'Tips & insights', icon: Bell },
]

export function NotificationScreen({ onBack }: NotificationScreenProps) {
  const profile = useStore((s) => s.profile)
  const updateProfile = useStore((s) => s.updateProfile)

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-3 px-6 pt-14 pb-4">
        <button
          onClick={onBack}
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer bg-[#E9F8EE] text-[#2FAE60] transition active:scale-90"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-[17px] font-extrabold text-[#0E1B33]">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="mb-6">
          <h2 className="text-xs font-bold text-[#6B7690] tracking-wider uppercase mb-3">Preferences</h2>
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-[#E7ECF6]">
            <div>
              <span className="text-sm font-bold text-[#0E1B33]">Push notifications</span>
              <p className="text-[11px] text-[#6B7690] mt-0.5">Receive alerts about meals and goals</p>
            </div>
            <Switch checked={profile.notificationsEnabled} onCheckedChange={(checked) => updateProfile({ notificationsEnabled: checked })} />
          </div>
        </div>

        {profile.notificationsEnabled && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-[#6B7690] tracking-wider uppercase mb-3">Notify me about</h2>
            <div className="space-y-2">
              {NOTIFICATION_TYPES.map((nt) => {
                const Icon = nt.icon
                return (
                  <div key={nt.key} className="flex items-center justify-between bg-white rounded-2xl p-4 border border-[#E7ECF6]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#E9F8EE]">
                        <Icon className="h-4 w-4 text-[#2FAE60]" />
                      </div>
                      <span className="text-sm font-medium text-[#0E1B33]">{nt.label}</span>
                    </div>
                    <Switch
                      checked={true}
                      onCheckedChange={() => {}}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xs font-bold text-[#6B7690] tracking-wider uppercase mb-3">Recent</h2>
          <div className="space-y-2">
            {SAMPLE_NOTIFICATIONS.map((n) => {
              const Icon = n.icon
              return (
                <div key={n.id} className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-[#E7ECF6]">
                  <div className="p-2 rounded-xl bg-[#E9F8EE] shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-[#2FAE60]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[#0E1B33]">{n.title}</div>
                    <p className="text-[12px] text-[#6B7690] mt-0.5">{n.desc}</p>
                  </div>
                  <span className="text-[11px] text-[#6B7690] shrink-0">{n.time}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
