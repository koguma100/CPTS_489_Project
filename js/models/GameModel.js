import { supabase } from '../supabase/supabase.js'

/**
 * GameModel — all Supabase data access and Realtime channel management.
 *
 * Schema reference:
 *   games:         id, created_at, pin, phase, current_question,
 *                  question_duration_ms, host (uuid), quiz (uuid)
 *   player_scores: id, created_at, game (uuid FK), player_name (text), score (int8)
 */
export class GameModel {

  // ─── Games ────────────────────────────────────────────────────────────────

  /**
   * Create a new game row.
   * @param {string} hostId             - UUID of the host
   * @param {string} quizId             - UUID of the quiz to play
   * @param {number} questionDurationMs - ms per question (default 20s)
   */
  async getQuiz(quizId) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('id, title')
      .eq('id', quizId)
      .single()

    if (error) throw error
    return data
  }

  async createGame(hostId, quizId, questionDurationMs = 20000) {
    const pin = Math.floor(100000 + Math.random() * 900000).toString()

    const { data, error } = await supabase
      .from('games')
      .insert({
        host:                 hostId,
        quiz:                 quizId,
        pin,
        phase:                'lobby',
        current_question:     0,
        question_duration_ms: questionDurationMs,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Fetch a game row by its 6-digit PIN.
   * Throws if no game found — .single() errors on zero rows.
   */
  async getGameByPin(pin) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('pin', pin)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update the game phase.
   * @param {string} gameId
   * @param {'lobby'|'question_active'|'question_end'|'game_over'} phase
   */
  async updatePhase(gameId, phase) {
    const { error } = await supabase
      .from('games')
      .update({ phase })
      .eq('id', gameId)

    if (error) throw error
  }

  /**
   * Advance to a question index and set phase to question_active.
   * @param {string} gameId
   * @param {number} index - zero-based
   */
  async advanceQuestion(gameId, index) {
    const { error } = await supabase
      .from('games')
      .update({ current_question: index, phase: 'question_active' })
      .eq('id', gameId)

    if (error) throw error
  }

  // ─── Player Scores ────────────────────────────────────────────────────────

  /**
   * Insert a player into player_scores with score = 0 when they join.
   * Upserts so page refreshes / rejoins don't throw a duplicate error.
   *
   * ⚠️  Requires a unique constraint — run once in Supabase SQL editor:
   *   ALTER TABLE player_scores
   *     ADD CONSTRAINT player_scores_game_player_unique
   *     UNIQUE (game, player_name);
   *
   * @param {string} gameId
   * @param {string} playerName
   */
  async addPlayer(gameId, playerName) {
    const { data, error } = await supabase
      .from('player_scores')
      .upsert(
        {
          game:        gameId,
          player_name: playerName,
          score:       50,
        },
        {
          onConflict:       'game,player_name',
          ignoreDuplicates: true,  // silently skip if player already joined
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Fetch all scores for a game, ordered by score descending.
   * Used for leaderboard display after each question and at game over.
   *
   * @param {string} gameId
   * @returns {Array<{ player_name: string, score: number }>}
   */
  async getQuestions(quizId) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('order, question, answer1, answer2, answer3, answer4, isMultiple, correctAnswer, thumbnail')
      .eq('quiz', quizId)
      .order('order', { ascending: true })

    if (error) throw error

    return data.map(q => ({
      order:         q.order,
      text:          q.question,
      options:       q.isMultiple
        ? [q.answer1, q.answer2, q.answer3, q.answer4].filter(Boolean)
        : [q.answer1, q.answer2].filter(Boolean),
      correctAnswer: q.correctAnswer,  // 1-indexed
      isMultiple:    q.isMultiple,
      thumbnail:     q.thumbnail,
    }))
  }

  async deletePlayer(playerId) {
    const { error } = await supabase
      .from('player_scores')
      .delete()
      .eq('id', playerId)

    if (error) throw error
  }

  async getPlayerScore(gameId, playerName) {
    const { data, error } = await supabase
      .from('player_scores')
      .select('score')
      .eq('game', gameId)
      .eq('player_name', playerName)
      .single()

    if (error) throw error
    return data.score
  }

  async setScore(gameId, playerName, newScore) {
    const { error } = await supabase
      .from('player_scores')
      .update({ score: newScore })
      .eq('game', gameId)
      .eq('player_name', playerName)

    if (error) throw error
  }

  async getPlayers(gameId) {
    const { data, error } = await supabase
      .from('player_scores')
      .select('id, player_name')
      .eq('game', gameId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  async getScores(gameId) {
    const { data, error } = await supabase
      .from('player_scores')
      .select('player_name, score')
      .eq('game', gameId)             // column is "game" not "game_id"
      .order('score', { ascending: false })

    if (error) throw error
    return data
  }

  /**
   * Submit a player's answer via a Postgres RPC function (SECURITY DEFINER).
   * Scoring logic runs server-side — clients cannot tamper with points.
   *
   * @returns {{ correct: boolean, points: number, correct_answer: string }}
   */
  async submitAnswer({ gameId, questionId, playerName, answer, timeTakenMs }) {
    const { data, error } = await supabase.rpc('submit_answer', {
      p_game_id:       gameId,
      p_question_id:   questionId,
      p_player_name:   playerName,
      p_answer:        answer,
      p_time_taken_ms: timeTakenMs,
    })

    if (error) throw error
    return data
  }

  // ─── Realtime Channel ─────────────────────────────────────────────────────

  /**
   * Creates and subscribes to a game channel using all three Realtime features:
   *
   *   Broadcast  → fast ephemeral events (QUESTION_START, TICK, QUESTION_END, GAME_OVER)
   *   Presence   → live player list (who is connected right now)
   *   DB Changes → authoritative state (games phase, player_scores updates)
   *
   * @param {string} pin        - 6-digit game PIN (used as channel key)
   * @param {string} playerName - display name tracked in Presence
   * @param {object} handlers
   *   .onPresenceSync(players)     - called when player list changes
   *   .onBroadcast(event, payload) - called for any broadcast event
   *   .onDbChange(table, payload)  - called for games / player_scores DB changes
   *   .onSubscribed()              - called once channel is ready
   *
   * @returns {{ channel, unsubscribe }}
   */
  createGameChannel(pin, playerName, handlers) {
    const channel = supabase.channel(`game:${pin}`, {
      config: {
        presence:  { key: playerName },
        broadcast: { self: false },  // host won't echo its own broadcasts
      },
    })

    // ── Presence: live player list ───────────────────────────────────────────
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      // presenceState() → { key: [{ ...meta }] } — flatten to array
      const players = Object.values(state).flat()
      handlers.onPresenceSync?.(players)
    })

    // ── Broadcast: fast game events ──────────────────────────────────────────
    channel.on('broadcast', { event: '*' }, ({ event, payload }) => {
      handlers.onBroadcast?.(event, payload)
    })

    // ── DB Changes: authoritative state ─────────────────────────────────────
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `pin=eq.${pin}` },
        (payload) => handlers.onDbChange?.('games', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_scores' },
        (payload) => handlers.onDbChange?.('player_scores', payload)
      )

    // ── Subscribe and track presence ─────────────────────────────────────────
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ name: playerName, score: 0, joined_at: Date.now() })
        handlers.onSubscribed?.()
      }
    })

    const unsubscribe = () => supabase.removeChannel(channel)
    return { channel, unsubscribe }
  }

  // ─── Broadcast Helpers (host only) ───────────────────────────────────────

  async broadcastQuestion(channel, { questionIndex, text, options, isMultiple, correctAnswer, timeLimitMs }) {
    await channel.send({
      type:    'broadcast',
      event:   'QUESTION_START',
      payload: { questionIndex, text, options, isMultiple, correctAnswer, timeLimitMs, startedAt: Date.now() },
    })
  }

  async broadcastTick(channel, { secondsLeft }) {
    await channel.send({
      type:    'broadcast',
      event:   'TICK',
      payload: { secondsLeft },
    })
  }

  async broadcastQuestionEnd(channel, { correctAnswer, scores }) {
    await channel.send({
      type:    'broadcast',
      event:   'QUESTION_END',
      payload: { correctAnswer, scores },
    })
  }

  async broadcastGameOver(channel, { leaderboard }) {
    await channel.send({
      type:    'broadcast',
      event:   'GAME_OVER',
      payload: { leaderboard },
    })
  }
}