import { Settings } from "../../../../constants/settings";
import { AdditiveInputsManager } from "../../inputs-mixer/additive-inputs-manager";
import { BaseUnipolarLfo } from "./base-unipolar-lfo";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


/*    Low frequency oscillator implementation, this LFO is always unipolar and positive (it oscillates between 0 and 1).
**    This class is basically an oscilator that goes on no matter if it is modulating one or more parameters.
**    This LFO has 4 shapes (sine, triangle, saw, square) wich can be combined togheter, each shape having it's own
** magnitude (it's own weight).
**    So, for example, the LFO could be mad up of the folowing shapes with the folowing weights:
** sine: 0.4, triangle: 0.0, saw: 0.5, square: 0.2.
**    This LFO offers a very fine mixing of the 4 wave shapes, but because of this, changing the weight of a wave shape
** does not have immediate results. This LFO is mostly for fine adjustments and tweeking.
**    In order to manage the weight of each of the 4 wave shapes, this LFO class uses a 'AdditiveInputsManager' instance,
** which, adds an arbitrary number of inputs, each input having it's own weight/magnitude. The inputs of 'AdditiveInputsManager'
** can be of any type, not just LFOs. In this way, this class doees not have to reimplement the logic of 'AdditiveInputsManager'. */
export class UnipolarWeightedMultiShapeLfo extends BaseUnipolarLfo
{
    // the LFO oscillators (they oscillate between -1 and 1)
    private sineLfo: OscillatorNode;
    private triangleLfo: OscillatorNode;
    private sawLfo: OscillatorNode;
    private squareLfo: OscillatorNode;

    // a mixer node that merges the 4 oscillators above
    private additiveInputsMixer: AdditiveInputsManager;

    // the absolute frequency of the LFO, in Hz
    private absoluteFrequency: number = Settings.defaultLfoLowAbsoluteFrequency;

    /* The indexes of the 4 LFOs, these indexes will be used for referencing the LFOs and must
    ** correspond exactly to the order in which the 4 LFOs are added to 'toggledInputsMixer' */
    private static readonly SINE_OSC_INDEX = 0;
    private static readonly TRIANGLE_OSC_INDEX = 1;
    private static readonly SAW_OSC_INDEX = 2;
    private static readonly SQUARE_OSC_INDEX = 3;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "UnipolarWeightedMultiShapeLfo", minLevel: Settings.minLogLevel});

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

        this.additiveInputsMixer = new AdditiveInputsManager(this.audioContext);

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

        // start the nodes
        this.sineLfo.start();
        this.triangleLfo.start();
        this.sawLfo.start();
        this.squareLfo.start();
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

    public setSineGain(gain: number): boolean
    {
        UnipolarWeightedMultiShapeLfo.logger.debug(`setSineGain(${gain})`);

        const result: boolean = this.additiveInputsMixer.setInputGain(UnipolarWeightedMultiShapeLfo.SINE_OSC_INDEX, gain);

        return result;
    }

    public setTriangleGain(gain: number): boolean
    {
        UnipolarWeightedMultiShapeLfo.logger.debug(`setTriangleGain(${gain})`);

        const result: boolean = this.additiveInputsMixer.setInputGain(UnipolarWeightedMultiShapeLfo.TRIANGLE_OSC_INDEX, gain);

        return result;
    }

    public setSawGain(gain: number): boolean
    {
        UnipolarWeightedMultiShapeLfo.logger.debug(`setSawGain(${gain})`);

        const result: boolean = this.additiveInputsMixer.setInputGain(UnipolarWeightedMultiShapeLfo.SAW_OSC_INDEX, gain);

        return result;
    }

    public setSquareGain(gain: number): boolean
    {
        UnipolarWeightedMultiShapeLfo.logger.debug(`setSquareGain(${gain})`);

        const result: boolean = this.additiveInputsMixer.setInputGain(UnipolarWeightedMultiShapeLfo.SQUARE_OSC_INDEX, gain);

        return result;
    }
}