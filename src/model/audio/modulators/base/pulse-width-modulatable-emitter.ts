import type { ModulationManager } from "../modulation-manager";

/* This interface represents an emitter (a source of signal) who's pulse width can be modulated
** by an external modulator (the modulator is also an emitter).
**
** Any emitter that wishes to be pulse-width modulated should implement this interface.
** The usual emitters that implement this interface are oscillators. */
export interface PulseWidthModulatableEmitter
{
    /* Method that connects the external pulse-width modulator with all pulse width modulatable nodes of the
    ** modulated emitter.
    **   The modulated emitter is usually an oscillator, but an oscillator could be made of more that one
    ** internal oscillator, so the modulator should be connected with all internal oscillators, not just one.
    **   This method is designed to do just that, to connect the pulse-width modulator with all relevant internal nodes. */
    connectPulseWidthModulator(modulator: ModulationManager): void;
}