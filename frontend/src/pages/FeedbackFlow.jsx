import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import LandingScreen from '../components/LandingScreen'
import MethodSelectScreen from '../components/MethodSelectScreen'
import DirectScreen from '../components/DirectScreen'
import SelfieScreen from '../components/SelfieScreen'
import VibeScoreScreen from '../components/VibeScoreScreen'
import VoiceScreen from '../components/VoiceScreen'
import BrutalQuestionScreen from '../components/BrutalQuestionScreen'
import GhostNoteScreen from '../components/GhostNoteScreen'
import ReceiptScreen from '../components/ReceiptScreen'

import { getRotatingQuestion } from '../lib/questions'

const STEP_PROGRESS = {
  landing: 0,
  'method-select': 10,
  direct: 40,
  selfie: 30,
  vibe: 55,
  audio: 68,
  question: 82,
  ghost: 92,
  receipt: 100,
}

export default function FeedbackFlow() {
  const [searchParams] = useSearchParams()
  const cafeId  = searchParams.get('cafe')  || 'demo'
  const tableId = searchParams.get('table') || '1'

  // Pick rotating question once per session — deterministic, no state needed
  const sessionQuestion = getRotatingQuestion(cafeId, tableId)

  const [step,        setStep]        = useState('landing')
  const [methodQueue, setMethodQueue] = useState([])
  const [methodIdx,   setMethodIdx]   = useState(0)
  const [submitting,  setSubmitting]  = useState(false)

  const [submission, setSubmission] = useState({
    cafe_id:          cafeId,
    table_id:         tableId,
    vibe_score:       null,
    vibe_label:       null,
    mood:             null,
    mood_accurate:    null,
    voice_transcript: null,
    ghost_note:       '',
    direct_text:      '',
    is_direct:        false,
    question:         sessionQuestion,  // always present, set once
    question_answer:  null,
    receipt_oneliner: null,
  })

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
      queue = ['selfie', 'vibe', 'audio', 'question', 'ghost']
    } else {
      if (selectedMethods.has('photo'))  queue.push('selfie')
      if (selectedMethods.has('vibe'))   queue.push('vibe')
      if (selectedMethods.has('audio'))  queue.push('audio')
      queue.push('question')
      queue.push('ghost')
    }

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

  function handleGhostSubmit(note) {
    const finalSub = { ...submission, ghost_note: note }
    setSubmission(finalSub)
    handleFinalSubmit(finalSub)
  }

  async function handleFinalSubmit(finalSub) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalSub),
      })
      const data = await res.json()
      update({ receipt_oneliner: data.oneliner })
    } catch {
      update({ receipt_oneliner: 'A solid visit. The coffee carried. ☕' })
    }
    setSubmitting(false)
    goTo('receipt')
  }

  const progress    = STEP_PROGRESS[step] || 0
  const totalSteps  = methodQueue.length
  const currentStep = methodIdx
  const screenProps = { cafeId, tableId, submission, update, nextStep, submitting }

  return (
    <div className="app">

      {step !== 'landing' && step !== 'receipt' && (
        <div className="progress-wrap">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="step-dots">
            {Array.from({ length: Math.max(totalSteps, 1) }, (_, i) => (
              <div key={i} className={`step-dot${i === currentStep ? ' active' : ''}`} />
            ))}
          </div>
        </div>
      )}

      {step === 'landing'        && <LandingScreen tableId={tableId} onStart={() => goTo('method-select')} />}
      {step === 'method-select'  && <MethodSelectScreen {...screenProps} onContinue={startFlow} />}
      {step === 'direct'         && (
        <DirectScreen
          {...screenProps}
          onSubmit={async text => {
            const updated = { ...submission, direct_text: text, is_direct: true }
            update(updated)
            await handleFinalSubmit(updated)
          }}
        />
      )}
      {step === 'selfie'   && (
        <SelfieScreen
          updateSubmission={update}
          nextStep={nextStep}
          stepLabel={`Step ${currentStep + 1} of ${totalSteps}`}
        />
      )}
      {step === 'vibe'     && <VibeScoreScreen {...screenProps} />}
      {step === 'audio'    && <VoiceScreen {...screenProps} />}
      {step === 'question' && (
        <BrutalQuestionScreen
          submission={submission}
          updateSubmission={update}
          nextStep={nextStep}
          stepLabel={`Step ${currentStep + 1} of ${totalSteps}`}
        />
      )}
      {step === 'ghost'    && <GhostNoteScreen {...screenProps} onSubmit={handleGhostSubmit} />}
      {step === 'receipt'  && <ReceiptScreen {...screenProps} />}

    </div>
  )
}
