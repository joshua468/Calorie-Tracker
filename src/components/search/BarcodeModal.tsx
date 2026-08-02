import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Barcode, Camera, Search, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/store/useStore'
import { MEAL_LABELS, generateBarcodeMockName, QUICK_FOODS } from '@/lib/constants'
import type { MealType, LogSource } from '@/lib/types'

interface BarcodeModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMeal?: string
  onLog: (data: { name: string; calories: number; protein: number; carbs: number; fat: number; meal: MealType; source?: LogSource }) => void
}

export function BarcodeModal({ isOpen, onClose, defaultMeal, onLog }: BarcodeModalProps) {
  const addEntry = useStore((s) => s.addEntry)
  const [mode, setMode] = useState<'scan' | 'manual'>('scan')
  const [barcode, setBarcode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [foundProduct, setFoundProduct] = useState<{ name: string; calories: number; protein: number; carbs: number; fat: number } | null>(null)
  const [meal, setMeal] = useState<MealType>((defaultMeal as MealType) || 'snacks')
  const [servings, setServings] = useState('1')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && defaultMeal) setMeal(defaultMeal as MealType)
    if (isOpen && mode === 'manual') setTimeout(() => inputRef.current?.focus(), 200)
  }, [isOpen, defaultMeal, mode])

  const handleBarcodeSubmit = () => {
    const code = barcode.trim()
    if (!code) return

    setScanning(true)
    setTimeout(() => {
      const product = QUICK_FOODS.find((f) => f.name === generateBarcodeMockName(code))
      if (product) {
        setFoundProduct({
          name: product.name,
          calories: product.calories,
          protein: product.protein,
          carbs: product.carbs,
          fat: product.fat,
        })
      } else if (code === '0000000000000') {
        setFoundProduct({
          name: 'Test Product',
          calories: 100,
          protein: 5,
          carbs: 10,
          fat: 3,
        })
      } else {
        setFoundProduct(null)
      }
      setScanning(false)
    }, 800)
  }

  const handleLog = () => {
    if (!foundProduct) return
    const s = parseFloat(servings) || 1
    addEntry({
      name: foundProduct.name,
      calories: Math.round(foundProduct.calories * s),
      protein: Math.round(foundProduct.protein * s),
      carbs: Math.round(foundProduct.carbs * s),
      fat: Math.round(foundProduct.fat * s),
      meal,
      servingSize: s,
      source: 'barcode',
    })
    setBarcode('')
    setFoundProduct(null)
    onClose()
  }

  const handleManualLog = (e: React.FormEvent) => {
    e.preventDefault()
    const name = (inputRef.current?.value || '').trim()
    if (!name) return
    onLog({
      name,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      meal,
      source: 'barcode',
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <div>
                <h2 className="text-lg font-bold text-foreground">Barcode Scan</h2>
                <p className="text-xs text-muted-foreground">Scan a product barcode to log it</p>
              </div>
              <button onClick={onClose} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pb-8 space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={mode === 'scan' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('scan')}
                  className="rounded-xl"
                >
                  <Barcode className="h-3.5 w-3.5" />
                  Scan
                </Button>
                <Button
                  variant={mode === 'manual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('manual')}
                  className="rounded-xl"
                >
                  <Search className="h-3.5 w-3.5" />
                  Manual Entry
                </Button>
              </div>

              {mode === 'scan' ? (
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-2xl bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    {scanning ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Scanning...</p>
                      </div>
                    ) : foundProduct ? (
                      <div className="text-center">
                        <Check className="h-10 w-10 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">Product found!</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Enter barcode number below</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value.replace(/\D/g, '').slice(0, 13))}
                      placeholder="Enter barcode number"
                      className="h-11 flex-1"
                      maxLength={13}
                      type="text"
                      inputMode="numeric"
                    />
                    <Button variant="green" onClick={handleBarcodeSubmit} disabled={scanning || !barcode.trim()} className="h-11 rounded-xl">
                      {scanning ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {foundProduct && (
                    <div className="space-y-3 rounded-2xl bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{foundProduct.name}</span>
                        <span className="text-sm font-bold tabular-nums">{foundProduct.calories} cal</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        P {foundProduct.protein}g · C {foundProduct.carbs}g · F {foundProduct.fat}g
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground block mb-1">Servings</label>
                          <Input type="number" value={servings} onChange={(e) => setServings(e.target.value)} min={0.1} step={0.5} className="h-9" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground block mb-1">Meal</label>
                          <Select value={meal} onValueChange={(v) => setMeal(v as MealType)}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(MEAL_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button variant="green" className="w-full h-10 rounded-xl" onClick={handleLog}>
                        <Check className="h-4 w-4" />
                        Log {foundProduct.name}
                      </Button>
                    </div>
                  )}

                  {!foundProduct && barcode && !scanning && (
                    <p className="text-xs text-muted-foreground text-center">
                      Product not found?{' '}
                      <button onClick={() => setMode('manual')} className="text-primary font-medium">
                        Enter details manually
                      </button>
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleManualLog} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Product Name</label>
                    <Input placeholder="e.g. Whole Wheat Bread" className="h-11" required />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Meal</label>
                    <Select value={meal} onValueChange={(v) => setMeal(v as MealType)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MEAL_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="green" className="w-full h-11 rounded-xl" type="submit">
                    <Search className="h-4 w-4" />
                    Search & Log
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
