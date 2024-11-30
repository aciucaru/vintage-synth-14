import { Settings } from "../../../constants/settings";
import { BaseUnipolarLfo } from "../modulators/lfo/base-unipolar-lfo";
import { AdsrEnvelope } from "../modulators/envelope/adsr-envelope";
import { ModulationManager } from "../modulators/modulation-manager";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";



export class OscFilter
// extends SingleInputNode
{
    protected audioContext: AudioContext;

    // the node to wich inputs are connected with this class
    protected inputGainNode: GainNode;

    // the output node, this is the sound resulting from this class
    protected outputGainNode: GainNode;

    // the main node: the biquad filter, this node sits between 'inputNode' and 'outputNode'
    private filterNode: BiquadFilterNode;

    // parameter manager nodes
    private cutoffFreqModulationManager: ModulationManager;
    private resonanceModulationManager: ModulationManager;

    // the ADSR envelope for the cutoff frequency
    private cutoffAdsrEnvelope: AdsrEnvelope;
    
    // the gain node for the ADSR amount
    private envelopeAmountGainNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "LowpassFilter", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext, lfoArray: Array<BaseUnipolarLfo>)
    {
        // super(audioContext);

        this.audioContext = audioContext;

        this.inputGainNode = this.audioContext.createGain();
        this.inputGainNode.gain.setValueAtTime(Settings.inputGain, this.audioContext.currentTime);

        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.outputGain, this.audioContext.currentTime);

        this.filterNode = this.audioContext.createBiquadFilter();
        this.filterNode.type = "lowpass";
        // set the cuttof frequency and detune to a default
        this.filterNode.frequency.setValueAtTime(Settings.defaultFilterCutoffFreq, this.audioContext.currentTime);
        this.filterNode.detune.setValueAtTime(Settings.defaultFilterDetune, this.audioContext.currentTime);

        // connect inherited input and output to the low-pass filter node
        this.inputGainNode.connect(this.filterNode);
        this.filterNode.connect(this.outputGainNode);

        const useFixedModulationRanges = false;
        const lowerModulationFixedRange = Settings.minFilterLfoAmount;
        const upperModulationFixedRange = Settings.maxFilterLfoAmount;
        this.cutoffFreqModulationManager = new ModulationManager(this.audioContext, lfoArray,
                                            Settings.minFilterEnvelopeAmount, Settings.maxFilterEnvelopeAmount, Settings.defaultFilterEnvelopeAmount,
                                            useFixedModulationRanges, lowerModulationFixedRange, upperModulationFixedRange);
        this.resonanceModulationManager = new ModulationManager(this.audioContext, lfoArray,
                                            Settings.minFilterResonance, Settings.maxFilterResonance, Settings.defaultFilterResonance);


        this.cutoffAdsrEnvelope = new AdsrEnvelope(this.audioContext);
        this.envelopeAmountGainNode = this.audioContext.createGain();
        this.envelopeAmountGainNode.gain.setValueAtTime(-2400, this.audioContext.currentTime);

        this.cutoffFreqModulationManager.outputNode().connect(this.filterNode.detune);
        this.cutoffAdsrEnvelope.outputNode().connect(this.envelopeAmountGainNode);
        this.envelopeAmountGainNode.connect(this.filterNode.detune);

        // connect modulators with resonance (Q factor)
        this.resonanceModulationManager.outputNode().connect(this.filterNode.Q);
    }

    // returns the main gain node
    public inputNode(): GainNode { return this.inputGainNode; }

    // returns the main gain node
    public outputNode(): GainNode { return this.outputGainNode; }

    // this method is supposed to return the main node of the class
    public getLowPassFilter(): AudioNode { return this.filterNode; }

    // sets the cutoff frequency of the filter, in Hz
    public setCutoffFrequency(freq: number): boolean
    {
        if (Settings.minFilterCutoffFreq <= freq && freq <= Settings.maxFilterCutoffFreq)
        {
            OscFilter.logger.debug(`setCutoffFrequency(${freq})`);

            // set the cutoff frequency
            this.filterNode.frequency.setValueAtTime(freq, this.audioContext.currentTime);

            // notify the modulation manager that the main value has changed
            this.cutoffFreqModulationManager.setParameterCurrentValue(freq);

            return true; // change was succesfull
        }
        else
        {
            OscFilter.logger.warn(`setCutoffFrequency(${freq}): value outside bounds`);
            return false; // change was not succesfull
        }
    }

    public setResonance(resonance: number): boolean
    {
        if (Settings.minFilterResonance <= resonance && resonance <= Settings.maxFilterResonance)
        {
            OscFilter.logger.debug(`setResonance(${resonance})`);

            // set the resonance
            this.setQFactor(resonance);

            // notify the modulation manager that the main value has changed
            this.resonanceModulationManager.setParameterCurrentValue(resonance);

            return true; // change was succesfull
        }
        else
        {
            OscFilter.logger.debug(`setResonance(${resonance}): value outside bounds`);
            return false; // change was not succesfull
        }
    }

    public setKeyTrackingLevel(keyTrackingLevel: number): boolean
    {
        return false;
    }

    // sets the frequency detune of the filter, in cents
    private setDetune(centsDetune: number): boolean
    {
        if (Settings.minFilterDetune <= centsDetune && centsDetune <= Settings.maxFilterDetune)
        {
            OscFilter.logger.debug(`setDetune(${centsDetune})`);

            this.filterNode.detune.setValueAtTime(centsDetune, this.audioContext.currentTime);

            return true; // change was succesfull
        }
        else
        {
            OscFilter.logger.debug(`setDetune(${centsDetune}): value outside bounds`);
            return false; // change was not succesfull
        }
    }

    // sets the Q Factor (quality factor), no units
    private setQFactor(qFactor: number): boolean
    {
        if (Settings.minFilterQFactor <= qFactor && qFactor <= Settings.maxFilterQFactor)
        {
            OscFilter.logger.debug(`setQFactor(${qFactor})`);

            this.filterNode.Q.setValueAtTime(qFactor, this.audioContext.currentTime);

            return true; // change was succesfull
        }
        else
        {
            OscFilter.logger.warn(`setQFactor(${qFactor}): value outside bounds`);
            return false; // change was not succesfull
        }
    }

    public setEnvelopeAmount(amount: number): boolean
    {
        if (Settings.minFilterEnvelopeAmount <= amount && amount <= Settings.maxFilterEnvelopeAmount)
        {
            OscFilter.logger.debug(`setEnvelopeAmount(${amount})`);

            const changeTime = this.audioContext.currentTime;
            this.envelopeAmountGainNode.gain.linearRampToValueAtTime(amount, changeTime);

            return true; // change was succesfull
        }
        else
        {
            OscFilter.logger.warn(`setEnvelopeAmount(${amount}): value outside bounds`);
            return false; // change was not succesfull
        }
    }

    // sets the filter gain
    private setGain(gain: number): boolean
    {
        if (Settings.minFilterGain <= gain && gain <= Settings.maxFilterGain)
        {
            OscFilter.logger.debug(`setGain(${gain})`);

            this.filterNode.gain.setValueAtTime(gain, this.audioContext.currentTime);

            return true; // change was succesfull
        }
        else
        {
            OscFilter.logger.warn(`setGain(${gain}): value outside bounds`);
            return false; // change was not succesfull
        }
    }

    // modulators getters
    // public getAdsrEnvelope(): SimpleAdsrEnvelope { return this.cutoffAdsrEnvelope; }
    public getAdsrEnvelope(): AdsrEnvelope { return this.cutoffAdsrEnvelope; }
    public getCutoffFreqModulationManager(): ModulationManager { return this.cutoffFreqModulationManager; }
    public getResonanceModulationManager(): ModulationManager { return this.resonanceModulationManager; }
}