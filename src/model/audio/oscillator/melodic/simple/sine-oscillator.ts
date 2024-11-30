import { Settings } from "../../../../../constants/settings";
import { BaseMelodicOscillator } from "../base/base-melodic-oscillator";

import type { AmplitudeModulatableEmitter } from "../../../modulators/base/amplitude-modulatable-emitter";
import type { FrequencyModulatableEmitter } from "../../../modulators/base/frequency-modulatable-emitter";

import { BehaviorSubject } from "rxjs";
import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import type { ModulationManager } from "../../../modulators/modulation-manager";


export class SineOscillator extends BaseMelodicOscillator
            implements AmplitudeModulatableEmitter, FrequencyModulatableEmitter
{
    // main node
    private sineOscillator: OscillatorNode;

    // parameter modulation observable values:
    private observableAmplitude: BehaviorSubject<number>;
    private observableFrequency: BehaviorSubject<number>;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "SineOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext, initialGain: number)
    {
        super(audioContext, initialGain);

        // instantiate the sub oscillator and set settings
        this.sineOscillator = this.audioContext.createOscillator();
        this.sineOscillator.type = "sine"; // the sub oscillator is always a sine

        // connect the sub oscillator to the main output node
        this.sineOscillator.connect(this.outputGainNode);

        // also connect the sub oscillator to the analyser gain node, that is already connected to the analyser
        this.sineOscillator.connect(this.analyserGainNode);

        // instantiate the observable objects for modulators
        this.observableAmplitude = new BehaviorSubject<number>(Settings.defaultOscGain);
        this.observableFrequency = new BehaviorSubject<number>(Settings.defaultOscFreqModulation);

        // start the sound oscillator
        this.sineOscillator.start();
    }

    // inherited from interface 'AmplitudeModulatableEmitter'
    public connectAmplitudeModulator(amplitudeModulator: ModulationManager): void
    {
        amplitudeModulator.outputNode().connect(this.outputGainNode.gain);
    }

    // inherited from interface 'FrequencyModulatableEmitter'
    public connectFrequencyModulator(frequencyModulator: ModulationManager): void
    {
        frequencyModulator.outputNode().connect(this.sineOscillator.frequency);
    }

    public override setNote(octaves: number, semitones: number): boolean
    {
        const isChangeSuccessfull = this.note.setOctavesAndSemitones(octaves, semitones);

        if (isChangeSuccessfull)
        {
            SineOscillator.logger.debug(`setOctavesAndSemitones(${octaves}, ${semitones})`);

            // set the frequency
            this.sineOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            SineOscillator.logger.warn(`setOctavesAndSemitones(${octaves}, ${semitones}): value/values outside bounds`);

        return isChangeSuccessfull;
    }

    public override setOctavesOffset(octavesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setOctavesOffset(octavesOffset);

        if (isChangeSuccessfull)
        {
            SineOscillator.logger.debug(`setOctavesOffset(${octavesOffset})`);

            // set the frequency
            this.sineOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            SineOscillator.logger.warn(`setOctavesOffset(${octavesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setSemitonesOffset(semitonesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setSemitonesOffset(semitonesOffset);

        if (isChangeSuccessfull)
        {
            SineOscillator.logger.debug(`setSemitonesOffset(${semitonesOffset})`);

            // set the frequency
            this.sineOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            SineOscillator.logger.warn(`setSemitonesOffset(${semitonesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setCentsOffset(centsOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setCentsOffset(centsOffset);

        if (isChangeSuccessfull)
        {
            SineOscillator.logger.debug(`setCentsOffset(${centsOffset})`);

            // set the frequency
            this.sineOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            SineOscillator.logger.warn(`setCentsOffset(${centsOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setBeatOctavesOffset(beatOctavesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setBeatOctavesOffset(beatOctavesOffset);

        if (isChangeSuccessfull)
        {
            SineOscillator.logger.debug(`setBeatOctavesOffset(${beatOctavesOffset})`);

            // set the frequency
            this.sineOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            SineOscillator.logger.warn(`setBeatOctavesOffset(${beatOctavesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setBeatSemitonesOffset(beatSemitonesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setBeatSemitonesOffset(beatSemitonesOffset);

        if (isChangeSuccessfull)
        {
            SineOscillator.logger.debug(`setBeatSemitonesOffset(${beatSemitonesOffset})`);

            // set the frequency
            this.sineOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            SineOscillator.logger.warn(`setBeatSemitonesOffset(${beatSemitonesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }
}