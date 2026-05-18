import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import LandingScreen from '../components/LandingScreen'
import MethodSelectScreen from '../components/MethodSelectScreen'
import DirectScreen from '../components/DirectScreen'
import PhotoScreen from '../components/PhotoScreen'
import VibeScoreScreen from '../components/VibeScoreScreen'
import VoiceScreen from '../components/VoiceScreen'
import GhostNoteScreen from '../components/GhostNoteScreen'
import ReceiptScreen from '../components/ReceiptScreen'

const STEP_PROGRESS = {
  landing: 0,
  'method-select': 10,
  direct: 40,
  photo: 35,
  vibe: 55,
  audio: 70,
  ghost: 88,
  receipt: 100,
}

export default function FeedbackFlow() {
  const [searchParams] = useSearchParams()

  const cafeId = searchParams.get('cafe') || 'demo'
  const tableId = searchParams.get('table') || '4'

  const [step, setStep] = useState('landing')
  const [methodQueue, setMethodQueue] = useState([])
  const [methodIdx, setMethodIdx] = useState(0)

  const [submission, setSubmission] = useState({
    cafe_id: cafeId,
    table_id: tableId,
    vibe_score: null,
    vibe_label: null,
    voice_transcript: null,
    photo_feedback: null,
    ghost_note: '',
    direct_text: '',
    is_direct: false,
    receipt_oneliner: null,
  })

  const [submitting, setSubmitting] = useState(false)
  const [visits, setVisits] = useState(0)

  useEffect(() => {
    const v = parseInt(localStorage.getItem(`vc_visits_${cafeId}`) || '0')
    setVisits(v)
  }, [cafeId])

  function update(fields) {
    setSubmission(prev => ({ ...prev, ...fields }))
  }

  function goTo(s) {
    setStep(s)
    window.scrollTo(0, 0)
  }

  function startFlow(selectedMethods, isDirect) {
    if (isDirect) {
      update({ is_direct: true })
      goTo('direct')
      return
    }

    let queue = []

    if (selectedMethods.has('all')) {
      queue = ['photo', 'vibe', 'audio']
    } else {
      if (selectedMethods.has('photo')) queue.push('photo')
      if (selectedMethods.has('vibe')) queue.push('vibe')
      if (selectedMethods.has('audio')) queue.push('audio')
    }

    queue.push('ghost')

    setMethodQueue(queue)
    setMethodIdx(0)

    goTo(queue[0])
  }

  function nextStep() {
    const next = methodIdx + 1

    if (next >= methodQueue.length) {
      handleFinalSubmit(submission)
    } else {
      setMethodIdx(next)
      goTo(methodQueue[next])
    }
  }

  async function handleFinalSubmit(finalSub) {
    setSubmitting(true)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalSub),
      })

      const data = await res.json()

      update({
        receipt_oneliner: data.oneliner,
      })

    } catch (err) {
      console.error(err)

      update({
        receipt_oneliner: 'A solid visit. The coffee carried. ☕',
      })
    }

    const v =
      parseInt(localStorage.getItem(`vc_visits_${cafeId}`) || '0') + 1

    localStorage.setItem(`vc_visits_${cafeId}`, v)

    setVisits(v)

    setSubmitting(false)

    goTo('receipt')
  }

  const progress = STEP_PROGRESS[step] || 0

  const totalSteps = methodQueue.length

  const currentStep = methodIdx

  const screenProps = {
    cafeId,
    tableId,
    submission,
    update,
    nextStep,
    visits,
    submitting,
  }

  return (
    <div className="app">

      {step !== 'landing' && step !== 'receipt' && (
        <div className="progress-wrap">

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="step-dots">
            {Array.from(
              { length: Math.max(totalSteps, 1) },
              (_, i) => (
                <div
                  key={i}
                  className={`step-dot${
                    i === currentStep ? ' active' : ''
                  }`}
                />
              )
            )}
          </div>

        </div>
      )}

      {step === 'landing' && (
        <LandingScreen
          {...screenProps}
          onStart={() => goTo('method-select')}
        />
      )}

      {step === 'method-select' && (
        <MethodSelectScreen
          {...screenProps}
          onContinue={startFlow}
        />
      )}

      {step === 'direct' && (
        <DirectScreen
          {...screenProps}
          onSubmit={async text => {
            const updated = {
              ...submission,
              direct_text: text,
              is_direct: true,
            }

            update(updated)

            await handleFinalSubmit(updated)
          }}
        />
      )}

      {step === 'photo' && (
        <PhotoScreen {...screenProps} />
      )}

      {step === 'vibe' && (
        <VibeScoreScreen {...screenProps} />
      )}

      {step === 'audio' && (
        <VoiceScreen {...screenProps} />
      )}

      {step === 'ghost' && (
        <GhostNoteScreen
          {...screenProps}
          onSubmit={async note => {
            const updated = {
              ...submission,
              ghost_note: note,
            }

            update(updated)

            await handleFinalSubmit(updated)
          }}
        />
      )}

      {step === 'receipt' && (
        <ReceiptScreen {...screenProps} />
      )}

    </div>
  )
}
