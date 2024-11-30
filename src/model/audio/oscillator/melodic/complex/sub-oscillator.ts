import { Settings } from "../../../../../constants/settings";
import { BaseMelodicOscillator } from "../base/base-melodic-oscillator";
import { SineOscillator } from "../simple/sine-oscillator";

import type { AmplitudeModulatableEmitter } from "../../../modulators/base/amplitude-modulatable-emitter";
import type { FrequencyModulatableEmitter } from "../../../modulators/base/frequency-modulatable-emitter";

import { BehaviorSubject } from "rxjs";
import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import type { ModulationManager } from "../../../modulators/modulation-manager";


export class SubOscillator extends BaseMelodicOscillator
        implements AmplitudeModulatableEmitter, FrequencyModulatableEmitter
{
    private sineOscillatorNode: SineOscillator;

    // parameter modulation observable values:
    private observableAmplitude: BehaviorSubject<number>;
    private observableFrequency: BehaviorSubject<number>;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "SubOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext, initialGain: number)
    {
        super(audioContext, initialGain);

        // instantiate the sine oscillator
        this.sineOscillatorNode = new SineOscillator(this.audioContext, Settings.maxOscGain);

        // instantiate the observable objects for modulators
        this.observableAmplitude = new BehaviorSubject<number>(Settings.defaultOscGain);
        this.observableFrequency = new BehaviorSubject<number>(Settings.defaultOscFreqModulation);

        // connect the nodes between them:
        this.sineOscillatorNode.outputNode().connect(this.outputGainNode);
        this.sineOscillatorNode.outputNode().connect(this.analyserGainNode);
    }

    // method from 'AmplitudeModulatableEmitter'
    public connectAmplitudeModulator(amplitudeModulator: ModulationManager): void
    {
        amplitudeModulator.outputNode().connect(this.analyserGainNode.gain);
        amplitudeModulator.outputNode().connect(this.outputGainNode.gain);
    }

    // method from 'FrequencyModulatableEmitter'
    public connectFrequencyModulator(frequencyModulator: ModulationManager): void
    {
        this.sineOscillatorNode.connectFrequencyModulator(frequencyModulator);
    }

    public getObservableAmplitude(): BehaviorSubject<number> { return this.observableAmplitude; }
    public getObservableFrequency(): BehaviorSubject<number> { return this.observableFrequency; }

    public override setNote(octaves: number, semitones: number): boolean
    {
        const isChangeSuccessfull = this.note.setOctavesAndSemitones(octaves, semitones);

        if (isChangeSuccessfull)
        {
            SubOscillator.logger.debug(`setOctavesAndSemitones(${octaves}, ${semitones})`);

            this.sineOscillatorNode.setNote(octaves, semitones);
        }
        else
            SubOscillator.logger.warn(`setOctavesAndSemitones(${octaves}, ${semitones}): value/values outside bounds`);

        return isChangeSuccessfull;
    }

    public override setOctavesOffset(octavesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setOctavesOffset(octavesOffset);

        if (isChangeSuccessfull)
        {
            SubOscillator.logger.debug(`setOctavesOffset(${octavesOffset})`);

            this.sineOscillatorNode.setOctavesOffset(octavesOffset);
        }
        else
            SubOscillator.logger.warn(`setOctavesOffset(${octavesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setSemitonesOffset(semitonesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setSemitonesOffset(semitonesOffset);

        if (isChangeSuccessfull)
        {
            SubOscillator.logger.debug(`setSemitonesOffset(${semitonesOffset})`);

            this.sineOscillatorNode.setSemitonesOffset(semitonesOffset);
        }
        else
            SubOscillator.logger.warn(`setSemitonesOffset(${semitonesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setCentsOffset(centsOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setCentsOffset(centsOffset);

        if (isChangeSuccessfull)
        {
            SubOscillator.logger.debug(`setCentsOffset(${centsOffset})`);

            this.sineOscillatorNode.setCentsOffset(centsOffset);
        }
        else
            SubOscillator.logger.warn(`setCentsOffset(${centsOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setBeatOctavesOffset(beatOctavesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setBeatOctavesOffset(beatOctavesOffset);

        if (isChangeSuccessfull)
        {
            SubOscillator.logger.debug(`setBeatOctavesOffset(${beatOctavesOffset})`);

            this.sineOscillatorNode.setBeatOctavesOffset(beatOctavesOffset);
        }
        else
            SubOscillator.logger.warn(`setBeatOctavesOffset(${beatOctavesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setBeatSemitonesOffset(beatSemitonesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setBeatSemitonesOffset(beatSemitonesOffset);

        if (isChangeSuccessfull)
        {
            SubOscillator.logger.debug(`setBeatSemitonesOffset(${beatSemitonesOffset})`);

            this.sineOscillatorNode.setBeatSemitonesOffset(beatSemitonesOffset);
        }
        else
            SubOscillator.logger.warn(`setBeatSemitonesOffset(${beatSemitonesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }
}