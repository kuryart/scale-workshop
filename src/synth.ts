// Classic variants are from Scale Workshop 2, they're softer on SW3.

import { AperiodicWave } from 'sw-synth'
import { centsToValue, valueToCents } from 'xen-dev-utils'
import { ceilPow2 } from './utils'
import { computed, type ComputedRef } from 'vue'

export const BASIC_WAVEFORMS = ['sine', 'square', 'sawtooth', 'triangle']
export const CUSTOM_WAVEFORMS = [
  'warm1',
  'warm2',
  'warm3',
  'warm4',
  'octaver',
  'brightness',
  'harmonicbell',
  'semisine',
  'rich',
  'slender',
  'didacus',
  'bohlen',
  'glass',
  'boethius',
  'gold',
  'rich-classic',
  'slender-classic',
  'didacus-classic',
  'bohlen-classic',
  'glass-classic',
  'boethius-classic'
]
export const WAVEFORMS = BASIC_WAVEFORMS.concat(CUSTOM_WAVEFORMS)
export const PERIODIC_WAVES: Record<string, ComputedRef<PeriodicWave>> = {}

export const APERIODIC_WAVEFORMS = [
  'jegogan',
  'jublag',
  'ugal',
  'gender',
  'tin',
  'bronze',
  'steel',
  'silver',
  'platinum',
  '12-TET'
]
export const APERIODIC_WAVES: Record<string, ComputedRef<AperiodicWave>> = {}

export function initializePeriodic(audioContext: BaseAudioContext) {
  PERIODIC_WAVES.warm1 = computed(() =>
    audioContext.createPeriodicWave(
      new Float32Array([0, 10, 2, 2, 2, 1, 1, 0.5]),
      new Float32Array([0, 0, 0, 0, 0, 0, 0, 0])
    )
  )

  PERIODIC_WAVES.warm2 = computed(() =>
    audioContext.createPeriodicWave(
      new Float32Array([0, 10, 5, 3.33, 2, 1]),
      new Float32Array([0, 0, 0, 0, 0, 0])
    )
  )
  PERIODIC_WAVES.warm3 = computed(() =>
    audioContext.createPeriodicWave(
      new Float32Array([0, 10, 5, 5, 3]),
      new Float32Array([0, 0, 0, 0, 0])
    )
  )
  PERIODIC_WAVES.warm4 = computed(() =>
    audioContext.createPeriodicWave(
      new Float32Array([0, 10, 2, 2, 1]),
      new Float32Array([0, 0, 0, 0, 0])
    )
  )
  PERIODIC_WAVES.octaver = computed(() =>
    audioContext.createPeriodicWave(
      new Float32Array([0, 1000, 500, 0, 333, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 166]),
      new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    )
  )
  PERIODIC_WAVES.brightness = computed(() =>
    audioContext.createPeriodicWave(
      new Float32Array([
        0, 10, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 0.75, 0.5, 0.2, 0.1
      ]),
      new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    )
  )
  PERIODIC_WAVES.harmonicbell = computed(() =>
    audioContext.createPeriodicWave(
      new Float32Array([0, 10, 2, 2, 2, 2, 0, 0, 0, 0, 0, 7]),
      new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    )
  )

  // DC-blocked semisine
  PERIODIC_WAVES.semisine = computed(() => {
    const semisineSineComponents = new Float32Array(64)
    const semisineCosineComponents = new Float32Array(64)
    for (let n = 1; n < 64; ++n) {
      semisineCosineComponents[n] = 1 / (1 - 4 * n * n)
    }
    return audioContext.createPeriodicWave(semisineCosineComponents, semisineSineComponents)
  })

  const zeros = new Float32Array(101)

  // N squared waveform (harmonic entry in the metallic series)
  PERIODIC_WAVES.gold = computed(() => {
    const goldComponents = new Float32Array(101)
    for (let n = 1; n <= 10; ++n) {
      goldComponents[n * n] = n ** -0.75
    }
    return audioContext.createPeriodicWave(zeros, goldComponents)
  })

  // Subgroup optimized waveforms
  // Name     | Factors
  // rich     | 2,3,5
  // slender  | 2,3,7
  // didacus  | 2,5,7
  // bohlen   | 3,5,7
  // glass    | 2,7,11
  // boethius | 2,3,19

  const subgroupWaveforms = computed(() => {
    const rich = new Float32Array(101)
    const richClassic = new Float32Array(101)
    const slender = new Float32Array(101)
    const slenderClassic = new Float32Array(101)
    const didacus = new Float32Array(101)
    const didacusClassic = new Float32Array(101)
    const bohlen = new Float32Array(101)
    const bohlenClassic = new Float32Array(101)
    const glass = new Float32Array(101)
    const glassClassic = new Float32Array(101)
    const boethius = new Float32Array(101)
    const boethiusClassic = new Float32Array(101)

    // No multiples of 13, 17 or primes above 23
    const lowPrimeHarmonics = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19, 20, 21, 22, 24, 25, 27, 28, 30, 32,
      33, 35, 36, 38, 40, 42, 44, 45, 48, 49, 50, 54, 55, 56, 57, 60, 63, 64, 66, 70, 72, 75, 76,
      77, 80, 81, 84, 88, 90, 95, 96, 98, 99, 100
    ]

    lowPrimeHarmonics.forEach((n) => {
      // Classics are saw-like
      const m = 1 / n
      // Modern is softer and "pink"
      const p = n ** -1.5
      if (n % 11 && n % 19) {
        if (n % 7) {
          richClassic[n] = m
          rich[n] = p
        }
        if (n % 5) {
          slenderClassic[n] = m
          slender[n] = p
        }
        if (n % 3) {
          didacusClassic[n] = m
          didacus[n] = p
        }
        if (n % 2) {
          bohlenClassic[n] = m
          bohlen[n] = p
        }
      }
      if (n % 3 && n % 5 && n % 19) {
        if (n % 7 && n % 11) {
          glassClassic[n] = m
          glass[n] = p
        } else {
          glassClassic[n] = 2 * m
          glass[n] = 2 * p
        }
      }
      if (n % 5 && n % 7 && n % 11) {
        if (n % 19) {
          boethiusClassic[n] = m
          boethius[n] = p
        } else {
          boethiusClassic[n] = 2 * m
          boethius[n] = 2 * p
        }
      }
    })
    return {
      richClassic,
      rich,
      slenderClassic,
      slender,
      didacusClassic,
      didacus,
      bohlenClassic,
      bohlen,
      glassClassic,
      glass,
      boethiusClassic,
      boethius
    }
  })

  PERIODIC_WAVES['rich-classic'] = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.richClassic)
  )
  PERIODIC_WAVES.rich = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.rich)
  )
  PERIODIC_WAVES['slender-classic'] = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.slenderClassic)
  )
  PERIODIC_WAVES.slender = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.slender)
  )
  PERIODIC_WAVES['didacus-classic'] = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.didacusClassic)
  )
  PERIODIC_WAVES.didacus = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.didacus)
  )
  PERIODIC_WAVES['bohlen-classic'] = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.bohlenClassic)
  )
  PERIODIC_WAVES.bohlen = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.bohlen)
  )
  PERIODIC_WAVES['glass-classic'] = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.glassClassic)
  )
  PERIODIC_WAVES.glass = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.glass)
  )
  PERIODIC_WAVES['boethius-classic'] = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.boethiusClassic)
  )
  PERIODIC_WAVES.boethius = computed(() =>
    audioContext.createPeriodicWave(zeros, subgroupWaveforms.value.boethius)
  )
}

function initializeAperiodic(audioContext: BaseAudioContext) {
  const ns = [...Array(129).keys()]
  ns.shift()
  const amplitudes = ns.map((n) => 0.3 * n ** -1.5)
  const maxNumberOfVoices = 7
  const tolerance = 0.1 // In cents
  APERIODIC_WAVES['tin'] = computed(
    () =>
      new AperiodicWave(
        audioContext,
        ns.map((n) => n ** (8 / 9)),
        amplitudes,
        maxNumberOfVoices,
        tolerance
      )
  )
  APERIODIC_WAVES['steel'] = computed(
    () =>
      new AperiodicWave(
        audioContext,
        ns.map((n) => n ** 1.5),
        amplitudes,
        maxNumberOfVoices,
        tolerance
      )
  )
  APERIODIC_WAVES['bronze'] = computed(
    () =>
      new AperiodicWave(
        audioContext,
        ns.map((n) => n ** (4 / 3)),
        amplitudes,
        maxNumberOfVoices,
        tolerance
      )
  )
  APERIODIC_WAVES['silver'] = computed(
    () =>
      new AperiodicWave(
        audioContext,
        ns.map((n) => n ** (5 / 3)),
        amplitudes,
        maxNumberOfVoices,
        tolerance
      )
  )
  APERIODIC_WAVES['platinum'] = computed(
    () =>
      new AperiodicWave(
        audioContext,
        ns.slice(0, 32).map((n) => n ** 2.5),
        amplitudes.slice(0, 32),
        maxNumberOfVoices,
        tolerance
      )
  )

  APERIODIC_WAVES['gender'] = computed(() => {
    const spectrum_ = [1, 2.26, 3.358, 3.973, 7.365, 13, 29, 31, 37]
    const amplitudes_ = [1, 0.6, 0.3, 0.4, 0.2, 0.05, 0.04, 0.01, 0.006].map((a) => 0.4 * a)

    // Add shimmer
    const spectrum: number[] = []
    const amplitudes: number[] = []
    for (let i = 0; i < spectrum_.length; ++i) {
      spectrum.push(spectrum_[i] * 1.004)
      spectrum.push(spectrum_[i] / 1.004)
      amplitudes.push(amplitudes_[i])
      amplitudes.push(0.6 * amplitudes_[i])
    }

    return new AperiodicWave(audioContext, spectrum, amplitudes, maxNumberOfVoices, tolerance)
  })

  // https://pubs.aip.org/asa/jasa/article/127/5/EL197/783208/Vibrational-characteristics-of-Balinese-gamelan
  APERIODIC_WAVES['jublag'] = computed(() => {
    // Spectrum is from literature
    const spectrum = [1, 2.77, 5.18, 5.33]
    // Made up stuff to round it off
    spectrum.push(9.1, 18.9, 23)
    // Add shimmer
    spectrum[0] = 1.01
    spectrum.unshift(1 / spectrum[0])
    spectrum.push(2.76)

    // Amplitudes are made up
    const amplitudes = [1, 0.5, 0.5, 0.3, 0.2, 0.15, 0.1, 0.09, 0.2].map((a) => 0.45 * a)

    return new AperiodicWave(audioContext, spectrum, amplitudes, maxNumberOfVoices, tolerance)
  })

  // https://pubs.aip.org/asa/jasa/article/127/5/EL197/783208/Vibrational-characteristics-of-Balinese-gamelan
  APERIODIC_WAVES['ugal'] = computed(() => {
    // Spectrum is from literature
    const spectrum = [1, 2.61, 4.8, 4.94, 6.32]
    // Made up stuff to round it off
    spectrum.push(9.9, 17, 24.1)
    // Add shimmer
    spectrum[0] = 1.008
    spectrum.unshift(1 / spectrum[0])
    spectrum.push(2.605)
    spectrum.push(4.81)

    // Amplitudes are made up
    const amplitudes = [0.6, 1, 0.45, 0.3, 0.15, 0.2, 0.07, 0.08, 0.05, 0.1, 0.1].map(
      (a) => 0.45 * a
    )

    return new AperiodicWave(audioContext, spectrum, amplitudes, maxNumberOfVoices, tolerance)
  })

  // https://pubs.aip.org/asa/jasa/article/127/5/EL197/783208/Vibrational-characteristics-of-Balinese-gamelan
  APERIODIC_WAVES['jegogan'] = computed(() => {
    // Spectrum is from literature
    const spectrum = [
      1, 2.8, 5.5, 9, 16.7, 17.8, 20.5, 22.9, 24.9, 27, 28.1, 29.2, 29.5, 30, 31.8, 33.3, 36, 36.9,
      40.6, 41.4
    ]
    // Amplitudes are made up
    const amplitudes = spectrum.map((i) => (0.7 * (Math.cos(0.3 * i * i) + 1.6)) / (i ** 1.4 + 1.6))
    return new AperiodicWave(audioContext, spectrum, amplitudes, maxNumberOfVoices, tolerance)
  })

  APERIODIC_WAVES['12-TET'] = computed(() => {
    const twelveSpectrumCents: number[] = []
    const twelveAmplitudes: number[] = []
    for (let h = 1; h <= 128; ++h) {
      const cents = valueToCents(h)
      const closest = Math.round(cents / 100) * 100
      if (Math.abs(cents - closest) < 15) {
        twelveSpectrumCents.push((3 * closest + cents) / 4)
        if (h === ceilPow2(h)) {
          twelveAmplitudes.push(0.3 * h ** -2)
        } else {
          twelveAmplitudes.push(0.6 * h ** -1.5)
        }
      }
    }
    return new AperiodicWave(
      audioContext,
      twelveSpectrumCents.map(centsToValue),
      twelveAmplitudes,
      maxNumberOfVoices,
      tolerance
    )
  })
}

export function initializeCustomWaves(audioContext: BaseAudioContext) {
  initializePeriodic(audioContext)
  initializeAperiodic(audioContext)
}

// Simple feedback loop bouncing sound between left and right channels.
export class PingPongDelay {
  audioContext: AudioContext
  delayL: DelayNode
  delayR: DelayNode
  gainL: GainNode
  gainR: GainNode
  panL: StereoPannerNode
  panR: StereoPannerNode
  destination: AudioNode

  constructor(audioContext: AudioContext, maxDelayTime = 5) {
    this.audioContext = audioContext
    this.delayL = audioContext.createDelay(maxDelayTime)
    this.delayR = audioContext.createDelay(maxDelayTime)
    this.gainL = audioContext.createGain()
    this.gainR = audioContext.createGain()
    this.panL = audioContext.createStereoPanner()
    this.panR = audioContext.createStereoPanner()

    // Create a feedback loop with a gain stage.
    this.delayL.connect(this.gainL).connect(this.delayR).connect(this.gainR).connect(this.delayL)
    // Tap outputs.
    this.gainL.connect(this.panL)
    this.gainR.connect(this.panR)

    // Tag input.
    this.destination = this.delayL
  }

  set delayTime(value: number) {
    const now = this.audioContext.currentTime
    this.delayL.delayTime.setValueAtTime(value, now)
    this.delayR.delayTime.setValueAtTime(value, now)
  }

  set feedback(value: number) {
    const now = this.audioContext.currentTime
    this.gainL.gain.setValueAtTime(value, now)
    this.gainR.gain.setValueAtTime(value, now)
  }

  set separation(value: number) {
    const now = this.audioContext.currentTime
    this.panL.pan.setValueAtTime(-value, now)
    this.panR.pan.setValueAtTime(value, now)
  }

  connect(destination: AudioNode) {
    this.panL.connect(destination)
    this.panR.connect(destination)
    return destination
  }

  disconnect(destination: AudioNode) {
    this.panL.disconnect(destination)
    this.panR.disconnect(destination)
    return destination
  }
}
