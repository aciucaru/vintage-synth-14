import { Settings } from "../../../../constants/settings";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


export abstract class BaseVoice
{
    protected audioContext: AudioContext;

    // the final node
    protected outputGainNode: GainNode;

    private static readonly baseVoiceLogger: Logger<ILogObj> = new Logger({name: "BaseVoice", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        this.audioContext = audioContext;

        this.outputGainNode = this.audioContext.createGain();
    }

    public abstract noteOn(octaves: number, semitones: number): void;

    public abstract noteOff(): void;

    public abstract noteOnOff(octaves: number, semitones: number, duration: number): void;

    public abstract resetBeatOffsets(): void;

    public setGain(gain: number): void
    {
        if (Settings.minVoiceGain <= gain && gain <= Settings.maxVoiceGain)
        {
            BaseVoice.baseVoiceLogger.debug(`setGain(${gain})`);

            const currentTime = this.audioContext.currentTime;

            // set the new value
            this.outputGainNode.gain.linearRampToValueAtTime(gain, currentTime + 0.1);
        }
        else
            BaseVoice.baseVoiceLogger.warn(`setGain(${gain}): value outside bounds`);
    }

    public outputNode(): GainNode { return this.outputGainNode; }

    // required for having permission to play the sound in the browser, after a user interaction
    public resume(): void
    {
        this.audioContext.resume();
    }
}