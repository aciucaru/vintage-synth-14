import { Settings } from "../../../../constants/settings";
import type { BaseOscillator } from "../../oscillator/base-oscillator";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


/* Interface that represent an oscillator and it's associated gain weight.
** The mixer uses the gain weight of each oscillator to apply it to that oscillator.
**
** The reason for this class is to have a general purpose mixer, that can mix an arbitrary number of oscillators.
** Classes that extend this class can mix the oscillators in any way possible, such as: simple addition (weighted average),
** FM algorithms, ring modulation between the oscillators and any kind of combination/mixing between oscillators. */
export interface BaseOscillatorData
{
    oscillator: BaseOscillator;
    gainWeight: number;
}

/* This class manages the gain of the connected oscillators.
** the gain is managed through the 'setOutputGain()' method that each oscillators has.
**
** The reason for this class is to have a general purpose mixer, that can mix an arbitrary number of oscillators.
** This class only manages the gain levels of oscillators, but does not add the oscillators togheter. */
export abstract class BaseOscillatorMixer
// extends SingleInputNode
{
    protected audioContext: AudioContext;

    // the node to wich inputs are connected with this class
    protected inputGainNode: GainNode;

    // the output node, this is the sound resulting from this class
    protected outputGainNode: GainNode;

    /* The array of oscillators and their gain weights */
    // protected oscillators: Array<BaseOscillatorData> = new Array<BaseOscillatorData>();

    /* The main outputs of the oscillator:
    ** - one output is for the oscillators that will pass through the filter; this output is 'ouputGainNode' and
    **   is inherited from 'BaseReceiverEmitterNode' class
    ** - another output is for the oscillators that will bypass the filter, this is the 'nonFilteredOutputGainNode' property */
    protected nonFilteredOutputGainNode: GainNode;

    private static readonly baseOscillatorMixerLogger: Logger<ILogObj> = new Logger({name: "BaseOscillatorMixer", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext)
    {
        // super(audioContext);

        this.audioContext = audioContext;

        this.inputGainNode = this.audioContext.createGain();
        this.inputGainNode.gain.setValueAtTime(Settings.inputGain, this.audioContext.currentTime);

        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.outputGain, this.audioContext.currentTime);

        // the 'outputGainNode' is for filtered oscillators and is already instantiated in the 'BaseReceiverEmitterNode'
        // all we need to do is to just set it's gain value
        this.outputGainNode.gain.setValueAtTime(Settings.maxVoiceGain, this.audioContext.currentTime);

        this.nonFilteredOutputGainNode = this.audioContext.createGain();
        this.nonFilteredOutputGainNode.gain.setValueAtTime(Settings.maxVoiceGain, this.audioContext.currentTime);
    }

    // returns the main gain node
    public outputNode(): GainNode { return this.outputGainNode; }

    /* Unlike most BaseReceiverEmitterNodes, the oscillator mixer has 2 outputs instead of one:
    ** - one output for oscillators that will be passed through a filter (filtered output), this is the
    **   standard output inherited from the 'BaseReceiverEmitterNodes' class and is returned by inherited 'ouputNode()' method
    ** - one output for oscillators that won't be passed through a filter (non filtered output), this is the
    **   'nonFilteredOutputGainNode' property which is returned by 'nonFilteredOutput()' */
    public nonFilteredOutputNode(): GainNode { return this.nonFilteredOutputGainNode; }

    // sets the gain value for the oscillator at the specified index
    public abstract setOscillatorLevel(oscillatorIndex: number, level: number): boolean;

    /* this method add an oscillator to the mixer and connects it to the output dedicated for the
    ** filter (this oscillator will be filter eventually) */
    public abstract addFilteredOscillator(oscillatorData: BaseOscillatorData): void;

    /* this method add an oscillator to the mixer and connects it to the output dedicated for the
    ** non-filtered oscillators (this oscillator will bypass the filter) */
    public abstract addNonFilteredOscillator(oscillatorData: BaseOscillatorData): void;
}