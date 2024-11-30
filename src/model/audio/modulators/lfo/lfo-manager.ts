import { Settings } from "../../../../constants/settings";
import { ToggledInputsManager } from "../../inputs-mixer/toggled-inputs-manager";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import type { BaseUnipolarLfo } from "./base-unipolar-lfo";


export class LfoManager
// extends BaseEmitterNode
{
    /* the audio context used to create and connect nodes; must be supplied from outside the class */
    private audioContext: AudioContext;

    // the final output of the oscillator; this is used to connect the oscillator to other nodes
    private outputGainNode: GainNode;

    /*    The actual LFO manager, this is a 'ToggledInputsManager', a class that accepts mutiple inputs
    ** and allows toggling those inputs on/off while always emiting a signal of amplitude (for this to work,
    ** the 'ToggledInputsManager' assumes tha all it's inputs have an amplitude of 1.0, e.g. it's inputs all
    ** vary between -1 and 1 when bipolar or it's inputs all vary between 0 and 1 if unipolar).
    **    The 'ToggledInputsManager' class also stores it's inputs inside an internal array, so there is no
    ** need for an array of LFOs. */
    private toggledLfosManager: ToggledInputsManager;

    // the modulation amount, in normalized form (between -1.0 and 1.0, where 0.0 means no modulation)
    private normalizedModulationAmount = 0; // 0% (no modulation)

    // the final (absolute) modulation amount
    private absoluteModulationAmount = 0;

    /* The limits of the modulated parameter, in absolute value (not in percentages).
    ** These are the limits between which the modulated parameter varies, there are not the limits of the modulator.
    ** The modulator (LfoManager) needs to know these limits, in order to not exceed the limits of the modulated parameter. */
    private parameterLowerLimit: number;
    private parameterUpperLimit: number;
    // the current value of the modulated parameter
    private parameterCurrentValue: number;

    /* Fixed modulation ranges (amounts), these are both positive.
    ** The 'upperModulationFixedRange' is always positive and refers to the maximum absolute (not in percentages) modulation amount
    ** that can be set when the normalized modulation amount is positive (e.g. the modulation takes place ABOVE the current value of
    ** the modulated parameter, meaning that the modulation is positive and ADDED to the current value of the parameter).
    **
    ** The 'lowerModulationFixedRange' is always positive and refers to the maximum absolute (not in percentages) modulation amount
    ** that can be set when the normalized modulation amount is negative (e.g. the modulation takes place BELOW the current value of
    ** the modulated parameter, meaning that the modulation is positive but SUBTRACTED from the current value of the parameter). */
    private useFixedModulationRanges: boolean = false;
    private lowerModulationFixedRange: number;
    private upperModulationFixedRange: number;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "LfoManager", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext,
            parameterLowerLimit: number, parameterUpperLimit: number, parameterCurrentValue: number,
            useFixedModulationRanges: boolean = false, lowerModulationFixedRange: number = 0, upperModulationFixedRange: number = 0)
    {
        // super(audioContext);

        this.audioContext = audioContext;

        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.baseSourceDefaultGain, this.audioContext.currentTime);

        this.toggledLfosManager = new ToggledInputsManager(this.audioContext);

        // initialize limits of the modulated parameter
        if (parameterLowerLimit < parameterUpperLimit)
        {
            this.parameterLowerLimit = parameterLowerLimit;
            this.parameterUpperLimit = parameterUpperLimit;
        }
        else
        {
            LfoManager.logger.warn(`constructor(): lower limit of modulated parameter is not smaller than upper limit, values will be switched`);

            this.parameterLowerLimit = parameterUpperLimit;
            this.parameterUpperLimit = parameterLowerLimit;
        }

        // initialize the current value of the modulated parameter
        // if the current value is inside limits
        if (parameterLowerLimit <= parameterCurrentValue && parameterCurrentValue <= parameterUpperLimit)
            this.parameterCurrentValue = parameterCurrentValue;
        else // if current value is outside limits
        {
            LfoManager.logger.warn(`constructor(): current value of modulated parameter is not inside supplied limits, current value will be in the middle`);

            // aproximate the current value as being in the middle of the lower and upper limit
            this.parameterCurrentValue = (this.parameterUpperLimit - this.parameterLowerLimit) / 2.0;
        }

        this.useFixedModulationRanges = useFixedModulationRanges;
        this.lowerModulationFixedRange = lowerModulationFixedRange;
        this.upperModulationFixedRange = upperModulationFixedRange;

        /* The final gain node is 'outputGainNode', inherited from BaseSource class.
        ** This gain node serves both as the modulation amount (it's gain is the modulation amount, 
        ** basically a multiplier that multiplies the LFOs signal merged by 'toggledLfosManager').
        ** The initial gain of the node that merges all LFOs is 0 (no modulation amount). */
        this.outputGainNode.gain.setValueAtTime(Settings.minLfoGain, this.audioContext.currentTime);

        // connect the LFO manager to the final output node
        this.toggledLfosManager.outputNode().connect(this.outputGainNode);
    }

    // returns the main gain node
    public outputNode(): GainNode { return this.outputGainNode; }

    public addLfo(lfo: BaseUnipolarLfo): void
    {
        // add the LFO to the multiple inputs manager
        this.toggledLfosManager.connectInput(lfo.outputNode(), {gain: Settings.shareableLfoDisabledGain});
    }

    public enableLfo(lfoIndex: number): boolean
    {
        LfoManager.logger.debug(`enableLfo(${lfoIndex})`);

        // enable the LFO inside the manager of multiple inputs
        const isOperationSuccessful = this.toggledLfosManager.unmuteInput(lfoIndex);

        return isOperationSuccessful;
    }

    public disableLfo(lfoIndex: number): boolean
    {
        LfoManager.logger.debug(`disableLfo(${lfoIndex})`);

        // disable the LFO inside the manager of multiple inputs
        const isOperationSuccessful = this.toggledLfosManager.muteInput(lfoIndex);

        return isOperationSuccessful;
    }

    public setNormalizedModulationAmount(normalizedModulationAmount: number): boolean
    {
        if (Settings.minLfoManagerModulationAmount <= normalizedModulationAmount && normalizedModulationAmount <= Settings.maxLfoManagerModulationAmount)
        {
            LfoManager.logger.debug(`setNormalizedModulationAmount(${normalizedModulationAmount})`);

            this.normalizedModulationAmount = normalizedModulationAmount;

            // recompute the modulation absolute amount
            if (this.useFixedModulationRanges)
                this.computeAbsoluteModulationWithFixedRanges();
            else
                this.computeAbsoluteModulationWithVariableRanges();

            // set the computed gain that was just saved in 'this.absoluteModulationAmount' property
            this.outputGainNode.gain.linearRampToValueAtTime(this.absoluteModulationAmount, this.audioContext.currentTime);

            return true; // change was succesfull
        }
        else
        {
            LfoManager.logger.warn(`setNormalizedModulationAmount(${normalizedModulationAmount}): parameter is outside bounds`);

            return false; // change was not succesfull
        }
    }

    /* This method sets the current absolute value of the modulated parameter.
    ** This method should be called when the absolute value of the modulated parmaters changes, this
    ** should happen inside the class that contains the modulated parameter. */
    public setParameterCurrentValue(parameterCurrentValue: number): boolean
    {
        if (this.parameterLowerLimit <= parameterCurrentValue && parameterCurrentValue <= this.parameterUpperLimit)
        {
            LfoManager.logger.debug(`setParameterCurrentValue(${parameterCurrentValue})`);

            this.parameterCurrentValue = parameterCurrentValue;

            // recompute the modulation absolute amount
            if (this.useFixedModulationRanges)
                this.computeAbsoluteModulationWithFixedRanges();
            else
                this.computeAbsoluteModulationWithVariableRanges();

            // set the computed gain that was just saved in 'this.absoluteModulationAmount' property
            this.outputGainNode.gain.linearRampToValueAtTime(this.absoluteModulationAmount, this.audioContext.currentTime);

            return true; // change was succesfull
        }
        else
        {
            LfoManager.logger.warn(`setParameterCurrentValue(${parameterCurrentValue}): parameter is outside bounds`);

            return true; // change was not succesfull
        }
    }

    public getParameterCurrentValue(): number { return this.outputGainNode.gain.value; }

    /* This method computes the absolute modulation amount, and does this by multiplying the 'normalizedModulationAmount', which is
    ** a factor with the maximum possible modulation in the direction of the 'normalizedModulationAmount' (plus or minus).
    **
    ** If the 'normalizedModulationAmount' is positive, then the maximum modulation possible will be between the modulated parameter's
    ** current value and the modulated parameter's upper limit.
    **
    ** If the 'normalizedModulationAmount' is negative, then the maximum modulation possible will be  between the modulated parameter's
    ** current value and the modulated paramter's lower limit.
    **
    ** So the absolute modulation amount differs, depending if the normalized modulation amount is positive (0...1) or negative (-1...0) */
    private computeAbsoluteModulationWithVariableRanges(): void
    {
        LfoManager.logger.debug(`computeAbsoluteModulationWithVariableRanges()`);

        // first, we check if the normalized modulation amount is positive or negative
        if (this.normalizedModulationAmount >= 0)
            this.absoluteModulationAmount = this.normalizedModulationAmount * (this.parameterUpperLimit - this.parameterCurrentValue);
        else
            this.absoluteModulationAmount = this.normalizedModulationAmount * (this.parameterCurrentValue - this.parameterLowerLimit);
    }

    /* This method is imilar to the previous method and computes the absolute modulation amount.
    ** So the absolute modulation amount differs, depending if the normalized modulation amount is positive (0...1) or negative (-1...0) */
    private computeAbsoluteModulationWithFixedRanges(): void
    {
        LfoManager.logger.debug(`computeAbsoluteModulationWithFixedRanges()`);

        // if the normalized modulation amount is positive
        if (this.normalizedModulationAmount >= 0)
        {
            const modulationAmount = this.normalizedModulationAmount * this.upperModulationFixedRange;

            if (this.parameterCurrentValue + modulationAmount <= this.parameterUpperLimit)
                this.absoluteModulationAmount = modulationAmount;
            else
                this.absoluteModulationAmount = this.normalizedModulationAmount * (this.parameterUpperLimit - this.parameterCurrentValue);
        }
        // if the normalized modulation amount is negative
        else
        {
            const modulationAmount = this.normalizedModulationAmount * this.lowerModulationFixedRange;

            // remember, here 'modulationAmount' is negative
            if (this.parameterCurrentValue + modulationAmount >= this.parameterLowerLimit)
                this.absoluteModulationAmount = modulationAmount;
            else
                this.absoluteModulationAmount = this.normalizedModulationAmount * (this.parameterCurrentValue - this.parameterLowerLimit);
        }
    }
}