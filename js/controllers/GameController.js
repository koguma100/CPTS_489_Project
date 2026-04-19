import { GameModel } from '../models/GameModel.js'

/**
 * GameController — orchestrates game flow for both host and players.
 *
 * State machine phases:
 *   lobby → question_active → question_end → [repeat] → game_over
 *
 * The HOST drives phase transitions via broadcasts.
 * PLAYERS react to broadcasts and can only call submitAnswer().
 */
export class GameController {
  constructor(view) {
    this.model = new GameModel()
    this.view  = view

    // Game state
    this.game        = null
    this.players     = []       // live player list from Presence
    this.questions   = []       // loaded when host starts
    this.currentQuestionIndex = 0
    this.currentQuestion      = null

    // Session
    this.playerName = null
    this.isHost     = false
    this.phase      = 'idle'

    // Channel
    this.channel     = null
    this.unsubscribe = null

    // Answer tracking
    this._questionStartedAt = null
    this._answered          = false
    this._tickTimer         = null
  }

  // ─── Host: create and run a game ─────────────────────────────────────────

  /**
   * Called from the host's "Create Game" form.
   * Creates the game row, shows the lobby, and sets up the Realtime channel.
   *
   * @param {string} hostId   - UUID of the host (from Supabase Auth or crypto.randomUUID())
   * @param {string} quizId   - UUID of the selected quiz
   */
  async createGame(hostId, quizId) {
    this.isHost     = true
    this.playerName = hostId  // host is identified by their ID in Presence

    this.view.showLoading('Creating game…')

    try {
      this.game = await this.model.createGame(hostId, quizId)

      sessionStorage.setItem('hostGameId',  this.game.id)
      sessionStorage.setItem('hostGamePin', this.game.pin)
      sessionStorage.setItem('hostQuizId',  quizId)
      sessionStorage.setItem('hostId',      hostId)

      const quiz = await this.model.getQuiz(quizId)
      this.view.setTitle(quiz.title)
      this.view.setPin(this.game.pin)
      this.view.setStatus('Waiting for players…')

      const initial = await this.model.getPlayers(this.game.id)
      this.view.renderPlayers(initial.map(p => ({ id: p.id, name: p.player_name })))

      // Register view callbacks
      this.view.onKick((playerId) => this._handleKick(playerId))
      this.view.onStart(() => this._handleStart())

      // Open the Realtime channel
      this._connectChannel(this.game.pin, hostId)

    } catch (err) {
      this.view.showError('Failed to create game: ' + err.message)
    }
  }

  async reconnectGame(hostId, gameId, pin, quizId) {
    this.isHost     = true
    this.playerName = hostId
    this.game       = { id: gameId, pin, quiz: quizId, question_duration_ms: 20000 }

    sessionStorage.setItem('hostId', hostId)

    this.view.showLoading('Reconnecting…')

    try {
      const quiz = await this.model.getQuiz(quizId)
      this.view.setTitle(quiz.title)
      this.view.setPin(pin)
      this.view.setStatus('Waiting for players…')

      const players = await this.model.getPlayers(gameId)
      this.view.renderPlayers(players.map(p => ({ id: p.id, name: p.player_name })))

      this.view.onKick((playerId) => this._handleKick(playerId))
      this.view.onStart(() => this._handleStart())

      this._connectChannel(pin, hostId)
    } catch (err) {
      this.view.showError('Failed to reconnect: ' + err.message)
    }
  }

  async resumeAsHost() {
    const hostId = sessionStorage.getItem('hostId')
    const pin    = sessionStorage.getItem('hostGamePin')
    const quizId = sessionStorage.getItem('hostQuizId')

    if (!hostId || !pin || !quizId) {
      this.view.showError('No active game found. Return to lobby.')
      return
    }

    this.isHost     = true
    this.playerName = hostId
    this.game       = await this.model.getGameByPin(pin)
    this.questions  = await this.model.getQuestions(quizId)
    this.currentQuestionIndex = this.game.current_question ?? 0

    this._postSubscribe = () => this._startNextQuestion()
    this._connectChannel(pin, hostId)
  }

  // ─── Player: join an existing game ───────────────────────────────────────

  /**
   * Called from joinGame.html form submit.
   * Validates the PIN, registers the player in player_scores, then redirects.
   * The Realtime channel is opened on lobby.html load (see connectToLobby).
   *
   * @param {string} pin        - 6-digit game PIN entered by the player
   * @param {string} playerName - display name entered by the player
   */
  async joinGame(pin, playerName) {
    this.isHost     = false
    this.playerName = playerName

    try {
      // 1. Validate the game exists
      this.game = await this.model.getGameByPin(pin)

      if (this.game.phase === 'game_over') {
        throw new Error('This game has already ended.')
      }

      // 2. Register player in player_scores (score = 0)
      //    Upsert means rejoining on refresh won't error
      await this.model.addPlayer(this.game.id, playerName)

      // 3. Persist to sessionStorage so lobby.html can reconnect
      sessionStorage.setItem('gamePin',    pin)
      sessionStorage.setItem('playerName', playerName)
      sessionStorage.setItem('gameId',     this.game.id)

      return this.game

    } catch (err) {
      // Re-throw so the page's try/catch can show the right error message
      throw err
    }
  }

  /**
   * Called on lobby.html load for players (not the host).
   * Reads sessionStorage and opens the Realtime channel.
   */
  async connectToLobby() {
    const pin        = sessionStorage.getItem('gamePin')
    const playerName = sessionStorage.getItem('playerName')
    const gameId     = sessionStorage.getItem('gameId')

    if (!pin || !playerName || !gameId) {
      window.location.href = 'joinGame.html'
      return
    }

    this.playerName = playerName
    this.game       = { id: gameId, pin }
    this.isHost     = false

    this.view.setPin(pin)
    this.view.setStatus('Connected — waiting for host to start…')

    this._connectChannel(pin, playerName)
  }

  // ─── Shared: channel setup ────────────────────────────────────────────────

  _connectChannel(pin, playerName) {
    const { channel, unsubscribe } = this.model.createGameChannel(
      pin,
      playerName,
      {
        onPresenceSync: (players) => {
          const visible = this.isHost
            ? players.filter(p => p.name !== this.playerName)
            : players
          this.players = visible
          if (!this.isHost) {
            this.view.renderPlayers(visible)
          }
        },

        onBroadcast: (event, payload) => {
          this._handleBroadcast(event, payload)
        },

        onDbChange: (table, payload) => {
          this._handleDbChange(table, payload)
        },

        onSubscribed: () => {
          console.log('[GameController] Channel ready')
          this.view.setStatus(
            this.isHost ? 'Waiting for players…' : 'Connected — waiting for host…'
          )
          if (this._postSubscribe) {
            this._postSubscribe()
            this._postSubscribe = null
          }
        },
      }
    )

    this.channel     = channel
    this.unsubscribe = unsubscribe
  }

  // ─── Broadcast handler ────────────────────────────────────────────────────

  _handleBroadcast(event, payload) {
    console.log('[Broadcast]', event, payload)

    switch (event) {
      case 'QUESTION_START':
        this._onQuestionStart(payload)
        break
      case 'TICK':
        this.view.updateCountdown(payload.secondsLeft)
        break
      case 'QUESTION_END':
        this._onQuestionEnd(payload)
        break
      case 'GAME_OVER':
        this._onGameOver(payload)
        break
    }
  }

  // ─── DB change handler ────────────────────────────────────────────────────

  async _handleDbChange(table, payload) {
    console.log('[DB Change]', table, payload)

    if (table === 'games') {
      const { phase, current_question } = payload.new ?? {}

      // If game phase changed and we're a player, sync our local state
      if (phase && phase !== this.phase) {
        this.phase = phase
      }
    }

    if (table === 'player_scores' && payload.new?.game === this.game?.id) {
      const players = await this.model.getPlayers(this.game.id)
      this.view.renderPlayers(players.map(p => ({ id: p.id, name: p.player_name })))
    }
  }

  // ─── Host: game flow ──────────────────────────────────────────────────────

  async _handleStart() {
    const dbPlayers = await this.model.getPlayers(this.game.id)
    if (dbPlayers.length === 0) {
      this.view.showError('No players have joined yet.')
      return
    }

    this.questions = await this.model.getQuestions(this.game.quiz)
    if (this.questions.length === 0) {
      this.view.showError('This quiz has no questions.')
      return
    }

    this.currentQuestionIndex = 0
    await this.model.advanceQuestion(this.game.id, 0)
    window.location.href = '/pages/game/view.html'
  }

  async _startNextQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      return this._endGame()
    }

    this.currentQuestion = this.questions[this.currentQuestionIndex]
    this._answered          = false
    this._questionStartedAt = Date.now()

    const q = this.currentQuestion
    await this.model.broadcastQuestion(this.channel, {
      questionIndex:  this.currentQuestionIndex,
      text:           q.text,
      options:        q.options,
      isMultiple:     q.isMultiple,
      correctAnswer:  q.correctAnswer,
      timeLimitMs:    this.game.question_duration_ms,
    })

    this._onQuestionStart({
      questionIndex: this.currentQuestionIndex,
      text:          q.text,
      options:       q.options,
      isMultiple:    q.isMultiple,
      timeLimitMs:   this.game.question_duration_ms,
      startedAt:     this._questionStartedAt,
    })

    this._startHostTimer(this.game.question_duration_ms)
  }

  _startHostTimer(timeLimitMs) {
    let secondsLeft = Math.ceil(timeLimitMs / 1000)
    this.view.updateCountdown(secondsLeft)

    this._tickTimer = setInterval(async () => {
      secondsLeft -= 1
      await this.model.broadcastTick(this.channel, { secondsLeft })
      this.view.updateCountdown(secondsLeft)

      if (secondsLeft <= 0) {
        clearInterval(this._tickTimer)
        await this._endQuestion()
      }
    }, 1000)
  }

  async _endQuestion() {
    const scores = await this.model.getScores(this.game.id)

    await this.model.broadcastQuestionEnd(this.channel, {
      correctAnswer: this.currentQuestion.correctAnswer,
      scores,
    })

    this._onQuestionEnd({
      correctAnswer: this.currentQuestion.correctAnswer,
      scores,
    })

    this.currentQuestionIndex += 1
  }

  async _endGame() {
    const leaderboard = await this.model.getScores(this.game.id)
    await this.model.broadcastGameOver(this.channel, { leaderboard })
    this._onGameOver({ leaderboard })
  }

  // ─── Host: kick a player ──────────────────────────────────────────────────

  async _handleKick(playerId) {
    try {
      await this.model.deletePlayer(playerId)
      const players = await this.model.getPlayers(this.game.id)
      this.players = players
      this.view.renderPlayers(players.map(p => ({ id: p.id, name: p.player_name })))
    } catch (err) {
      this.view.showError('Failed to kick player: ' + err.message)
    }
  }

  // ─── Shared: question rendering ───────────────────────────────────────────

  // Triggered by broadcast on players, called directly on host
  _onQuestionStart({ questionIndex, text, options, isMultiple, correctAnswer, timeLimitMs, startedAt }) {
    this.phase                = 'question_active'
    this._answered            = false
    this._questionStartedAt   = startedAt ?? Date.now()
    this.currentQuestionIndex = questionIndex

    this.view.showQuestion({
      questionIndex,
      text,
      options,
      isMultiple,
      correctAnswer,
      timeLimitMs,
      isHost:   this.isHost,
      onAnswer: (answer) => this._handleAnswer(answer),
    })
  }

  _onQuestionEnd({ correctAnswer, scores }) {
    this.phase = 'question_end'
    clearInterval(this._tickTimer)

    this.view.showQuestionResult({
      correctAnswer,
      scores,
      isHost: this.isHost,
      onNext: this.isHost ? () => this._startNextQuestion() : null,
    })
  }

  _onGameOver({ leaderboard }) {
    this.phase = 'game_over'
    sessionStorage.removeItem('hostGameId')
    sessionStorage.removeItem('hostGamePin')
    sessionStorage.removeItem('hostQuizId')
    this.view.showGameOver({ leaderboard })
  }

  // ─── Player: answer submission ────────────────────────────────────────────

  async _handleAnswer(answer) {
    if (this._answered || this.phase !== 'question_active') return
    this._answered = true

    const timeTakenMs = Date.now() - this._questionStartedAt

    try {
      const result = await this.model.submitAnswer({
        gameId:      this.game.id,
        questionId:  this.currentQuestion.id,
        playerName:  this.playerName,
        answer,
        timeTakenMs,
      })

      // Show immediate feedback to the player
      this.view.showAnswerConfirmation(result)

    } catch (err) {
      console.error('Answer submission failed:', err)
      this.view.showError('Failed to submit answer. Please try again.')
    }
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  destroy() {
    clearInterval(this._tickTimer)
    this.unsubscribe?.()
  }
}