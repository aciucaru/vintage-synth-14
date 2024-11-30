import type { ModulationManager } from "../modulation-manager";

/* This interface represents an emitter (a source of signal) who's frequency can be modulated
** by an external modulator (the modulator is also an emitter).
**
** Any emitter that wishes to be frequency modulated should implement this interface.
** The usual emitters that implement this interface are oscillators. */
export interface FrequencyModulatableEmitter
{
    /* Method that connects the external frequency modulator with all frequency modulatable nodes of the
    ** modulated emitter.
    **   The modulated emitter is usually an oscillator, but an oscillator could be made of more that one
    ** internal oscillator, so the modulator should be connected with all internal oscillators, not just one.
    **   This method is designed to do just that, to connect the frequency modulator withh all relevant internal nodes. */
    connectFrequencyModulator(modulator: ModulationManager): void;
}