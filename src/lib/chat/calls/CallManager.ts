import type { CallSignal, CallState, CallStatus } from '../types'

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export type CallStateChange = (state: CallState) => void
export type CallSignalSender = (peerJid: string, signal: CallSignal) => Promise<void>

export class CallManager {
  private pc: RTCPeerConnection | null = null
  private state: CallState = {
    status: 'idle',
    peerJid: null,
    error: null,
    localStream: null,
    remoteStream: null,
  }

  constructor(
    private onChange: CallStateChange,
    private sendSignal: CallSignalSender,
  ) {}

  private setStatus(
    status: CallStatus,
    peerJid: string | null = this.state.peerJid,
    error: string | null = null,
  ) {
    this.state = { ...this.state, status, peerJid, error }
    this.onChange(this.state)
  }

  private async getUserMedia(): Promise<MediaStream | null> {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('Failed to get microphone:', e)
      this.setStatus('idle', null, `Microphone access failed: ${msg}`)
      return null
    }
  }

  private createPeerConnection(peerJid: string) {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    pc.onicecandidate = (event) => {
      this.sendSignal(peerJid, { type: 'candidate', candidate: event.candidate })
    }

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams
      this.state = { ...this.state, remoteStream }
      this.onChange(this.state)
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.setStatus('connected')
      } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        this.endCall()
      }
    }

    return pc
  }

  private cleanup() {
    if (this.pc) {
      this.pc.close()
      this.pc = null
    }
    this.state.localStream?.getTracks().forEach((track) => track.stop())
    this.state = {
      status: 'idle',
      peerJid: null,
      error: null,
      localStream: null,
      remoteStream: null,
    }
    this.onChange(this.state)
  }

  async startCall(peerJid: string) {
    if (this.state.status !== 'idle') return

    const localStream = await this.getUserMedia()
    if (!localStream) return

    this.state = { ...this.state, localStream }
    this.setStatus('outgoing', peerJid)

    this.pc = this.createPeerConnection(peerJid)
    localStream.getTracks().forEach((track) => this.pc!.addTrack(track, localStream))

    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)
    await this.sendSignal(peerJid, { type: 'offer', sdp: offer.sdp })
  }

  async acceptCall(peerJid: string) {
    if (this.state.status !== 'incoming' || this.state.peerJid !== peerJid || !this.pc) return

    const localStream = await this.getUserMedia()
    if (!localStream) {
      await this.rejectCall(peerJid)
      return
    }

    this.state = { ...this.state, localStream }
    this.setStatus('connected', peerJid)

    localStream.getTracks().forEach((track) => this.pc!.addTrack(track, localStream))

    const answer = await this.pc.createAnswer()
    await this.pc.setLocalDescription(answer)
    await this.sendSignal(peerJid, { type: 'answer', sdp: answer.sdp })
  }

  async rejectCall(peerJid: string) {
    if (this.state.peerJid !== peerJid) return
    await this.sendSignal(peerJid, { type: 'reject' })
    this.cleanup()
  }

  async endCall() {
    const { peerJid } = this.state
    if (peerJid) {
      try {
        await this.sendSignal(peerJid, { type: 'end' })
      } catch {
        // ignore send failures on teardown
      }
    }
    this.cleanup()
  }

  async handleSignal(peerJid: string, signal: CallSignal) {
    if (signal.type === 'reject' || signal.type === 'end') {
      this.cleanup()
      this.setStatus(signal.type === 'reject' ? 'rejected' : 'ended')
      return
    }

    if (signal.type === 'offer') {
      if (this.state.status !== 'idle') {
        await this.sendSignal(peerJid, { type: 'reject' })
        return
      }
      this.setStatus('incoming', peerJid)
      this.pc = this.createPeerConnection(peerJid)
      await this.pc.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }),
      )
      return
    }

    if (!this.pc) return

    if (signal.type === 'answer') {
      await this.pc.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }),
      )
      this.setStatus('connected')
      return
    }

    if (signal.type === 'candidate') {
      if (signal.candidate) {
        await this.pc.addIceCandidate(new RTCIceCandidate(signal.candidate))
      }
    }
  }
}
