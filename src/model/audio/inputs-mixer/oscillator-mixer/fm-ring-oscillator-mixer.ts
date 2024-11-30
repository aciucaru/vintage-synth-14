import { Settings } from "../../../../constants/settings";
import { BaseOscillatorMixer } from "./base-oscillator-mixer";
import type { BaseOscillatorData } from "./base-oscillator-mixer";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


/* This class represents an oscillators mixer that mixes the oscillators with FM and ring modulation.
** This mixer is a more complex mixer, capable of connecting the oscillators into an FM aglorithm with the
** posibilty of ring modulation as well, where 'ring modulation' is the arithmetic multiplication between 2 oscillators. */
export class FmRingOscillatorMixer extends BaseOscillatorMixer
{
    /* The array of oscillators and their gain weights */
    private oscillators: Array<BaseOscillatorData> = new Array<BaseOscillatorData>();

    private static readonly logger: Logger<ILogObj> = new Logger({name: "FmRingOscillatorMixer", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext)
    {
        super(audioContext);

        // set the gain for the all the oscillators
        this.computeAndSetGainValues();
    }

    // sets the gain value for the oscillator at specified index
    public override setOscillatorLevel(oscillatorIndex: number, level: number): boolean
    {
        const isIndexInRange: boolean = 0 <= oscillatorIndex && oscillatorIndex < this.oscillators.length;
        const isLevelInRange: boolean = Settings.minMixerOscGain <= level && level <= Settings.maxMixerOscGain;

        if (!isIndexInRange)
        {
            FmRingOscillatorMixer.logger.warn(`setOscillatorLevel(${oscillatorIndex}, ${level}): oscillator index outside bounds`);
            return false; // change was not succesfull
        }
        else if (!isLevelInRange)
        {
            FmRingOscillatorMixer.logger.warn(`setOscillatorLevel(${oscillatorIndex}, ${level}): level outside bounds`);
            return false; // change was not succesfull
        }
        else
        {
            FmRingOscillatorMixer.logger.debug(`setOscillatorLevel(${oscillatorIndex}, ${level}): started`);

            this.oscillators[oscillatorIndex].gainWeight = level;

            // TO DO

            return true; // change was succesfull
        }
    }

    /* this method add an oscillator to the mixer and connects it to the output dedicated for the
    ** filter (this oscillator will be filter eventually) */
    public addFilteredOscillator(oscillatorData: BaseOscillatorData): void
    {
        /* If the oscillators array does not have any elements, this means that the currently
        ** added element is the first.
        ** Any newly added oscillator, except the first one, receives a mininimum gain by default. */
        let gain = Settings.maxMixerOscGain;

        // if this isn't he first oscillator added to the array
        if (this.oscillators.length > 0)
            gain = Settings.minMixerOscGain; // then it's gain should be mimimum
        else // if the oscillator is the first added to the array
        {
            gain = Settings.maxMixerOscGain; // then it's gain should be maximum
            FmRingOscillatorMixer.logger.warn(`addFilteredOscillator(): gain = ${gain}`);
        }

        // change the gain of the oscillator data
        oscillatorData.gainWeight = gain;

        // add the new oscillator to the array of oscillators
        this.oscillators.push(oscillatorData);

        // (re)compute the gain levels of all oscillators
        this.computeAndSetGainValues();

        // connect the new oscillator to the mixer output for filtered oscillators (oscillators that will
        // pass through a filter)
        oscillatorData.oscillator.outputNode().connect(this.outputGainNode);
    }

    /* this method add an oscillator to the mixer and connects it to the output dedicated for the
    ** non-filtered oscillators (this oscillator will bypass the filter) */
    public addNonFilteredOscillator(oscillatorData: BaseOscillatorData): void
    {
        /* If the oscillators array does not have any elements, this means that the currently
        ** added element is the first.
        ** Any newly added oscillator, except the first one, receives a mininimum gain by default. */
        let gain = Settings.maxMixerOscGain;

        // if this isn't he first oscillator added to the array
        if (this.oscillators.length > 0)
            gain = Settings.minMixerOscGain; // then it's gain should be mimimum
        else // if the oscillator is the first added to the array
        {
            gain = Settings.maxMixerOscGain; // then it's gain should be maximum
            FmRingOscillatorMixer.logger.warn(`addNonFilteredOscillator(): gain = ${gain}`);
        }

        // change the gain of the oscillator data
        oscillatorData.gainWeight = gain;

        // add the new oscillator to the array of oscillators
        this.oscillators.push(oscillatorData);

        // (re)compute the gain levels of all oscillators
        this.computeAndSetGainValues();

        // connect the new oscillator to the mixer output for filtered oscillators (oscillators that will
        // pass through a filter)
        oscillatorData.oscillator.outputNode().connect(this.nonFilteredOutputGainNode);
    }

    private computeAndSetGainValues(): void
    {
        FmRingOscillatorMixer.logger.debug(`computeAndSetGainValues()`);

        const length = this.oscillators.length;

        // compute and set the actual gain levels for each oscillator:
        if (length > 0) // if there is at least one oscillator, then compute the gain
        {
            for (let oscillatorData of this.oscillators)
            {
                oscillatorData.oscillator.setOutputGain(oscillatorData.gainWeight / length);
            }
        }
    }
}