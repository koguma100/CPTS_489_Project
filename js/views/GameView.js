export class GameView {

  // ── DOM refs ────────────────────────────────────────────────────────────
  constructor() {
    this.playerList  = document.getElementById('player-list')
    this.emptyMsg    = document.getElementById('empty-msg')
    this.playerCount = document.getElementById('player-count')
    this.gameCode    = document.getElementById('game-code') ?? document.getElementById('game-pin')
    this.statusBadge = document.getElementById('status-badge')
    this.quizTitle   = document.getElementById('quiz-title')
    this.kickBtn     = document.getElementById('btn-kick')
    this.startBtn    = document.getElementById('btn-start')

    this.selectedId  = null
    this._onKick     = null
    this._onStart    = null

    // Wire buttons once — the view owns its own event listeners
    this.kickBtn?.addEventListener('click',  () => this._handleKick())
    this.startBtn?.addEventListener('click', () => this._handleStart())
  }

  // ── Public API (called by Controller) ───────────────────────────────────

  setTitle(title) {
    if (this.quizTitle) this.quizTitle.textContent = title
  }

  setPin(pin) {
    this.gameCode.textContent = pin
  }

  setStatus(message) {
    this.statusBadge.textContent = message
  }

  /**
   * Re-renders the player list.
   * @param {Array<{ id: string, name: string }>} players
   */
  renderPlayers(players) {
    this.playerCount.textContent = players.length
    this.playerList.innerHTML = ''

    if (players.length === 0) {
      this.emptyMsg.classList.remove('hidden')
      return
    }

    this.emptyMsg.classList.add('hidden')

    players.forEach(player => {
      const isSelected = player.id === this.selectedId
      const chip = document.createElement('div')

      chip.className = [
        'px-3 py-1.5 border rounded cursor-pointer select-none text-white text-sm font-medium',
        isSelected
          ? 'bg-berry-lipstick border-berry-lipstick'
          : 'bg-royal-plum border-royal-plum hover:border-berry-lipstick'
      ].join(' ')

      chip.textContent = this._escape(player.name)
      chip.dataset.playerId = player.id
      chip.addEventListener('click', () => this._selectPlayer(player.id))
      this.playerList.appendChild(chip)
    })

    this.kickBtn.disabled = this.selectedId === null
  }

  /** Register the callback the Controller provides for kick */
  onKick(handler) {
    this._onKick = handler
  }

  /** Register the callback the Controller provides for start */
  onStart(handler) {
    this._onStart = handler
  }

  showLoading(message) {
    this.setStatus(message)
  }

  showError(message) {
    alert(message)
  }

  showQuestion({ questionIndex, text, options, timeLimitMs, isHost }) {
    this.setStatus(`Question ${questionIndex + 1} — ${text}`)
  }

  updateCountdown(secondsLeft) {
    this.setStatus(`Time left: ${secondsLeft}s`)
  }

  showQuestionResult({ correctAnswer, scores }) {
    this.setStatus(`Answer: option ${correctAnswer} | ${scores.length} player(s) scored`)
  }

  showGameOver({ leaderboard }) {
    this.setStatus('Game over!')
  }

  showAnswerConfirmation(result) {
    this.setStatus(result.correct ? 'Correct!' : 'Wrong!')
  }

  // ── Private ─────────────────────────────────────────────────────────────

  _selectPlayer(id) {
    // Toggle selection
    this.selectedId = this.selectedId === id ? null : id
    // Re-render is triggered by the Controller after it updates its own state,
    // but for pure UI selection highlight we re-render immediately
    this._refreshSelection()
  }

  _refreshSelection() {
    this.playerList.querySelectorAll('div[data-player-id]').forEach(chip => {
      const isSelected = chip.dataset.playerId === String(this.selectedId)
      chip.className = [
        'px-3 py-1.5 border rounded cursor-pointer select-none text-white text-sm font-medium',
        isSelected
          ? 'bg-berry-lipstick border-berry-lipstick'
          : 'bg-royal-plum border-royal-plum hover:border-berry-lipstick'
      ].join(' ')
    })
    this.kickBtn.disabled = this.selectedId === null
  }

  _handleKick() {
    if (this.selectedId === null) return
    this._onKick?.(this.selectedId)
    this.selectedId = null  // clear selection after kick
  }

  _handleStart() {
    this._onStart?.()
  }

  _escape(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
}