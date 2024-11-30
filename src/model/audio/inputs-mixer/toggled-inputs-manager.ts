import { Settings } from "../../../constants/settings";
import { BaseInputsMixer } from "./base-inputs-mixer";
import type { InputData } from "./base-inputs-mixer";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";

interface ToggledInput
{
    inputNode: AudioNode;
    inputGainToggleNode: GainNode;
    isEnabled: boolean;
    inputData: InputData;
}

/*    Class that represents a general-purpose on/off mixing node.
**    This node can accept an arbitrary number of inputs (which must be Web Audio API AudioNodes or subclasses) and then
** adds these inputs togheter, where each input can be enabled (gain = 1) or disabled (gain = 0).
**   This class allows adding new input nodes and allows muting/unmuting each input.
**   Removing inputs is currently not possible.
**   The inputs are stored in a unidimensional array and are accessed by their index, so reordering the inputs is not possible,
** once an input has been added, it holds it's index in the array. */
export class ToggledInputsManager extends BaseInputsMixer
{
    private inputsArray: Array<ToggledInput>;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "ToggledInputsManager", minLevel: Settings.minLogLevel });

    public constructor(audioContext: AudioContext)
    {
        super(audioContext);

        this.inputsArray = new Array<ToggledInput>();

        this.computeFinalGain();
    }

    // Abstract method inherited from 'BaseMultipleInputsNode' abstract class
    public override connectInput(inputNode: AudioNode, inputData: InputData): void
    {
        ToggledInputsManager.logger.debug("connectInput()");

        // Create and add the additive input to the array of inputs
        const newInput: ToggledInput = {inputNode: inputNode, inputGainToggleNode: this.audioContext.createGain(), isEnabled: false, inputData: inputData };
        this.inputsArray.push(newInput);

        // Connect the added input to it's corresponding gain node
        inputNode.connect(newInput.inputGainToggleNode);

        // Connect the gain toggle node to the fianl output node
        newInput.inputGainToggleNode.connect(this.outputGainNode);

        // Set the gain value of the gain node corresponding to the input.
        // The gain will be such that the newly added input is disabled/muted
        newInput.inputGainToggleNode.gain.setValueAtTime(Settings.multipleInputsMinGain, this.audioContext.currentTime);

        // recompute the output final gain
        this.computeFinalGain();
    }

    // One of the main methods of this class: it mutes (toggles off) an input by it's index
    public muteInput(inputIndex: number): boolean
    {
        if (0 <= inputIndex && inputIndex < this.inputsArray.length)
        {
            ToggledInputsManager.logger.debug(`muteInput(${inputIndex}): started`);

            this.inputsArray[inputIndex].isEnabled = false;
            this.inputsArray[inputIndex].inputData.gain = Settings.multipleInputsMinGain;
            this.inputsArray[inputIndex].inputGainToggleNode.gain.linearRampToValueAtTime(Settings.multipleInputsMinGain, this.audioContext.currentTime);

            this.computeFinalGain();

            return true; // change was succesfull
        }
        else
        {
            ToggledInputsManager.logger.warn(`muteInput(${inputIndex}): index out of range`);
            return false;  // change was not succesfull
        }
    }

    // One of the main methods of this class: it unmutes (toggles on) an input by it's index
    public unmuteInput(inputIndex: number): boolean
    {
        if (0 <= inputIndex && inputIndex < this.inputsArray.length)
        {
            ToggledInputsManager.logger.debug(`unmuteInput(${inputIndex}): started`);

            this.inputsArray[inputIndex].isEnabled = true;
            this.inputsArray[inputIndex].inputData.gain = Settings.multipleInputsMaxGain;
            this.inputsArray[inputIndex].inputGainToggleNode.gain.linearRampToValueAtTime(Settings.multipleInputsMaxGain, this.audioContext.currentTime);

            this.computeFinalGain();

            return true; // change was succesfull
        }
        else
        {
            ToggledInputsManager.logger.warn(`unmuteInput(${inputIndex}): index out of range`);
            return false;  // change was not succesfull
        }
    }

    // Counts how many enabled inputs there are, it use the ToggledInput's 'isEnabled' property
    private countEnabledInputs(): number
    {
        ToggledInputsManager.logger.debug("countEnabledInputs(): started");

        let enabledInputs = 0;

        for (const input of this.inputsArray)
        {
            if (input.isEnabled)
                enabledInputs++;
        }

        return enabledInputs;
    }

    // Computes and sets the gain of the final ouput gain node
    private computeFinalGain(): void
    {
        ToggledInputsManager.logger.debug("computeFinalGain(): started");

        let enabledInputsCount = this.countEnabledInputs();

        let finalGain = 0;

        if (enabledInputsCount > 0)
            finalGain = (Settings.multipleInputsMaxGain / enabledInputsCount) - Number.EPSILON;
        else
            finalGain = Settings.multipleInputsMinGain;

        this.outputGainNode.gain.linearRampToValueAtTime(finalGain, this.audioContext.currentTime);
    }
}