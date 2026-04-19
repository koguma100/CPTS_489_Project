import { GameController } from './controllers/GameController.js'
import { GameView }        from './views/GameView.js'
import { supabase }        from './supabase/supabase.js'

// ─── Detect current page ──────────────────────────────────────────────────────
const page = document.body.dataset.page

const view       = new GameView()
const controller = new GameController(view)

// ─── Page: joinGame.html ──────────────────────────────────────────────────────
if (page === 'join') {
  const form = document.getElementById('joinGameForm')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const pin        = document.getElementById('lobbyCode').value.trim()
    const playerName = document.getElementById('playerName').value.trim()

    if (!pin || !playerName) {
      showFormError('Please enter both a lobby code and your name.')
      return
    }

    setSubmitLoading(true)

    try {
      await controller.joinGame(pin, playerName)
      window.location.href = '/pages/game/playerLobby.html'

    } catch (err) {
      const message = err.message.includes('No rows')
        ? 'Game not found. Check the code and try again.'
        : err.message ?? 'Something went wrong.'
      showFormError(message)

    } finally {
      setSubmitLoading(false)
    }
  })
}

// ─── Page: lobby.html (player) ────────────────────────────────────────────────
if (page === 'lobby-player') {
  await controller.connectToLobby()
}

// ─── Page: lobby.html (host) ──────────────────────────────────────────────────
if (page === 'lobby-host') {
  const { data: { user } } = await supabase.auth.getUser()
  const hostId = user?.id ?? crypto.randomUUID()

  const savedGameId  = sessionStorage.getItem('hostGameId')
  const savedGamePin = sessionStorage.getItem('hostGamePin')
  const savedQuizId  = sessionStorage.getItem('hostQuizId')

  if (savedGameId && savedGamePin && savedQuizId) {
    await controller.reconnectGame(hostId, savedGameId, savedGamePin, savedQuizId)
  } else {
    const quizId = sessionStorage.getItem('selectedQuizId') ?? '0f2cbb4d-b1a0-46cc-8295-ab62d6a3db95'
    await controller.createGame(hostId, quizId)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setSubmitLoading(on) {
  const btn = document.querySelector('[type="submit"]')
  if (!btn) return
  btn.disabled    = on
  btn.textContent = on ? 'Joining…' : 'Join Game'
}

function showFormError(message) {
  let el = document.getElementById('form-error')
  if (!el) {
    el = document.createElement('p')
    el.id        = 'form-error'
    el.className = 'text-red-500 text-sm text-center mt-3'
    document.getElementById('joinGameForm')?.appendChild(el)
  }
  el.textContent = message
}