import { Settings } from "../../../../../constants/settings";
import { BaseMelodicOscillator } from "../base/base-melodic-oscillator";
import type { BaseUnisonOscillator } from "../base/base-unison-oscillator";
import type { BasePulseOscillator } from "../base/base-pulse-oscillator";
import { TriangleOscillator } from "../simple/triangle-oscillator";
import { SawOscillator } from "../simple/saw-oscillator";
import { PulseOscillator } from "../simple/pulse-oscillator";
import { ToggledInputsManager } from "../../../inputs-mixer/toggled-inputs-manager";

import type { AmplitudeModulatableEmitter } from "../../../modulators/base/amplitude-modulatable-emitter";
import type { FrequencyModulatableEmitter } from "../../../modulators/base/frequency-modulatable-emitter";
import type { PulseWidthModulatableEmitter } from "../../../modulators/base/pulse-width-modulatable-emitter";
import type { UnisonDetuneModulatableEmitter } from "../../../modulators/base/unison-detune-modulatable-emitter";

import { BehaviorSubject } from "rxjs";
import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import type { ModulationManager } from "../../../modulators/modulation-manager";



export class MultiShapeOscillator extends BaseMelodicOscillator
        implements BaseUnisonOscillator, BasePulseOscillator,
                    AmplitudeModulatableEmitter, FrequencyModulatableEmitter, PulseWidthModulatableEmitter, UnisonDetuneModulatableEmitter
{
    // the oscillator nodes
    private triangleOscillatorNode: TriangleOscillator;
    private sawOscillatorNode: SawOscillator;
    private pulseOscillatorNode: PulseOscillator;

    // the mixer that toggles on/off the oscillator nodes
    private toggledInputsMixer: ToggledInputsManager;

    // parameter modulation observable values:
    private observableAmplitude: BehaviorSubject<number>;
    private observableFrequency: BehaviorSubject<number>;
    private observablePulseWidth: BehaviorSubject<number>;
    private observableUnisonDetune: BehaviorSubject<number>;

    private static readonly TRIANGLE_OSC_INDEX = 0;
    private static readonly SAW_OSC_INDEX = 1;
    private static readonly PULSE_OSC_INDEX = 2;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "MultiShapeOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext, initialGain: number)
    {
        super(audioContext, initialGain);

        // instantiate all sound oscillators
        this.triangleOscillatorNode = new TriangleOscillator(this.audioContext, Settings.maxOscGain);
        this.sawOscillatorNode = new SawOscillator(this.audioContext, Settings.maxOscGain);
        this.pulseOscillatorNode = new PulseOscillator(this.audioContext, Settings.maxOscGain);

        // instantiate the oscillators mixer, which toggles oscillator on/off
        this.toggledInputsMixer = new ToggledInputsManager(this.audioContext);

        // add the oscillators to the mixer
        this.toggledInputsMixer.connectInput(this.triangleOscillatorNode.outputNode(), {gain: Settings.maxOscGain});
        this.toggledInputsMixer.connectInput(this.sawOscillatorNode.outputNode(), {gain: Settings.maxOscGain});
        this.toggledInputsMixer.connectInput(this.pulseOscillatorNode.outputNode(), {gain: Settings.maxOscGain});

        /* Toggle the oscillators on/off, the indexes must correspond to the order in wich these inputs
        ** where added to 'toggledInputsMixer' */
        this.toggledInputsMixer.unmuteInput(MultiShapeOscillator.TRIANGLE_OSC_INDEX);
        this.toggledInputsMixer.muteInput(MultiShapeOscillator.SAW_OSC_INDEX);
        this.toggledInputsMixer.muteInput(MultiShapeOscillator.PULSE_OSC_INDEX);
        
        // instantiate the observable objects for modulators
        this.observableAmplitude = new BehaviorSubject<number>(Settings.defaultOscGain);
        this.observableFrequency = new BehaviorSubject<number>(Settings.defaultOscFreqModulation);
        this.observablePulseWidth = new BehaviorSubject<number>(Settings.defaultOscPulseWidth);
        this.observableUnisonDetune = new BehaviorSubject<number>(Settings.defaultOscUnisonCentsDetune);

        // connect the result (of mixing the 3 oscillators) to the output gain node
        this.toggledInputsMixer.outputNode().connect(this.outputGainNode);

        // connect the output gain to the gain node for the analyser
        this.toggledInputsMixer.outputNode().connect(this.analyserGainNode);
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
        this.triangleOscillatorNode.connectFrequencyModulator(frequencyModulator);
        this.sawOscillatorNode.connectFrequencyModulator(frequencyModulator);
        this.pulseOscillatorNode.connectFrequencyModulator(frequencyModulator);
    }

    // method from 'PulseWidthModulatableEmitter'
    public connectPulseWidthModulator(pulseWidthModulator: ModulationManager): void
    {
        this.pulseOscillatorNode.connectPulseWidthModulator(pulseWidthModulator);
    }

    // method from 'UnisonDetuneModulatableEmitter'
    public connectUnisonDetuneModulator(unisonDetuneModulator: ModulationManager): void
    {
        this.triangleOscillatorNode.connectUnisonDetuneModulator(unisonDetuneModulator);
        this.sawOscillatorNode.connectUnisonDetuneModulator(unisonDetuneModulator);
        this.pulseOscillatorNode.connectUnisonDetuneModulator(unisonDetuneModulator);
    }

    public getObservableAmplitude(): BehaviorSubject<number> { return this.observableAmplitude; }
    public getObservableFrequency(): BehaviorSubject<number> { return this.observableFrequency; }
    public getObservablePulseWidth(): BehaviorSubject<number> { return this.observablePulseWidth; }
    public getObservableUnisonDetune(): BehaviorSubject<number> { return this.observableUnisonDetune; }

    public override setNote(octaves: number, semitones: number): boolean
    {
        const isChangeSuccessfull = this.note.setOctavesAndSemitones(octaves, semitones);

        if (isChangeSuccessfull)
        {
            MultiShapeOscillator.logger.debug(`setOctavesAndSemitones(${octaves}, ${semitones})`);

            this.triangleOscillatorNode.setNote(octaves, semitones);
            this.sawOscillatorNode.setNote(octaves, semitones);
            this.pulseOscillatorNode.setNote(octaves, semitones);
        }
        else
            MultiShapeOscillator.logger.warn(`setOctavesAndSemitones(${octaves}, ${semitones}): value/values outside bounds`);

        return isChangeSuccessfull;
    }

    public override setOctavesOffset(octavesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setOctavesOffset(octavesOffset);

        if (isChangeSuccessfull)
        {
            MultiShapeOscillator.logger.debug(`setOctavesOffset(${octavesOffset})`);

            this.triangleOscillatorNode.setOctavesOffset(octavesOffset);
            this.sawOscillatorNode.setOctavesOffset(octavesOffset);
            this.pulseOscillatorNode.setOctavesOffset(octavesOffset);
        }
        else
            MultiShapeOscillator.logger.warn(`setOctavesOffset(${octavesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setSemitonesOffset(semitonesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setSemitonesOffset(semitonesOffset);

        if (isChangeSuccessfull)
        {
            MultiShapeOscillator.logger.debug(`setSemitonesOffset(${semitonesOffset})`);

            this.triangleOscillatorNode.setSemitonesOffset(semitonesOffset);
            this.sawOscillatorNode.setSemitonesOffset(semitonesOffset);
            this.pulseOscillatorNode.setSemitonesOffset(semitonesOffset);
        }
        else
            MultiShapeOscillator.logger.warn(`setSemitonesOffset(${semitonesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setCentsOffset(centsOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setCentsOffset(centsOffset);

        if (isChangeSuccessfull)
        {
            MultiShapeOscillator.logger.debug(`setCentsOffset(${centsOffset})`);

            this.triangleOscillatorNode.setCentsOffset(centsOffset);
            this.sawOscillatorNode.setCentsOffset(centsOffset);
            this.pulseOscillatorNode.setCentsOffset(centsOffset);
        }
        else
            MultiShapeOscillator.logger.warn(`setCentsOffset(${centsOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setBeatOctavesOffset(beatOctavesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setBeatOctavesOffset(beatOctavesOffset);

        if (isChangeSuccessfull)
        {
            MultiShapeOscillator.logger.debug(`setBeatOctavesOffset(${beatOctavesOffset})`);

            this.triangleOscillatorNode.setBeatOctavesOffset(beatOctavesOffset);
            this.sawOscillatorNode.setBeatOctavesOffset(beatOctavesOffset);
            this.pulseOscillatorNode.setBeatOctavesOffset(beatOctavesOffset);
        }
        else
            MultiShapeOscillator.logger.warn(`setBeatOctavesOffset(${beatOctavesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    public override setBeatSemitonesOffset(beatSemitonesOffset: number): boolean
    {
        // try to set the new value
        const isChangeSuccessfull = this.note.setBeatSemitonesOffset(beatSemitonesOffset);

        if (isChangeSuccessfull)
        {
            MultiShapeOscillator.logger.debug(`setBeatSemitonesOffset(${beatSemitonesOffset})`);

            this.triangleOscillatorNode.setBeatSemitonesOffset(beatSemitonesOffset);
            this.sawOscillatorNode.setBeatSemitonesOffset(beatSemitonesOffset);
            this.pulseOscillatorNode.setBeatSemitonesOffset(beatSemitonesOffset);
        }
        else
            MultiShapeOscillator.logger.warn(`setBeatSemitonesOffset(${beatSemitonesOffset}): value outside bounds`);

        return isChangeSuccessfull;
    }

    // method from 'BaseUnisonOscillator' interface
    public setUnisonDetune(centsDetune: number): boolean
    {
        if (Settings.minOscUnisonCentsDetune <= centsDetune && centsDetune <= Settings.maxOscUnisonCentsDetune)
        {
            MultiShapeOscillator.logger.debug(`setDetune(${centsDetune})`);

            this.triangleOscillatorNode.setUnisonDetune(centsDetune);
            this.sawOscillatorNode.setUnisonDetune(centsDetune);
            this.pulseOscillatorNode.setUnisonDetune(centsDetune);

            return true;
        }
        else
        {
            MultiShapeOscillator.logger.warn(`setDetune(${centsDetune}): value is outside bounds`);
            return false;
        }
    }

    // method from 'BasePulseOscillator' interface
    public setPulseWidth(pulseWidth: number): boolean
    {
        const isChangeSuccsefull = this.pulseOscillatorNode.setPulseWidth(pulseWidth);

        if (isChangeSuccsefull)
        {
            MultiShapeOscillator.logger.debug(`setPulseWidth(${pulseWidth})`);

            this.pulseOscillatorNode.setPulseWidth(pulseWidth);

            return true; // change was successfull
        }
        else
        {
            MultiShapeOscillator.logger.warn(`setPulseWidth(${pulseWidth}): value is outside bounds`);
            return false; // change was not successfull
        }
    }

    public enableTriangleShape(): void
    {
        MultiShapeOscillator.logger.debug("enableTriangleShape()");

        this.toggledInputsMixer.unmuteInput(MultiShapeOscillator.TRIANGLE_OSC_INDEX);
    }

    public disableTriangleShape(): void
    {
        MultiShapeOscillator.logger.debug("disableTriangleShape()");

        this.toggledInputsMixer.muteInput(MultiShapeOscillator.TRIANGLE_OSC_INDEX);
    }

    public enableSawShape(): void
    {
        MultiShapeOscillator.logger.debug("enableSawShape()");

        this.toggledInputsMixer.unmuteInput(MultiShapeOscillator.SAW_OSC_INDEX);
    }

    public disableSawShape(): void
    {
        MultiShapeOscillator.logger.debug("disableSawShape()");

        this.toggledInputsMixer.muteInput(MultiShapeOscillator.SAW_OSC_INDEX);
    }

    public enablePulseShape(): void
    {
        MultiShapeOscillator.logger.debug("enablePulseShape()");

        this.toggledInputsMixer.unmuteInput(MultiShapeOscillator.PULSE_OSC_INDEX);
    }

    public disablePulseShape(): void
    {
        MultiShapeOscillator.logger.debug("disablePulseShape()");

        this.toggledInputsMixer.muteInput(MultiShapeOscillator.PULSE_OSC_INDEX);
    }
}