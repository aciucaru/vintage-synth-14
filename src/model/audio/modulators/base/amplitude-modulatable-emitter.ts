import type { ModulationManager } from "../modulation-manager";

/* This interface represents an emitter (a source of signal) who's amplittude can be modulated
** by an external modulator (the modulator is also an emitter).
**
** Any emitter that wishes to be amplitude modulated should implement this interface.
** The usual emitters that implement this interface are oscillators. */
export interface AmplitudeModulatableEmitter
{
    /* Method that connects the external amplitude modulator with all amplitude modulatable nodes of the
    ** modulated emitter.
    **   The modulated emitter is usually an oscillator, but an oscillator could be made of more that one
    ** internal oscillator, so the modulator should be connected with all internal oscillators, not just one.
    **   This method is designed to do just that, to connect the amplitude modulator with all relevant internal nodes. */
    connectAmplitudeModulator(modulator: ModulationManager): void;
}