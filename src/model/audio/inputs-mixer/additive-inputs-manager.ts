import { Settings } from "../../../constants/settings";
import { BaseInputsMixer } from "./base-inputs-mixer";
import type { InputData } from "./base-inputs-mixer";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";

/* The data type used internally by the array of inputs.
** This interface contains all the data required to represent one single input. */
interface AdditiveInput
{
    inputNode: AudioNode;
    inputGainNode: GainNode;
    inputData: InputData;
}

/*    Class that represents a general-purpose additive mixing node.
**    This node can accept an arbitrary number of inputs (which must be Web Audio API AudioNodes or subclasses) and then
** adds these inputs togheter, each input having it's own gain (it's own weight).
**   This class bassically does an weighted average of the inputs, where the weight of each input is it's gain.
**   This class allows adding new input nodes and allows changing the 'weight' (the gain) of each node.
**   Removing inputs is currently not possible.
**   The inputs are stored in a unidimensional array and are accessed by their index, so reordering the inputs is not possible,
** once an input has been added, it holds it's index in the array. */
export class AdditiveInputsManager extends BaseInputsMixer
{
    private inputsArray: Array<AdditiveInput>;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "AdditiveInputsManager", minLevel: Settings.minLogLevel });

    public constructor(audioContext: AudioContext)
    {
        super(audioContext);

        this.inputsArray = new Array<AdditiveInput>();

        this.computeFinalGain();
    }

    // Abstract method inherited from 'BaseMultipleInputsNode' abstract class
    public override connectInput(inputNode: AudioNode, inputData: InputData): void
    {
        AdditiveInputsManager.logger.debug("connectInput()");

        // Create and add the additive input to the array of inputs
        const newInput: AdditiveInput = {inputNode: inputNode, inputGainNode: this.audioContext.createGain(), inputData: inputData };
        this.inputsArray.push(newInput);

        // Connect the added input to it's corresponding gain node
        inputNode.connect(newInput.inputGainNode);

        // Connect the gain node to the final output gain node
        newInput.inputGainNode.connect(this.outputGainNode);

        // Set the gain value of the gain node corresponding to the input.
        // The gain will be such that the newly added input is muted
        newInput.inputGainNode.gain.setValueAtTime(Settings.multipleInputsMinGain, this.audioContext.currentTime);

        // recompute the output final gain
        this.computeFinalGain();
    }

    // Main method of this class, it sets the gain (weight) of an input by the input's index.
    public setInputGain(inputIndex: number, gain: number): boolean
    {
        const isIndexInRange: boolean = 0 <= inputIndex && inputIndex < this.inputsArray.length;
        const isLevelInRange: boolean = Settings.multipleInputsMinGain <= gain && gain <= Settings.multipleInputsMaxGain;

        if (!isIndexInRange)
        {
            AdditiveInputsManager.logger.warn(`setInputGain(${inputIndex}, ${gain}): oscillator index outside bounds`);
            return false; // change was not succesfull
        }
        else if (!isLevelInRange)
        {
            AdditiveInputsManager.logger.warn(`setInputGain(${inputIndex}, ${gain}): level outside bounds`);
            return false; // change was not succesfull
        }
        else
        {
            AdditiveInputsManager.logger.debug(`setInputGain(${inputIndex}, ${gain}): started`);

            this.inputsArray[inputIndex].inputData.gain = gain;
            this.inputsArray[inputIndex].inputGainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime);

            return true; // change was succesfull
        }
    }

    // Computes and sets the gain of the final ouput gain node
    private computeFinalGain(): void
    {
        AdditiveInputsManager.logger.debug("computeFinalGain(): started");

        let finalGain = 0;

        // if there are no inputs
        if (this.inputsArray.length === 0)
            finalGain = Settings.multipleInputsMinGain; // if there are no inputs, then the gain is zero
        // if there is at least one input
        else if (this.inputsArray.length > 0)
            finalGain = Settings.multipleInputsMaxGain / this.inputsArray.length;

        this.outputGainNode.gain.linearRampToValueAtTime(finalGain, this.audioContext.currentTime);
    }
}