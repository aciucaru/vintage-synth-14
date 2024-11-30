import { Settings } from "../../../../constants/settings";
import { BaseUnipolarLfo } from "./base-unipolar-lfo";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


/* An enum that describes the posible shapes of the LFO */
export enum LfoShape
{
    Triangle = "Triangle",
    Sawtooth = "Sawtooth",
    Square = "Square",
    Sine = "Sine"
}

/* Low frequency oscillator implementation, this LFO is always unipolar and positive (it oscillates between 0 and 1).
** Most of the implementation of this class is already done in the 'BaseUnipolarLfo' base class, all this class needs
** to implement is an LFO signal wich varies between -1.0 and 1.0 (bypolar), because the 'BaseUnipolarLfo' base class
** will add a WEb Audio API 'ConstantSourceNode' that always emits 1.0 and is already added to the inherited 'outputGainNode'.
**
** The only method this class needs to implement is the 'applyFrequency()' abstract method, which is already called
** internally by 'BaseUnipolarLfo' base class. */
export class UnipolarLfo extends BaseUnipolarLfo
{
    // the LFO oscillator (should always oscillate between -1 and 1)
    private lfoOscillator: OscillatorNode;

    // the absolute frequency of the LFO, in Hz
    private absoluteFrequency: number = Settings.defaultLfoLowAbsoluteFrequency;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "UnipolarLfo", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        super(audioContext);

        this.lfoOscillator = this.audioContext.createOscillator();
        this.lfoOscillator.type = "triangle";
        this.lfoOscillator.frequency.setValueAtTime(this.absoluteFrequency, this.audioContext.currentTime);

        // connect oscillator and to the gain (the 'ConstantSourceNode' inherited from 'BaseUnipolarLfo' is already connected)
        this.lfoOscillator.connect(this.outputGainNode);

        // start the LFO (the 'ConstantSourceNode' inherited from 'BaseUnipolarLfo' is already started)
        this.lfoOscillator.start();
    }

    /* Abstract method inherited from BaseUnipolarLfo. This method is called internally by the 'setFrequency()' public method
    ** of the 'BaseUnipolarLfo' base class and the argument check for 'freq' is alread made. */
    protected override applyFrequency(freq: number): void
    {
        this.lfoOscillator.frequency.linearRampToValueAtTime(freq, this.audioContext.currentTime);
    }

    public setShape(shape: LfoShape): void
    {
        UnipolarLfo.logger.debug(`setShape(${shape})`);

        switch (shape)
        {
            case LfoShape.Triangle: this.lfoOscillator.type = "triangle"; break;

            case LfoShape.Sawtooth: this.lfoOscillator.type = "sawtooth"; break;

            case LfoShape.Square: this.lfoOscillator.type = "square"; break;

            case LfoShape.Sine: this.lfoOscillator.type = "sine"; break;

            default: break;
        }
    }
}