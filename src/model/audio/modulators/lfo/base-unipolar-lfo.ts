import { Settings } from "../../../../constants/settings";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


// export enum FrequencyType
// {
//     AbsoluteFrequency = "AbsoluteFrequency",
//     BarDivisions4by4 = "BarDivisions4by4"
// }

/* An enum that describes the possible frequency ranges of an LFO */
export enum LfoFreqRange
{
    Low = 0,
    Mid = 1,
    High = 2
}

export interface LfoFreqRangeLimits
{
    // limits for the low frequence range
    lowRangeMin: number;
    lowRangeMax: number;

    // limits for the middle frequency range
    midRangeMin: number;
    midRangeMax: number;

    // limits for the high frequency range
    highRangeMin: number;
    highRangeMax: number;
}

/* Low frequency oscillator vase class, which describes an unipolar and positive LFO (it oscillates between 0 and 1).
** This class is basically an oscilator that goes on no matter if it is modulating one or more parameters.
** The BaseUnipolarLfo has a fixed frequency (currently no key tracking available) but which can vary in 3 frequency
** ranges: low, mid and high.
** The interesting part about this base class is that the user can set the limits of the 3 frequency ranges (low, mid, high)
** if the default limits are not adequate. Setting custom limits is done once, in the constructor, through the 'freqRangeLimits'
** optional argument. */
export abstract class BaseUnipolarLfo
// extends BaseEmitterNode
{
    /* the audio context used to create and connect nodes; must be supplied from outside the class */
    protected audioContext: AudioContext;

    // the final output of the oscillator; this is used to connect the oscillator to other nodes
    protected outputGainNode: GainNode;

    /* A constant node of gain 1.0, which will turn the merged oscillators into a positive signal,
    ** IMPORTANT: the value (offset) of this node should always be 1, so it always sends the value 1! */
    private constantOscillator: ConstantSourceNode;

    // the allowable frequency range of the LFO
    private freqRange: LfoFreqRange = LfoFreqRange.Low;

    // the actual limits of the frequency ranges
    private freqRangeLimits: LfoFreqRangeLimits;

    // these values are for the 'constant' oscillator and for the merger gain node, they are fixed and should never change
    private static readonly CONSTANT_OSCILLATOR_OFFSET = 1;
    private static readonly OUTPUT_GAIN = 0.5;

    private static readonly baseUnipolarLfoLogger: Logger<ILogObj> = new Logger({name: "BaseUnipolarLfo", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext,
                freqRangeLimits: LfoFreqRangeLimits =
                                {
                                    lowRangeMin: Settings.minLfoLowAbsoluteFrequency,
                                    lowRangeMax: Settings.maxLfoLowAbsoluteFrequency,
                                
                                    midRangeMin: Settings.minLfoMidAbsoluteFrequency,
                                    midRangeMax: Settings.maxLfoMidAbsoluteFrequency,
                                
                                    highRangeMin: Settings.minLfoHighAbsoluteFrequency,
                                    highRangeMax: Settings.maxLfoHighAbsoluteFrequency
                                })
    {
        // super(audioContext);

        this.audioContext = audioContext;

        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.baseSourceDefaultGain, this.audioContext.currentTime);

        this.freqRangeLimits = freqRangeLimits;

        this.constantOscillator = this.audioContext.createConstantSource();
        this.constantOscillator.offset.setValueAtTime(BaseUnipolarLfo.CONSTANT_OSCILLATOR_OFFSET, this.audioContext.currentTime);

        /* This node that adds (merges) the 'lfoOscillator' and 'constantOscillator' togheter is a node inherited from 'BaseSource'.
        ** The node is called 'outputGainNode' and will add the two oscillators in order to obtain an oscillator that will oscillate
        ** between 0 and 2.
        ** In order to obtain the expected oscillation between 0 and 1, the gain of this oscillator SHOULD ALWAYS BE 0.5, so the end
        ** result oscillates between 0.5*0 and 0.5*2 (e.g. between 0 and 1). */
        this.outputGainNode.gain.setValueAtTime(BaseUnipolarLfo.OUTPUT_GAIN, this.audioContext.currentTime);

        // connect constant source to the gain
        this.constantOscillator.connect(this.outputGainNode);

        // start the constant oscillator
        this.constantOscillator.start();
    }

    // returns the main gain node
    public outputNode(): GainNode { return this.outputGainNode; }

    // sets the gain of the oscillator
    public setOutputGain(gain: number): boolean
    {
        if (Settings.minOscGain <= gain && gain <= Settings.maxOscGain)
        {
            BaseUnipolarLfo.baseUnipolarLfoLogger.debug(`setOutputGain(${gain})`);

            // set the new value
            this.outputGainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime);
            return true; // change was successfull
        }
        else
        {
            BaseUnipolarLfo.baseUnipolarLfoLogger.warn(`setOutputGain(${gain}): value outside bounds`);

            return false; // change was not successfull
        }
    }

    /* This is the only abstract method of this class. This method is already called internally by the 'setFrequency()'
    ** public method, which already checks all frequency range limits and calls this 'applyFrequency()' method
    ** if the new frequency is within limits. So the argument checking is already implemented in the 'setFrequency()',
    ** all a subclass needs to do is to just put the frequency change code in this 'applyFrequency()' method. */
    protected abstract applyFrequency(freq: number): void;

    public setFrequencyRange(freqRange: LfoFreqRange): void
    {
        BaseUnipolarLfo.baseUnipolarLfoLogger.debug(`setFrequencyRange(${freqRange})`);

        this.freqRange = freqRange;
    }

    // sets the absolute frequency of the LFO, in Hz
    public setFrequency(freq: number): boolean
    {
        switch (this.freqRange)
        {
            case LfoFreqRange.Low:
                if (this.freqRangeLimits.lowRangeMin <= freq && freq <= this.freqRangeLimits.lowRangeMax)
                {
                    BaseUnipolarLfo.baseUnipolarLfoLogger.debug(`setFrequency(${freq})`);
        
                    // assign the new frequency according to subclass custom implementation
                    this.applyFrequency(freq); // abstract method
        
                    return true; // change was succesfull
                }
                else
                {
                    BaseUnipolarLfo.baseUnipolarLfoLogger.warn(`setFrequency(${freq}): value is outside bounds`);
                    return false; // change was not succesfull
                }

            case LfoFreqRange.Mid:
                if (this.freqRangeLimits.midRangeMin <= freq && freq <= this.freqRangeLimits.midRangeMax)
                {
                    BaseUnipolarLfo.baseUnipolarLfoLogger.debug(`setFrequency(${freq})`);
        
                    // assign the new frequency according to subclass custom implementation
                    this.applyFrequency(freq); // abstract method
        
                    return true; // change was succesfull
                }
                else
                {
                    BaseUnipolarLfo.baseUnipolarLfoLogger.warn(`setFrequency(${freq}): value is outside bounds`);
                    return false; // change was not succesfull
                }

            case LfoFreqRange.High:
                if (this.freqRangeLimits.highRangeMin <= freq && freq <= this.freqRangeLimits.highRangeMax)
                {
                    BaseUnipolarLfo.baseUnipolarLfoLogger.debug(`setFrequency(${freq})`);
        
                    // assign the new frequency according to subclass custom implementation
                    this.applyFrequency(freq); // abstract method
        
                    return true; // change was succesfull
                }
                else
                {
                    BaseUnipolarLfo.baseUnipolarLfoLogger.warn(`setFrequency(${freq}): value is outside bounds`);
                    return false; // change was not succesfull
                }
        }
    }
}