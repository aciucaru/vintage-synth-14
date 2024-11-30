import { Settings } from "../../../constants/settings";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";

export interface InputData
{
    /*    The gain/power/magnitude level of the input, this is a general-purpose parameter
    ** and does not refer ncessarily only to the gain of the input, it could refere to anything
    ** related to the magnitude/power of that input.
    **    It is up to the implementation of a subclass of 'BaseMultipleInputsNode' to decide how to use
    ** the 'gain' parameter. */
    gain: number;
}
/*    This class represent an intermediate node that is made up of one or multiple inputs that
** are somehow joined/connected togheter.
**    This class ensures that, no matter how many inputs are combined togheter, the resulting
** signal always has an amplitude of 1.0.
**    The input signals which are joined/connected togheter can either be all bipolar (between -1 and 1) or they
** can be all unipolar (between 0 and 1). */
export abstract class BaseInputsMixer
{
    /* the audio context used to create and connect nodes;
    ** must be supplied from outside the class */
    protected audioContext: AudioContext;

    // the final output of the oscillator; this is used to connect the oscillator to other nodes
    protected outputGainNode: GainNode;

    private static readonly baseMultipleInputsNodeLogger: Logger<ILogObj> = new Logger({name: "BaseInputsMixer", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext)
    {
        this.audioContext = audioContext;

        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.baseSourceDefaultGain, this.audioContext.currentTime);
    }

    // returns the main gain node
    public outputNode(): GainNode { return this.outputGainNode; }

    /* This is the main method of this class and should add and connect an input to this class.
    **    This method receives two parameters: the input node and 'inputData'. The 'inputData' is a general
    ** data type ment to be extended if it's necessary to pass more data in an implementaing class.
    **    The reason for which the 'inputData' is not passed separately (in another method), but in this method,
    ** is that, after adding an input, we need to refer to that input in some way, in order for this class to know
    ** to which input the 'inputData' should belong to. But there is no way to know how an implementing class
    ** will store it's inputs (in an array or a matrix or even a graph), so the only option would be to also pass
    ** that input by reference and make a search by reference in the method that should set the 'inputData' separately.
    **    Because the 'in[utData' is being passed as argument togheter wit it's input, there is no need for such complicated
    ** implementation inside a subclass. But it's also true that most times, the 'inputData' will not be usefull for a
    ** subclass, it's just here so more complex forms of InputData (exenteding interfaces) could be passed as arguments.
    **    Basicaclly, InputData is here as the base interface for custom data that would be necessary for the connected
    ** input. */
    public abstract connectInput(inputNode: AudioNode, inputData: InputData): void;
}