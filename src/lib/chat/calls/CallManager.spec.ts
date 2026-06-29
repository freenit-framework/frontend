import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CallManager } from './CallManager'
import type { CallSignal } from '../types'

describe('CallManager', () => {
  let sendSignal = vi.fn<() => Promise<void>>()
  let onChange = vi.fn<() => void>()
  let manager: CallManager

  beforeEach(() => {
    sendSignal = vi.fn(() => Promise.resolve())
    onChange = vi.fn()

    const mockStream = {
      getTracks: vi.fn(() => [{ stop: vi.fn() }]),
    } as unknown as MediaStream

    vi.stubGlobal(
      'RTCPeerConnection',
      class MockRTCPeerConnection {
        onicecandidate: ((ev: RTCPeerConnectionIceEvent) => void) | null = null
        ontrack: ((ev: RTCTrackEvent) => void) | null = null
        onconnectionstatechange: (() => void) | null = null
        connectionState = 'new'
        localDescription: RTCSessionDescriptionInit | null = null

        addTrack = vi.fn()
        close = vi.fn()
        addIceCandidate = vi.fn(() => Promise.resolve())

        createOffer = vi.fn(() =>
          Promise.resolve({ type: 'offer', sdp: 'offer-sdp' } as RTCSessionDescriptionInit),
        )
        createAnswer = vi.fn(() =>
          Promise.resolve({ type: 'answer', sdp: 'answer-sdp' } as RTCSessionDescriptionInit),
        )
        setLocalDescription = vi.fn((desc: RTCSessionDescriptionInit | undefined) => {
          this.localDescription = desc || null
          return Promise.resolve()
        })
        setRemoteDescription = vi.fn(() => Promise.resolve())
      },
    )
    vi.stubGlobal(
      'RTCSessionDescription',
      class MockRTCSessionDescription {
        type: string
        sdp: string
        constructor(init: RTCSessionDescriptionInit) {
          this.type = init.type || ''
          this.sdp = init.sdp || ''
        }
      },
    )
    vi.stubGlobal(
      'RTCIceCandidate',
      class MockRTCIceCandidate {
        candidate: string
        constructor(init: RTCIceCandidateInit) {
          this.candidate = init.candidate || ''
        }
      },
    )
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn(() => Promise.resolve(mockStream)),
      },
    })

    manager = new CallManager(onChange, sendSignal)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts a call and sends an offer', async () => {
    await manager.startCall('peer@example.com')
    expect(sendSignal).toHaveBeenCalledWith('peer@example.com', {
      type: 'offer',
      sdp: 'offer-sdp',
    })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'outgoing', peerJid: 'peer@example.com' }),
    )
  })

  it('handles an incoming offer', async () => {
    const signal: CallSignal = { type: 'offer', sdp: 'remote-offer' }
    await manager.handleSignal('peer@example.com', signal)
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'incoming', peerJid: 'peer@example.com' }),
    )
  })

  it('accepts a call and sends an answer', async () => {
    await manager.handleSignal('peer@example.com', { type: 'offer', sdp: 'remote-offer' })
    await manager.acceptCall('peer@example.com')
    expect(sendSignal).toHaveBeenLastCalledWith('peer@example.com', {
      type: 'answer',
      sdp: 'answer-sdp',
    })
  })

  it('completes handshake when answer is received', async () => {
    await manager.startCall('peer@example.com')
    await manager.handleSignal('peer@example.com', { type: 'answer', sdp: 'remote-answer' })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'connected', peerJid: 'peer@example.com' }),
    )
  })

  it('rejects a second offer when already busy', async () => {
    await manager.handleSignal('first@example.com', { type: 'offer', sdp: 'remote-offer' })
    sendSignal.mockClear()
    await manager.handleSignal('second@example.com', { type: 'offer', sdp: 'remote-offer' })
    expect(sendSignal).toHaveBeenCalledWith('second@example.com', { type: 'reject' })
  })

  it('adds an ICE candidate', async () => {
    await manager.handleSignal('peer@example.com', { type: 'offer', sdp: 'remote-offer' })
    const candidate: RTCIceCandidateInit = { candidate: 'candidate:1', sdpMid: '0' }
    await manager.handleSignal('peer@example.com', { type: 'candidate', candidate })
    const pc = (manager as any).pc
    expect(pc.addIceCandidate).toHaveBeenCalled()
  })

  it('ends a call and notifies the peer', async () => {
    await manager.startCall('peer@example.com')
    sendSignal.mockClear()
    await manager.endCall()
    expect(sendSignal).toHaveBeenCalledWith('peer@example.com', { type: 'end' })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'idle', peerJid: null }),
    )
  })
})
