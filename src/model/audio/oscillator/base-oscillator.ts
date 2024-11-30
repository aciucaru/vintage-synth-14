import { Settings } from "../../../constants/settings";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


export class BaseOscillator
// extends BaseEmitterNode
// implements AnalysableNode
{
    /* the audio context used to create and connect nodes; must be supplied from outside the class */
    protected audioContext: AudioContext;

    // the final output of the oscillator; this is used to connect the oscillator to other nodes
    protected outputGainNode: GainNode;

    /* the gain node that should be used for drawing the sound (for AnalyserNode);
    ** this property is inherided from 'AnalysableNode' interface */
    public analyserGainNode: GainNode;

    private static readonly baseOscLogger: Logger<ILogObj> = new Logger({name: "BaseOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext)
    {
        // super(audioContext);

        this.audioContext = audioContext;

        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.baseSourceDefaultGain, this.audioContext.currentTime);
        
        this.analyserGainNode = this.audioContext.createGain();
        this.analyserGainNode.gain.setValueAtTime(Settings.maxOscGain, this.audioContext.currentTime);
    }

    // returns the main gain node
    public outputNode(): GainNode { return this.outputGainNode; }

    // sets the gain of the oscillator
    public setOutputGain(gain: number): boolean
    {
        if (Settings.minOscGain <= gain && gain <= Settings.maxOscGain)
        {
            BaseOscillator.baseOscLogger.debug(`setOutputGain(${gain})`);

            // set the new value
            this.outputGainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime);
            return true; // change was successfull
        }
        else
        {
            BaseOscillator.baseOscLogger.warn(`setOutputGain(${gain}): value outside bounds`);

            return false; // change was not successfull
        }
    }

    /* Method from 'AnalysableNode' interface.
    ** This method returns the gain node that should be used for drawing the sound (for AnalyserNode). */
    public getAnalyserGainNode(): GainNode { return this.analyserGainNode; }
}