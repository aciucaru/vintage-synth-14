import { Settings } from "../../../../constants/settings";
import type { BaseMelodicOscillator } from "../../oscillator/melodic/base/base-melodic-oscillator";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";



export abstract class BaseVoiceManager
{
    protected audioContext: AudioContext;

    protected melodicOscillators: Array<BaseMelodicOscillator>;
    protected nonMelodicOscillators: Array<BaseMelodicOscillator>;

    // the final node
    protected outputGainNode: GainNode;

    private static readonly baseVoiceManagerLogger: Logger<ILogObj> = new Logger({name: "BaseVoiceManager", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        this.audioContext = audioContext;

        this.melodicOscillators = new Array<BaseMelodicOscillator>;
        this.nonMelodicOscillators = new Array<BaseMelodicOscillator>;

        this.outputGainNode = this.audioContext.createGain();
    }

}