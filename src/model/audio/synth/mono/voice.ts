import { Settings } from "../../../../constants/settings";

import { SubOscillator } from "../../oscillator/melodic/complex/sub-oscillator";
import { MultiShapeOscillator } from "../../oscillator/melodic/complex/multi-shape-oscillator";
import { MultiNoiseOscillator } from "../../oscillator/noise/multi-noise-oscillator";

import { AdditiveOscillatorMixer } from "../../inputs-mixer/oscillator-mixer/additive-oscillator-mixer";
import { OscFilter } from "../../filters/lowpass-filter";

import { AdsrEnvelope } from "../../modulators/envelope/adsr-envelope";
import { BaseUnipolarLfo } from "../../modulators/lfo/base-unipolar-lfo";
import { UnipolarLfo } from "../../modulators/lfo/unipolar-lfo";
import { UnipolarToggledMultiShapeLfo } from "../../modulators/lfo/unipolar-toggled-multi-shape-lfo";
import { ModulationManager } from "../../modulators/modulation-manager";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


export class Voice
{
    private audioContext: AudioContext;

    // the oscillators:
    private multiShapeOscillator1: MultiShapeOscillator;
    private multiShapeOscillator2: MultiShapeOscillator;
    private subOscillator: SubOscillator;
    private noiseOscillator: MultiNoiseOscillator;

    // the oscillator mixer
    private oscillatorMixer: AdditiveOscillatorMixer;

    // the filter and envelope:
    private filterNode: OscFilter;

    private voiceAdsrEnvelope: AdsrEnvelope;
    private voiceAdsrGainNode: GainNode;

    // the per-voice LFOs, these LFOs will modulate al modulatable parameters except frequency
    private lfoArray: Array<BaseUnipolarLfo>;

    // the per-voice FM and ring modulation LFOs, these LFOs will modulate frequency and will also assure ring modulation
    private fmRingLfoArray: Array<UnipolarToggledMultiShapeLfo>;

    // the modulators that use the previous LFOs
    private osc1AmplitudeModulationManager: ModulationManager;
    private osc1FrequencyModulationManager: ModulationManager;
    private osc1PulseWidthModulationManager: ModulationManager;
    private osc1UnisonDetuneModulationManager: ModulationManager;

    private osc2AmplitudeModulationManager: ModulationManager;
    private osc2FrequencyModulationManager: ModulationManager;
    private osc2PulseWidthModulationManager: ModulationManager;
    private osc2UnisonDetuneModulationManager: ModulationManager;

    private subOscAmplitudeModulationManager: ModulationManager;
    private subOscFrequencyModulationManager: ModulationManager;

    // the final node
    private outputGainNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "Voice", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        if (audioContext !== undefined)
            this.audioContext = audioContext;
        else
        {
            Voice.logger.warn("constructor(): audioContext is null, separate audioContext was created");
            this.audioContext = new AudioContext();
        }

        if (audioContext === null)
            Voice.logger.warn("constructor(): audioContext is null, separate audioContext was created");

        // instantiate the array of general purpose LFOs (and the LFOs themselves)
        this.lfoArray = new Array<UnipolarLfo>(Settings.generalUseLfoPerVoiceCount);
        for (let i = 0; i < this.lfoArray.length; i++)
        {
            this.lfoArray[i] = new UnipolarLfo(audioContext);
            this.lfoArray[i].setFrequency(Settings.defaultLfoLowAbsoluteFrequency);
        }

        // instantiate the array of LFOs dedicated to FM and ring modulation (and the LFOs themselves)
        this.fmRingLfoArray = new Array<UnipolarToggledMultiShapeLfo>(Settings.generalUseLfoPerVoiceCount);
        for (let i = 0; i < this.lfoArray.length; i++)
        {
            this.fmRingLfoArray[i] = new UnipolarToggledMultiShapeLfo(audioContext);
            this.fmRingLfoArray[i].setFrequency(Settings.defaultLfoLowAbsoluteFrequency);
        }

        // instantiate oscillator 1 amplitude, pulse width and unison detune modulation modulators:
        this.osc1AmplitudeModulationManager = new ModulationManager(this.audioContext, this.lfoArray,
                                                                    Settings.minOscGain, Settings.maxOscGain, Settings.defaultOscGain);
        this.osc1PulseWidthModulationManager = new ModulationManager(this.audioContext, this.lfoArray,
                                                                    Settings.minOscPulseWidth, Settings.maxOscPulseWidth, Settings.defaultOscPulseWidth);
        this.osc1UnisonDetuneModulationManager = new ModulationManager(this.audioContext, this.lfoArray,
                                                                        Settings.minOscUnisonCentsDetune, Settings.maxOscUnisonCentsDetune, Settings.defaultOscUnisonCentsDetune);
        // instantiate oscillator 1 FM and ring modulation modulator:
        this.osc1FrequencyModulationManager = new ModulationManager(this.audioContext, this.fmRingLfoArray,
                                                                    Settings.minOscFreqModulation, Settings.maxOscFreqModulation, Settings.defaultOscFreqModulation);

        // instantiate oscillator 2 amplitude, pulse width and unison detune modulation modulators:
        this.osc2AmplitudeModulationManager = new ModulationManager(this.audioContext, this.lfoArray,
                                                                    Settings.minOscGain, Settings.maxOscGain, Settings.defaultOscGain);
        this.osc2PulseWidthModulationManager = new ModulationManager(this.audioContext, this.lfoArray,
                                                                    Settings.minOscPulseWidth, Settings.maxOscPulseWidth, Settings.defaultOscPulseWidth);
        this.osc2UnisonDetuneModulationManager = new ModulationManager(this.audioContext, this.lfoArray,
                                                                        Settings.minOscUnisonCentsDetune, Settings.maxOscUnisonCentsDetune, Settings.defaultOscUnisonCentsDetune);

        // instantiate oscillator 2 FM and ring modulation modulator:
        this.osc2FrequencyModulationManager = new ModulationManager(this.audioContext, this.fmRingLfoArray,
                                                                    Settings.minOscFreqModulation, Settings.maxOscFreqModulation, Settings.defaultOscFreqModulation);

        // instantiate sub oscillator 2 amplitude modulation modulator:
        this.subOscAmplitudeModulationManager = new ModulationManager(this.audioContext, this.lfoArray,
                                                                    Settings.minOscGain, Settings.maxOscGain, Settings.defaultOscGain);
        // instantiate sub oscillator FM and ring modulation modulator:
        this.subOscFrequencyModulationManager = new ModulationManager(this.audioContext, this.fmRingLfoArray,
                                                                    Settings.minOscFreqModulation, Settings.maxOscFreqModulation, Settings.defaultOscFreqModulation);

        this.multiShapeOscillator1 = new MultiShapeOscillator(this.audioContext, Settings.maxOscGain);
        this.multiShapeOscillator2 = new MultiShapeOscillator(this.audioContext, Settings.minOscGain);
        this.subOscillator = new SubOscillator(this.audioContext, Settings.minOscGain);
        this.noiseOscillator = new MultiNoiseOscillator(this.audioContext, Settings.minOscGain);

        // instantiate and set the mixer
        this.oscillatorMixer = new AdditiveOscillatorMixer(this.audioContext);

        // instantiate the filter
        this.filterNode = new OscFilter(this.audioContext, this.lfoArray);

        // instantiate and set the ADSR envelope
        this.voiceAdsrEnvelope = new AdsrEnvelope(this.audioContext);
        this.voiceAdsrGainNode = this.audioContext.createGain();
        this.voiceAdsrGainNode.gain.setValueAtTime(Settings.adsrOffLevel, this.audioContext.currentTime);

        // instantiate and set the final gain node
        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.maxOscGain, this.audioContext.currentTime);

        // connect the modulators to the oscillators
        this.multiShapeOscillator1.connectAmplitudeModulator(this.osc1AmplitudeModulationManager);
        this.multiShapeOscillator1.connectFrequencyModulator(this.osc1FrequencyModulationManager);
        this.multiShapeOscillator1.connectPulseWidthModulator(this.osc1PulseWidthModulationManager);
        this.multiShapeOscillator1.connectUnisonDetuneModulator(this.osc1UnisonDetuneModulationManager);

        this.multiShapeOscillator2.connectAmplitudeModulator(this.osc2AmplitudeModulationManager);
        this.multiShapeOscillator2.connectFrequencyModulator(this.osc2FrequencyModulationManager);
        this.multiShapeOscillator2.connectPulseWidthModulator(this.osc2PulseWidthModulationManager);
        this.multiShapeOscillator2.connectUnisonDetuneModulator(this.osc2UnisonDetuneModulationManager);

        this.subOscillator.connectAmplitudeModulator(this.subOscAmplitudeModulationManager);
        this.subOscillator.connectFrequencyModulator(this.subOscFrequencyModulationManager);

        // add the oscillators to the mixer, in the exact order below
        // { oscillator: BaseOscillator; gainWeight: number; }
        this.oscillatorMixer.addFilteredOscillator( { oscillator: this.multiShapeOscillator1, gainWeight: 1.0 } ); // osc 1 must be at index 0
        this.oscillatorMixer.addFilteredOscillator( { oscillator: this.multiShapeOscillator2, gainWeight: 0.0 } ); // osc 2 must be at index 1
        this.oscillatorMixer.addNonFilteredOscillator({ oscillator: this.subOscillator, gainWeight: 0.0 } ); // sub osc must be at index 2
        this.oscillatorMixer.addFilteredOscillator({ oscillator: this.noiseOscillator, gainWeight: 0.0 } ); // noise osc must be at index 3

        // connect the merged result of the oscillators that should be filtered, to the filter itself
        this.oscillatorMixer.outputNode().connect(this.filterNode.inputNode());

        /* Connect the filtered and non filtered signals with the ADSR gain envelope.
        ** These are not connected to the ADSR envelope itself, because the ADSR envelope is an emitter,
        ** not a destination, these are connected to a GainNode who's .gain property is modulated by the ADSR. */
        // the non filtered oscillators are taken from the mixer
        this.oscillatorMixer.nonFilteredOutputNode().connect(this.voiceAdsrGainNode);
        // the filtered oscillators are taken from the filter output
        this.filterNode.outputNode().connect(this.voiceAdsrGainNode);
        
        /* Connect ADSR envelope with GainNode dedicated to ADSR envelope modulation.
        ** Important! this ADSR modulation gets ADDED to the current value of .gain parameter, it does not overwrite it!
        ** This is why the .gain parameter's value should be zero. */
        this.voiceAdsrEnvelope.outputNode().connect(this.voiceAdsrGainNode.gain);

        // finally, connect the output from the GainNode modulated by ADSR to the final output GainNode
        this.voiceAdsrGainNode.connect(this.outputGainNode);
    }

    public playNote(octaves: number, semitones: number, duration: number): void
    {
        Voice.logger.debug(`playNote(): playing: octaves: ${octaves} semitones: ${semitones}`);

        // first, set the internal note (as octaves and semitones) for all oscillators
        this.multiShapeOscillator1.setNote(octaves, semitones);
        this.multiShapeOscillator2.setNote(octaves, semitones);
        this.subOscillator.setNote(octaves, semitones);

        // then trigger the ADSR envelope for the voice
        this.voiceAdsrEnvelope.startBeat(duration);
        // and then trigger the ADSR envelopr for the filter as well
        this.filterNode.getAdsrEnvelope().startBeat(duration);
    }

    public playSequencerStep(beatOctavesOffset: number, beatSemitonesOffset: number, stepDuration: number): void
    {
        Voice.logger.debug(`playNoteWithOffset(octaves: ${beatOctavesOffset}, semitones: ${beatSemitonesOffset})`);

        // first, set the internal note offsets (as octaves and semitones) for all oscillators
        this.multiShapeOscillator1.setBeatOctavesOffset(beatOctavesOffset);
        this.multiShapeOscillator1.setBeatSemitonesOffset(beatSemitonesOffset);

        this.multiShapeOscillator2.setBeatOctavesOffset(beatOctavesOffset);
        this.multiShapeOscillator2.setBeatSemitonesOffset(beatSemitonesOffset);

        this.subOscillator.setBeatOctavesOffset(beatOctavesOffset);
        this.subOscillator.setBeatSemitonesOffset(beatSemitonesOffset);

        // then trigger the ADSR envelope for the voice
        this.voiceAdsrEnvelope.startBeat(stepDuration);
        // and then trigger the ADSR envelopr for the filter as well
        this.filterNode.getAdsrEnvelope().startBeat(stepDuration);
    }

    public noteOn(octaves: number, semitones: number): void
    {
        Voice.logger.debug(`noteOn(octaves = ${octaves}, semitones = ${semitones})`);

        // first, set the internal note (as octaves and semitones) for all melodic oscillators
        this.multiShapeOscillator1.setNote(octaves, semitones);
        this.multiShapeOscillator2.setNote(octaves, semitones);
        this.subOscillator.setNote(octaves, semitones);

        // then trigger the ADSR envelope for the voice
        this.voiceAdsrEnvelope.start();
        // and then trigger the ADSR envelopr for the filter as well
        this.filterNode.getAdsrEnvelope().start();
    }

    public noteOff(): void
    {
        Voice.logger.debug(`noteOff()`);

        // stop the ADSR envelope for the voice
        this.voiceAdsrEnvelope.stop();
        // stop the ADSR envelope for rhe filter as well
        this.filterNode.getAdsrEnvelope().stop();
    }

    public resetBeatOffsets(): void
    {
        Voice.logger.debug(`resetBeatOffsets()`);

        this.multiShapeOscillator1.setBeatOctavesOffset(0);
        this.multiShapeOscillator1.setBeatSemitonesOffset(0);

        this.multiShapeOscillator2.setBeatOctavesOffset(0);
        this.multiShapeOscillator2.setBeatSemitonesOffset(0);

        this.subOscillator.setBeatOctavesOffset(0);
        this.subOscillator.setBeatSemitonesOffset(0);
    }

    public setMainGain(gain: number): void
    {
        if (Settings.minVoiceGain <= gain && gain <= Settings.maxVoiceGain)
        {
            Voice.logger.debug(`setGain(${gain})`);

            const currentTime = this.audioContext.currentTime;

            // set the new value
            this.outputGainNode.gain.linearRampToValueAtTime(gain, currentTime + 0.1);
        }
        else
            Voice.logger.warn(`setGain(${gain}): value outside bounds`);
    }

    public outputNode(): GainNode { return this.outputGainNode; }

    public getMultiShapeOscillator1(): MultiShapeOscillator { return this.multiShapeOscillator1; }

    public getMultiShapeOscillator2(): MultiShapeOscillator { return this.multiShapeOscillator2; }

    public getSubOscillator(): SubOscillator { return this.subOscillator; }

    public getNoiseOscillator(): MultiNoiseOscillator { return this.noiseOscillator; }

    public getLfoArray(): Array<BaseUnipolarLfo> { return this.lfoArray; } 

    public getFmRingLfoArray(): Array<UnipolarToggledMultiShapeLfo> { return this.fmRingLfoArray; }

    // getters for the modulators
    public getOsc1AmplitudeModulationManager(): ModulationManager { return this.osc1AmplitudeModulationManager; }
    public getOsc1FrequencyModulationManager(): ModulationManager { return this.osc1FrequencyModulationManager; }
    public getOsc1PulseWidthModulationManager(): ModulationManager { return this.osc1PulseWidthModulationManager; }
    public getOsc1UnisonDetuneModulationManager(): ModulationManager { return this.osc1UnisonDetuneModulationManager; }

    public getOsc2AmplitudeModulationManager(): ModulationManager { return this.osc2AmplitudeModulationManager; }
    public getOsc2FrequencyModulationManager(): ModulationManager { return this.osc2FrequencyModulationManager; }
    public getOsc2PulseWidthModulationManager(): ModulationManager { return this.osc2PulseWidthModulationManager; }
    public getOsc2UnisonDetuneModulationManager(): ModulationManager { return this.osc2UnisonDetuneModulationManager; }

    public getSubOscAmplitudeModulationManager(): ModulationManager { return this.subOscAmplitudeModulationManager; }
    public getSubOscFrequencyModulationManager(): ModulationManager { return this.subOscFrequencyModulationManager; }

    // public getAnalyserNode(): AnalyserNode { return this.analyserNode; }

    public getMixer(): AdditiveOscillatorMixer { return this.oscillatorMixer; }

    public getFilter(): OscFilter { return this.filterNode; }

    public getAdsrEnvelope(): AdsrEnvelope { return this.voiceAdsrEnvelope; }

    public getAudioContext(): AudioContext { return this.audioContext; }

    // required for having permission to play the sound in the browser, after a user interaction
    public resume(): void
    {
        this.audioContext.resume();
    }
}