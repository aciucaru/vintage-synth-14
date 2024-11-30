import { Settings } from "../../../../constants/settings";
import { ToggledInputsManager } from "../../inputs-mixer/toggled-inputs-manager";
import { BaseUnipolarLfo } from "./base-unipolar-lfo";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


/* Low frequency oscillator implementation, this LFO is always unipolar and positive (it oscillates between 0 and 1).
** This class is basically an oscilator that goes on no matter if it is modulating one or more parameters.
** */
export class UnipolarToggledMultiShapeLfo extends BaseUnipolarLfo
{
    // the LFO oscillators (they oscillate between -1 and 1)
    private sineLfo: OscillatorNode;
    private triangleLfo: OscillatorNode;
    private sawLfo: OscillatorNode;
    private squareLfo: OscillatorNode;

    // a merger gain node that merges the 4 oscillators above
    // private mergerGainNode: GainNode;
    private additiveInputsMixer: ToggledInputsManager;

    // the absolute frequency of the LFO, in Hz
    private absoluteFrequency: number = Settings.defaultLfoLowAbsoluteFrequency;

    /* The indexes of the 4 LFOs, these indexes will be used for referencing the LFOs and must
    ** correspond exactly to the order in which the 4 LFOs are added to 'toggledInputsMixer' */
    private static readonly SINE_OSC_INDEX = 0;
    private static readonly TRIANGLE_OSC_INDEX = 1;
    private static readonly SAW_OSC_INDEX = 2;
    private static readonly SQUARE_OSC_INDEX = 3;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "UnipolarToggledMultiShapeLfo", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        super(audioContext);

        this.sineLfo = this.audioContext.createOscillator();
        this.sineLfo.type = "sine";
        this.sineLfo.frequency.setValueAtTime(this.absoluteFrequency, this.audioContext.currentTime);

        this.triangleLfo = this.audioContext.createOscillator();
        this.triangleLfo.type = "triangle";
        this.triangleLfo.frequency.setValueAtTime(this.absoluteFrequency, this.audioContext.currentTime);

        this.sawLfo = this.audioContext.createOscillator();
        this.sawLfo.type = "sawtooth";
        this.sawLfo.frequency.setValueAtTime(this.absoluteFrequency, this.audioContext.currentTime);

        this.squareLfo = this.audioContext.createOscillator();
        this.squareLfo.type = "square";
        this.squareLfo.frequency.setValueAtTime(this.absoluteFrequency, this.audioContext.currentTime);

        // this.mergerGainNode = this.audioContext.createGain();
        this.additiveInputsMixer = new ToggledInputsManager(this.audioContext);

        /* First, merge all 4 LFOs into one lfo, with the help of the inputs mixer (the merged signal will be automatically
        ** normalized between -1.0 and 1.0).
        /* The order in which the 4 LFOs are added to 'toggledInputsMixer' matters and must match the values of:
        ** SINE_OSC_INDEX = 0
        ** TRIANGLE_OSC_INDEX = 1
        ** SAW_OSC_INDEX = 2
        ** SQUARE_OSC_INDEX = 3 */
        this.additiveInputsMixer.connectInput(this.sineLfo, {gain: Settings.maxLfoGain});
        this.additiveInputsMixer.connectInput(this.triangleLfo, {gain: Settings.minLfoGain});
        this.additiveInputsMixer.connectInput(this.sawLfo, {gain: Settings.minLfoGain});
        this.additiveInputsMixer.connectInput(this.squareLfo, {gain: Settings.minLfoGain});

        /* Then, add the 4 merged oscillators to the final output gain node (the resulting signal will be between -1.0 and 1.0).
        ** A 'ConstantSourceNode' the continously emits 1.0 is already added to the final output node (this is inherited from 'BaseUnipolarLfo').
        ** The gain of the final output node ('outputGainNode') has already the correct value (0.5), in such a way that
        ** the signal resulting from 'outputGainNode' is unipolar (between 0.0 and 1.0). */
        this.additiveInputsMixer.outputNode().connect(this.outputGainNode);

        // start the oscillator nodes
        this.sineLfo.start();
        this.triangleLfo.start();
        this.sawLfo.start();
        this.squareLfo.start();

        // toggle one node ON by default (the sine wave)
        this.additiveInputsMixer.unmuteInput(UnipolarToggledMultiShapeLfo.SINE_OSC_INDEX);
    }

    /* Abstract method inherited from BaseUnipolarLfo. This method is called internally by the 'setFrequency()' public method
    ** of the 'BaseUnipolarLfo' base class and the argument check for 'freq' is alread made.
    ** All that remains to do is to just implement the frequency change code. */
    protected override applyFrequency(freq: number): void
    {
        this.sineLfo.frequency.linearRampToValueAtTime(freq, this.audioContext.currentTime);
        this.triangleLfo.frequency.linearRampToValueAtTime(freq, this.audioContext.currentTime);
        this.sawLfo.frequency.linearRampToValueAtTime(freq, this.audioContext.currentTime);
        this.squareLfo.frequency.linearRampToValueAtTime(freq, this.audioContext.currentTime);
    }

    public toggleSineWave(isToggled: boolean): void
    {
        UnipolarToggledMultiShapeLfo.logger.debug(`setSineGain(${isToggled})`);

        if (isToggled)
            this.additiveInputsMixer.unmuteInput(UnipolarToggledMultiShapeLfo.SINE_OSC_INDEX);
        else
            this.additiveInputsMixer.muteInput(UnipolarToggledMultiShapeLfo.SINE_OSC_INDEX);
    }

    public toggleTriangleWave(isToggled: boolean): void
    {
        UnipolarToggledMultiShapeLfo.logger.debug(`setTriangleGain(${isToggled})`);

        if (isToggled)
            this.additiveInputsMixer.unmuteInput(UnipolarToggledMultiShapeLfo.TRIANGLE_OSC_INDEX);
        else
            this.additiveInputsMixer.muteInput(UnipolarToggledMultiShapeLfo.TRIANGLE_OSC_INDEX);
    }

    public toggleSawWave(isToggled: boolean): void
    {
        UnipolarToggledMultiShapeLfo.logger.debug(`setSawGain(${isToggled})`);

        if (isToggled)
            this.additiveInputsMixer.unmuteInput(UnipolarToggledMultiShapeLfo.SAW_OSC_INDEX);
        else
            this.additiveInputsMixer.muteInput(UnipolarToggledMultiShapeLfo.SAW_OSC_INDEX);
    }

    public toggleSquareWave(isToggled: boolean): void
    {
        UnipolarToggledMultiShapeLfo.logger.debug(`setSquareGain(${isToggled})`);

        if (isToggled)
            this.additiveInputsMixer.unmuteInput(UnipolarToggledMultiShapeLfo.SQUARE_OSC_INDEX);
        else
            this.additiveInputsMixer.muteInput(UnipolarToggledMultiShapeLfo.SQUARE_OSC_INDEX);
    }
}