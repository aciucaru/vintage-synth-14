import { Settings } from "../../../../../constants/settings";
import { BaseMelodicOscillator } from "../base/base-melodic-oscillator";
import type { BaseUnisonOscillator } from "../base/base-unison-oscillator";

import type { AmplitudeModulatableEmitter } from "../../../modulators/base/amplitude-modulatable-emitter";
import type { FrequencyModulatableEmitter } from "../../../modulators/base/frequency-modulatable-emitter";
import type { UnisonDetuneModulatableEmitter } from "../../../modulators/base/unison-detune-modulatable-emitter";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import type { ModulationManager } from "../../../modulators/modulation-manager";


export class TriangleOscillator extends BaseMelodicOscillator
            implements BaseUnisonOscillator,
                        AmplitudeModulatableEmitter, FrequencyModulatableEmitter, UnisonDetuneModulatableEmitter
{
    // main node
    private triangleOscillator: OscillatorNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "TriangleOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext, initialGain: number)
    {
        super(audioContext, initialGain);

        // instantiate the sub oscillator and set settings
        this.triangleOscillator = this.audioContext.createOscillator();
        this.triangleOscillator.type = "triangle";

        // connect the sub oscillator to the main output node
        this.triangleOscillator.connect(this.outputGainNode);

        // also connect the sub oscillator to the analyser gain node, that is already connected to the analyser
        this.triangleOscillator.connect(this.analyserGainNode);

        this.triangleOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);

        // start the sound oscillator
        this.triangleOscillator.start();
    }

    // inherited from interface 'AmplitudeModulatableEmitter'
    public connectAmplitudeModulator(amplitudeModulator: ModulationManager): void
    {
        amplitudeModulator.outputNode().connect(this.outputGainNode.gain);
    }

    // inherited from interface 'FrequencyModulatableEmitter'
    public connectFrequencyModulator(frequencyModulator: ModulationManager): void
    {
        frequencyModulator.outputNode().connect(this.triangleOscillator.frequency);
    }

    // inherited from interface 'UnisonDetuneModulatableEmitter'
    public connectUnisonDetuneModulator(unisonDetuneModulator: ModulationManager): void
    {
        unisonDetuneModulator.outputNode().connect(this.triangleOscillator.detune);
    }

    public override setNote(octaves: number, semitones: number): boolean
    {
        const isChangeSuccessfull = this.note.setOctavesAndSemitones(octaves, semitones);

        if (isChangeSuccessfull)
        {
            TriangleOscillator.logger.debug(`setOctavesAndSemitones(${octaves}, ${semitones})`);

            // set the frequency
            this.triangleOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            TriangleOscillator.logger.warn(`setOctavesAndSemitones(${octaves}, ${semitones}): value/values outside bounds`);

        return isChangeSuccessfull;
    }

    public override setOctavesOffset(octavesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setOctavesOffset(octavesOffset);

        if (isChangeSuccessfull)
        {
            TriangleOscillator.logger.debug(`setOctavesOffset(${octavesOffset})`);

            // set the frequency
            this.triangleOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            TriangleOscillator.logger.warn(`setOctavesOffset(${octavesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setSemitonesOffset(semitonesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setSemitonesOffset(semitonesOffset);

        if (isChangeSuccessfull)
        {
            TriangleOscillator.logger.debug(`setSemitonesOffset(${semitonesOffset})`);

            // set the frequency
            this.triangleOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            TriangleOscillator.logger.warn(`setSemitonesOffset(${semitonesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setCentsOffset(centsOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setCentsOffset(centsOffset);

        if (isChangeSuccessfull)
        {
            TriangleOscillator.logger.debug(`setCentsOffset(${centsOffset})`);

            // set the frequency
            this.triangleOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            TriangleOscillator.logger.warn(`setCentsOffset(${centsOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setBeatOctavesOffset(beatOctavesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setBeatOctavesOffset(beatOctavesOffset);

        if (isChangeSuccessfull)
        {
            TriangleOscillator.logger.debug(`setBeatOctavesOffset(${beatOctavesOffset})`);

            // set the frequency
            this.triangleOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            TriangleOscillator.logger.warn(`setBeatOctavesOffset(${beatOctavesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setBeatSemitonesOffset(beatSemitonesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setBeatSemitonesOffset(beatSemitonesOffset);

        if (isChangeSuccessfull)
        {
            TriangleOscillator.logger.debug(`setBeatSemitonesOffset(${beatSemitonesOffset})`);

            // set the frequency
            this.triangleOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
        }
        else
            TriangleOscillator.logger.warn(`setBeatSemitonesOffset(${beatSemitonesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    // from 'BaseUnisonOscillator' interface
    public setUnisonDetune(centsDetune: number): boolean
    {
        if (Settings.minOscUnisonCentsDetune <= centsDetune && centsDetune <= Settings.maxOscUnisonCentsDetune)
        {
            TriangleOscillator.logger.debug(`setDetune(${centsDetune})`);

            // set the frequency
            this.triangleOscillator.frequency.setValueAtTime(this.note.getFreq(), this.audioContext.currentTime);
            
            return true;
        }
        else
        {
            TriangleOscillator.logger.warn(`setDetune(${centsDetune}): value is outside bounds`);
            return false;
        }
    }
    
    public getOscillatorNode(): OscillatorNode { return this.triangleOscillator; }
}