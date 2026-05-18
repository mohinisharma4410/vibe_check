export const BRUTAL_QUESTIONS = [
  "Did your server seem like they wanted to be here?",
  "Rate the bathroom honestly.",
  "Was the music too loud, too low, or just right?",
  "What would you fix if you owned this place?",
  "Would you recommend this café to someone you actually like?",
  "Was the wait time acceptable?",
  "How was the WiFi? (Be honest)",
  "Did anything feel off today?",
  "Was the pricing fair for what you got?",
  "Did the staff make you feel welcome?",
]

export function getRotatingQuestion(cafeId, tableId) {
  const seed = (cafeId + tableId + new Date().toDateString()).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return BRUTAL_QUESTIONS[seed % BRUTAL_QUESTIONS.length]
}
