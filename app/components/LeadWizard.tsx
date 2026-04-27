'use client'

import { useState } from 'react'

interface Selections {
  serviceType: string
  roofSize: string
  urgency: string
  roofCondition: string
  insuranceStatus: string
}

interface ContactInfo {
  fullName: string
  email: string
  phone: string
}

interface QuoteResult {
  low: number
  high: number
  isInsuranceClaim: boolean
}

const BASE_PRICES: Record<string, number> = {
  'Roof Replacement': 9500,
  'Roof Repair': 1150,
  'Storm Damage Assessment': 300,
  'Free Inspection Only': 0,
}

const SIZE_MULTIPLIERS: Record<string, number> = {
  'Small (under 1,500 sq ft)': 0.8,
  'Medium (1,500 – 2,500 sq ft)': 1.0,
  'Large (2,500+ sq ft)': 1.4,
}

const URGENCY_MULTIPLIERS: Record<string, number> = {
  'Emergency (within 48 hours)': 1.15,
  'Soon (within 2 weeks)': 1.0,
  'Planning ahead (1–3 months)': 0.95,
}

const CONDITION_MODIFIERS: Record<string, number> = {
  'Visible damage / leaks': 800,
  'Old but functional': 0,
  'Just want an upgrade': -300,
}

const STEPS = [
  {
    id: 1,
    question: 'What service do you need?',
    field: 'serviceType' as keyof Selections,
    options: [
      'Roof Replacement',
      'Roof Repair',
      'Storm Damage Assessment',
      'Free Inspection Only',
    ],
  },
  {
    id: 2,
    question: "What's the size of your roof?",
    field: 'roofSize' as keyof Selections,
    options: [
      'Small (under 1,500 sq ft)',
      'Medium (1,500 – 2,500 sq ft)',
      'Large (2,500+ sq ft)',
    ],
  },
  {
    id: 3,
    question: 'How urgent is this?',
    field: 'urgency' as keyof Selections,
    options: [
      'Emergency (within 48 hours)',
      'Soon (within 2 weeks)',
      'Planning ahead (1–3 months)',
    ],
  },
  {
    id: 4,
    question: "What's the condition of your current roof?",
    field: 'roofCondition' as keyof Selections,
    options: [
      'Visible damage / leaks',
      'Old but functional',
      'Just want an upgrade',
    ],
  },
  {
    id: 5,
    question: 'Are you filing an insurance claim?',
    field: 'insuranceStatus' as keyof Selections,
    options: [
      "Yes, I'm filing a claim",
      'No, paying out of pocket',
      'Not sure',
    ],
  },
]

function calculateQuote(selections: Selections): QuoteResult {
  if (selections.insuranceStatus === "Yes, I'm filing a claim") {
    return { low: 500, high: 2500, isInsuranceClaim: true }
  }

  const basePrice = BASE_PRICES[selections.serviceType] ?? 0
  const sizeMultiplier = SIZE_MULTIPLIERS[selections.roofSize] ?? 1.0
  const urgencyMultiplier = URGENCY_MULTIPLIERS[selections.urgency] ?? 1.0
  const conditionModifier = CONDITION_MODIFIERS[selections.roofCondition] ?? 0
  const insuranceMultiplier =
    selections.insuranceStatus === 'No, paying out of pocket' ? 0.92 : 1.0

  const subtotal = basePrice * sizeMultiplier + conditionModifier
  const total = subtotal * urgencyMultiplier * insuranceMultiplier

  return {
    low: Math.round(total * 0.85),
    high: Math.round(total * 1.15),
    isInsuranceClaim: false,
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function LeadWizard() {
  const [step, setStep] = useState(1)
  const [selections, setSelections] = useState<Selections>({
    serviceType: '',
    roofSize: '',
    urgency: '',
    roofCondition: '',
    insuranceStatus: '',
  })
  const [contact, setContact] = useState<ContactInfo>({
    fullName: '',
    email: '',
    phone: '',
  })
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [errors, setErrors] = useState<Partial<ContactInfo>>({})
  const [inspectionBooked, setInspectionBooked] = useState(false)

  const totalQuestionSteps = 5
  const isOnQuestion = step >= 1 && step <= totalQuestionSteps
  const isOnCapture = step === 6
  const isOnResults = step === 7

  const currentStepData = isOnQuestion ? STEPS[step - 1] : null
  const currentSelection = currentStepData
    ? selections[currentStepData.field]
    : ''

  function handleSelect(field: keyof Selections, value: string) {
    setSelections((prev) => ({ ...prev, [field]: value }))
  }

  function handleNext() {
    if (step < totalQuestionSteps) {
      setStep((prev) => prev + 1)
    } else if (step === totalQuestionSteps) {
      setStep(6)
    }
  }

  function handleBack() {
    if (step > 1) setStep((prev) => prev - 1)
  }

  function validateContact(): boolean {
    const newErrors: Partial<ContactInfo> = {}
    if (!contact.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!contact.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (contact.phone.replace(/\D/g, '').length !== 10)
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateContact()) return
    const result = calculateQuote(selections)
    setQuote(result)
    setStep(7)
  }

  // ─── Results Screen ───────────────────────────────────────────────────────
  if (isOnResults && quote) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-2xl border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.15)] w-full max-w-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-sm font-semibold tracking-widest text-orange-500 uppercase mb-2">
            Your Estimate Is Ready
          </p>
          <h2 className="text-3xl font-bold text-white mb-2">
            {quote.isInsuranceClaim
              ? '$500 – $2,500'
              : `${formatCurrency(quote.low)} – ${formatCurrency(quote.high)}`}
          </h2>
          {quote.isInsuranceClaim && (
            <p className="text-gray-300 text-sm mb-1">Estimated deductible range</p>
          )}
          <p className="text-gray-300 text-sm mb-8">
            Forge Roofing will reach out within 24 hours to confirm your appointment.
          </p>

          {inspectionBooked ? (
            <div className="bg-green-950 border border-green-800 rounded-xl px-5 py-4 mb-4 text-green-300 text-sm font-medium">
              Thanks! Your inspection request has been received. Forge Roofing will call you within 24 hours.
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setInspectionBooked(true)}
              className="block w-full bg-orange-500 hover:bg-amber-700 text-white font-semibold text-base py-4 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(249,115,22,0.4)] mb-4"
            >
              Book My Free Inspection
            </button>
          )}

          <div className="bg-[#1A1A1A] rounded-xl p-4 text-left text-sm text-gray-300">
            <p className="font-semibold text-white mb-2">Your selections:</p>
            <ul className="space-y-1">
              <li><span className="text-gray-500">Service:</span> {selections.serviceType}</li>
              <li><span className="text-gray-500">Roof size:</span> {selections.roofSize}</li>
              <li><span className="text-gray-500">Urgency:</span> {selections.urgency}</li>
              <li><span className="text-gray-500">Condition:</span> {selections.roofCondition}</li>
              <li><span className="text-gray-500">Insurance:</span> {selections.insuranceStatus}</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // ─── Capture Form ─────────────────────────────────────────────────────────
  if (isOnCapture) {
    const isFormValid =
      contact.fullName.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) &&
      contact.phone.replace(/\D/g, '').length === 10

    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-2xl border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.15)] w-full max-w-lg">
          {/* Header */}
          <div className="bg-[#1A1A1A] rounded-t-2xl px-8 py-6 border-b border-orange-500/30">
            <p className="text-orange-500 font-bold tracking-widest text-xs uppercase mb-1">
              Forge Roofing
            </p>
            <h1 className="text-white text-xl font-semibold">Almost there — where do we send your estimate?</h1>
          </div>

          {/* Progress */}
          <div className="px-8 pt-6">
            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div key={s.id} className="h-1.5 flex-1 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              ))}
              <div className="h-1.5 flex-1 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Final step</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={contact.fullName}
                onChange={(e) => setContact((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Jane Smith"
                className={`w-full border rounded-xl px-4 py-3 bg-[#1A1A1A] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${errors.fullName ? 'border-red-400' : 'border-neutral-700'}`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="jane@example.com"
                className={`w-full border rounded-xl px-4 py-3 bg-[#1A1A1A] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${errors.email ? 'border-red-400' : 'border-neutral-700'}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 000-0000"
                className={`w-full border rounded-xl px-4 py-3 bg-[#1A1A1A] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${errors.phone ? 'border-red-400' : 'border-neutral-700'}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-none px-5 py-3 rounded-xl border border-neutral-700 text-gray-300 text-sm font-medium hover:bg-[#1A1A1A] transition-all duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 text-sm font-semibold py-3 rounded-xl transition-all duration-200 ${
                  isFormValid
                    ? 'bg-orange-500 hover:bg-amber-700 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                Get My Free Estimate
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ─── Question Steps ───────────────────────────────────────────────────────
  if (!currentStepData) return null

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.15)] w-full max-w-lg">
        {/* Header */}
        <div className="bg-[#1A1A1A] rounded-t-2xl px-8 py-6 border-b border-orange-500/30">
          <p className="text-orange-500 font-bold tracking-widest text-xs uppercase mb-1">
            Forge Roofing
          </p>
          <h1 className="text-white text-xl font-semibold leading-snug">
            Get Your Free Instant Estimate
          </h1>
        </div>

        {/* Progress */}
        <div className="px-8 pt-6">
          <div className="flex items-center gap-1.5">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                  s.id <= step ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-neutral-800'
                }`}
              />
            ))}
            {/* capture step indicator */}
            <div className="h-1.5 flex-1 rounded-full bg-neutral-800" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Step {step} of {totalQuestionSteps + 1}
          </p>
        </div>

        {/* Question */}
        <div className="px-8 py-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {currentStepData.question}
          </h2>

          <div className="space-y-3">
            {currentStepData.options.map((option) => {
              const selected = currentSelection === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(currentStepData.field, option)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                    selected
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-zinc-400 bg-zinc-900 shadow-md shadow-black/50 text-gray-200 hover:border-orange-500/60 hover:bg-[#1A1A1A]'
                  }`}
                >
                  <span
                    className={`inline-flex w-4 h-4 rounded-full border-2 mr-3 items-center justify-center shrink-0 align-middle transition-colors ${
                      selected ? 'border-orange-500 bg-orange-500' : 'border-neutral-600'
                    }`}
                  >
                    {selected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                    )}
                  </span>
                  {option}
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-none px-5 py-3 rounded-xl border border-neutral-700 text-gray-300 text-sm font-medium hover:bg-[#1A1A1A] transition-all duration-200"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!currentSelection}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentSelection
                  ? 'bg-orange-500 hover:bg-amber-700 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {step === totalQuestionSteps ? 'Continue to Contact Info' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
